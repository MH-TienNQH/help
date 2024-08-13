-- AlterTable
ALTER TABLE `Product` ADD COLUMN `statusMessage` VARCHAR(191) NOT NULL DEFAULT 'Your product is pending for approval',
    MODIFY `categoryId` INTEGER NOT NULL DEFAULT 1;
