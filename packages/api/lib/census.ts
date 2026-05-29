/**
 * US Census ACS 5-year estimates at ZCTA (ZIP) level.
 * Dataset: ACS 2023 5-year (acs/acs5).
 * @see https://www.census.gov/data/developers/data-sets/acs-5year.html
 */

const ACS_YEAR = "2023";
const ACS_DATASET = "acs/acs5";

/** Census variable codes */
export const CENSUS_VARS = {
  population: "B01003_001E",
  medianIncome: "B19013_001E",
  households: "B11001_001E",
  /** Population 1 year and over */
  mobilityTotal: "B07003_001E",
  /** Same house 1 year ago */
  sameHouse: "B07003_004E",
} as const;

/** Suppressed / missing Census sentinel values */
const SUPPRESSED = new Set([
  "-666666666",
  "-888888888",
  "-999999999",
  "-555555555",
  "-222222222",
  "-",
  "",
]);

export interface ZipDemographics {
  zcta: string;
  name: string;
  population: number;
  medianIncome: number | null;
  households: number;
  /** Approximate % who did not live in the same house 1 year ago */
  moverPercent: number | null;
}

export interface ACSStatsResult {
  zctaCount: number;
  population: number;
  households: number;
  avgMedianIncome: number | null;
  avgMoverPercent: number | null;
  zctas: ZipDemographics[];
}

export interface AudienceEstimate {
  zctaCount: number;
  population: number;
  households: number;
  avgMedianIncome: number | null;
  avgMoverPercent: number | null;
  /** Households when available, otherwise population */
  reach: number;
  zctas: ZipDemographics[];
  pricing?: {
    quantity: number;
    unitPriceCents: number;
    totalPriceCents: number;
    estimatedReach: number;
    usedOverride: boolean;
  };
}

type CacheEntry = { data: ZipDemographics; expiresAt: number };

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class CensusConfigError extends Error {
  constructor(message = "CENSUS_API_KEY is not configured") {
    super(message);
    this.name = "CensusConfigError";
  }
}

function requireApiKey(): string {
  const key = process.env.CENSUS_API_KEY?.trim();
  if (!key) {
    throw new CensusConfigError(
      "CENSUS_API_KEY is not configured. Add it to your environment (https://api.census.gov/data/key_signup.html)."
    );
  }
  return key;
}

function normalizeZcta(zcta: string): string {
  const digits = zcta.replace(/\D/g, "").slice(0, 5);
  if (digits.length !== 5) {
    throw new Error(`Invalid ZCTA: ${zcta}`);
  }
  return digits;
}

function parseNumber(val: string | null | undefined): number | null {
  if (val == null || SUPPRESSED.has(val)) return null;
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function emptyZcta(zcta: string): ZipDemographics {
  return {
    zcta,
    name: `ZCTA ${zcta}`,
    population: 0,
    medianIncome: null,
    households: 0,
    moverPercent: null,
  };
}

function parseRow(headers: string[], row: string[]): ZipDemographics {
  const idx = (name: string) => headers.indexOf(name);
  const zcta = row[idx("zip code tabulation area")] ?? row[row.length - 1] ?? "";

  const pop = parseNumber(row[idx(CENSUS_VARS.population)]) ?? 0;
  const income = parseNumber(row[idx(CENSUS_VARS.medianIncome)]);
  const households = parseNumber(row[idx(CENSUS_VARS.households)]) ?? 0;
  const mobTotal = parseNumber(row[idx(CENSUS_VARS.mobilityTotal)]);
  const sameHouse = parseNumber(row[idx(CENSUS_VARS.sameHouse)]);

  let moverPercent: number | null = null;
  if (mobTotal != null && mobTotal > 0 && sameHouse != null) {
    moverPercent = Math.round(((mobTotal - sameHouse) / mobTotal) * 1000) / 10;
  }

  return {
    zcta,
    name: row[idx("NAME")] ?? `ZCTA ${zcta}`,
    population: pop,
    medianIncome: income,
    households,
    moverPercent,
  };
}

function aggregateZctas(zctas: ZipDemographics[]): ACSStatsResult {
  const population = zctas.reduce((s, r) => s + r.population, 0);
  const households = zctas.reduce((s, r) => s + r.households, 0);

  const incomes = zctas.map((r) => r.medianIncome).filter((n): n is number => n != null);
  const avgMedianIncome =
    incomes.length > 0 ? Math.round(incomes.reduce((a, b) => a + b, 0) / incomes.length) : null;

  const movers = zctas.map((r) => r.moverPercent).filter((n): n is number => n != null);
  const avgMoverPercent =
    movers.length > 0
      ? Math.round((movers.reduce((a, b) => a + b, 0) / movers.length) * 10) / 10
      : null;

  return {
    zctaCount: zctas.length,
    population,
    households,
    avgMedianIncome,
    avgMoverPercent,
    zctas,
  };
}

async function fetchZctasFromApi(zctas: string[]): Promise<Map<string, ZipDemographics>> {
  requireApiKey();

  const key = process.env.CENSUS_API_KEY!.trim();
  const vars = Object.values(CENSUS_VARS).join(",");
  const base = `https://api.census.gov/data/${ACS_YEAR}/${ACS_DATASET}`;
  const params = new URLSearchParams({ get: `NAME,${vars}`, key });

  for (const z of zctas) {
    params.append("for", `zip code tabulation area:${z}`);
  }

  const url = `${base}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Census API error (${res.status}) for ZCTAs: ${zctas.join(", ")}`);
  }

  const json = (await res.json()) as string[][];
  if (!json || json.length < 2) {
    return new Map(zctas.map((z) => [z, emptyZcta(z)]));
  }

  const headers = json[0]!;
  const results = new Map<string, ZipDemographics>();

  for (let i = 1; i < json.length; i++) {
    const parsed = parseRow(headers, json[i]!);
    results.set(parsed.zcta, parsed);
  }

  for (const z of zctas) {
    if (!results.has(z)) {
      results.set(z, emptyZcta(z));
    }
  }

  return results;
}

async function getZctaStats(zcta: string): Promise<ZipDemographics> {
  const normalized = normalizeZcta(zcta);
  const cached = memoryCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const map = await fetchZctasFromApi([normalized]);
  const data = map.get(normalized) ?? emptyZcta(normalized);
  memoryCache.set(normalized, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

/** Fetch ACS stats for multiple ZCTAs with in-memory cache (24h TTL). */
export async function getACSStats(zctas: string[]): Promise<ACSStatsResult> {
  if (zctas.length === 0) {
    return aggregateZctas([]);
  }

  requireApiKey();

  const unique = [...new Set(zctas.map(normalizeZcta))];
  const results: ZipDemographics[] = [];
  const toFetch: string[] = [];

  for (const z of unique) {
    const cached = memoryCache.get(z);
    if (cached && cached.expiresAt > Date.now()) {
      results.push(cached.data);
    } else {
      toFetch.push(z);
    }
  }

  const BATCH = 25;
  for (let i = 0; i < toFetch.length; i += BATCH) {
    const batch = toFetch.slice(i, i + BATCH);
    try {
      const fetched = await fetchZctasFromApi(batch);
      for (const z of batch) {
        const data = fetched.get(z) ?? emptyZcta(z);
        memoryCache.set(z, { data, expiresAt: Date.now() + CACHE_TTL_MS });
        results.push(data);
      }
    } catch {
      for (const z of batch) {
        try {
          const data = await getZctaStats(z);
          results.push(data);
        } catch {
          results.push(emptyZcta(z));
        }
      }
    }
  }

  results.sort((a, b) => a.zcta.localeCompare(b.zcta));
  return aggregateZctas(results);
}

export type EstimateAudienceOptions = {
  baseRateCentsPerPiece?: number;
  size?: string;
  quantityOverride?: number;
};

const SIZE_MULTIPLIERS: Record<string, number> = {
  "4x6": 1,
  "5x7": 1.15,
  "6x9": 1.35,
  "6x11": 1.5,
};

const MIN_QUANTITY = 100;

function resolveUnitPriceCents(size: string, baseRateCentsPerPiece?: number): number {
  const multiplier = SIZE_MULTIPLIERS[size] ?? 1;
  const base =
    baseRateCentsPerPiece ??
    (() => {
      const env = process.env.POSTCARD_BASE_RATE_CENTS;
      if (env) {
        const n = parseInt(env, 10);
        if (Number.isFinite(n) && n > 0) return n;
      }
      return 12;
    })();
  return Math.round(base * multiplier);
}

/** Build an audience estimate from pre-fetched ACS stats (no API calls). */
export function audienceEstimateFromStats(
  stats: ACSStatsResult,
  options: EstimateAudienceOptions = {}
): AudienceEstimate {
  const reach = stats.households > 0 ? stats.households : stats.population;

  const estimate: AudienceEstimate = {
    zctaCount: stats.zctaCount,
    population: stats.population,
    households: stats.households,
    avgMedianIncome: stats.avgMedianIncome,
    avgMoverPercent: stats.avgMoverPercent,
    reach,
    zctas: stats.zctas,
  };

  if (options.baseRateCentsPerPiece != null || options.size != null || options.quantityOverride != null) {
    const size = options.size ?? "6x11";
    const unitPriceCents = resolveUnitPriceCents(size, options.baseRateCentsPerPiece);
    const estimatedReach = Math.max(0, Math.floor(reach));
    const usedOverride = options.quantityOverride != null && options.quantityOverride > 0;
    const rawQty = usedOverride ? options.quantityOverride! : estimatedReach;
    const quantity = Math.max(MIN_QUANTITY, Math.floor(rawQty));

    estimate.pricing = {
      quantity,
      unitPriceCents,
      totalPriceCents: unitPriceCents * quantity,
      estimatedReach,
      usedOverride,
    };
  }

  return estimate;
}

/** Estimate audience reach and optional live cost preview from ZCTA selection. */
export async function estimateAudience(
  zctas: string[],
  options: EstimateAudienceOptions = {}
): Promise<AudienceEstimate> {
  const stats = await getACSStats(zctas);
  return audienceEstimateFromStats(stats, options);
}

/** @deprecated Use getACSStats — kept for internal callers during migration */
export async function getStatsForZctas(zctas: string[]): Promise<ACSStatsResult> {
  return getACSStats(zctas);
}

/** Clear in-memory cache (for tests/admin) */
export function clearCensusCache(): void {
  memoryCache.clear();
}
