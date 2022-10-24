/*
  Warnings:

  - You are about to drop the `Detail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `animation` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `backgroundColor` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstChildElementCount` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fontFamily` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fontSize` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fontWeight` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineHeight` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `margin` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outerHtml` to the `Anchor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `padding` to the `Anchor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Detail" DROP CONSTRAINT "Detail_anchorId_fkey";

-- AlterTable
ALTER TABLE "Anchor" ADD COLUMN     "animation" TEXT NOT NULL,
ADD COLUMN     "backgroundColor" TEXT NOT NULL,
ADD COLUMN     "classList" JSONB,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "datasets" JSONB,
ADD COLUMN     "firstChildElementCount" INTEGER NOT NULL,
ADD COLUMN     "firstChildElementName" TEXT,
ADD COLUMN     "fontFamily" TEXT NOT NULL,
ADD COLUMN     "fontSize" INTEGER NOT NULL,
ADD COLUMN     "fontWeight" INTEGER NOT NULL,
ADD COLUMN     "htmlId" TEXT,
ADD COLUMN     "lineHeight" INTEGER NOT NULL,
ADD COLUMN     "margin" TEXT NOT NULL,
ADD COLUMN     "onClick" TEXT,
ADD COLUMN     "outerHtml" TEXT NOT NULL,
ADD COLUMN     "padding" TEXT NOT NULL,
ADD COLUMN     "referrerPolicy" TEXT,
ADD COLUMN     "relList" JSONB,
ADD COLUMN     "target" TEXT,
ADD COLUMN     "textContext" TEXT;

-- DropTable
DROP TABLE "Detail";
