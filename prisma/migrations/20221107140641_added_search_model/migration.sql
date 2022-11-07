/*
  Warnings:

  - You are about to drop the column `resultNum` on the `Query` table. All the data in the column will be lost.
  - Added the required column `count` to the `Query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `safe` to the `Query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalResults` to the `Query` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Query" DROP COLUMN "resultNum",
ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "safe" BOOLEAN NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "totalResults" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Search" (
    "id" SERIAL NOT NULL,
    "cx" TEXT NOT NULL,
    "q" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "res" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);
