/*
  Warnings:

  - You are about to drop the column `endAt` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "endAt",
DROP COLUMN "scheduledAt",
DROP COLUMN "startAt",
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "time" INTEGER;

-- CreateTable
CREATE TABLE "Error" (
    "id" SERIAL NOT NULL,
    "occured" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "trace" TEXT NOT NULL,

    CONSTRAINT "Error_pkey" PRIMARY KEY ("id")
);
