import type { MarketingMapVariant } from "./marketing-map-variant";

/** Side panel — homepage (#fafaf9 on white section) */
export const marketingMapPanelHomeClass =
  "rounded-3xl bg-[#fafaf9] p-6 lg:min-h-[420px]";

/** Side panel — standalone map tool (white card + border) */
export const marketingMapPanelStandaloneClass =
  "rounded-3xl border border-gray-200 bg-white p-6 lg:min-h-[520px]";

export function marketingMapPanelClass(variant: MarketingMapVariant) {
  return variant === "homepage"
    ? marketingMapPanelHomeClass
    : marketingMapPanelStandaloneClass;
}

export const marketingMapPanelLabelClass = "mb-2 text-sm font-semibold text-[#0A2540]";

export const marketingMapFieldClass =
  "w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#0A2540] outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20";

/** Map canvas height — redesign/index.html 420px, map-tool.html 520px */
export function marketingMapCanvasClass(variant: MarketingMapVariant) {
  const lgHeight = variant === "homepage" ? "lg:h-[420px]" : "lg:h-[520px]";
  return `marketing-map-canvas relative h-[320px] overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-[0_10px_15px_-3px_rgb(15_23_42_/_0.1)] sm:h-[400px] ${lgHeight}`;
}
