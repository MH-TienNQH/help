/*
  Warnings:

  - Added the required column `message` to the `RequestToBuy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offer` to the `RequestToBuy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_userId_fkey`;

-- DropForeignKey
ALTER TABLE `RequestToBuy` DROP FOREIGN KEY `RequestToBuy_userId_fkey`;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `pending` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `statusMessage` VARCHAR(191) NOT NULL DEFAULT 'Your product is waiting for approval';

-- AlterTable
ALTER TABLE `RequestToBuy` ADD COLUMN `message` VARCHAR(191) NOT NULL,
    ADD COLUMN `offer` INTEGER NOT NULL,
    ADD COLUMN `requestStatus` ENUM('PENDING', 'APPROVE', 'REJECT') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`categoryId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestToBuy` ADD CONSTRAINT `RequestToBuy_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
