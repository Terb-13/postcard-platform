/**
 * Melissa LeadGen Consumer — the targeted list door.
 *
 * Census ACS is map/quote only. `get` = count. `buy` = purchase CSV of names+addresses.
 * Occupant/Consumer `id=` is MELISSA_CUSTOMER_IDENT (numeric Customer Ident),
 * falling back to MELISSA_API_KEY. License Key as id= returns empty Geography.
 * NewMovers Data Retriever still uses MELISSA_API_KEY as CustomerID.
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

/** Melissa LeadGen Occupant/Consumer `id=` — numeric Customer Ident, not the License Key. */
export const MELISSA_LEADGEN_ID_REQUIRED =
  "MELISSA_CUSTOMER_IDENT (numeric Customer Ident) is required for LeadGen Occupant/Consumer id=. MELISSA_API_KEY (License Key) is a fallback only — License Key as id= returns empty Geography. Do not invent an id.";

/**
 * Occupant + LeadGen Consumer get/buy use this as Melissa `id=`.
 * Prefer MELISSA_CUSTOMER_IDENT; fall back to MELISSA_API_KEY. Fail closed if both missing.
 */
export function readMelissaLeadgenCustomerId(explicit?: string): string {
  const id =
    explicit?.trim() ||
    process.env.MELISSA_CUSTOMER_IDENT?.trim() ||
    process.env.MELISSA_API_KEY?.trim() ||
    "";
  if (!id) {
    throw new MelissaLeadgenError(MELISSA_LEADGEN_ID_REQUIRED, "NO_KEY");
  }
  return id;
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

export type MelissaRecipient = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  addressLine: string;
  city?: string;
  state?: string;
  zip: string;
  plus4?: string;
  resultCodes?: string;
};

export type MelissaLeadgenPurchase = MelissaLeadgenCount & {
  orderId: string;
  downloadUrl: string;
  recipients: MelissaRecipient[];
};

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
  options: { licenseKey?: string; fetchImpl?: LeadgenFetch } = {}
): Promise<MelissaLeadgenCount> {
  const customerId = readMelissaLeadgenCustomerId(options.licenseKey);

  const zips = input.zips.map(normalizeZip5).filter((z) => z.length === 5);
  if (zips.length === 0) {
    throw new MelissaLeadgenError("At least one 5-digit ZIP is required for a Melissa list count.", "NO_ZIPS");
  }

  const params = buildLeadgenCountParams({ zips, filters: input.filters });
  params.set("id", customerId);

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

export function parseLeadgenBuyXml(xml: string): {
  recipientCount: number;
  statusCode: string;
  orderId?: string;
  downloadUrl?: string;
} {
  return {
    ...parseLeadgenCountXml(xml),
    orderId: xmlTag(xml, "Id"),
    downloadUrl: xmlTag(xml, "DownloadURL"),
  };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current.trim());
  return out;
}

function pick(row: Record<string, string>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (value) return value;
  }
  return undefined;
}

/** Parse Melissa LeadGen CSV (file=8). Header names vary; we map documented mailing fields. */
export function parseMelissaListCsv(csv: string): MelissaRecipient[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0] ?? "").map((h) => h.toLowerCase().replace(/[\s_]+/g, ""));
  const recipients: MelissaRecipient[] = [];

  for (const line of lines.slice(1)) {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    const addressLine =
      pick(row, "addressline", "address", "address1", "addressline1", "street", "streetaddress") ?? "";
    const zip = normalizeZip5(pick(row, "zip", "zipcode", "postalcode", "zip5") ?? "");
    if (!addressLine || zip.length !== 5) continue;
    recipients.push({
      firstName: pick(row, "firstname", "first", "fname"),
      lastName: pick(row, "lastname", "last", "lname"),
      fullName: pick(row, "fullname", "name"),
      addressLine,
      city: pick(row, "city"),
      state: pick(row, "state", "st"),
      zip,
      plus4: pick(row, "plus4", "zip4", "plusfour"),
      resultCodes: pick(row, "resultcodes", "results"),
    });
  }
  return recipients;
}

export function creditsCannotBuyMessage(statusCode: string, detail: string): string {
  return (
    `Melissa LeadGen Consumer buy ${statusCode}: ${detail}. ` +
    `LeadGen buy is a list purchase (order/subscription), not a Lookups credit ping. ` +
    `Melissa Cloud credits do not enable every product — if this key is credits-only and LeadGen is not activated, ` +
    `buy cannot return doors (status 104/116/130/133). Brett: enable LeadGen Consumer on the license ` +
    `(Sales@Melissa.com or 800-MELISSA ext. 3). Do not invent a key.`
  );
}

/**
 * Purchase a Consumer list (names + ZIP+4 addresses). Spends Melissa list credits/order.
 * Preview/count must use countMelissaConsumerList instead.
 */
export async function buyMelissaConsumerList(
  input: MelissaLeadgenQuery,
  options: { licenseKey?: string; fetchImpl?: LeadgenFetch; purchaseOrder?: string }
): Promise<MelissaLeadgenPurchase> {
  const customerId = readMelissaLeadgenCustomerId(options.licenseKey);

  const zips = input.zips.map(normalizeZip5).filter((z) => z.length === 5);
  if (zips.length === 0) {
    throw new MelissaLeadgenError("At least one 5-digit ZIP is required for a Melissa list buy.", "NO_ZIPS");
  }

  const params = buildLeadgenCountParams({ zips, filters: input.filters });
  params.set("id", customerId);
  params.set("name", "1");
  params.set("zip4", "1");
  params.set("file", "8");
  if (options.purchaseOrder) params.set("po", options.purchaseOrder);

  const fetchImpl = options.fetchImpl ?? fetch;
  const url = `${MELISSA_LEADGEN_CONSUMER_BASE}/buy/zip?${params.toString()}`;
  const res = await fetchImpl(url, {
    method: "GET",
    headers: { Accept: "application/xml" },
  });
  const rawXml = await res.text();
  if (!res.ok) {
    throw new MelissaLeadgenError(
      `Melissa LeadGen Consumer buy HTTP ${res.status}: ${rawXml.slice(0, 200)}`,
      `HTTP_${res.status}`
    );
  }

  const parsed = parseLeadgenBuyXml(rawXml);
  if (parsed.statusCode !== "Approved" || !parsed.downloadUrl || !parsed.orderId) {
    const detail = xmlTag(rawXml, "Error") ?? xmlTag(rawXml, "ErrorMessage") ?? rawXml.slice(0, 240);
    throw new MelissaLeadgenError(creditsCannotBuyMessage(parsed.statusCode, detail), parsed.statusCode);
  }

  const fileRes = await fetchImpl(parsed.downloadUrl, { method: "GET" });
  const csv = await fileRes.text();
  if (!fileRes.ok) {
    throw new MelissaLeadgenError(
      `Melissa list file HTTP ${fileRes.status} for order ${parsed.orderId}: ${csv.slice(0, 200)}`,
      `HTTP_${fileRes.status}`
    );
  }

  const recipients = parseMelissaListCsv(csv);
  if (recipients.length === 0) {
    throw new MelissaLeadgenError(
      `Melissa order ${parsed.orderId} returned no parseable name/address rows. Not substituting Census counts.`,
      "EMPTY_LIST"
    );
  }

  const appliedParams = Object.fromEntries(
    [...params.entries()].filter(([key]) => key !== "id")
  );

  return {
    recipientCount: recipients.length,
    statusCode: parsed.statusCode,
    appliedParams,
    rawXml,
    orderId: parsed.orderId,
    downloadUrl: parsed.downloadUrl,
    recipients,
  };
}
