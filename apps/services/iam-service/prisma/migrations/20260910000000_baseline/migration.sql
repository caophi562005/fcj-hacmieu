-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(20) NULL,
    `avatar` VARCHAR(1000) NULL,
    `birthday` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `group` JSON NOT NULL,
    `provinceId` INTEGER NULL,
    `provinceName` VARCHAR(255) NULL,
    `districtId` INTEGER NULL,
    `districtName` VARCHAR(255) NULL,
    `wardId` INTEGER NULL,
    `wardName` VARCHAR(255) NULL,
    `address` VARCHAR(1000) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_deletedAt_idx`(`deletedAt`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_username_idx`(`username`),
    INDEX `User_status_idx`(`status`),
    UNIQUE INDEX `User_email_deletedAt_key`(`email`, `deletedAt`),
    UNIQUE INDEX `User_username_deletedAt_key`(`username`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `path` VARCHAR(500) NOT NULL,
    `method` ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD') NOT NULL,
    `module` VARCHAR(500) NOT NULL DEFAULT '',
    `group` ENUM('ADMIN', 'SELLER', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Permission_deletedAt_idx`(`deletedAt`),
    INDEX `Permission_group_idx`(`group`),
    UNIQUE INDEX `Permission_path_method_group_key`(`path`, `method`, `group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
