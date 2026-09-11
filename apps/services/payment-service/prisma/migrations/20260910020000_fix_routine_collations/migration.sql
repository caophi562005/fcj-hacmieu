ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP PROCEDURE `sp_process_bank_transaction`;

CREATE PROCEDURE `sp_process_bank_transaction`(
    IN p_transaction_id INT,
    IN p_gateway VARCHAR(100),
    IN p_transaction_date DATETIME(3),
    IN p_account_number VARCHAR(100),
    IN p_sub_account VARCHAR(250),
    IN p_amount_in INT,
    IN p_amount_out INT,
    IN p_accumulated INT,
    IN p_bank_code VARCHAR(250),
    IN p_payment_code VARCHAR(250),
    IN p_content TEXT,
    IN p_reference_number VARCHAR(255),
    IN p_body TEXT
)
BEGIN
    DECLARE v_payment_id VARCHAR(191) DEFAULT NULL;
    DECLARE v_payment_amount INT;
    DECLARE v_payment_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
    INSERT INTO `Transaction` (
        `id`, `gateway`, `transactionDate`, `accountNumber`, `subAccount`,
        `amountIn`, `amountOut`, `accumulated`, `code`, `transactionContent`,
        `referenceNumber`, `body`, `createdAt`
    ) VALUES (
        p_transaction_id, p_gateway, p_transaction_date, p_account_number,
        p_sub_account, p_amount_in, p_amount_out, p_accumulated, p_bank_code,
        p_content, p_reference_number, p_body, NOW(3)
    );
    SELECT `id`, `amount`, `status`
      INTO v_payment_id, v_payment_amount, v_payment_status
      FROM `Payment`
     WHERE `code` = p_payment_code
     FOR UPDATE;
    IF v_payment_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PAYMENT_NOT_FOUND';
    END IF;
    IF v_payment_status = 'SUCCESS' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PAYMENT_ALREADY_COMPLETED';
    END IF;
    IF p_amount_in <> v_payment_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PAYMENT_AMOUNT_MISMATCH';
    END IF;
    UPDATE `Payment`
       SET `status` = 'SUCCESS', `updatedAt` = NOW(3)
     WHERE `id` = v_payment_id;
    COMMIT;
END;
