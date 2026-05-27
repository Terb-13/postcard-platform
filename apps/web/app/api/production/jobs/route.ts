import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Production Partner API
 * Auth: X-Production-Key header
 */
async function getAuthenticatedPartner(req: NextRequest) {
  const apiKey = req.headers.get("x-production-key");
  if (!apiKey) return null;

  return prisma.productionPartner.findUnique({
    where: { apiKey },
  });
}

export async function GET(req: NextRequest) {
  const partner = await getAuthenticatedPartner(req);
  if (!partner || !partner.isActive) {
    return NextResponse.json({ error: "Invalid or inactive partner" }, { status: 403 });
  }

  const jobs = await prisma.productionJob.findMany({
    where: { productionPartnerId: partner.id },
    orderBy: { createdAt: "desc" },
    include: {
      campaign: {
        select: { name: true, size: true, quantity: true },
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  return NextResponse.json({ jobs });
}

/**
 * (Optional) Platform can still POST new jobs to a partner if needed
 */
export async function POST(req: NextRequest) {
  const partner = await getAuthenticatedPartner(req);
  if (!partner || !partner.isActive) {
    return NextResponse.json({ error: "Invalid or inactive partner" }, { status: 403 });
  }

  const body = await req.json();

  const job = await prisma.productionJob.create({
    data: {
      campaignId: body.campaignId,
      productionPartnerId: partner.id,
      status: "RECEIVED",
      payload: body.payload || {},
      externalId: body.externalId,
    },
  });

  await prisma.jobEvent.create({
    data: {
      productionJobId: job.id,
      status: "RECEIVED",
      message: "Job received by platform",
    },
  });

  return NextResponse.json({ success: true, jobId: job.id }, { status: 201 });
}
