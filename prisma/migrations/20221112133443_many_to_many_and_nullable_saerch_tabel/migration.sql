/*
  Warnings:

  - You are about to drop the column `queryId` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_queryId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "queryId";

-- AlterTable
ALTER TABLE "Search" ALTER COLUMN "res" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_ArticleToResult" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleToResult_AB_unique" ON "_ArticleToResult"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleToResult_B_index" ON "_ArticleToResult"("B");

-- AddForeignKey
ALTER TABLE "_ArticleToResult" ADD CONSTRAINT "_ArticleToResult_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToResult" ADD CONSTRAINT "_ArticleToResult_B_fkey" FOREIGN KEY ("B") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
