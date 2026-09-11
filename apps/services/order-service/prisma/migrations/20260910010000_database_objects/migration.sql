-- Deterministic calculation functions used by OrderRepository/OrderService.
CREATE FUNCTION `fn_calculate_discount`(
    p_type VARCHAR(20),
    p_value INT,
    p_subtotal INT,
    p_max_discount INT
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_discount INT;
    IF p_type = 'PERCENT' THEN
        SET v_discount = FLOOR(p_subtotal * p_value / 10000);
    ELSE
        SET v_discount = p_value;
    END IF;
    IF p_max_discount IS NOT NULL THEN
        SET v_discount = LEAST(v_discount, p_max_discount);
    END IF;
    RETURN GREATEST(LEAST(v_discount, p_subtotal), 0);
END;

CREATE FUNCTION `fn_order_grand_total`(
    p_item_total INT,
    p_shipping_fee INT,
    p_discount INT
)
RETURNS INT
DETERMINISTIC
RETURN GREATEST(p_item_total + p_shipping_fee + p_discount, 0);

CREATE PROCEDURE `sp_change_order_status`(
    IN p_order_id VARCHAR(191),
    IN p_shop_id VARCHAR(191),
    IN p_new_status VARCHAR(20),
    IN p_updated_by_id VARCHAR(191)
)
BEGIN
    DECLARE v_current_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_allowed BOOLEAN DEFAULT FALSE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    SELECT `status`
      INTO v_current_status
      FROM `Order`
     WHERE `id` = p_order_id
       AND (p_shop_id IS NULL OR `shopId` = p_shop_id)
       AND `deletedAt` IS NULL
     FOR UPDATE;

    IF v_current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ORDER_NOT_FOUND';
    END IF;

    SET v_allowed = CASE
        WHEN v_current_status = 'CREATING'  AND p_new_status IN ('PENDING', 'CANCELLED') THEN TRUE
        WHEN v_current_status = 'PENDING'   AND p_new_status IN ('CONFIRMED', 'CANCELLED') THEN TRUE
        WHEN v_current_status = 'CONFIRMED' AND p_new_status IN ('SHIPPING', 'CANCELLED') THEN TRUE
        WHEN v_current_status = 'SHIPPING'  AND p_new_status = 'COMPLETED' THEN TRUE
        WHEN v_current_status = 'COMPLETED' AND p_new_status = 'REFUNDED' THEN TRUE
        ELSE FALSE
    END;

    IF NOT v_allowed THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ORDER_STATUS_TRANSITION_INVALID';
    END IF;

    UPDATE `Order`
       SET `status` = p_new_status,
           `timeline` = JSON_ARRAY_APPEND(
               COALESCE(`timeline`, JSON_ARRAY()),
               '$',
               JSON_OBJECT('status', p_new_status, 'at', DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%H:%i:%s.%fZ'))
           ),
           `updatedById` = p_updated_by_id,
           `updatedAt` = NOW(3)
     WHERE `id` = p_order_id;
    COMMIT;
END;

CREATE TRIGGER `trg_order_item_total_before_insert`
BEFORE INSERT ON `OrderItem`
FOR EACH ROW
BEGIN
    IF NEW.`quantity` <= 0 OR NEW.`price` < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ORDER_ITEM_VALUE_INVALID';
    END IF;
    SET NEW.`total` = NEW.`quantity` * NEW.`price`;
END;

CREATE TRIGGER `trg_order_item_total_before_update`
BEFORE UPDATE ON `OrderItem`
FOR EACH ROW
BEGIN
    IF NEW.`quantity` <= 0 OR NEW.`price` < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ORDER_ITEM_VALUE_INVALID';
    END IF;
    SET NEW.`total` = NEW.`quantity` * NEW.`price`;
END;
