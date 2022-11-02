/*
  Warnings:

  - You are about to drop the column `animation` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundColor` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `classList` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `contrastScore` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `dataset` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `firstChildElementCount` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `firstChildElementName` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `fontFamily` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `fontSize` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `fontWeight` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `hasAnimation` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `htmlId` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `lineHeight` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `margin` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `onClick` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `outerHtml` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `padding` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `referrerPolicy` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `relList` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `screenshot` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `sponsored` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `Anchor` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Anchor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Anchor" DROP COLUMN "animation",
DROP COLUMN "backgroundColor",
DROP COLUMN "classList",
DROP COLUMN "color",
DROP COLUMN "contrastScore",
DROP COLUMN "dataset",
DROP COLUMN "firstChildElementCount",
DROP COLUMN "firstChildElementName",
DROP COLUMN "fontFamily",
DROP COLUMN "fontSize",
DROP COLUMN "fontWeight",
DROP COLUMN "hasAnimation",
DROP COLUMN "height",
DROP COLUMN "htmlId",
DROP COLUMN "lineHeight",
DROP COLUMN "margin",
DROP COLUMN "onClick",
DROP COLUMN "outerHtml",
DROP COLUMN "padding",
DROP COLUMN "referrerPolicy",
DROP COLUMN "relList",
DROP COLUMN "screenshot",
DROP COLUMN "sponsored",
DROP COLUMN "target",
DROP COLUMN "textContent",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y";

-- CreateTable
CREATE TABLE "Variation" (
    "id" SERIAL NOT NULL,
    "anchorId" INTEGER NOT NULL,
    "outerHtml" TEXT NOT NULL,
    "relList" JSONB,
    "target" TEXT,
    "htmlId" TEXT,
    "dataset" JSONB,
    "onClick" TEXT,
    "classList" JSONB,
    "textContent" TEXT,
    "referrerPolicy" TEXT,
    "firstChildElementCount" INTEGER NOT NULL,
    "firstChildElementName" TEXT,
    "color" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "fontSize" DOUBLE PRECISION NOT NULL,
    "fontWeight" INTEGER NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "lineHeight" DOUBLE PRECISION NOT NULL,
    "padding" TEXT NOT NULL,
    "margin" TEXT NOT NULL,
    "animation" TEXT NOT NULL,
    "sponsored" BOOLEAN NOT NULL,
    "screenshot" TEXT,
    "hasAnimation" BOOLEAN NOT NULL,
    "contrastScore" DOUBLE PRECISION NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Variation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Variation" ADD CONSTRAINT "Variation_anchorId_fkey" FOREIGN KEY ("anchorId") REFERENCES "Anchor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
