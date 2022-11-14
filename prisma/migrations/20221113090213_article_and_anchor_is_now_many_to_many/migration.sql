/*
  Warnings:

  - You are about to drop the column `articleId` on the `Anchor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Anchor" DROP CONSTRAINT "Anchor_articleId_fkey";

-- AlterTable
ALTER TABLE "Anchor" DROP COLUMN "articleId";

-- CreateTable
CREATE TABLE "_AnchorToArticle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AnchorToArticle_AB_unique" ON "_AnchorToArticle"("A", "B");

-- CreateIndex
CREATE INDEX "_AnchorToArticle_B_index" ON "_AnchorToArticle"("B");

-- AddForeignKey
ALTER TABLE "_AnchorToArticle" ADD CONSTRAINT "_AnchorToArticle_A_fkey" FOREIGN KEY ("A") REFERENCES "Anchor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnchorToArticle" ADD CONSTRAINT "_AnchorToArticle_B_fkey" FOREIGN KEY ("B") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
