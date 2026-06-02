-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "guestSessionId" TEXT;

-- CreateIndex
CREATE INDEX "Campaign_guestSessionId_idx" ON "Campaign"("guestSessionId");
