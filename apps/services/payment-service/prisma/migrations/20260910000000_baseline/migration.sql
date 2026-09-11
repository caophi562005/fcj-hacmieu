-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderId` JSON NOT NULL,
    `method` ENUM('COD', 'ONLINE', 'WALLET') NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `amount` INTEGER NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_code_key`(`code`),
    INDEX `Payment_code_idx`(`code`),
    INDEX `Payment_userId_idx`(`userId`),
    INDEX `Payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gateway` VARCHAR(100) NOT NULL,
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accountNumber` VARCHAR(100) NULL,
    `subAccount` VARCHAR(250) NULL,
    `amountIn` INTEGER NOT NULL DEFAULT 0,
    `amountOut` INTEGER NOT NULL DEFAULT 0,
    `accumulated` INTEGER NOT NULL DEFAULT 0,
    `code` VARCHAR(250) NULL,
    `transactionContent` TEXT NULL,
    `referenceNumber` VARCHAR(255) NULL,
    `body` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refund` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reason` TEXT NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Refund_userId_idx`(`userId`),
    INDEX `Refund_orderId_idx`(`orderId`),
    INDEX `Refund_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
