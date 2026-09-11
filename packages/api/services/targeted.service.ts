import type { TargetingMetadata } from "../lib/targeting-summary";
import {
  buyMelissaConsumerList,
  countMelissaConsumerList,
  MelissaLeadgenError,
  readMelissaLeadgenCustomerId,
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
  "MELISSA_API_KEY (License Key) is required for NewMovers Data Retriever CustomerID. Census ACS is map/quote only — not a list door. LeadGen Occupant/Consumer id= uses MELISSA_CUSTOMER_IDENT (numeric Ident), falling back to MELISSA_API_KEY. Do not invent a key.";

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
  const filters = readListFilters(input.filters);

  if (shouldUseNewMoversDoor(filters)) {
    const licenseKey = licenseKeyOrThrow();
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

  const customerId = readMelissaLeadgenCustomerId();
  const count = await countMelissaConsumerList({ zips: input.zctas, filters }, { licenseKey: customerId });
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
  const filters = readListFilters(input.filters);

  if (shouldUseNewMoversDoor(filters)) {
    const licenseKey = licenseKeyOrThrow();
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

  const customerId = readMelissaLeadgenCustomerId();
  const purchase = await buyMelissaConsumerList(
    { zips: input.zctas, filters },
    { licenseKey: customerId, purchaseOrder: input.campaignId }
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
