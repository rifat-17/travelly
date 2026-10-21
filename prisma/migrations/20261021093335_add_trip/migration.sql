-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trip_createdAt_idx" ON "Trip"("createdAt");
