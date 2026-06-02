import type { Campaign, Prisma, PrismaClient } from "@prisma/client";
import { targetingPayloadBlock } from "./targeting-summary";
import { ensureMailingJobForCampaign } from "../services/mailing-finalize.service";

type ActivateOptions = {
  amountPaidCents?: number;
  purchaserEmail?: string | null;
  paymentIntentId?: string;
  actor?: string;
};

/** Mark campaign paid and create production + mailing jobs (same path as Stripe webhook). */
export async function activateOrderForProduction(
  prisma: PrismaClient,
  campaign: Campaign & { savedMap?: { metadata: unknown } | null },
  options: ActivateOptions = {}
) {
  const {
    amountPaidCents = campaign.totalPriceCents ?? 12500,
    purchaserEmail = null,
    paymentIntentId,
    actor = "system",
  } = options;

  const existingJob = await prisma.productionJob.findUnique({
    where: { campaignId: campaign.id },
  });
  if (existingJob) {
    return { campaign, productionJob: existingJob, created: false as const };
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      amountPaidCents,
      purchaserEmail,
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
    },
  });

  const firstActivePartner = await prisma.productionPartner.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const targetingMeta = campaign.targetingMetadata ?? campaign.savedMap?.metadata;
  const targeting = targetingPayloadBlock(targetingMeta);

  const jobPayload = {
    campaignName: campaign.name,
    size: campaign.size,
    quantity: campaign.quantity,
    dropDate: campaign.dropDate?.toISOString() ?? null,
    totalPriceCents: campaign.totalPriceCents,
    notes: campaign.notes,
    ...(targeting ? { targeting } : {}),
  } satisfies Record<string, unknown>;

  const productionJob = await prisma.productionJob.create({
    data: {
      campaignId: campaign.id,
      productionPartnerId: firstActivePartner?.id ?? null,
      status: "RECEIVED",
      payload: jobPayload as Prisma.InputJsonValue,
    },
  });

  await ensureMailingJobForCampaign(campaign);

  const updatedCampaign = await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: "IN_PRODUCTION" },
  });

  await prisma.jobEvent.create({
    data: {
      productionJobId: productionJob.id,
      status: "RECEIVED",
      note: firstActivePartner
        ? `Order activated. Assigned to ${firstActivePartner.name}`
        : "Order activated. Awaiting partner assignment.",
      actor,
    },
  });

  return { campaign: updatedCampaign, productionJob, created: true as const };
}

export function isTestOrdersEnabled(): boolean {
  return (
    process.env.ALLOW_TEST_ORDERS === "true" ||
    process.env.NODE_ENV === "development"
  );
}
