import { buildOrderTracking, type OrderTrackingSummary } from "./order-tracking";

type CampaignWithRelations = {
  status: string;
  paidAt?: Date | null;
  artwork?: { status: string } | null;
  productionJobs: Array<{
    id: string;
    status: string;
    trackingNumber: string | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    productionPartner?: { name: string | null } | null;
    events?: Array<{
      id: string;
      status: string;
      note: string | null;
      createdAt: Date;
    }>;
  }>;
};

export function trackingForCampaign(campaign: CampaignWithRelations): OrderTrackingSummary {
  const job = campaign.productionJobs[0] ?? null;
  return buildOrderTracking(campaign, campaign.artwork, job);
}
