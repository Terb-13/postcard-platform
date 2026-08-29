import type { TargetingMetadata } from "../lib/targeting-summary";
import {
  buyMelissaConsumerList,
  countMelissaConsumerList,
  MelissaLeadgenError,
  type MelissaListFilters,
  type MelissaRecipient,
} from "./melissa-leadgen-consumer";
import {
  countMelissaNewMovers,
  lookupMelissaNewMovers,
  shouldUseNewMoversDoor,
} from "./melissa-newmovers";

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
  door?: "melissa-consumer" | "melissa-newmovers";
  downloadUrl?: string;
  recipients?: MelissaRecipient[];
};

export const MELISSA_KEY_REQUIRED =
  "MELISSA_API_KEY is required for targeted lists. Census ACS is map/quote only — not a list door. Set TARGETED_LIST_PROVIDER=melissa and MELISSA_API_KEY on Vercel after Brett lands Cloud credits / LeadGen. Do not invent a key.";

export function requireMelissaProvider(): void {
  const provider = (process.env.TARGETED_LIST_PROVIDER ?? "melissa").toLowerCase();
  if (provider !== "melissa") {
    throw new Error(
      `TARGETED_LIST_PROVIDER=${provider} is not opened. Data Axle stays backup — do not add Data Axle keys. Set TARGETED_LIST_PROVIDER=melissa.`
    );
  }
}

export function readListFilters(raw?: TargetingMetadata["filters"]): MelissaListFilters | undefined {
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

function licenseKeyOrThrow(): string {
  const licenseKey = process.env.MELISSA_API_KEY?.trim() ?? "";
  if (!licenseKey) {
    throw new MelissaLeadgenError(MELISSA_KEY_REQUIRED, "NO_KEY");
  }
  return licenseKey;
}

/** Preview only — Consumer get or NewMovers doCount. Never buys. Never uses Census households. */
export async function countTargetedList(
  input: GenerateTargetedListInput
): Promise<GenerateTargetedListResult> {
  requireMelissaProvider();
  const licenseKey = licenseKeyOrThrow();
  const filters = readListFilters(input.filters);

  if (shouldUseNewMoversDoor(filters)) {
    const count = await countMelissaNewMovers(input.zctas, { licenseKey });
    return {
      listProvider: "melissa",
      listRequestId: count.jobId ?? `melissa-newmovers-count-${input.campaignId}`,
      recipientCount: count.recipientCount,
      isStub: false,
      warnings: [],
      door: "melissa-newmovers",
    };
  }

  const count = await countMelissaConsumerList({ zips: input.zctas, filters }, { licenseKey });
  return {
    listProvider: "melissa",
    listRequestId: `melissa-count-${input.campaignId}`,
    recipientCount: count.recipientCount,
    isStub: false,
    warnings: [],
    appliedParams: count.appliedParams,
    door: "melissa-consumer",
  };
}

/**
 * List door: Melissa buy / NewMovers lookup. Returns names+addresses.
 * Does not fall back to Census household estimates.
 */
export async function generateTargetedList(
  input: GenerateTargetedListInput,
  _censusQuoteHouseholds?: number
): Promise<GenerateTargetedListResult> {
  requireMelissaProvider();
  const licenseKey = licenseKeyOrThrow();
  const filters = readListFilters(input.filters);

  if (shouldUseNewMoversDoor(filters)) {
    const lookup = await lookupMelissaNewMovers(input.zctas, { licenseKey });
    return {
      listProvider: "melissa",
      listRequestId: lookup.jobId ?? `melissa-newmovers-${input.campaignId}`,
      recipientCount: lookup.recipients.length,
      isStub: false,
      warnings: [],
      door: "melissa-newmovers",
      recipients: lookup.recipients,
    };
  }

  const purchase = await buyMelissaConsumerList(
    { zips: input.zctas, filters },
    { licenseKey, purchaseOrder: input.campaignId }
  );

  return {
    listProvider: "melissa",
    listRequestId: purchase.orderId,
    recipientCount: purchase.recipients.length,
    isStub: false,
    warnings: [],
    appliedParams: purchase.appliedParams,
    door: "melissa-consumer",
    downloadUrl: purchase.downloadUrl,
    recipients: purchase.recipients,
  };
}
