/**
 * Premium sequential palette for median-income choropleth.
 * Cool slate → teal → blue → indigo → deep navy (brand-aligned).
 */

export function incomeToColor(income: number | null | undefined): string {
  if (income == null) return "#cbd5e1";
  if (income < 40000) return "#94a3b8";
  if (income < 55000) return "#5eead4";
  if (income < 75000) return "#38bdf8";
  if (income < 100000) return "#6366f1";
  return "#0A2540";
}

export const INCOME_LEGEND = [
  { label: "< $40k", color: "#94a3b8" },
  { label: "$40–55k", color: "#5eead4" },
  { label: "$55–75k", color: "#38bdf8" },
  { label: "$75–100k", color: "#6366f1" },
  { label: "$100k+", color: "#0A2540" },
] as const;

/** CSS linear-gradient for horizontal legend bar */
export const INCOME_LEGEND_GRADIENT =
  "linear-gradient(90deg, #94a3b8 0%, #5eead4 25%, #38bdf8 50%, #6366f1 75%, #0A2540 100%)";

export type IncomePreset = {
  id: string;
  label: string;
  minIncome?: number;
};

export const INCOME_PRESETS: IncomePreset[] = [
  { id: "all", label: "All incomes" },
  { id: "50k", label: "$50k+", minIncome: 50000 },
  { id: "75k", label: "$75k+", minIncome: 75000 },
  { id: "100k", label: "$100k+", minIncome: 100000 },
];

export function presetToFilters(presetId: string): { minIncome?: number } | undefined {
  const preset = INCOME_PRESETS.find((p) => p.id === presetId);
  if (!preset || preset.id === "all") return undefined;
  return { minIncome: preset.minIncome };
}

export function filtersToPresetId(filters?: { minIncome?: number }): string {
  if (!filters?.minIncome) return "all";
  const match = INCOME_PRESETS.find((p) => p.minIncome === filters.minIncome);
  return match?.id ?? "all";
}
