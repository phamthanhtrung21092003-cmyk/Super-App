/*
  Warnings:

  - You are about to drop the column `isOnline` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `walletBalance` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `coins` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rewardPoints` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `vipTier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `walletBalance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LinkedBank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RideRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavingsBook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "LinkedBank" DROP CONSTRAINT "LinkedBank_userId_fkey";

-- DropForeignKey
ALTER TABLE "RideRequest" DROP CONSTRAINT "RideRequest_driverId_fkey";

-- DropForeignKey
ALTER TABLE "RideRequest" DROP CONSTRAINT "RideRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "SavingsBook" DROP CONSTRAINT "SavingsBook_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "isOnline",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "walletBalance",
ADD COLUMN     "hashedRefreshToken" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
DROP COLUMN "coins",
DROP COLUMN "rewardPoints",
DROP COLUMN "vipTier",
DROP COLUMN "walletBalance",
ADD COLUMN     "hashedRefreshToken" TEXT;

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "LinkedBank";

-- DropTable
DROP TABLE "RideRequest";

-- DropTable
DROP TABLE "SavingsBook";

-- DropTable
DROP TABLE "Transaction";
