/*
  Warnings:

  - The values [APPROVE,REJECT] on the enum `RequestToBuy_requestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `ProductLiked` DROP FOREIGN KEY `ProductLiked_productId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductSaved` DROP FOREIGN KEY `ProductSaved_productId_fkey`;

-- DropForeignKey
ALTER TABLE `RequestToBuy` DROP FOREIGN KEY `RequestToBuy_productId_fkey`;

-- AlterTable
ALTER TABLE `RequestToBuy` MODIFY `requestStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `RequestToBuy` ADD CONSTRAINT `RequestToBuy_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSaved` ADD CONSTRAINT `ProductSaved_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductLiked` ADD CONSTRAINT `ProductLiked_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;
