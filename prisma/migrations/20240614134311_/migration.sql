/*
  Warnings:

  - You are about to drop the column `userId` on the `Comments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Comments` DROP FOREIGN KEY `Comments_userId_fkey`;

-- AlterTable
ALTER TABLE `Comments` DROP COLUMN `userId`;
