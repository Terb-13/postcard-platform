import type { TargetingSelection } from "@/components/targeting";
import { formatTrpcError } from "@/lib/utils";
import type { CampaignBasics } from "./schema";

type ArtworkFile = {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  pageCount?: number;
};

type EstimateData = {
  reach?: number;
  pricing?: {
    quantity?: number;
    totalPriceCents?: number;
    unitPriceCents?: number;
  };
} | null | undefined;

export type SubmitCampaignMutations = {
  create: (input: {
    name: string;
    size: string;
    dropDate?: string;
    notes?: string;
    targeting?: {
      zctas: string[];
      geoJson?: TargetingSelection["geoJson"];
      filters?: TargetingSelection["filters"];
      quantityOverride?: number;
    };
  }) => Promise<{ id?: string }>;
  updateDraft: (input: {
    id: string;
    name?: string;
    size?: string;
    dropDate?: string | null;
    notes?: string | null;
    targeting?: {
      zctas: string[];
      geoJson?: TargetingSelection["geoJson"];
      filters?: TargetingSelection["filters"];
      quantityOverride?: number;
    };
  }) => Promise<{ id?: string }>;
  uploadArtwork: (input: {
    campaignId: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    pageCount?: number;
  }) => Promise<unknown>;
  createCheckoutSession: (input: { campaignId: string }) => Promise<{ url: string | null }>;
};

export type SubmitCampaignInput = {
  campaignId: string | null;
  basics: CampaignBasics;
  targeting: TargetingSelection;
  dropDate: string;
  notes: string;
  estimate: EstimateData;
  artwork?: ArtworkFile | null;
  existingArtwork?: { fileUrl?: string | null } | null;
};

function buildTargetingPayload(targeting: TargetingSelection) {
  const zctas = targeting.zctas.map((z) => z.zcta);
  if (zctas.length === 0) return undefined;

  return {
    zctas,
    geoJson: targeting.geoJson,
    filters: targeting.filters,
    quantityOverride: targeting.quantityOverride,
  };
}

export async function submitCampaign(
  mutations: SubmitCampaignMutations,
  input: SubmitCampaignInput
): Promise<{ campaignId: string; checkoutUrl: string }> {
  const targetingPayload = buildTargetingPayload(input.targeting);
  if (!targetingPayload) {
    throw new Error("Select at least one ZIP code before submitting.");
  }

  let campaignId = input.campaignId;

  if (campaignId) {
    await mutations.updateDraft({
      id: campaignId,
      name: input.basics.name,
      size: input.basics.size,
      targeting: targetingPayload,
      dropDate: input.dropDate || null,
      notes: input.notes || null,
    });
  } else {
    const created = await mutations.create({
      name: input.basics.name,
      size: input.basics.size,
      dropDate: input.dropDate || undefined,
      notes: input.notes || undefined,
      targeting: targetingPayload,
    });
    campaignId = created.id;
    if (!campaignId) {
      throw new Error("Campaign was created but no ID was returned.");
    }
  }

  const artwork = input.artwork;
  const needsArtworkUpload =
    artwork?.fileUrl && artwork.fileUrl !== input.existingArtwork?.fileUrl;

  if (needsArtworkUpload) {
    await mutations.uploadArtwork({
      campaignId,
      fileUrl: artwork.fileUrl,
      fileName: artwork.fileName,
      fileSize: artwork.fileSize,
      pageCount: artwork.pageCount,
    });
  } else if (!input.existingArtwork?.fileUrl && !artwork?.fileUrl) {
    throw new Error("Upload your postcard PDF before submitting.");
  }

  try {
    const checkout = await mutations.createCheckoutSession({ campaignId });
    if (!checkout.url) {
      throw new Error("Stripe checkout URL was not returned.");
    }
    return { campaignId, checkoutUrl: checkout.url };
  } catch (error) {
    throw new Error(formatTrpcError(error));
  }
}
