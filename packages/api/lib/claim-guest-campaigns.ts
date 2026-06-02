import type { PrismaClient } from "@prisma/client";

export type ClaimGuestCampaignsResult = {
  claimedCount: number;
  campaignIds: string[];
};

/** Move guest-session campaigns (and linked saved maps) into the signed-in user's organization. */
export async function claimGuestCampaigns(
  prisma: PrismaClient,
  guestSessionId: string,
  targetOrganizationId: string
): Promise<ClaimGuestCampaignsResult> {
  const campaigns = await prisma.campaign.findMany({
    where: { guestSessionId },
    select: { id: true, savedMapId: true },
  });

  if (campaigns.length === 0) {
    return { claimedCount: 0, campaignIds: [] };
  }

  const savedMapIds = campaigns
    .map((c) => c.savedMapId)
    .filter((id): id is string => Boolean(id));

  await prisma.$transaction([
    prisma.campaign.updateMany({
      where: { guestSessionId },
      data: {
        organizationId: targetOrganizationId,
        guestSessionId: null,
      },
    }),
    ...(savedMapIds.length
      ? [
          prisma.savedMap.updateMany({
            where: { id: { in: savedMapIds } },
            data: { organizationId: targetOrganizationId },
          }),
        ]
      : []),
  ]);

  return {
    claimedCount: campaigns.length,
    campaignIds: campaigns.map((c) => c.id),
  };
}
