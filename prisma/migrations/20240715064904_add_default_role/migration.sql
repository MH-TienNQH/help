-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('User', 'Admin') NOT NULL DEFAULT 'User';
