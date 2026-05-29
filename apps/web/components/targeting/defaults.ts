import type { SelectedZcta, TargetingSelection } from "./types";

/** Pre-loaded LA metro ZIPs for landing demo and map smoke tests */
export const DEMO_ZCTAS: SelectedZcta[] = [
  { zcta: "90210", placeName: "Beverly Hills, CA", center: [-118.4065, 34.103] },
  { zcta: "90212", placeName: "Beverly Hills, CA", center: [-118.399, 34.062] },
  { zcta: "90024", placeName: "Los Angeles, CA", center: [-118.4395, 34.063] },
];

export const DEMO_VIEW = { longitude: -118.415, latitude: 34.078, zoom: 11.5 };

export function createDefaultSelection(
  zctas: SelectedZcta[] = DEMO_ZCTAS
): TargetingSelection {
  return { zctas };
}
