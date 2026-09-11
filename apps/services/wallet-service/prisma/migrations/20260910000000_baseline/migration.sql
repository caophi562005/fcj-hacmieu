-- CreateTable
CREATE TABLE `Wallet` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Wallet_userId_key`(`userId`),
    INDEX `Wallet_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WalletTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('CREDIT', 'DEBIT') NOT NULL,
    `source` ENUM('ORDER_REWARD', 'REVIEW_REWARD', 'PROMOTION_GIFT', 'REFERRAL', 'TOPUP', 'REFUND', 'ORDER_PAYMENT', 'SYSTEM', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `referenceId` VARCHAR(191) NULL,
    `amount` INTEGER NOT NULL,
    `balanceAfter` INTEGER NOT NULL,
    `description` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WalletTransaction_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `WalletTransaction_walletId_createdAt_idx`(`walletId`, `createdAt`),
    INDEX `WalletTransaction_userId_source_idx`(`userId`, `source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Credit` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Credit_shopId_key`(`shopId`),
    INDEX `Credit_shopId_idx`(`shopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `creditId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `type` ENUM('CREDIT', 'DEBIT') NOT NULL,
    `source` ENUM('ORDER_REVENUE', 'WITHDRAWAL', 'REFUND', 'SYSTEM', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `referenceId` VARCHAR(191) NULL,
    `amount` INTEGER NOT NULL,
    `balanceAfter` INTEGER NOT NULL,
    `description` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CreditTransaction_shopId_createdAt_idx`(`shopId`, `createdAt`),
    INDEX `CreditTransaction_creditId_createdAt_idx`(`creditId`, `createdAt`),
    INDEX `CreditTransaction_shopId_source_idx`(`shopId`, `source`),
    UNIQUE INDEX `CreditTransaction_shopId_source_referenceId_key`(`shopId`, `source`, `referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayoutRequest` (
    `id` VARCHAR(191) NOT NULL,
    `creditId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `bankName` VARCHAR(255) NOT NULL,
    `accountNumber` VARCHAR(255) NOT NULL,
    `accountHolder` VARCHAR(255) NOT NULL,
    `note` VARCHAR(1000) NULL,
    `status` ENUM('PENDING', 'TRANSFERRED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectReason` VARCHAR(1000) NULL,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PayoutRequest_shopId_createdAt_idx`(`shopId`, `createdAt`),
    INDEX `PayoutRequest_creditId_createdAt_idx`(`creditId`, `createdAt`),
    INDEX `PayoutRequest_shopId_status_createdAt_idx`(`shopId`, `status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WalletTransaction` ADD CONSTRAINT `WalletTransaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditTransaction` ADD CONSTRAINT `CreditTransaction_creditId_fkey` FOREIGN KEY (`creditId`) REFERENCES `Credit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayoutRequest` ADD CONSTRAINT `PayoutRequest_creditId_fkey` FOREIGN KEY (`creditId`) REFERENCES `Credit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
