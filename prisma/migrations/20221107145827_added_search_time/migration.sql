/*
  Warnings:

  - Added the required column `searchTime` to the `Query` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Query" ADD COLUMN     "searchTime" DOUBLE PRECISION NOT NULL;
