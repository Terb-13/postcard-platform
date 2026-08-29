/**
 * Melissa LeadGen Consumer — the targeted list door.
 *
 * Census ACS is map/quote only. This client talks to Melissa for real list counts.
 * Does not purchase lists (no `buy`) and does not invent rates or license keys.
 *
 * @see https://docs.melissa.com/reference-data/leadgen-consumer/leadgen-consumer-reference-guide.html
 */

export const MELISSA_LEADGEN_CONSUMER_BASE =
  "https://list.melissadata.net/v1/Consumer/rest/Service.svc";

/** Published Melissa household-income brackets (`hInc-d` 1-based indices). Not our prices. */
export const MELISSA_HINC_BRACKETS = [
  { index: 1, min: 0, max: 14_999 },
  { index: 2, min: 15_000, max: 19_999 },
  { index: 3, min: 20_000, max: 29_999 },
  { index: 4, min: 30_000, max: 39_999 },
  { index: 5, min: 40_000, max: 49_999 },
  { index: 6, min: 50_000, max: 74_999 },
  { index: 7, min: 75_000, max: 99_999 },
  { index: 8, min: 100_000, max: 124_999 },
  { index: 9, min: 125_000, max: 149_999 },
  { index: 10, min: 150_000, max: 174_999 },
  { index: 11, min: 175_000, max: 199_999 },
  { index: 12, min: 200_000, max: 249_999 },
  { index: 13, min: 250_000, max: Number.POSITIVE_INFINITY },
] as const;

/**
 * Melissa `resLen-d` (length of residence):
 * 1 = 0–6 months, 2 = 7–12 months.
 * Matches the product filter “Recent Movers (last 12 mo)”.
 */
export const MELISSA_RESLEN_LAST_12_MONTHS = "1-2";

export type MelissaListFilters = {
  minIncome?: number;
  maxIncome?: number;
  minMoverPercent?: number;
  ownHome?: boolean;
  homeowners?: boolean;
};

export type MelissaLeadgenQuery = {
  zips: string[];
  filters?: MelissaListFilters;
};

export type MelissaLeadgenCount = {
  recipientCount: number;
  statusCode: string;
  appliedParams: Record<string, string>;
  rawXml: string;
};

export class MelissaLeadgenError extends Error {
  readonly statusCode: string;
  constructor(message: string, statusCode: string) {
    super(message);
    this.name = "MelissaLeadgenError";
    this.statusCode = statusCode;
  }
}

export function normalizeZip5(zip: string): string {
  return zip.replace(/\D/g, "").slice(0, 5);
}

/** Map min/max USD income onto Melissa `hInc-d` indices. Undefined = all brackets. */
export function hincDFromIncome(min?: number, max?: number): string | undefined {
  if (min == null && max == null) return undefined;
  const matches = MELISSA_HINC_BRACKETS.filter((b) => {
    if (min != null && b.max < min) return false;
    if (max != null && b.min > max) return false;
    return true;
  });
  if (matches.length === 0 || matches.length === MELISSA_HINC_BRACKETS.length) {
    return undefined;
  }
  return matches.map((b) => b.index).join("-");
}

/** On = last 12 months (`resLen-d=1-2`). Off = no Melissa residency filter. */
export function resLenDForRecentMovers(minMoverPercent?: number): string | undefined {
  if (minMoverPercent == null || minMoverPercent <= 0) return undefined;
  return MELISSA_RESLEN_LAST_12_MONTHS;
}

export function ownRentDFromFilters(filters?: MelissaListFilters): string | undefined {
  if (filters?.ownHome === true || filters?.homeowners === true) return "1";
  return undefined;
}

export function buildLeadgenCountParams(input: MelissaLeadgenQuery): URLSearchParams {
  const zips = input.zips.map(normalizeZip5).filter((z) => z.length === 5);
  const params = new URLSearchParams();
  params.set("zip", zips.join(","));

  const hInc = hincDFromIncome(input.filters?.minIncome, input.filters?.maxIncome);
  if (hInc) params.set("hInc-d", hInc);

  const ownRent = ownRentDFromFilters(input.filters);
  if (ownRent) params.set("ownRent-d", ownRent);

  const resLen = resLenDForRecentMovers(input.filters?.minMoverPercent);
  if (resLen) params.set("resLen-d", resLen);

  return params;
}

function xmlTag(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, "i"));
  return match?.[1];
}

export function parseLeadgenCountXml(xml: string): { recipientCount: number; statusCode: string } {
  const statusCode = xmlTag(xml, "StatusCode") ?? "Err";
  const countRaw = xmlTag(xml, "Count") ?? "0";
  const recipientCount = Number.parseInt(countRaw, 10);
  return {
    statusCode,
    recipientCount: Number.isFinite(recipientCount) ? recipientCount : 0,
  };
}

export type LeadgenFetch = (url: string, init?: RequestInit) => Promise<Response>;

export async function countMelissaConsumerList(
  input: MelissaLeadgenQuery,
  options: { licenseKey: string; fetchImpl?: LeadgenFetch } = { licenseKey: "" }
): Promise<MelissaLeadgenCount> {
  const licenseKey = options.licenseKey.trim();
  if (!licenseKey) {
    throw new MelissaLeadgenError(
      "MELISSA_API_KEY is required for targeted lists. Census ACS is map/quote only — not a list door. Brett: add a Melissa LeadGen Consumer license key (Sales@Melissa.com or 800-MELISSA ext. 3). Do not invent a key.",
      "NO_KEY"
    );
  }

  const zips = input.zips.map(normalizeZip5).filter((z) => z.length === 5);
  if (zips.length === 0) {
    throw new MelissaLeadgenError("At least one 5-digit ZIP is required for a Melissa list count.", "NO_ZIPS");
  }

  const params = buildLeadgenCountParams({ zips, filters: input.filters });
  params.set("id", licenseKey);

  const url = `${MELISSA_LEADGEN_CONSUMER_BASE}/get/zip?${params.toString()}`;
  const fetchImpl = options.fetchImpl ?? fetch;
  const res = await fetchImpl(url, {
    method: "GET",
    headers: { Accept: "application/xml" },
  });

  const rawXml = await res.text();
  if (!res.ok) {
    throw new MelissaLeadgenError(
      `Melissa LeadGen Consumer HTTP ${res.status}: ${rawXml.slice(0, 200)}`,
      `HTTP_${res.status}`
    );
  }

  const parsed = parseLeadgenCountXml(rawXml);
  if (parsed.statusCode !== "Approved") {
    const detail = xmlTag(rawXml, "Error") ?? xmlTag(rawXml, "ErrorMessage") ?? rawXml.slice(0, 200);
    throw new MelissaLeadgenError(
      `Melissa LeadGen Consumer ${parsed.statusCode}: ${detail}. If StatusCode is Declined with an unrecognized id, the key is missing or not enabled for LeadGen Consumer (Sales@Melissa.com or 800-MELISSA ext. 3).`,
      parsed.statusCode
    );
  }

  const appliedParams = Object.fromEntries(
    [...params.entries()].filter(([key]) => key !== "id")
  );

  return {
    recipientCount: parsed.recipientCount,
    statusCode: parsed.statusCode,
    appliedParams,
    rawXml,
  };
}
