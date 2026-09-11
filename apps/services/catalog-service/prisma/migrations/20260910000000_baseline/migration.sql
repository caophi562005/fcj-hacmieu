-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `logo` VARCHAR(1000) NULL,
    `parentCategoryId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Category_name_idx`(`name`),
    INDEX `Category_parentCategoryId_idx`(`parentCategoryId`),
    INDEX `Category_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brand` (
    `id` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(1000) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Brand_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `Brand_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,
    `provinceId` INTEGER NOT NULL,
    `provinceName` VARCHAR(255) NOT NULL,
    `districtId` INTEGER NOT NULL,
    `districtName` VARCHAR(255) NOT NULL,
    `wardId` INTEGER NOT NULL,
    `wardName` VARCHAR(255) NOT NULL,
    `sizeGuide` TEXT NULL,
    `basePrice` DOUBLE NOT NULL DEFAULT 0,
    `virtualPrice` DOUBLE NOT NULL DEFAULT 0,
    `brandId` VARCHAR(191) NULL,
    `images` JSON NOT NULL,
    `variants` JSON NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'BANNED', 'DRAFT') NOT NULL DEFAULT 'DRAFT',
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `ratingCount` INTEGER NOT NULL DEFAULT 0,
    `ratingSum` INTEGER NOT NULL DEFAULT 0,
    `averageRate` DOUBLE NOT NULL DEFAULT 0,
    `attributes` JSON NOT NULL,
    `soldCount` INTEGER NOT NULL DEFAULT 0,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `isHidden` BOOLEAN NOT NULL DEFAULT false,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Product_isHidden_idx`(`isHidden`),
    INDEX `Product_shopId_idx`(`shopId`),
    INDEX `Product_brandId_idx`(`brandId`),
    INDEX `Product_createdById_idx`(`createdById`),
    INDEX `Product_name_idx`(`name`),
    INDEX `Product_deletedAt_idx`(`deletedAt`),
    INDEX `Product_provinceId_idx`(`provinceId`),
    INDEX `Product_districtId_idx`(`districtId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attribute` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `url` VARCHAR(1000) NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Attribute_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `Attribute_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SKU` (
    `id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(500) NOT NULL,
    `price` DOUBLE NOT NULL,
    `stock` INTEGER NOT NULL,
    `image` VARCHAR(1000) NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SKU_deletedAt_idx`(`deletedAt`),
    INDEX `SKU_productId_idx`(`productId`),
    UNIQUE INDEX `SKU_productId_value_key`(`productId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProductCategories` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProductCategories_AB_unique`(`A`, `B`),
    INDEX `_ProductCategories_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentCategoryId_fkey` FOREIGN KEY (`parentCategoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `SKU` ADD CONSTRAINT `SKU_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `_ProductCategories` ADD CONSTRAINT `_ProductCategories_A_fkey` FOREIGN KEY (`A`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductCategories` ADD CONSTRAINT `_ProductCategories_B_fkey` FOREIGN KEY (`B`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
