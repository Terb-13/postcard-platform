export type ToolKind = "read" | "draft" | "spend" | "fulfill";

export type ToolCatalogEntry = {
  name: string;
  kind: ToolKind;
  wraps: string;
  safety: string;
};

export const TOOL_CATALOG: ToolCatalogEntry[] = [
  {
    name: "get_workflow_guide",
    kind: "read",
    wraps: "n/a — agent planning text",
    safety: "read-only",
  },
  {
    name: "list_products",
    kind: "read",
    wraps: "apps/web/lib/products.ts slugs",
    safety: "read-only",
  },
  {
    name: "get_spend_status",
    kind: "read",
    wraps: "McpApiKey spend fields",
    safety: "read-only",
  },
  {
    name: "search_zips",
    kind: "read",
    wraps: "targeting.searchZips",
    safety: "read-only",
  },
  {
    name: "estimate_audience",
    kind: "read",
    wraps: "targeting.estimateAudience",
    safety: "estimate-only",
  },
  {
    name: "estimate_audience_from_zctas",
    kind: "read",
    wraps: "targeting.estimateAudienceFromZctas",
    safety: "estimate-only",
  },
  {
    name: "get_census_stats",
    kind: "read",
    wraps: "targeting.getCensusStatsForZctas",
    safety: "estimate-only",
  },
  {
    name: "calculate_cost",
    kind: "read",
    wraps: "mailing.calculatePricing → pricing.service",
    safety: "estimate-only",
  },
  {
    name: "preview_eddm_routes",
    kind: "read",
    wraps: "mailing.eddmRoutes → eddm.service",
    safety: "estimate-only",
  },
  {
    name: "list_campaigns",
    kind: "read",
    wraps: "campaign.getMine",
    safety: "org-scoped read",
  },
  {
    name: "get_campaign",
    kind: "read",
    wraps: "campaign.getById",
    safety: "org-scoped read",
  },
  {
    name: "get_order",
    kind: "read",
    wraps: "campaign.getOrderDetail",
    safety: "org-scoped read",
  },
  {
    name: "get_mailing_job",
    kind: "read",
    wraps: "mailing.getByCampaignId",
    safety: "org-scoped read",
  },
  {
    name: "get_payment_readiness",
    kind: "read",
    wraps: "campaign.getById (inspect artwork/status)",
    safety: "read-only — does not create Stripe session",
  },
  {
    name: "create_campaign",
    kind: "draft",
    wraps: "campaign.create",
    safety: "dryRun=true default; dryRun=false writes DRAFT only",
  },
  {
    name: "update_campaign_draft",
    kind: "draft",
    wraps: "campaign.updateDraft",
    safety: "dryRun=true default",
  },
  {
    name: "attach_artwork",
    kind: "draft",
    wraps: "campaign.uploadArtwork",
    safety: "dryRun=true default; does not approve artwork",
  },
  {
    name: "prepare_checkout",
    kind: "spend",
    wraps: "campaign.createCheckoutSession",
    safety: "confirm=true + spend scope + spend cap required",
  },
  {
    name: "finalize_mailing",
    kind: "fulfill",
    wraps: "mailing.finalize → finalizeMailingJob → handoffToDrummond",
    safety: "confirm=true required; runHandoff defaults false; confirmHandoff for Drummond/R2",
  },
];
