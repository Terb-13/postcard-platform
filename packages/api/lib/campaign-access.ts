import { TRPCError } from "@trpc/server";
import type { Campaign, User } from "@prisma/client";

type CampaignAccessCtx = {
  user: User | null;
  guestSessionId: string | null;
  organizationId: string;
};

export function assertCampaignAccess(
  campaign: Pick<Campaign, "organizationId" | "guestSessionId">,
  ctx: CampaignAccessCtx
): void {
  if (campaign.organizationId !== ctx.organizationId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
  }

  if (!ctx.user && ctx.guestSessionId) {
    if (campaign.guestSessionId && campaign.guestSessionId !== ctx.guestSessionId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
    }
  }
}
