import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Production Partner uploads proof for a job
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
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

  const { proofUrl } = await req.json();

  if (!proofUrl) {
    return NextResponse.json({ error: "proofUrl is required" }, { status: 400 });
  }

  const job = await prisma.productionJob.findUnique({
    where: { id: params.jobId },
  });

  if (!job || job.productionPartnerId !== partner.id) {
    return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
  }

  await prisma.productionJob.update({
    where: { id: params.jobId },
    data: { proofUrl },
  });

  await prisma.jobEvent.create({
    data: {
      productionJobId: params.jobId,
      status: job.status,
      message: "Proof uploaded by partner",
      metadata: { proofUrl },
    },
  });

  // Notify customer that proof was uploaded
  const campaign = await prisma.campaign.findUnique({
    where: { id: job.campaignId },
    include: { organization: true },
  });

  const user = campaign
    ? await prisma.user.findFirst({
        where: { organizationId: campaign.organizationId },
        orderBy: { createdAt: "asc" },
      })
    : null;

  if (user?.email) {
    const { sendEmail } = await import("@/packages/api/lib/email");
    await sendEmail({
      to: user.email,
      subject: `Proof uploaded for ${campaign!.name}`,
      html: `
        <p>A proof has been uploaded by the production partner for your campaign <strong>${campaign!.name}</strong>.</p>
        <p>Log into your dashboard to review it.</p>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
