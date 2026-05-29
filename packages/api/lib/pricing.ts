/**
 * Postcard campaign pricing — configurable base rate × reach (households).
 */

export type PostcardSize = "4x6" | "5x7" | "6x9" | "6x11";

const SIZE_MULTIPLIERS: Record<string, number> = {
  "4x6": 1,
  "5x7": 1.15,
  "6x9": 1.35,
  "6x11": 1.5,
};

const MIN_QUANTITY = 100;

function baseRateCents(): number {
  const env = process.env.POSTCARD_BASE_RATE_CENTS;
  if (env) {
    const n = parseInt(env, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 35; // $0.35 placeholder until partner pricing is wired in
}

export type PricingInput = {
  size: string;
  /** Estimated households / reach from Census */
  estimatedReach: number;
  /** User override — if set, used instead of estimatedReach */
  quantityOverride?: number;
};

export type PricingResult = {
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  estimatedReach: number;
  usedOverride: boolean;
};

export function calculateCampaignPricing(input: PricingInput): PricingResult {
  const multiplier = SIZE_MULTIPLIERS[input.size] ?? 1;
  const unitPriceCents = Math.round(baseRateCents() * multiplier);
  const estimatedReach = Math.max(0, Math.floor(input.estimatedReach));

  const usedOverride = input.quantityOverride != null && input.quantityOverride > 0;
  const rawQty = usedOverride ? input.quantityOverride! : estimatedReach;
  const quantity = Math.max(MIN_QUANTITY, Math.floor(rawQty));

  const totalPriceCents = unitPriceCents * quantity;

  return {
    quantity,
    unitPriceCents,
    totalPriceCents,
    estimatedReach,
    usedOverride,
  };
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
