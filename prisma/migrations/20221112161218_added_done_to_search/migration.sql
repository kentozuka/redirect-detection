/*
  Warnings:

  - Made the column `res` on table `Search` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Search" ADD COLUMN     "done" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "res" SET NOT NULL;
