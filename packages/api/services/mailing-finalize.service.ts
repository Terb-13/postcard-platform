import type { Campaign, MailingJob, MailingJobType, Prisma } from "@prisma/client";
import { prisma } from "@postcard-platform/db/client";
import { parseTargetingMetadata } from "../lib/targeting-summary";
import { fetchEddmRoutes } from "./eddm.service";
import { handoffToDrummond } from "./drummond-handoff.service";
import { calculatePricing } from "./pricing.service";
import { generateTargetedList } from "./targeted.service";
import type { CostBreakdown, FinalizeMailingResult } from "./types";

export function inferMailingJobType(campaign: Campaign): MailingJobType {
  const pt = (campaign.productType ?? "EDDM").toUpperCase();
  if (pt === "TARGETED" || pt === "NEWMOVER" || pt === "SATURATION") {
    return pt === "TARGETED" || pt === "NEWMOVER" ? "TARGETED" : "EDDM";
  }
  const meta = parseTargetingMetadata(campaign.targetingMetadata);
  const product = (meta as { product?: string } | null)?.product;
  if (product === "targeted" || product === "newmover") return "TARGETED";
  return "EDDM";
}

function householdByZipFromMetadata(campaign: Campaign): Record<string, number> {
  const meta = parseTargetingMetadata(campaign.targetingMetadata);
  const zctas = meta?.zctas ?? [];
  const reach = meta?.estimate?.households ?? meta?.estimate?.reach ?? campaign.quantity;
  if (zctas.length === 0) return {};
  const perZip = Math.ceil(reach / zctas.length);
  return Object.fromEntries(zctas.map((z) => [z.replace(/\D/g, "").slice(0, 5), perZip]));
}

/** Create MailingJob after payment if missing */
export async function ensureMailingJobForCampaign(campaign: Campaign): Promise<MailingJob> {
  const existing = await prisma.mailingJob.findUnique({
    where: { campaignId: campaign.id },
  });
  if (existing) return existing;

  const estimatedTotalCents =
    campaign.totalPriceCents ??
    calculatePricing({
      size: campaign.size,
      quantity: campaign.quantity,
      productType: inferMailingJobType(campaign),
      source: "estimate",
    }).totalCents;

  return prisma.mailingJob.create({
    data: {
      campaignId: campaign.id,
      type: inferMailingJobType(campaign),
      status: "PENDING",
      estimatedTotalCents,
      dropDate: campaign.dropDate,
    },
  });
}

/**
 * Post-checkout: resolve routes or list, recalculate pricing, optional Drummond handoff.
 */
export async function finalizeMailingJob(
  campaignId: string,
  options: { runHandoff?: boolean } = {}
): Promise<FinalizeMailingResult> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { mailingJob: true, productionJobs: true },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (campaign.status !== "PAID" && campaign.status !== "IN_PRODUCTION") {
    throw new Error(`Campaign must be paid before finalize (status: ${campaign.status})`);
  }

  const mailingJob = campaign.mailingJob ?? (await ensureMailingJobForCampaign(campaign));
  const meta = parseTargetingMetadata(campaign.targetingMetadata);
  const zctas = meta?.zctas ?? [];

  try {
    let finalQuantity = campaign.quantity;
    let selectedRoutes: Prisma.InputJsonValue | undefined;
    let eddmTotalHomes: number | undefined;
    let recipientCount: number | undefined;
    let listProvider: string | undefined;
    let listRequestId: string | undefined;

    if (mailingJob.type === "EDDM") {
      const householdByZip = householdByZipFromMetadata(campaign);
      const eddm = await fetchEddmRoutes({ zctas }, householdByZip);
      selectedRoutes = eddm.routes as Prisma.InputJsonValue;
      eddmTotalHomes = eddm.totalHomes;
      finalQuantity = eddm.totalHomes;
    } else {
      const list = await generateTargetedList(
        { zctas, filters: meta?.filters, campaignId: campaign.id },
        meta?.estimate?.households ?? campaign.quantity
      );
      listProvider = list.listProvider;
      listRequestId = list.listRequestId;
      recipientCount = list.recipientCount;
      finalQuantity = list.recipientCount;
    }

    const costBreakdown: CostBreakdown = calculatePricing({
      size: campaign.size,
      quantity: finalQuantity,
      productType: mailingJob.type === "TARGETED" ? "TARGETED" : "EDDM",
      source: "final",
    });

    let manifestUrl: string | null = null;
    let status: "LIST_GENERATED" | "SENT_TO_PRINTER" = "LIST_GENERATED";

    const updated = await prisma.mailingJob.update({
      where: { id: mailingJob.id },
      data: {
        status: "LIST_GENERATED",
        selectedRoutes,
        eddmTotalHomes,
        recipientCount,
        listProvider,
        listRequestId,
        finalQuantity,
        finalTotalCents: costBreakdown.totalCents,
        costBreakdown: costBreakdown as Prisma.InputJsonValue,
        errorMessage: null,
      },
    });

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        quantity: finalQuantity,
        totalPriceCents: costBreakdown.totalCents,
        unitPriceCents: costBreakdown.unitPriceCents,
      },
    });

    if (options.runHandoff !== false) {
      const handoff = await handoffToDrummond({
        mailingJob: updated,
        campaignName: campaign.name,
        size: campaign.size,
        campaignId: campaign.id,
      });
      manifestUrl = handoff.manifestUrl;

      if (manifestUrl) {
        await prisma.mailingJob.update({
          where: { id: mailingJob.id },
          data: {
            status: "SENT_TO_PRINTER",
            manifestUrl,
          },
        });
        status = "SENT_TO_PRINTER";
      }

      const productionJob = campaign.productionJobs[0];
      if (productionJob) {
        await prisma.productionJob.update({
          where: { id: productionJob.id },
          data: {
            payload: {
              ...(typeof productionJob.payload === "object" && productionJob.payload
                ? productionJob.payload
                : {}),
              mailingJobId: mailingJob.id,
              finalQuantity,
              manifestUrl,
              costBreakdown,
            } as Prisma.InputJsonValue,
          },
        });
      }
    }

    return {
      mailingJobId: mailingJob.id,
      status,
      finalQuantity,
      finalTotalCents: costBreakdown.totalCents,
      costBreakdown,
      manifestUrl,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Finalize failed";
    await prisma.mailingJob.update({
      where: { id: mailingJob.id },
      data: { status: "FAILED", errorMessage: message },
    });
    throw err;
  }
}
