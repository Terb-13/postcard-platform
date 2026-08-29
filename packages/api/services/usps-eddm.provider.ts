/**
 * EDDM carrier route resolution.
 *
 * USPS does not expose a public REST API for the EDDM Online Tool route table.
 * Real routes were not in the Census/Melissa list-door share. This provider
 * does not invent stub routes.
 *
 * Production options (configure via EDDM_ROUTES_PROVIDER):
 * - `http` — aggregator URL (EDDM_ROUTES_API_URL + optional EDDM_ROUTES_API_KEY)
 *
 * Melissa LeadGen Occupant / Carrier Route Lookups and USPS EDDM Online were
 * not in the share. Do not invent those clients or rates.
 *
 * @see https://postalpro.usps.com/mailing/every-door-direct-mail
 */

import type { EddmRouteSelection } from "./types";

const EDDM_MIN_PIECES_PER_ROUTE = 200;

export const EDDM_ROUTES_BLOCKER =
  "Real USPS/Melissa carrier routes are not configured. Census ACS is map/quote only. The Melissa share covered LeadGen Consumer lists (MELISSA_API_KEY), not EDDM route geometry. Brett-only: (1) Melissa sales — enable LeadGen Occupant and/or Carrier Route Lookups on the existing Melissa account (Sales@Melissa.com or 800-MELISSA ext. 3; they quote partner pricing — do not invent rates), or (2) log in to USPS Business Customer Gateway / EDDM Online (https://eddm.usps.com / https://gateway.usps.com) and give us the licensed route-table feed or aggregator URL as EDDM_ROUTES_API_URL with EDDM_ROUTES_PROVIDER=http. Do not stub routes.";

export class EddmRoutesNotConfiguredError extends Error {
  constructor(message = EDDM_ROUTES_BLOCKER) {
    super(message);
    this.name = "EddmRoutesNotConfiguredError";
  }
}

export type FetchRoutesInput = {
  zctas: string[];
  householdByZip?: Record<string, number>;
};

export type FetchRoutesResult = {
  routes: EddmRouteSelection[];
  totalHomes: number;
  warnings: string[];
  provider: string;
  isStub: boolean;
};

function normalizeZip(z: string): string {
  return z.replace(/\D/g, "").slice(0, 5);
}

/** Expected JSON from EDDM_ROUTES_API_URL: { routes: EddmRouteSelection[] } */
async function fetchRoutesFromHttp(input: FetchRoutesInput): Promise<FetchRoutesResult> {
  const base = process.env.EDDM_ROUTES_API_URL?.trim();
  if (!base) {
    throw new EddmRoutesNotConfiguredError(
      `EDDM_ROUTES_PROVIDER=http but EDDM_ROUTES_API_URL is empty. ${EDDM_ROUTES_BLOCKER}`
    );
  }

  const zips = input.zctas.map(normalizeZip).filter((z) => z.length === 5).join(",");
  const url = new URL(base);
  url.searchParams.set("zips", zips);

  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.EDDM_ROUTES_API_KEY?.trim();
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EDDM routes API HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { routes?: EddmRouteSelection[]; warnings?: string[] };
  const routes = data.routes ?? [];

  return {
    routes,
    totalHomes: routes.reduce((s, r) => s + r.householdCount, 0),
    warnings: data.warnings ?? [],
    provider: "http",
    isStub: false,
  };
}

export async function fetchEddmRoutesFromProvider(input: FetchRoutesInput): Promise<FetchRoutesResult> {
  const provider = (process.env.EDDM_ROUTES_PROVIDER ?? "").toLowerCase();

  switch (provider) {
    case "http":
    case "aggregator":
      return fetchRoutesFromHttp(input);
    case "melissa":
    case "dataaxle":
      throw new EddmRoutesNotConfiguredError(
        `EDDM_ROUTES_PROVIDER=${provider} is not wired. Carrier-route products were not in the Melissa list-door share. ${EDDM_ROUTES_BLOCKER}`
      );
    default:
      throw new EddmRoutesNotConfiguredError();
  }
}

export { EDDM_MIN_PIECES_PER_ROUTE };
