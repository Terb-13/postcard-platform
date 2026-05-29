import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Allowed statuses from print partners
const ALLOWED_PARTNER_STATUSES = ["SENT_TO_PROVIDER", "SHIPPED", "DELIVERED"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const apiKey = req.headers.get("x-production-key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const partner = await prisma.productionPartner.findUnique({
    where: { apiKey },
  });

  if (!partner) {
    return NextResponse.json({ error: "Invalid partner" }, { status: 403 });
  }

  const job = await prisma.productionJob.findUnique({
    where: { id: jobId },
    include: {
      campaign: { select: { name: true, size: true, quantity: true } },
      events: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!job || job.productionPartnerId !== partner.id) {
    return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json({ job });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const apiKey = req.headers.get("x-production-key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const partner = await prisma.productionPartner.findUnique({
    where: { apiKey },
  });

  if (!partner) {
    return NextResponse.json({ error: "Invalid partner" }, { status: 403 });
  }

  const { status, message, trackingNumber } = await req.json();

  if (!ALLOWED_PARTNER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const job = await prisma.productionJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.productionPartnerId !== partner.id) {
    return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
  }

  const updateData: any = { status };

  if (trackingNumber) {
    updateData.trackingNumber = trackingNumber;
  }

  const updated = await prisma.productionJob.update({
    where: { id: jobId },
    data: updateData,
  });

  await prisma.jobEvent.create({
    data: {
      productionJobId: jobId,
      status,
      note: message || `Status updated to ${status}`,
      metadata: trackingNumber ? { trackingNumber } : undefined,
    },
  });

  return NextResponse.json({ success: true, job: updated });
}
