/*
  Warnings:

  - You are about to drop the `Query` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_queryId_fkey";

-- DropTable
DROP TABLE "Query";

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "array" TEXT[],
    "totalResults" TEXT NOT NULL,
    "searchTime" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
