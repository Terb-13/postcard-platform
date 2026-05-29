/** Color scale for median income choropleth (green → amber → navy) */
export function incomeToColor(income: number | null | undefined): string {
  if (income == null) return "#94a3b8";
  if (income < 40000) return "#15803d";
  if (income < 60000) return "#65a30d";
  if (income < 80000) return "#ca8a04";
  if (income < 100000) return "#ea580c";
  return "#0A2540";
}

export const INCOME_LEGEND = [
  { label: "< $40k", color: "#15803d" },
  { label: "$40–60k", color: "#65a30d" },
  { label: "$60–80k", color: "#ca8a04" },
  { label: "$80–100k", color: "#ea580c" },
  { label: "$100k+", color: "#0A2540" },
];
