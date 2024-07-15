/*
  Warnings:

  - You are about to alter the column `status` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Product` MODIFY `status` ENUM('Sold', 'Selling') NOT NULL DEFAULT 'Selling';
