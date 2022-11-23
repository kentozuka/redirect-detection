/*
  Warnings:

  - A unique constraint covering the columns `[word]` on the table `Word` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Word" ALTER COLUMN "done" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");
