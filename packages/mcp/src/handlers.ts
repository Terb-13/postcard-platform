import { calculateCampaignPricing } from "../../api/lib/pricing.ts";
import { releaseSpend, reserveSpend, SpendCapError } from "./auth.ts";
import { resolveProduct, WORKFLOW_GUIDE, PRODUCT_CATALOG, POSTCARD_SIZES } from "./catalog.ts";
import type { ToolRuntime } from "./context.ts";
import { fail, ok } from "./result.ts";
import { isDryRun, requireConfirm, requireScope, requireSpendRoom } from "./safety.ts";

export const filtersShape = {
  minIncome: undefined as number | undefined,
  maxIncome: undefined as number | undefined,
  minMoverPercent: undefined as number | undefined,
};

export type AudienceFilters = {
  minIncome?: number;
  maxIncome?: number;
  minMoverPercent?: number;
};

export type TargetingInput = {
  zctas: string[];
  geoJson?: unknown;
  filters?: AudienceFilters;
  quantityOverride?: number;
  savedMapName?: string;
};

function trpcError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  return fail(message, "TRPC_ERROR");
}

/** Same fallback as campaign.createCheckoutSession when totals were not snapshotted. */
export function checkoutTotalCents(campaign: {
  size: string;
  quantity: number;
  unitPriceCents?: number | null;
  totalPriceCents?: number | null;
}): { unitPriceCents: number; totalPriceCents: number } {
  if (campaign.totalPriceCents != null && campaign.unitPriceCents != null) {
    return { unitPriceCents: campaign.unitPriceCents, totalPriceCents: campaign.totalPriceCents };
  }
  const unitPriceCents =
    campaign.unitPriceCents ??
    calculateCampaignPricing({
      size: campaign.size,
      estimatedReach: campaign.quantity,
    }).unitPriceCents;
  const totalPriceCents =
    campaign.totalPriceCents ?? Math.round(unitPriceCents * campaign.quantity);
  return { unitPriceCents, totalPriceCents };
}

export function handleWorkflowGuide() {
  return ok({ guide: WORKFLOW_GUIDE, sizes: POSTCARD_SIZES, products: PRODUCT_CATALOG });
}

export function handleListProducts() {
  return ok({ products: PRODUCT_CATALOG, sizes: POSTCARD_SIZES });
}

export function handleSpendStatus(rt: ToolRuntime) {
  const { auth } = rt;
  return ok({
    keyName: auth.name,
    organizationId: auth.organizationId,
    organizationName: auth.organizationName,
    actorUserId: auth.user.id,
    actorEmail: auth.user.email,
    scopes: auth.scopes,
    spendCapCents: auth.spendCapCents,
    spentCents: auth.spentCents,
    remainingSpendCents: auth.remainingSpendCents,
    paidActionsEnabled: auth.spendCapCents > 0 && auth.scopes.includes("spend"),
    fulfillmentEnabled: auth.scopes.includes("fulfill"),
  });
}

export async function handleSearchZips(rt: ToolRuntime, input: { query: string }) {
  try {
    return ok(await rt.caller.targeting.searchZips(input));
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleEstimateAudience(
  rt: ToolRuntime,
  input: {
    zctas?: string[];
    geoJson?: unknown;
    filters?: AudienceFilters;
    size?: string;
    quantityOverride?: number;
  }
) {
  try {
    return ok(await rt.caller.targeting.estimateAudience(input), { dryRun: true });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleEstimateAudienceFromZctas(
  rt: ToolRuntime,
  input: {
    zctas: string[];
    filters?: AudienceFilters;
    size?: string;
    quantityOverride?: number;
    baseRateCentsPerPiece?: number;
  }
) {
  try {
    return ok(await rt.caller.targeting.estimateAudienceFromZctas(input), { dryRun: true });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleCensusStats(
  rt: ToolRuntime,
  input: { zctas: string[]; filters?: AudienceFilters; size?: string }
) {
  try {
    return ok(await rt.caller.targeting.getCensusStatsForZctas(input), { dryRun: true });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleCalculateCost(
  rt: ToolRuntime,
  input: {
    size: string;
    quantity: number;
    productType?: "EDDM" | "TARGETED";
    source?: "estimate" | "final";
  }
) {
  try {
    return ok(await rt.caller.mailing.calculatePricing(input), { dryRun: true });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handlePreviewEddmRoutes(
  rt: ToolRuntime,
  input: { zctas: string[]; householdByZip?: Record<string, number> }
) {
  try {
    return ok(await rt.caller.mailing.eddmRoutes(input), { dryRun: true });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleListCampaigns(rt: ToolRuntime) {
  const denied = requireScope(rt.auth, "read");
  if (denied) return denied;
  try {
    return ok(await rt.caller.campaign.getMine());
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleGetCampaign(rt: ToolRuntime, input: { id: string }) {
  try {
    return ok(await rt.caller.campaign.getById(input));
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleGetOrder(rt: ToolRuntime, input: { id: string }) {
  try {
    return ok(await rt.caller.campaign.getOrderDetail(input));
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleGetMailingJob(rt: ToolRuntime, input: { campaignId: string }) {
  try {
    return ok(await rt.caller.mailing.getByCampaignId(input));
  } catch (err) {
    return trpcError(err);
  }
}

export async function handlePaymentReadiness(rt: ToolRuntime, input: { campaignId: string }) {
  try {
    const campaign = await rt.caller.campaign.getById({ id: input.campaignId });
    const artworkStatus = campaign.artwork?.status ?? null;
    const approved = artworkStatus === "APPROVED";
    const statusOk = campaign.status === "DRAFT" || campaign.status === "READY_FOR_PAYMENT";
    const blockers: string[] = [];
    if (!campaign.artwork) blockers.push("No artwork attached. Call attach_artwork.");
    else if (!approved) blockers.push(`Artwork status is ${artworkStatus}; ops must APPROVE before payment.`);
    if (!statusOk) blockers.push(`Campaign status ${campaign.status} cannot start checkout.`);
    if ((campaign.quantity ?? 0) < 100) blockers.push("Quantity must be at least 100.");

    const checkout = checkoutTotalCents(campaign);
    return ok({
      campaignId: campaign.id,
      name: campaign.name,
      status: campaign.status,
      productType: campaign.productType,
      productSlug: campaign.productSlug,
      size: campaign.size,
      quantity: campaign.quantity,
      unitPriceCents: campaign.unitPriceCents,
      totalPriceCents: campaign.totalPriceCents,
      checkoutEstimate: checkout,
      artworkStatus,
      canCreateCheckout: approved && statusOk,
      blockers,
      nextTool: approved && statusOk ? "prepare_checkout" : approved ? "get_campaign" : "attach_artwork",
      checkoutRequires: {
        confirm: true,
        scope: "spend",
        spendCapCents: checkout.totalPriceCents,
      },
    });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleCreateCampaign(
  rt: ToolRuntime,
  input: {
    name: string;
    size: string;
    quantity?: number;
    productType?: "EDDM" | "TARGETED";
    productSlug?: string;
    dropDate?: string;
    notes?: string;
    targeting?: TargetingInput;
    dryRun?: boolean;
  }
) {
  const denied = requireScope(rt.auth, "draft");
  if (denied) return denied;

  const product = input.productSlug ? resolveProduct(input.productSlug) : null;
  const productType = input.productType ?? product?.productType;
  const productSlug = product?.slug ?? input.productSlug;
  const payload = {
    name: input.name,
    size: input.size,
    quantity: input.quantity,
    productType,
    productSlug,
    dropDate: input.dropDate,
    notes: input.notes,
    targeting: input.targeting,
  };

  if (isDryRun(input.dryRun)) {
    const hasTargeting = Boolean(input.targeting?.zctas?.length);

    // No-targeting path: campaign.create persists quantity only; unit/total stay null.
    if (!hasTargeting) {
      const quantity = input.quantity ?? 500;
      return ok(
        {
          wouldCreate: {
            ...payload,
            status: "DRAFT",
            organizationId: rt.auth.organizationId,
            quantity,
            unitPriceCents: null,
            totalPriceCents: null,
          },
          checkoutEstimate: checkoutTotalCents({ size: input.size, quantity }),
          note:
            "dryRun=true: no row written. campaign.create without targeting.zctas stores quantity only (unitPriceCents/totalPriceCents stay null). checkoutEstimate uses the same print-only fallback as campaign.createCheckoutSession (not postage/list). Re-call with dryRun=false to invoke campaign.create.",
        },
        { dryRun: true }
      );
    }

    // Targeting path: unfiltered ACS households + targeting.quantityOverride only (same as campaign.create).
    try {
      const createStats = await rt.caller.targeting.getCensusStatsForZctas({
        zctas: input.targeting!.zctas,
        size: input.size,
      });
      const createPricing = calculateCampaignPricing({
        size: input.size,
        estimatedReach: createStats.reach,
        quantityOverride: input.targeting!.quantityOverride,
      });
      const audienceEstimate = await rt.caller.targeting.estimateAudience({
        zctas: input.targeting!.zctas,
        geoJson: input.targeting!.geoJson,
        filters: input.targeting!.filters,
        size: input.size,
        quantityOverride: input.targeting!.quantityOverride,
      });
      return ok(
        {
          wouldCreate: {
            ...payload,
            status: "DRAFT",
            organizationId: rt.auth.organizationId,
            quantity: createPricing.quantity,
            unitPriceCents: createPricing.unitPriceCents,
            totalPriceCents: createPricing.totalPriceCents,
          },
          pricing: createPricing,
          audienceEstimate,
          note:
            "dryRun=true: no row written. wouldCreate.quantity/totalPriceCents match campaign.create (unfiltered ACS households; targeting.quantityOverride only). audienceEstimate is the filtered wizard preview and is NOT what create persists. Re-call with dryRun=false to invoke campaign.create with the same payload.",
        },
        { dryRun: true }
      );
    } catch (err) {
      return trpcError(err);
    }
  }

  try {
    const campaign = await rt.caller.campaign.create(payload);
    return ok(campaign, { dryRun: false, procedure: "campaign.create" });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleUpdateDraft(
  rt: ToolRuntime,
  input: {
    id: string;
    name?: string;
    size?: string;
    productType?: "EDDM" | "TARGETED";
    productSlug?: string;
    quantity?: number;
    dropDate?: string | null;
    notes?: string | null;
    targeting?: TargetingInput;
    dryRun?: boolean;
  }
) {
  const denied = requireScope(rt.auth, "draft");
  if (denied) return denied;

  const { dryRun, ...payload } = input;
  if (isDryRun(dryRun)) {
    try {
      const existing = await rt.caller.campaign.getById({ id: input.id });
      return ok(
        {
          current: existing,
          wouldUpdate: payload,
          note: "dryRun=true: no update written. Re-call with dryRun=false to invoke campaign.updateDraft.",
        },
        { dryRun: true }
      );
    } catch (err) {
      return trpcError(err);
    }
  }

  try {
    const campaign = await rt.caller.campaign.updateDraft(payload);
    return ok(campaign, { dryRun: false, procedure: "campaign.updateDraft" });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handleAttachArtwork(
  rt: ToolRuntime,
  input: {
    campaignId: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    pageCount?: number;
    dryRun?: boolean;
  }
) {
  const denied = requireScope(rt.auth, "draft");
  if (denied) return denied;

  const { dryRun, ...payload } = input;
  if (isDryRun(dryRun)) {
    try {
      const campaign = await rt.caller.campaign.getById({ id: input.campaignId });
      return ok(
        {
          campaignId: campaign.id,
          currentArtwork: campaign.artwork,
          wouldAttach: payload,
          note: "dryRun=true: no artwork upsert. Re-call with dryRun=false to invoke campaign.uploadArtwork.",
        },
        { dryRun: true }
      );
    } catch (err) {
      return trpcError(err);
    }
  }

  try {
    const artwork = await rt.caller.campaign.uploadArtwork(payload);
    return ok(artwork, { dryRun: false, procedure: "campaign.uploadArtwork" });
  } catch (err) {
    return trpcError(err);
  }
}

export async function handlePrepareCheckout(rt: ToolRuntime, input: { campaignId: string; confirm?: boolean }) {
  const scopeErr = requireScope(rt.auth, "spend");
  if (scopeErr) return scopeErr;
  const confirmErr = requireConfirm(input.confirm, "prepare_checkout (Stripe Checkout session)");
  if (confirmErr) return confirmErr;

  let campaign;
  try {
    campaign = await rt.caller.campaign.getById({ id: input.campaignId });
  } catch (err) {
    return trpcError(err);
  }

  const { totalPriceCents: total } = checkoutTotalCents(campaign);
  const capErr = requireSpendRoom(rt.auth, total);
  if (capErr) return capErr;

  let reservedCents = 0;
  try {
    const reserved = await reserveSpend(rt.auth.id, total);
    reservedCents = reserved.reservedCents;
  } catch (err) {
    if (err instanceof SpendCapError) {
      return fail(err.message, err.code);
    }
    return trpcError(err);
  }

  try {
    const result = await rt.caller.campaign.createCheckoutSession({ campaignId: input.campaignId });
    return ok(
      { ...result, reservedSpendCents: reservedCents },
      { dryRun: false, procedure: "campaign.createCheckoutSession", confirm: true }
    );
  } catch (err) {
    await releaseSpend(rt.auth.id, reservedCents);
    return trpcError(err);
  }
}

export async function handleFinalizeMailing(
  rt: ToolRuntime,
  input: {
    campaignId: string;
    confirm?: boolean;
    runHandoff?: boolean;
    confirmHandoff?: boolean;
  }
) {
  const scopeErr = requireScope(rt.auth, "fulfill");
  if (scopeErr) return scopeErr;
  const confirmErr = requireConfirm(input.confirm, "finalize_mailing (writes MailingJob / campaign totals)");
  if (confirmErr) return confirmErr;

  const runHandoff = input.runHandoff === true && input.confirmHandoff === true;
  if (input.runHandoff === true && input.confirmHandoff !== true) {
    return fail(
      "runHandoff=true would upload a Drummond/R2 fulfillment manifest. Re-call with confirm=true and confirmHandoff=true, or omit runHandoff to finalize lists only.",
      "HANDOFF_CONFIRM_REQUIRED"
    );
  }

  try {
    const result = await rt.caller.mailing.finalize({
      campaignId: input.campaignId,
      runHandoff,
    });
    return ok(result, {
      dryRun: false,
      procedure: "mailing.finalize",
      runHandoff,
      confirm: true,
    });
  } catch (err) {
    return trpcError(err);
  }
}
