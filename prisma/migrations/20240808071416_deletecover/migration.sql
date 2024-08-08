/*
  Warnings:

  - You are about to drop the column `cover` on the `Product` table. All the data in the column will be lost.
  - Made the column `images` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `cover`,
    MODIFY `images` JSON NOT NULL;
