/**
 * Melissa Data Retriever — NewMovers door.
 * CustomerID is MELISSA_API_KEY (License Key), not MELISSA_CUSTOMER_IDENT.
 * Used when the campaign is new-movers only (no income/own-home selects).
 * Combined income/own-home + movers uses LeadGen Consumer (documented filters).
 *
 * @see https://docs.melissa.com/reference-data/data-retriever/data-retriever-reference-guide.html
 */

import {
  MelissaLeadgenError,
  normalizeZip5,
  type LeadgenFetch,
  type MelissaListFilters,
  type MelissaRecipient,
} from "./melissa-leadgen-consumer";

export const MELISSA_NEWMOVERS_BASE = "https://dataretriever.melissadata.net/web/V1/NewMovers";

const NEWMOVERS_COLUMNS = [
  "MelissaAddressKey",
  "FullName",
  "FirstName",
  "LastName",
  "AddressLine",
  "City",
  "State",
  "ZIPCode",
  "Plus4",
  "ResultCodes",
] as const;

const MAX_LOOKUP_PAGES = 50;

export function last12MonthMoveWindow(now = new Date()): { StartDate: string; EndDate: string } {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`;
  return { StartDate: fmt(start), EndDate: fmt(end) };
}

function newMoversBody(zips: string[], licenseKey: string, page?: number) {
  const body: Record<string, unknown> = {
    CustomerID: licenseKey,
    Includes: {
      Zips: zips.map((zip) => ({ Zip: zip })),
      MoveEffectiveDate: last12MonthMoveWindow(),
    },
    Columns: [...NEWMOVERS_COLUMNS],
  };
  if (page != null) body.Pagination = { Page: page };
  return body;
}

export type NewMoversCount = {
  recipientCount: number;
  jobId?: string;
  resultCode: string;
};

export type NewMoversLookup = NewMoversCount & {
  recipients: MelissaRecipient[];
};

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === "object" ? (row as Record<string, unknown>) : {};
}

function str(row: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

export function mapNewMoversRow(row: unknown): MelissaRecipient | null {
  const rec = asRecord(row);
  const addressLine = str(rec, "AddressLine", "addressLine") ?? "";
  const zip = normalizeZip5(str(rec, "ZIPCode", "Zip", "zip") ?? "");
  if (!addressLine || zip.length !== 5) return null;
  return {
    firstName: str(rec, "FirstName"),
    lastName: str(rec, "LastName"),
    fullName: str(rec, "FullName"),
    addressLine,
    city: str(rec, "City"),
    state: str(rec, "State"),
    zip,
    plus4: str(rec, "Plus4"),
    resultCodes: str(rec, "ResultCodes"),
  };
}

export async function countMelissaNewMovers(
  zips: string[],
  options: { licenseKey: string; fetchImpl?: LeadgenFetch }
): Promise<NewMoversCount> {
  const licenseKey = options.licenseKey.trim();
  if (!licenseKey) {
    throw new MelissaLeadgenError(
      "MELISSA_API_KEY is required for NewMovers. Do not invent a key.",
      "NO_KEY"
    );
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  const res = await fetchImpl(`${MELISSA_NEWMOVERS_BASE}/doCount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(newMoversBody(zips.map(normalizeZip5).filter((z) => z.length === 5), licenseKey)),
  });
  const json = (await res.json()) as { Count?: number; JobId?: string; ResultCode?: string; Message?: string };
  if (!res.ok || json.ResultCode !== "LS01") {
    throw new MelissaLeadgenError(
      `Melissa NewMovers doCount ${json.ResultCode ?? `HTTP_${res.status}`}: ${json.Message ?? "not LS01"}. ` +
        `Cloud credits may not include Data Retriever NewMovers. Brett: enable NewMovers on the Melissa license.`,
      json.ResultCode ?? `HTTP_${res.status}`
    );
  }
  return {
    recipientCount: json.Count ?? 0,
    jobId: json.JobId,
    resultCode: json.ResultCode,
  };
}

export async function lookupMelissaNewMovers(
  zips: string[],
  options: { licenseKey: string; fetchImpl?: LeadgenFetch }
): Promise<NewMoversLookup> {
  const licenseKey = options.licenseKey.trim();
  if (!licenseKey) {
    throw new MelissaLeadgenError(
      "MELISSA_API_KEY is required for NewMovers. Do not invent a key.",
      "NO_KEY"
    );
  }

  const cleanZips = zips.map(normalizeZip5).filter((z) => z.length === 5);
  const fetchImpl = options.fetchImpl ?? fetch;
  const recipients: MelissaRecipient[] = [];
  let jobId: string | undefined;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= MAX_LOOKUP_PAGES) {
    const res = await fetchImpl(`${MELISSA_NEWMOVERS_BASE}/doLookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(newMoversBody(cleanZips, licenseKey, page)),
    });
    const json = (await res.json()) as {
      Count?: number;
      Results?: unknown[];
      Pagination?: { TotalPages?: number; NextPage?: number };
      JobId?: string;
      ResultCode?: string;
      Message?: string;
    };
    if (!res.ok || json.ResultCode !== "LS01") {
      throw new MelissaLeadgenError(
        `Melissa NewMovers doLookup ${json.ResultCode ?? `HTTP_${res.status}`}: ${json.Message ?? "not LS01"}. ` +
          `If this is a credits-only key without NewMovers, the API cannot return mover doors.`,
        json.ResultCode ?? `HTTP_${res.status}`
      );
    }
    jobId = json.JobId ?? jobId;
    for (const row of json.Results ?? []) {
      const mapped = mapNewMoversRow(row);
      if (mapped) recipients.push(mapped);
    }
    totalPages = json.Pagination?.TotalPages ?? page;
    page += 1;
  }

  if (recipients.length === 0) {
    throw new MelissaLeadgenError(
      "Melissa NewMovers returned no name/address rows. Not substituting Census counts.",
      "EMPTY_LIST"
    );
  }

  return {
    recipientCount: recipients.length,
    jobId,
    resultCode: "LS01",
    recipients,
  };
}

/** NewMovers door only when movers are on and income/own-home are not (those use Consumer). */
export function shouldUseNewMoversDoor(filters?: MelissaListFilters): boolean {
  const movers = (filters?.minMoverPercent ?? 0) > 0;
  const consumerSelects =
    filters?.minIncome != null ||
    filters?.maxIncome != null ||
    filters?.ownHome === true ||
    filters?.homeowners === true;
  return movers && !consumerSelects;
}
