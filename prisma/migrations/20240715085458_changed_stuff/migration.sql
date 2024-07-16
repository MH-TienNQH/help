/*
  Warnings:

  - You are about to drop the `ProductCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ProductCategory` DROP FOREIGN KEY `ProductCategory_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductCategory` DROP FOREIGN KEY `ProductCategory_productId_fkey`;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `categoryId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `ProductCategory`;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`categoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;
