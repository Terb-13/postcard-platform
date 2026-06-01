-- CreateEnum
CREATE TYPE "MailingJobType" AS ENUM ('EDDM', 'TARGETED');

-- CreateEnum
CREATE TYPE "MailingJobStatus" AS ENUM ('PENDING', 'LIST_GENERATED', 'SENT_TO_PRINTER', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "productType" TEXT NOT NULL DEFAULT 'EDDM';

-- CreateTable
CREATE TABLE "MailingJob" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "MailingJobType" NOT NULL,
    "status" "MailingJobStatus" NOT NULL DEFAULT 'PENDING',
    "estimatedTotalCents" INTEGER NOT NULL,
    "finalTotalCents" INTEGER,
    "costBreakdown" JSONB,
    "selectedRoutes" JSONB,
    "eddmTotalHomes" INTEGER,
    "listProvider" TEXT,
    "listRequestId" TEXT,
    "recipientCount" INTEGER,
    "manifestUrl" TEXT,
    "finalQuantity" INTEGER,
    "dropDate" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailingJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailingJob_campaignId_key" ON "MailingJob"("campaignId");

-- CreateIndex
CREATE INDEX "MailingJob_status_idx" ON "MailingJob"("status");

-- CreateIndex
CREATE INDEX "MailingJob_type_status_idx" ON "MailingJob"("type", "status");

-- AddForeignKey
ALTER TABLE "MailingJob" ADD CONSTRAINT "MailingJob_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
