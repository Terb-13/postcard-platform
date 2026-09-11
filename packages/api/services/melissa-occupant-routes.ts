/**
 * Melissa LeadGen Occupant — real EDDM carrier routes (not STUB-CR).
 * Wired only when EDDM_ROUTES_PROVIDER=melissa.
 * `id=` is MELISSA_CUSTOMER_IDENT (numeric Ident), falling back to MELISSA_API_KEY.
 *
 * @see https://docs.melissa.com/reference-data/leadgen-occupant/leadgen-occupant-reference-guide.html
 */

import {
  MelissaLeadgenError,
  normalizeZip5,
  readMelissaLeadgenCustomerId,
  type LeadgenFetch,
} from "./melissa-leadgen-consumer";
import type { EddmRouteSelection } from "./types";

export const MELISSA_OCCUPANT_BASE = "https://list.melissadata.net/V1/occupant/rest/Service.svc";

export type OccupantRoutesResult = {
  routes: EddmRouteSelection[];
  totalHomes: number;
  warnings: string[];
};

function xmlTag(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, "i"));
  return match?.[1];
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseOccupantRoutesJson(data: unknown): OccupantRoutesResult {
  const root = (data as { Occupant?: Record<string, unknown> })?.Occupant ?? (data as Record<string, unknown>);
  const status =
    String(
      (root as { Result?: { StatusCode?: string } })?.Result?.StatusCode ??
        (root as { StatusCode?: string }).StatusCode ??
        ""
    ) || "Err";
  if (status && status !== "Approved") {
    throw new MelissaLeadgenError(
      `Melissa Occupant ${status}. Occupant must be enabled on the license to return real carrier routes. Cloud credits may not include LeadGen Occupant.`,
      status
    );
  }

  const carrierBlock = (root as { CarrierRoutes?: { CarrierRoute?: unknown } }).CarrierRoutes;
  const rawRoutes = asArray(carrierBlock?.CarrierRoute as Record<string, string> | Record<string, string>[]);
  const routes: EddmRouteSelection[] = [];
  for (const row of rawRoutes) {
    const zip = normalizeZip5(String(row.Zip ?? row.zip ?? ""));
    const route = String(row.Route ?? row.route ?? "").replace(/\s+/g, "").toUpperCase();
    const householdCount = Number.parseInt(String(row.Count ?? row.count ?? "0"), 10);
    if (zip.length !== 5 || !route) continue;
    routes.push({
      carrierRouteId: `${route}-${zip}`,
      zip,
      householdCount: Number.isFinite(householdCount) ? householdCount : 0,
    });
  }
  return {
    routes,
    totalHomes: routes.reduce((s, r) => s + r.householdCount, 0),
    warnings: [],
  };
}

export function parseOccupantRoutesXml(xml: string): OccupantRoutesResult {
  const status = xmlTag(xml, "StatusCode") ?? "Err";
  if (status !== "Approved") {
    throw new MelissaLeadgenError(
      `Melissa Occupant ${status}. Occupant must be enabled on the license to return real carrier routes.`,
      status
    );
  }
  const routes: EddmRouteSelection[] = [];
  const blocks = xml.match(/<CarrierRoute>[\s\S]*?<\/CarrierRoute>/gi) ?? [];
  for (const block of blocks) {
    const zip = normalizeZip5(xmlTag(block, "Zip") ?? "");
    const route = (xmlTag(block, "Route") ?? "").replace(/\s+/g, "").toUpperCase();
    const householdCount = Number.parseInt(xmlTag(block, "Count") ?? "0", 10);
    if (zip.length !== 5 || !route || route.startsWith("STUB")) continue;
    routes.push({
      carrierRouteId: `${route}-${zip}`,
      zip,
      householdCount: Number.isFinite(householdCount) ? householdCount : 0,
    });
  }
  return {
    routes,
    totalHomes: routes.reduce((s, r) => s + r.householdCount, 0),
    warnings: [],
  };
}

export async function fetchMelissaOccupantRoutes(
  zips: string[],
  options: { licenseKey?: string; fetchImpl?: LeadgenFetch } = {}
): Promise<OccupantRoutesResult> {
  const customerId = readMelissaLeadgenCustomerId(options.licenseKey);

  const zipList = zips.map(normalizeZip5).filter((z) => z.length === 5).join(",");
  if (!zipList) {
    throw new MelissaLeadgenError("At least one 5-digit ZIP is required for Occupant routes.", "NO_ZIPS");
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const url = `${MELISSA_OCCUPANT_BASE}/get/json/zip?id=${encodeURIComponent(customerId)}&zip=${encodeURIComponent(zipList)}`;
  const res = await fetchImpl(url, { method: "GET", headers: { Accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) {
    throw new MelissaLeadgenError(
      `Melissa Occupant HTTP ${res.status}: ${text.slice(0, 200)}`,
      `HTTP_${res.status}`
    );
  }

  const trimmed = text.trim();
  const parsed = trimmed.startsWith("{") || trimmed.startsWith("[")
    ? parseOccupantRoutesJson(JSON.parse(trimmed) as unknown)
    : parseOccupantRoutesXml(text);

  if (parsed.routes.length === 0) {
    throw new MelissaLeadgenError(
      "Melissa Occupant returned no carrier routes. Not inventing STUB-CR routes.",
      "EMPTY_ROUTES"
    );
  }
  if (parsed.routes.some((r) => r.carrierRouteId.startsWith("STUB"))) {
    throw new MelissaLeadgenError("Refusing stub carrier route ids from Occupant.", "STUB_REFUSED");
  }
  return parsed;
}
