/*
  Warnings:

  - You are about to drop the `ProductLiked` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[categoryName]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `ProductLiked` DROP FOREIGN KEY `ProductLiked_productId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductLiked` DROP FOREIGN KEY `ProductLiked_userId_fkey`;

-- DropTable
DROP TABLE `ProductLiked`;

-- CreateIndex
CREATE UNIQUE INDEX `Category_categoryName_key` ON `Category`(`categoryName`);
