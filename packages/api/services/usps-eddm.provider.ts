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

import { fetchMelissaOccupantRoutes } from "./melissa-occupant-routes";
import type { EddmRouteSelection } from "./types";

const EDDM_MIN_PIECES_PER_ROUTE = 200;

export const EDDM_ROUTES_BLOCKER =
  "Real USPS/Melissa carrier routes are not configured. Set EDDM_ROUTES_PROVIDER=melissa and MELISSA_CUSTOMER_IDENT (numeric Customer Ident for Occupant id=; MELISSA_API_KEY is fallback only). Occupant must be enabled on that account. Or EDDM_ROUTES_PROVIDER=http plus EDDM_ROUTES_API_URL. Do not stub routes. Do not invent an id.";

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
    case "melissa": {
      const customerId =
        process.env.MELISSA_CUSTOMER_IDENT?.trim() || process.env.MELISSA_API_KEY?.trim() || "";
      const occupant = await fetchMelissaOccupantRoutes(input.zctas, { licenseKey: customerId });
      return {
        routes: occupant.routes,
        totalHomes: occupant.totalHomes,
        warnings: occupant.warnings,
        provider: "melissa",
        isStub: false,
      };
    }
    case "dataaxle":
      throw new EddmRoutesNotConfiguredError(
        "EDDM_ROUTES_PROVIDER=dataaxle is closed. Data Axle stays backup. Use EDDM_ROUTES_PROVIDER=melissa (Occupant + MELISSA_CUSTOMER_IDENT) or http + EDDM_ROUTES_API_URL."
      );
    default:
      throw new EddmRoutesNotConfiguredError();
  }
}

export { EDDM_MIN_PIECES_PER_ROUTE };
