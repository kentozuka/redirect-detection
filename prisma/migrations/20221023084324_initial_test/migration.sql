-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "keywords" TEXT,
    "description" TEXT,
    "image" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anchor" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "sponsored" BOOLEAN NOT NULL,
    "screenshot" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "samePage" BOOLEAN NOT NULL,
    "hasAnimation" BOOLEAN NOT NULL,
    "contrastScore" INTEGER NOT NULL,

    CONSTRAINT "Anchor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detail" (
    "anchorId" INTEGER NOT NULL,
    "href" TEXT NOT NULL,
    "target" TEXT,
    "referrerPolicy" TEXT,
    "textContext" TEXT,
    "outerHtml" TEXT NOT NULL,
    "datasets" JSONB,
    "htmlId" TEXT,
    "relList" JSONB,
    "classList" JSONB,
    "firstChildElementCount" INTEGER NOT NULL,
    "firstChildElementName" TEXT,
    "onClick" TEXT,
    "color" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "fontSize" INTEGER NOT NULL,
    "fontWeight" INTEGER NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "lineHeight" INTEGER NOT NULL,
    "padding" TEXT NOT NULL,
    "margin" TEXT NOT NULL,
    "animation" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "top" INTEGER NOT NULL,
    "right" INTEGER NOT NULL,
    "bottom" INTEGER NOT NULL,
    "left" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "anchorId" INTEGER NOT NULL,
    "start" TEXT NOT NULL,
    "documentNum" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "similarity" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doc" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "positive" BOOLEAN NOT NULL,
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "blacklisted" BOOLEAN NOT NULL,

    CONSTRAINT "Doc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parameter" (
    "id" SERIAL NOT NULL,
    "docId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Parameter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Detail_anchorId_key" ON "Detail"("anchorId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_anchorId_key" ON "Route"("anchorId");

-- AddForeignKey
ALTER TABLE "Anchor" ADD CONSTRAINT "Anchor_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detail" ADD CONSTRAINT "Detail_anchorId_fkey" FOREIGN KEY ("anchorId") REFERENCES "Anchor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_anchorId_fkey" FOREIGN KEY ("anchorId") REFERENCES "Anchor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parameter" ADD CONSTRAINT "Parameter_docId_fkey" FOREIGN KEY ("docId") REFERENCES "Doc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
