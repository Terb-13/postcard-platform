/**
 * EDDM carrier route resolution.
 *
 * USPS does not expose a public REST API for the EDDM Online Tool route table.
 * Production options (configure via EDDM_ROUTES_PROVIDER):
 * - `melissa` — Melissa Data / Data Axle route product (when API wired)
 * - `http`    — Your aggregator URL (EDDM_ROUTES_API_URL)
 * - `stub`    — Development fallback (default)
 *
 * @see https://postalpro.usps.com/mailing/every-door-direct-mail
 */

import type { EddmRouteSelection } from "./types";

const EDDM_MIN_PIECES_PER_ROUTE = 200;

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

function stubRoutes(input: FetchRoutesInput): FetchRoutesResult {
  const warnings: string[] = [
    "Using development stub routes. Set EDDM_ROUTES_PROVIDER=http and EDDM_ROUTES_API_URL for production.",
  ];
  const routes: EddmRouteSelection[] = [];

  for (const zip of input.zctas) {
    const normalized = normalizeZip(zip);
    if (normalized.length !== 5) continue;

    const householdCount = input.householdByZip?.[normalized] ?? 0;
    if (householdCount > 0 && householdCount < EDDM_MIN_PIECES_PER_ROUTE) {
      warnings.push(
        `ZIP ${normalized}: ${householdCount} delivery points (USPS retail EDDM minimum is ${EDDM_MIN_PIECES_PER_ROUTE} per ZIP/day).`
      );
    }

    routes.push({
      carrierRouteId: `STUB-CR-${normalized}-001`,
      zip: normalized,
      householdCount: Math.max(householdCount, EDDM_MIN_PIECES_PER_ROUTE),
      walkSequence: "001",
    });
  }

  return {
    routes,
    totalHomes: routes.reduce((s, r) => s + r.householdCount, 0),
    warnings,
    provider: "stub",
    isStub: true,
  };
}

/** Expected JSON from EDDM_ROUTES_API_URL: { routes: EddmRouteSelection[] } */
async function fetchRoutesFromHttp(input: FetchRoutesInput): Promise<FetchRoutesResult> {
  const base = process.env.EDDM_ROUTES_API_URL?.trim();
  if (!base) {
    return stubRoutes(input);
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

async function fetchRoutesFromMelissa(input: FetchRoutesInput): Promise<FetchRoutesResult> {
  const key = process.env.MELISSA_API_KEY?.trim();
  if (!key) {
    return {
      ...stubRoutes(input),
      warnings: [
        "EDDM_ROUTES_PROVIDER=melissa but MELISSA_API_KEY is not set.",
        ...stubRoutes(input).warnings,
      ],
    };
  }

  // TODO: Melissa EDDM / Carrier Route API — replace with vendor endpoint when contract is active
  return {
    ...stubRoutes(input),
    warnings: [
      "Melissa EDDM route API integration pending — using stub routes until endpoint is configured.",
      ...stubRoutes(input).warnings,
    ],
    provider: "melissa",
    isStub: true,
  };
}

export async function fetchEddmRoutesFromProvider(input: FetchRoutesInput): Promise<FetchRoutesResult> {
  const provider = (process.env.EDDM_ROUTES_PROVIDER ?? "stub").toLowerCase();

  switch (provider) {
    case "http":
    case "aggregator":
      return fetchRoutesFromHttp(input);
    case "melissa":
    case "dataaxle":
      return fetchRoutesFromMelissa(input);
    default:
      return stubRoutes(input);
  }
}

export { EDDM_MIN_PIECES_PER_ROUTE };
