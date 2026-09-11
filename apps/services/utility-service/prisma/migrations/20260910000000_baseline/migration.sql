-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('ORDER_UPDATE', 'PROMOTION', 'WALLET_UPDATE', 'OTHER') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `link` VARCHAR(1000) NULL,
    `image` VARCHAR(1000) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `targetType` ENUM('USER', 'SELLER', 'PRODUCT', 'ORDER', 'MESSAGE', 'REVIEW') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `category` ENUM('SCAM', 'FRAUD', 'FAKE', 'HARASSMENT', 'SPAM', 'OTHER') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` VARCHAR(2000) NOT NULL,
    `status` ENUM('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `assigneeAdminId` VARCHAR(191) NULL,
    `closedAt` DATETIME(3) NULL,
    `media` JSON NOT NULL,
    `action` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Report_status_createdAt_idx`(`status`, `createdAt` DESC),
    INDEX `Report_targetType_targetId_idx`(`targetType`, `targetId`),
    INDEX `Report_reporterId_createdAt_idx`(`reporterId`, `createdAt` DESC),
    INDEX `Report_assigneeAdminId_status_idx`(`assigneeAdminId`, `status`),
    INDEX `Report_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `orderItemId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `content` VARCHAR(1000) NULL,
    `mediaUrls` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Review_productId_createdAt_idx`(`productId`, `createdAt` DESC),
    INDEX `Review_sellerId_createdAt_idx`(`sellerId`, `createdAt` DESC),
    INDEX `Review_userId_createdAt_idx`(`userId`, `createdAt` DESC),
    INDEX `Review_orderId_idx`(`orderId`),
    INDEX `Review_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `Review_userId_orderItemId_key`(`userId`, `orderItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewReply` (
    `id` VARCHAR(191) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ReviewReply_reviewId_key`(`reviewId`),
    INDEX `ReviewReply_sellerId_createdAt_idx`(`sellerId`, `createdAt` DESC),
    INDEX `ReviewReply_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RatingAggregate` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `averageRating` DOUBLE NOT NULL DEFAULT 0,
    `totalReviews` INTEGER NOT NULL DEFAULT 0,
    `star1Count` INTEGER NOT NULL DEFAULT 0,
    `star2Count` INTEGER NOT NULL DEFAULT 0,
    `star3Count` INTEGER NOT NULL DEFAULT 0,
    `star4Count` INTEGER NOT NULL DEFAULT 0,
    `star5Count` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RatingAggregate_productId_key`(`productId`),
    INDEX `RatingAggregate_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `isHidden` BOOLEAN NOT NULL DEFAULT false,
    `duration` INTEGER NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `uploadedById` VARCHAR(191) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Video_shopId_idx`(`shopId`),
    INDEX `Video_productId_idx`(`productId`),
    INDEX `Video_status_idx`(`status`),
    INDEX `Video_isHidden_idx`(`isHidden`),
    INDEX `Video_uploadedById_idx`(`uploadedById`),
    INDEX `Video_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReviewReply` ADD CONSTRAINT `ReviewReply_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
