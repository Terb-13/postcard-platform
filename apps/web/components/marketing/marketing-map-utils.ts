import type { SelectedZcta } from "@/components/targeting/types";

/** Prototype-style single-line target area summary (e.g. "80202 + 2 ZIP codes") */
export function formatTargetAreaSummary(zctas: SelectedZcta[]): string {
  if (zctas.length === 0) return "";

  const first = zctas[0]!;
  const label =
    first.placeName?.split(",").slice(0, 2).join(",").trim() ?? `ZIP ${first.zcta}`;

  if (zctas.length === 1) return label;

  const extra = zctas.length - 1;
  return `${label} + ${extra} ZIP code${extra === 1 ? "" : "s"}`;
}
