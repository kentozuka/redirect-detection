-- CreateTable
CREATE TABLE "Avoid" (
    "id" SERIAL NOT NULL,
    "hostname" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avoid_pkey" PRIMARY KEY ("id")
);
