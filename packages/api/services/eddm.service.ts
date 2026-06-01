import type { EddmRouteSelection } from "./types";
import {
  EDDM_MIN_PIECES_PER_ROUTE,
  fetchEddmRoutesFromProvider,
  type FetchRoutesInput,
} from "./usps-eddm.provider";

export type FetchEddmRoutesInput = FetchRoutesInput;

export type FetchEddmRoutesResult = {
  routes: EddmRouteSelection[];
  totalHomes: number;
  warnings: string[];
  provider: string;
  isStub: boolean;
};

/** Resolve USPS EDDM carrier routes (provider: stub | http | melissa). */
export async function fetchEddmRoutes(
  input: FetchEddmRoutesInput,
  householdByZip?: Record<string, number>
): Promise<FetchEddmRoutesResult> {
  return fetchEddmRoutesFromProvider({
    zctas: input.zctas,
    householdByZip,
  });
}

/** CSV rows for Drummond / print partner (spec to be confirmed with partner) */
export function buildEddmManifestCsv(routes: EddmRouteSelection[]): string {
  const header = "carrier_route_id,zip,household_count,walk_sequence";
  const rows = routes.map(
    (r) =>
      `${r.carrierRouteId},${r.zip},${r.householdCount},${r.walkSequence ?? ""}`
  );
  return [header, ...rows].join("\n");
}

export { EDDM_MIN_PIECES_PER_ROUTE };
