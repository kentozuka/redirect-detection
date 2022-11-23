-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);
