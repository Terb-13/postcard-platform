import type { TargetingMetadata } from "../lib/targeting-summary";
import {
  countMelissaConsumerList,
  type MelissaListFilters,
} from "./melissa-leadgen-consumer";

export type GenerateTargetedListInput = {
  zctas: string[];
  filters?: TargetingMetadata["filters"];
  campaignId: string;
};

export type GenerateTargetedListResult = {
  listProvider: string;
  listRequestId: string;
  recipientCount: number;
  isStub: boolean;
  warnings: string[];
  appliedParams?: Record<string, string>;
};

export const MELISSA_KEY_REQUIRED =
  "MELISSA_API_KEY is required for targeted lists. Census ACS is map/quote only — not a list door. Brett: add TARGETED_LIST_PROVIDER=melissa and MELISSA_API_KEY (Melissa LeadGen Consumer license — Sales@Melissa.com or 800-MELISSA ext. 3). Do not invent a key.";

function readListFilters(raw?: TargetingMetadata["filters"]): MelissaListFilters | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const rec = raw as MelissaListFilters;
  const filters: MelissaListFilters = {};
  if (typeof rec.minIncome === "number") filters.minIncome = rec.minIncome;
  if (typeof rec.maxIncome === "number") filters.maxIncome = rec.maxIncome;
  if (typeof rec.minMoverPercent === "number") filters.minMoverPercent = rec.minMoverPercent;
  if (rec.ownHome === true) filters.ownHome = true;
  if (rec.homeowners === true) filters.homeowners = true;
  return Object.keys(filters).length > 0 ? filters : undefined;
}

/**
 * Melissa is the list door. Count only (LeadGen Consumer `get`) — never `buy`.
 * Census household estimates are not used as a recipient count.
 */
export async function generateTargetedList(
  input: GenerateTargetedListInput,
  _censusQuoteHouseholds?: number
): Promise<GenerateTargetedListResult> {
  const provider = (process.env.TARGETED_LIST_PROVIDER ?? "melissa").toLowerCase();
  if (provider !== "melissa") {
    throw new Error(
      `TARGETED_LIST_PROVIDER=${provider} is not opened. Data Axle stays backup — do not add Data Axle keys. Set TARGETED_LIST_PROVIDER=melissa.`
    );
  }

  const licenseKey = process.env.MELISSA_API_KEY?.trim() ?? "";
  const count = await countMelissaConsumerList(
    { zips: input.zctas, filters: readListFilters(input.filters) },
    { licenseKey }
  );

  return {
    listProvider: "melissa",
    listRequestId: `melissa-count-${input.campaignId}`,
    recipientCount: count.recipientCount,
    isStub: false,
    warnings: [],
    appliedParams: count.appliedParams,
  };
}
