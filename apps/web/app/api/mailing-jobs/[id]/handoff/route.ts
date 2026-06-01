import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgUser } from "@/lib/api-auth";
import { handoffToDrummond } from "@postcard-platform/api/services/drummond-handoff.service";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrgUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const job = await prisma.mailingJob.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!job || job.campaign.organizationId !== auth.user.organizationId) {
    return NextResponse.json({ error: "Mailing job not found" }, { status: 404 });
  }

  if (job.status !== "LIST_GENERATED" && job.status !== "SENT_TO_PRINTER") {
    return NextResponse.json(
      { error: "Finalize routes/list before handoff" },
      { status: 400 }
    );
  }

  const handoff = await handoffToDrummond({
    mailingJob: job,
    campaignName: job.campaign.name,
    size: job.campaign.size,
    campaignId: job.campaign.id,
  });

  if (handoff.manifestUrl) {
    await prisma.mailingJob.update({
      where: { id: job.id },
      data: { status: "SENT_TO_PRINTER", manifestUrl: handoff.manifestUrl },
    });
  }

  return NextResponse.json(handoff);
}
