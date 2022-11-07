/*
  Warnings:

  - You are about to drop the column `count` on the `Query` table. All the data in the column will be lost.
  - You are about to drop the column `safe` on the `Query` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Query` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Query" DROP COLUMN "count",
DROP COLUMN "safe",
DROP COLUMN "title";
