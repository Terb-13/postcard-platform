-- Phase A: order history + guest checkout email capture
ALTER TABLE "Campaign" ADD COLUMN "purchaserEmail" TEXT;

CREATE INDEX "Campaign_organizationId_paidAt_idx" ON "Campaign"("organizationId", "paidAt");
