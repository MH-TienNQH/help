/*
  Warnings:

  - You are about to drop the `ProductSaved` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Saved` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ProductSaved` DROP FOREIGN KEY `ProductSaved_productId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductSaved` DROP FOREIGN KEY `ProductSaved_savedId_fkey`;

-- DropForeignKey
ALTER TABLE `Saved` DROP FOREIGN KEY `Saved_userId_fkey`;

-- DropTable
DROP TABLE `ProductSaved`;

-- DropTable
DROP TABLE `Saved`;
