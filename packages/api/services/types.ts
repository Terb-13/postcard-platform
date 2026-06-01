/** Line items for customer-facing cost breakdown */
export type CostBreakdown = {
  printCents: number;
  postageCents: number;
  listCents: number;
  feesCents: number;
  totalCents: number;
  quantity: number;
  unitPriceCents: number;
  /** estimate = pre-finalize; final = after routes/list generation */
  source: "estimate" | "final";
};

export type EddmRouteSelection = {
  carrierRouteId: string;
  zip: string;
  householdCount: number;
  walkSequence?: string;
};

export type PricingCalculateInput = {
  size: string;
  quantity: number;
  productType?: "EDDM" | "TARGETED";
  source?: "estimate" | "final";
  /** Optional overrides (cents) — env defaults used when omitted */
  postageCentsPerPiece?: number;
  listCentsPerPiece?: number;
};

export type FinalizeMailingResult = {
  mailingJobId: string;
  status: string;
  finalQuantity: number | null;
  finalTotalCents: number | null;
  costBreakdown: CostBreakdown | null;
  manifestUrl: string | null;
};
