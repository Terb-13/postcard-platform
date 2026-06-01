import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgUser } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireOrgUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const job = await prisma.mailingJob.findUnique({
    where: { id },
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
          organizationId: true,
          size: true,
          quantity: true,
          productType: true,
        },
      },
    },
  });

  if (!job || job.campaign.organizationId !== auth.user.organizationId) {
    return NextResponse.json({ error: "Mailing job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
