-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `skuId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(500) NOT NULL,
    `skuValue` VARCHAR(500) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `productImage` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_shopId_idx`(`shopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `status` ENUM('CREATING', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL,
    `itemTotal` INTEGER NOT NULL DEFAULT 0,
    `shippingFee` INTEGER NOT NULL DEFAULT 0,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `grandTotal` INTEGER NOT NULL DEFAULT 0,
    `receiver` JSON NOT NULL,
    `paymentMethod` ENUM('COD', 'WALLET', 'ONLINE') NOT NULL,
    `paymentStatus` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paymentId` VARCHAR(191) NOT NULL,
    `timeline` JSON NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_code_key`(`code`),
    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_shopId_idx`(`shopId`),
    INDEX `Order_status_deletedAt_idx`(`status`, `deletedAt`),
    INDEX `Order_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `itemCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Cart_userId_idx`(`userId`),
    UNIQUE INDEX `Cart_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` VARCHAR(191) NOT NULL,
    `cartId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `skuId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `productName` VARCHAR(500) NOT NULL,
    `skuValue` VARCHAR(500) NOT NULL,
    `productImage` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CartItem_cartId_idx`(`cartId`),
    INDEX `CartItem_shopId_idx`(`shopId`),
    UNIQUE INDEX `CartItem_cartId_productId_skuId_key`(`cartId`, `productId`, `skuId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
