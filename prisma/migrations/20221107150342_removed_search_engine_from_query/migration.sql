/*
  Warnings:

  - You are about to drop the column `searchEngine` on the `Query` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Query" DROP COLUMN "searchEngine",
ALTER COLUMN "totalResults" SET DATA TYPE TEXT;
