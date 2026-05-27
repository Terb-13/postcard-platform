import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Production Partner API
 * This is called by print vendors to receive new jobs from the platform.
 * Auth: X-Production-Key header
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-production-key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const partner = await prisma.productionPartner.findUnique({
    where: { apiKey },
  });

  if (!partner || !partner.isActive) {
    return NextResponse.json({ error: "Invalid or inactive partner" }, { status: 403 });
  }

  const body = await req.json();

  // In real flow this would come from internal campaign creation
  const job = await prisma.productionJob.create({
    data: {
      campaignId: body.campaignId,
      productionPartnerId: partner.id,
      status: "RECEIVED",
      payload: body.payload || {},
      externalId: body.externalId,
    },
  });

  // Create initial event
  await prisma.jobEvent.create({
    data: {
      productionJobId: job.id,
      status: "RECEIVED",
      message: "Job received by platform",
    },
  });

  return NextResponse.json({ success: true, jobId: job.id }, { status: 201 });
}
