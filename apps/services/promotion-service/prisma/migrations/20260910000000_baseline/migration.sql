-- CreateTable
CREATE TABLE `Promotion` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `description` VARCHAR(1000) NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'DRAFT',
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `scope` ENUM('ORDER', 'SHIPPING') NOT NULL DEFAULT 'ORDER',
    `minOrderSubtotal` INTEGER NOT NULL DEFAULT 0,
    `discountType` ENUM('PERCENT', 'AMOUNT') NOT NULL,
    `discountValue` INTEGER NOT NULL,
    `maxDiscount` INTEGER NULL,
    `totalLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Promotion_deletedAt_idx`(`deletedAt`),
    INDEX `Promotion_scope_idx`(`scope`),
    INDEX `Promotion_discountType_idx`(`discountType`),
    UNIQUE INDEX `Promotion_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Redemption` (
    `id` VARCHAR(191) NOT NULL,
    `promotionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderIds` JSON NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discountType` ENUM('PERCENT', 'AMOUNT') NOT NULL,
    `discountValue` INTEGER NOT NULL,
    `minOrderSubtotal` INTEGER NOT NULL,
    `maxDiscount` INTEGER NULL,
    `claimedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Redemption_promotionId_userId_key`(`promotionId`, `userId`),
    UNIQUE INDEX `Redemption_code_userId_key`(`code`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Redemption` ADD CONSTRAINT `Redemption_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
