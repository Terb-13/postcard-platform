/**
 * US Census ACS 5-year estimates at ZCTA (ZIP Code Tabulation Area) level.
 *
 * ## Getting a free Census API key
 * 1. Visit https://api.census.gov/data/key_signup.html
 * 2. Enter your name, organization, and email — keys are free and usually arrive instantly.
 * 3. Add the key to your server environment as `CENSUS_API_KEY` (see `.env.example`).
 *
 * Without a key the Census API rate-limits aggressively and may return HTML error pages.
 *
 * ## Datasets used
 * - `acs/acs5` — detail tables (population, income, households)
 * - `acs/acs5/profile` — DP02 mobility profile (mover-related percentages)
 *
 * @see https://www.census.gov/data/developers/data-sets/acs-5year.html
 */

const ACS_YEAR = "2023";
const ACS_DATASET = "acs/acs5";
const ACS_PROFILE_DATASET = "acs/acs5/profile";

/** Detail-table variable codes (acs/acs5) */
export const CENSUS_VARS = {
  /** Total population */
  population: "B01003_001E",
  /** Median household income */
  medianIncome: "B19013_001E",
  households: "B11001_001E",
} as const;

/** B19001 household income brackets — share of households at $75k+ */
export const CENSUS_INCOME_BRACKET_VARS = {
  total: "B19001_001E",
  from75kTo100k: "B19001_013E",
  from100kTo125k: "B19001_014E",
  from125kTo150k: "B19001_015E",
  from150kTo200k: "B19001_016E",
  from200kPlus: "B19001_017E",
} as const;

/** Profile-table variable codes (acs/acs5/profile — DP02 mobility) */
export const CENSUS_PROFILE_VARS = {
  /** DP02: percent living in the same house 1 year ago; movers ≈ 100 − this value */
  sameHousePercent: "DP02_0063PE",
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
  /** Approximate % who did not live in the same house 1 year ago (from DP02) */
  moverPercent: number | null;
  /** Share of households earning $75k+ (0–1), from B19001 income brackets */
  income75kPlusShare: number | null;
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

export class CensusApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "CensusApiError";
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

function moverPercentFromSameHouse(sameHousePercent: number | null): number | null {
  if (sameHousePercent == null || sameHousePercent < 0 || sameHousePercent > 100) {
    return null;
  }
  return Math.round((100 - sameHousePercent) * 10) / 10;
}

function emptyZcta(zcta: string): ZipDemographics {
  return {
    zcta,
    name: `ZCTA ${zcta}`,
    population: 0,
    medianIncome: null,
    households: 0,
    moverPercent: null,
    income75kPlusShare: null,
  };
}

function income75kPlusShareFromBrackets(headers: string[], row: string[]): number | null {
  const idx = (name: string) => headers.indexOf(name);
  const total = parseNumber(row[idx(CENSUS_INCOME_BRACKET_VARS.total)]);
  if (total == null || total <= 0) return null;

  const above75k =
    (parseNumber(row[idx(CENSUS_INCOME_BRACKET_VARS.from75kTo100k)]) ?? 0) +
    (parseNumber(row[idx(CENSUS_INCOME_BRACKET_VARS.from100kTo125k)]) ?? 0) +
    (parseNumber(row[idx(CENSUS_INCOME_BRACKET_VARS.from125kTo150k)]) ?? 0) +
    (parseNumber(row[idx(CENSUS_INCOME_BRACKET_VARS.from150kTo200k)]) ?? 0) +
    (parseNumber(row[idx(CENSUS_INCOME_BRACKET_VARS.from200kPlus)]) ?? 0);

  return Math.min(1, Math.max(0, above75k / total));
}

function parseDetailRow(headers: string[], row: string[], moverByZcta: Map<string, number | null>): ZipDemographics {
  const idx = (name: string) => headers.indexOf(name);
  const zcta = row[idx("zip code tabulation area")] ?? row[row.length - 1] ?? "";

  const pop = parseNumber(row[idx(CENSUS_VARS.population)]) ?? 0;
  const income = parseNumber(row[idx(CENSUS_VARS.medianIncome)]);
  const households = parseNumber(row[idx(CENSUS_VARS.households)]) ?? 0;

  return {
    zcta,
    name: row[idx("NAME")] ?? `ZCTA ${zcta}`,
    population: pop,
    medianIncome: income,
    households,
    moverPercent: moverByZcta.get(zcta) ?? null,
    income75kPlusShare: income75kPlusShareFromBrackets(headers, row),
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

async function fetchCensusJson(base: string, zctas: string[], getVars: string): Promise<string[][]> {
  const key = requireApiKey();
  const params = new URLSearchParams({
    get: getVars,
    key,
    for: `zip code tabulation area:${zctas.join(",")}`,
  });

  const url = `${base}?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const contentType = res.headers.get("content-type") ?? "";
  const bodyText = await res.text();

  if (!res.ok) {
    throw new CensusApiError(
      `Census API HTTP ${res.status} for ZCTAs ${zctas.join(", ")}: ${bodyText.slice(0, 200)}`,
      res.status
    );
  }

  if (bodyText.trimStart().startsWith("<") || !contentType.includes("json")) {
    throw new CensusConfigError(
      "Census API rejected the request. Set a valid CENSUS_API_KEY in your server environment (https://api.census.gov/data/key_signup.html)."
    );
  }

  try {
    return JSON.parse(bodyText) as string[][];
  } catch {
    throw new CensusApiError(
      `Census API returned invalid JSON for ZCTAs ${zctas.join(", ")}: ${bodyText.slice(0, 120)}`
    );
  }
}

async function fetchProfileMoverPercents(zctas: string[]): Promise<Map<string, number | null>> {
  const base = `https://api.census.gov/data/${ACS_YEAR}/${ACS_PROFILE_DATASET}`;
  const getVars = `NAME,${CENSUS_PROFILE_VARS.sameHousePercent}`;

  let json: string[][];
  try {
    json = await fetchCensusJson(base, zctas, getVars);
  } catch {
    // Profile fetch is best-effort — detail stats still return without mover data.
    return new Map(zctas.map((z) => [z, null]));
  }

  const results = new Map<string, number | null>();
  if (!Array.isArray(json) || json.length < 2) {
    return new Map(zctas.map((z) => [z, null]));
  }

  const headers = json[0]!;
  const zctaIdx = headers.indexOf("zip code tabulation area");
  const sameHouseIdx = headers.indexOf(CENSUS_PROFILE_VARS.sameHousePercent);

  for (let i = 1; i < json.length; i++) {
    const row = json[i]!;
    const zcta = row[zctaIdx] ?? "";
    const sameHouse = parseNumber(row[sameHouseIdx]);
    results.set(zcta, moverPercentFromSameHouse(sameHouse));
  }

  for (const z of zctas) {
    if (!results.has(z)) {
      results.set(z, null);
    }
  }

  return results;
}

async function fetchZctasFromApi(zctas: string[]): Promise<Map<string, ZipDemographics>> {
  const base = `https://api.census.gov/data/${ACS_YEAR}/${ACS_DATASET}`;
  const vars = [
    ...Object.values(CENSUS_VARS),
    ...Object.values(CENSUS_INCOME_BRACKET_VARS),
  ].join(",");

  const [detailJson, moverByZcta] = await Promise.all([
    fetchCensusJson(base, zctas, `NAME,${vars}`),
    fetchProfileMoverPercents(zctas),
  ]);

  if (!Array.isArray(detailJson) || detailJson.length < 2) {
    return new Map(zctas.map((z) => [z, emptyZcta(z)]));
  }

  const headers = detailJson[0]!;
  const results = new Map<string, ZipDemographics>();

  for (let i = 1; i < detailJson.length; i++) {
    const parsed = parseDetailRow(headers, detailJson[i]!, moverByZcta);
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
    } catch (err) {
      // Fall back to per-ZCTA fetch so one bad batch doesn't drop the whole request.
      for (const z of batch) {
        try {
          const data = await getZctaStats(z);
          results.push(data);
        } catch {
          results.push(emptyZcta(z));
        }
      }
      if (results.every((r) => r.population === 0 && r.moverPercent == null)) {
        throw err;
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

/** Placeholder production rate — $0.35 per piece until partner pricing is wired in. */
export const PLACEHOLDER_RATE_CENTS = 35;

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
      return PLACEHOLDER_RATE_CENTS;
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
