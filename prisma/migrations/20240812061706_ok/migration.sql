/*
  Warnings:

  - You are about to drop the column `pending` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `pending`,
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';
