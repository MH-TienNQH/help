/*
  Warnings:

  - You are about to drop the column `authorId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_authorId_fkey`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `authorId`;
