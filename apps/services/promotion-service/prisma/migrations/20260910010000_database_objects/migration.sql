CREATE FUNCTION `fn_is_promotion_active`(
    p_promotion_id VARCHAR(191),
    p_at DATETIME(3)
)
RETURNS BOOLEAN
READS SQL DATA
BEGIN
    DECLARE v_is_active BOOLEAN DEFAULT FALSE;
    SELECT COUNT(*) > 0
      INTO v_is_active
      FROM `Promotion`
     WHERE `id` = p_promotion_id
       AND `status` = 'ACTIVE'
       AND `deletedAt` IS NULL
       AND (`startsAt` IS NULL OR `startsAt` <= p_at)
       AND (`endsAt` IS NULL OR `endsAt` >= p_at)
       AND (`totalLimit` IS NULL OR `usedCount` < `totalLimit`);
    RETURN v_is_active;
END;

CREATE PROCEDURE `sp_use_promotion`(
    IN p_redemption_id VARCHAR(191),
    IN p_promotion_id VARCHAR(191),
    IN p_user_id VARCHAR(191),
    IN p_order_ids JSON
)
BEGIN
    DECLARE v_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_starts_at DATETIME(3);
    DECLARE v_ends_at DATETIME(3);
    DECLARE v_total_limit INT;
    DECLARE v_used_count INT;
    DECLARE v_code VARCHAR(191);
    DECLARE v_discount_type VARCHAR(20);
    DECLARE v_discount_value INT;
    DECLARE v_min_subtotal INT;
    DECLARE v_max_discount INT;
    DECLARE v_existing_id VARCHAR(191) DEFAULT NULL;
    DECLARE v_existing_order_ids JSON;
    DECLARE v_already_used_at DATETIME(3);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_order_ids IS NULL OR JSON_LENGTH(p_order_ids) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PROMOTION_ORDER_LIST_EMPTY';
    END IF;

    START TRANSACTION;
    SELECT `status`, `startsAt`, `endsAt`, `totalLimit`, `usedCount`,
           `code`, `discountType`, `discountValue`, `minOrderSubtotal`, `maxDiscount`
      INTO v_status, v_starts_at, v_ends_at, v_total_limit, v_used_count,
           v_code, v_discount_type, v_discount_value, v_min_subtotal, v_max_discount
      FROM `Promotion`
     WHERE `id` = p_promotion_id AND `deletedAt` IS NULL
     FOR UPDATE;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PROMOTION_NOT_FOUND';
    END IF;
    IF v_status <> 'ACTIVE'
       OR (v_starts_at IS NOT NULL AND v_starts_at > NOW(3))
       OR (v_ends_at IS NOT NULL AND v_ends_at < NOW(3)) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PROMOTION_NOT_ACTIVE';
    END IF;

    SELECT `id`, `orderIds`, `usedAt`
      INTO v_existing_id, v_existing_order_ids, v_already_used_at
      FROM `Redemption`
     WHERE `promotionId` = p_promotion_id AND `userId` = p_user_id
     LIMIT 1
     FOR UPDATE;

    IF v_already_used_at IS NOT NULL THEN
        IF JSON_LENGTH(v_existing_order_ids) = JSON_LENGTH(p_order_ids)
           AND JSON_CONTAINS(v_existing_order_ids, p_order_ids)
           AND JSON_CONTAINS(p_order_ids, v_existing_order_ids) THEN
            COMMIT;
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PROMOTION_ALREADY_USED';
        END IF;
    ELSE
        IF v_total_limit IS NOT NULL AND v_used_count >= v_total_limit THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PROMOTION_LIMIT_REACHED';
        END IF;

        IF v_existing_id IS NULL THEN
            INSERT INTO `Redemption` (
                `id`, `promotionId`, `userId`, `orderIds`, `code`, `discountType`,
                `discountValue`, `minOrderSubtotal`, `maxDiscount`,
                `claimedAt`, `usedAt`, `createdAt`
            ) VALUES (
                p_redemption_id, p_promotion_id, p_user_id, p_order_ids, v_code,
                v_discount_type, v_discount_value, v_min_subtotal, v_max_discount,
                NOW(3), NOW(3), NOW(3)
            );
        ELSE
            UPDATE `Redemption`
               SET `orderIds` = p_order_ids, `usedAt` = NOW(3), `cancelledAt` = NULL
             WHERE `id` = v_existing_id;
        END IF;

        UPDATE `Promotion`
           SET `usedCount` = `usedCount` + 1, `updatedAt` = NOW(3)
         WHERE `id` = p_promotion_id;
        COMMIT;
    END IF;
END;
