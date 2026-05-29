-- CreateTable
CREATE TABLE "TargetingCriteria" (
    "id" TEXT NOT NULL,
    "geoJson" JSONB NOT NULL,
    "filters" JSONB,
    "estimatedReach" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetingCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TargetingCriteria_campaignId_key" ON "TargetingCriteria"("campaignId");

-- CreateIndex
CREATE INDEX "TargetingCriteria_campaignId_idx" ON "TargetingCriteria"("campaignId");

-- AddForeignKey
ALTER TABLE "TargetingCriteria" ADD CONSTRAINT "TargetingCriteria_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
