/**
 * Refined income choropleth — cohesive blue scale aligned with brand navy.
 */

export function incomeToColor(income: number | null | undefined): string {
  if (income == null) return "#e2e8f0";
  if (income < 45000) return "#cbd5e1";
  if (income < 65000) return "#94a3b8";
  if (income < 85000) return "#60a5fa";
  if (income < 110000) return "#2563eb";
  return "#0A2540";
}

export const INCOME_LEGEND = [
  { label: "< $45k", color: "#cbd5e1" },
  { label: "$45–65k", color: "#94a3b8" },
  { label: "$65–85k", color: "#60a5fa" },
  { label: "$85–110k", color: "#2563eb" },
  { label: "$110k+", color: "#0A2540" },
] as const;

export const INCOME_LEGEND_GRADIENT =
  "linear-gradient(90deg, #cbd5e1 0%, #94a3b8 25%, #60a5fa 50%, #2563eb 75%, #0A2540 100%)";

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
