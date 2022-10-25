/*
  Warnings:

  - You are about to drop the column `bottom` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `datasets` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `left` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `right` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `samePage` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `textContext` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `top` on the `Anchor` table. All the data in the column will be lost.
  - Added the required column `sameOrigin` to the `Anchor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Anchor" DROP COLUMN "bottom",
DROP COLUMN "datasets",
DROP COLUMN "left",
DROP COLUMN "right",
DROP COLUMN "samePage",
DROP COLUMN "textContext",
DROP COLUMN "top",
ADD COLUMN     "dataset" JSONB,
ADD COLUMN     "sameOrigin" BOOLEAN NOT NULL,
ADD COLUMN     "textContent" TEXT,
ALTER COLUMN "screenshot" DROP NOT NULL;
