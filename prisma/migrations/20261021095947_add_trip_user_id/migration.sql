-- DropIndex
DROP INDEX "Trip_createdAt_idx";

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Trip_userId_createdAt_idx" ON "Trip"("userId", "createdAt");
