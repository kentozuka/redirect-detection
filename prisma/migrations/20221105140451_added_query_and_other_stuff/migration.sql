/*
  Warnings:

  - The `relList` column on the `Variation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dataset` column on the `Variation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `classList` column on the `Variation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `queryId` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Anchor" ADD COLUMN     "failed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "failed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "queryId" INTEGER NOT NULL,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "startAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Variation" DROP COLUMN "relList",
ADD COLUMN     "relList" TEXT[],
DROP COLUMN "dataset",
ADD COLUMN     "dataset" TEXT[],
DROP COLUMN "classList",
ADD COLUMN     "classList" TEXT[];

-- CreateTable
CREATE TABLE "Query" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "array" TEXT[],
    "resultNum" INTEGER NOT NULL,
    "searchEngine" TEXT NOT NULL,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
