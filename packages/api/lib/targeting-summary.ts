/**
 * Compact targeting summary from Campaign.targetingMetadata or SavedMap.metadata.
 */

export type TargetingMetadata = {
  zctas?: string[];
  filters?: Record<string, unknown>;
  estimate?: {
    reach?: number;
    households?: number;
    population?: number;
    avgMedianIncome?: number | null;
    avgMoverPercent?: number | null;
    zctaCount?: number;
  };
  pricing?: {
    quantity?: number;
    totalPriceCents?: number;
    unitPriceCents?: number;
  };
};

export type TargetingSummary = {
  zctas: string[];
  zctaCount: number;
  reach: number | null;
  households: number | null;
  population: number | null;
  avgMedianIncome: number | null;
  totalPriceCents: number | null;
  quantity: number | null;
  label: string;
};

export function parseTargetingMetadata(raw: unknown): TargetingMetadata | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as TargetingMetadata;
}

export function buildTargetingSummary(
  metadata: unknown,
  fallback?: { quantity?: number; totalPriceCents?: number | null }
): TargetingSummary | null {
  const meta = parseTargetingMetadata(metadata);
  if (!meta?.zctas?.length && !meta?.estimate) return null;

  const zctas = meta.zctas ?? [];
  const reach = meta.estimate?.reach ?? meta.estimate?.households ?? null;
  const totalPriceCents =
    meta.pricing?.totalPriceCents ?? fallback?.totalPriceCents ?? null;
  const quantity = meta.pricing?.quantity ?? fallback?.quantity ?? null;

  const zctaCount = meta.estimate?.zctaCount ?? zctas.length;
  const reachLabel =
    reach != null ? `${reach.toLocaleString()} households` : null;
  const priceLabel =
    totalPriceCents != null
      ? `$${(totalPriceCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} est.`
      : null;

  const parts = [
    `${zctaCount} zip${zctaCount === 1 ? "" : "s"}`,
    reachLabel,
    priceLabel,
  ].filter(Boolean);

  return {
    zctas,
    zctaCount,
    reach,
    households: meta.estimate?.households ?? null,
    population: meta.estimate?.population ?? null,
    avgMedianIncome: meta.estimate?.avgMedianIncome ?? null,
    totalPriceCents,
    quantity,
    label: parts.join(" • "),
  };
}

/** Payload block for Drummond / production partners */
export function targetingPayloadBlock(metadata: unknown): Record<string, unknown> | null {
  const summary = buildTargetingSummary(metadata);
  if (!summary) return null;

  return {
    zctas: summary.zctas,
    zctaCount: summary.zctaCount,
    estimatedReach: summary.reach,
    estimatedHouseholds: summary.households,
    estimatedPopulation: summary.population,
    avgMedianIncome: summary.avgMedianIncome,
    estimatedQuantity: summary.quantity,
    estimatedTotalCents: summary.totalPriceCents,
    summaryLabel: summary.label,
  };
}
