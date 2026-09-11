-- CreateTable
CREATE TABLE `ReviewSummary` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `pros` JSON NOT NULL,
    `cons` JSON NOT NULL,
    `summary` VARCHAR(2000) NOT NULL,
    `reviewCount` INTEGER NOT NULL,
    `lastReviewAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ReviewSummary_productId_key`(`productId`),
    INDEX `ReviewSummary_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
