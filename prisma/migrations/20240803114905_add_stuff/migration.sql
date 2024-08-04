/*
  Warnings:

  - You are about to drop the column `cover` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `cover`,
    ADD COLUMN `pending` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `image` VARCHAR(191) NULL;
