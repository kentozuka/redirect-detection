/*
  Warnings:

  - You are about to drop the column `bottom` on the `Detail` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Detail` table. All the data in the column will be lost.
  - You are about to drop the column `href` on the `Detail` table. All the data in the column will be lost.
  - You are about to drop the column `left` on the `Detail` table. All the data in the column will be lost.
  - You are about to drop the column `right` on the `Detail` table. All the data in the column will be lost.
  - You are about to drop the column `top` on the `Detail` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Detail` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `Detail` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Detail` table. All the data in the column will be lost.
  - Added the required column `bottom` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `href` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `left` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `right` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `top` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `x` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y` to the `Anchor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Anchor" ADD COLUMN     "bottom" INTEGER NOT NULL,
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "href" TEXT NOT NULL,
ADD COLUMN     "left" INTEGER NOT NULL,
ADD COLUMN     "right" INTEGER NOT NULL,
ADD COLUMN     "top" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL,
ADD COLUMN     "x" INTEGER NOT NULL,
ADD COLUMN     "y" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Detail" DROP COLUMN "bottom",
DROP COLUMN "height",
DROP COLUMN "href",
DROP COLUMN "left",
DROP COLUMN "right",
DROP COLUMN "top",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y";
