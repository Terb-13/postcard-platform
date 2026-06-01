import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgUser } from "@/lib/api-auth";
import { finalizeMailingJob } from "@postcard-platform/api/services/mailing-finalize.service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrgUser();
  if ("error" in auth) return auth.error;

  const { id: campaignId } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.organizationId !== auth.user.organizationId) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const runHandoff = body?.runHandoff !== false;

  try {
    const result = await finalizeMailingJob(campaignId, { runHandoff });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Finalize failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
