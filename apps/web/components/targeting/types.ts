/** Max ZCTAs per campaign / estimate request (matches API schema) */
export const MAX_TARGETING_ZCTAS = 50;

export type SelectedZcta = {
  zcta: string;
  placeName?: string;
  center?: [number, number];
};

export type TargetingFilters = {
  minIncome?: number;
  maxIncome?: number;
  minMoverPercent?: number;
};

export type TargetingSelection = {
  zctas: SelectedZcta[];
  filters?: TargetingFilters;
  quantityOverride?: number;
  geoJson?: GeoJSON.FeatureCollection;
};

export type ChoroplethMetric = "medianIncome" | "population";
