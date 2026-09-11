-- Views used by WalletRepository, CreditRepository and PayoutRepository.
CREATE VIEW `vw_shop_credit_revenue` AS
SELECT
    `shopId`,
    DATE(`createdAt`) AS `revenueDate`,
    COUNT(*) AS `revenueEntries`,
    SUM(`amount`) AS `creditedRevenue`
FROM `CreditTransaction`
WHERE `type` = 'CREDIT'
  AND `source` = 'ORDER_REVENUE'
GROUP BY `shopId`, DATE(`createdAt`);

CREATE VIEW `vw_wallet_transaction_history` AS
SELECT
    wt.`id`, wt.`walletId`, wt.`userId`, wt.`type`, wt.`source`,
    wt.`referenceId`, wt.`amount`, wt.`balanceAfter`, wt.`description`,
    wt.`createdAt`, w.`balance` AS `currentBalance`
FROM `WalletTransaction` wt
INNER JOIN `Wallet` w ON w.`id` = wt.`walletId`;

CREATE VIEW `vw_pending_payouts` AS
SELECT
    `id`, `creditId`, `shopId`, `amount`, `bankName`, `accountNumber`,
    `accountHolder`, `note`, `status`, `rejectReason`, `processedAt`,
    `createdAt`, `updatedAt`
FROM `PayoutRequest`
WHERE `status` = 'PENDING';

-- Functions used by WalletRepository.
CREATE FUNCTION `fn_wallet_available_balance`(p_user_id VARCHAR(191))
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_balance INT DEFAULT 0;
    SELECT COALESCE(MAX(`balance`), 0)
      INTO v_balance
      FROM `Wallet`
     WHERE `userId` = p_user_id;
    RETURN v_balance;
END;

-- Procedures own their local transactions and are called as outermost units.
CREATE PROCEDURE `sp_adjust_wallet`(
    IN p_user_id VARCHAR(191),
    IN p_type VARCHAR(20),
    IN p_source VARCHAR(50),
    IN p_reference_id VARCHAR(191),
    IN p_amount INT,
    IN p_description VARCHAR(1000)
)
BEGIN
    DECLARE v_wallet_id VARCHAR(191);
    DECLARE v_balance INT;
    DECLARE v_new_balance INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'WALLET_AMOUNT_INVALID';
    END IF;
    IF p_type NOT IN ('CREDIT', 'DEBIT') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'WALLET_TYPE_INVALID';
    END IF;

    START TRANSACTION;
    INSERT INTO `Wallet` (`id`, `userId`, `balance`, `createdAt`, `updatedAt`)
    VALUES (UUID(), p_user_id, 0, NOW(3), NOW(3))
    ON DUPLICATE KEY UPDATE `id` = `id`;

    SELECT `id`, `balance`
      INTO v_wallet_id, v_balance
      FROM `Wallet`
     WHERE `userId` = p_user_id
     FOR UPDATE;

    SET v_new_balance = v_balance + IF(p_type = 'CREDIT', p_amount, -p_amount);
    IF v_new_balance < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'WALLET_INSUFFICIENT_BALANCE';
    END IF;

    UPDATE `Wallet`
       SET `balance` = v_new_balance, `updatedAt` = NOW(3)
     WHERE `id` = v_wallet_id;

    INSERT INTO `WalletTransaction` (
        `id`, `walletId`, `userId`, `type`, `source`, `referenceId`,
        `amount`, `balanceAfter`, `description`, `createdAt`
    ) VALUES (
        UUID(), v_wallet_id, p_user_id, p_type, p_source, p_reference_id,
        p_amount, v_new_balance, p_description, NOW(3)
    );
    COMMIT;
END;

CREATE PROCEDURE `sp_create_payout_request`(
    IN p_payout_id VARCHAR(191),
    IN p_shop_id VARCHAR(191),
    IN p_amount INT,
    IN p_bank_name VARCHAR(255),
    IN p_account_number VARCHAR(255),
    IN p_account_holder VARCHAR(255),
    IN p_note VARCHAR(1000)
)
BEGIN
    DECLARE v_credit_id VARCHAR(191) DEFAULT NULL;
    DECLARE v_balance INT;
    DECLARE v_new_balance INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PAYOUT_AMOUNT_INVALID';
    END IF;

    START TRANSACTION;
    SELECT `id`, `balance`
      INTO v_credit_id, v_balance
      FROM `Credit`
     WHERE `shopId` = p_shop_id
     FOR UPDATE;

    IF v_credit_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CREDIT_NOT_FOUND';
    END IF;
    IF v_balance < p_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CREDIT_INSUFFICIENT_BALANCE';
    END IF;

    SET v_new_balance = v_balance - p_amount;
    INSERT INTO `PayoutRequest` (
        `id`, `creditId`, `shopId`, `amount`, `bankName`, `accountNumber`,
        `accountHolder`, `note`, `status`, `createdAt`, `updatedAt`
    ) VALUES (
        p_payout_id, v_credit_id, p_shop_id, p_amount, p_bank_name,
        p_account_number, p_account_holder, p_note, 'PENDING', NOW(3), NOW(3)
    );

    UPDATE `Credit`
       SET `balance` = v_new_balance, `updatedAt` = NOW(3)
     WHERE `id` = v_credit_id;

    INSERT INTO `CreditTransaction` (
        `id`, `creditId`, `shopId`, `type`, `source`, `referenceId`,
        `amount`, `balanceAfter`, `description`, `createdAt`
    ) VALUES (
        UUID(), v_credit_id, p_shop_id, 'DEBIT', 'WITHDRAWAL', p_payout_id,
        p_amount, v_new_balance, CONCAT('Tao yeu cau rut tien #', UPPER(RIGHT(p_payout_id, 8))), NOW(3)
    );
    COMMIT;
END;

-- Final database-level safeguards. Each MySQL event needs a separate trigger.
CREATE TRIGGER `trg_wallet_non_negative_before_insert`
BEFORE INSERT ON `Wallet`
FOR EACH ROW
BEGIN
    IF NEW.`balance` < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'WALLET_BALANCE_NEGATIVE';
    END IF;
END;

CREATE TRIGGER `trg_wallet_non_negative_before_update`
BEFORE UPDATE ON `Wallet`
FOR EACH ROW
BEGIN
    IF NEW.`balance` < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'WALLET_BALANCE_NEGATIVE';
    END IF;
END;

CREATE TRIGGER `trg_credit_non_negative_before_insert`
BEFORE INSERT ON `Credit`
FOR EACH ROW
BEGIN
    IF NEW.`balance` < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CREDIT_BALANCE_NEGATIVE';
    END IF;
END;

CREATE TRIGGER `trg_credit_non_negative_before_update`
BEFORE UPDATE ON `Credit`
FOR EACH ROW
BEGIN
    IF NEW.`balance` < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CREDIT_BALANCE_NEGATIVE';
    END IF;
END;
