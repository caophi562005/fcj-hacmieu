-- CreateTable
CREATE TABLE `Merchant` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('INDIVIDUAL', 'BUSINESS') NOT NULL DEFAULT 'INDIVIDUAL',
    `legalName` VARCHAR(500) NOT NULL,
    `taxCode` VARCHAR(100) NULL,
    `approvalStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    `canSell` BOOLEAN NOT NULL DEFAULT false,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Merchant_userId_key`(`userId`),
    INDEX `Merchant_approvalStatus_idx`(`approvalStatus`),
    INDEX `Merchant_canSell_idx`(`canSell`),
    INDEX `Merchant_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shop` (
    `id` VARCHAR(191) NOT NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL DEFAULT '',
    `name` VARCHAR(500) NOT NULL,
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `logo` VARCHAR(1000) NULL,
    `banner` VARCHAR(1000) NULL,
    `phone` VARCHAR(20) NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'INACTIVE', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `pickupAddress` VARCHAR(1000) NULL,
    `returnAddress` VARCHAR(1000) NULL,
    `bankName` VARCHAR(255) NULL,
    `bankAccountNumber` VARCHAR(50) NULL,
    `bankCode` VARCHAR(50) NULL,
    `bankAccountName` VARCHAR(255) NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Shop_merchantId_key`(`merchantId`),
    INDEX `Shop_status_idx`(`status`),
    INDEX `Shop_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
