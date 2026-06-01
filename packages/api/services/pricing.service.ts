import { calculateCampaignPricing } from "../lib/pricing";
import type { CostBreakdown, PricingCalculateInput } from "./types";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Default USPS EDDM postage per piece (cents) — override via POSTAGE_CENTS_PER_PIECE */
export function defaultPostageCentsPerPiece(): number {
  return envInt("POSTAGE_CENTS_PER_PIECE", 20);
}

/** List / data fee per piece for targeted mail (cents) */
export function defaultListCentsPerPiece(productType?: string): number {
  if (productType === "TARGETED") {
    return envInt("LIST_CENTS_PER_PIECE_TARGETED", 8);
  }
  return envInt("LIST_CENTS_PER_PIECE_EDDM", 0);
}

export function defaultFeesCents(): number {
  return envInt("PLATFORM_FEE_CENTS", 0);
}

/**
 * Single pricing engine for map estimates, checkout, and post-finalize recalculation.
 * Print rate reuses {@link calculateCampaignPricing}; postage/list/fees are configurable.
 */
export function calculatePricing(input: PricingCalculateInput): CostBreakdown {
  const source = input.source ?? "estimate";
  const quantity = Math.max(0, Math.floor(input.quantity));

  const print = calculateCampaignPricing({
    size: input.size,
    estimatedReach: quantity,
  });

  const postagePer = input.postageCentsPerPiece ?? defaultPostageCentsPerPiece();
  const listPer = input.listCentsPerPiece ?? defaultListCentsPerPiece(input.productType);
  const fees = defaultFeesCents();

  const printCents = print.unitPriceCents * quantity;
  const postageCents = postagePer * quantity;
  const listCents = listPer * quantity;
  const totalCents = printCents + postageCents + listCents + fees;

  return {
    printCents,
    postageCents,
    listCents,
    feesCents: fees,
    totalCents,
    quantity,
    unitPriceCents: print.unitPriceCents,
    source,
  };
}

export function breakdownFromCampaignEstimate(options: {
  size: string;
  quantity: number;
  totalPriceCents?: number | null;
  productType?: string;
}): CostBreakdown {
  const breakdown = calculatePricing({
    size: options.size,
    quantity: options.quantity,
    productType: options.productType as PricingCalculateInput["productType"],
    source: "estimate",
  });

  if (options.totalPriceCents != null && options.totalPriceCents > 0) {
    return { ...breakdown, totalCents: options.totalPriceCents };
  }

  return breakdown;
}
