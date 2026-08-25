import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RuntimeFactory } from "./context.ts";
import {
  handleAttachArtwork,
  handleCalculateCost,
  handleCensusStats,
  handleCreateCampaign,
  handleEstimateAudience,
  handleEstimateAudienceFromZctas,
  handleFinalizeMailing,
  handleGetCampaign,
  handleGetMailingJob,
  handleGetOrder,
  handleListCampaigns,
  handleListProducts,
  handlePaymentReadiness,
  handlePrepareCheckout,
  handlePreviewEddmRoutes,
  handleSearchZips,
  handleSpendStatus,
  handleUpdateDraft,
  handleWorkflowGuide,
} from "./handlers.ts";

const filtersSchema = {
  minIncome: z
    .number()
    .optional()
    .describe("Minimum household median income (USD). New-mover / affluent filters."),
  maxIncome: z.number().optional().describe("Maximum household median income (USD)."),
  minMoverPercent: z
    .number()
    .optional()
    .describe("Minimum ACS mover percent. Use 8–15 for a targeted new-mover campaign."),
};

const targetingSchema = {
  zctas: z
    .array(z.string().min(5).max(10))
    .min(1)
    .max(50)
    .describe("US ZIP / ZCTA codes, e.g. [\"80202\",\"80205\"]"),
  geoJson: z
    .any()
    .optional()
    .describe("Optional GeoJSON Feature Polygon if ZCTAs were drawn on a map."),
  filters: z.object(filtersSchema).optional(),
  quantityOverride: z.number().int().min(100).optional(),
  savedMapName: z.string().optional().describe("Name for the SavedMap row created with the campaign."),
};

const audienceBase = {
  zctas: z.array(z.string().min(5).max(10)).max(50).optional(),
  geoJson: z.any().optional(),
  filters: z.object(filtersSchema).optional(),
  size: z.string().default("6x11").describe("Postcard size: 4x6 | 5x7 | 6x9 | 6x11"),
  quantityOverride: z.number().int().min(100).optional(),
};

async function withRuntime<T>(factory: RuntimeFactory, fn: (rt: Awaited<ReturnType<RuntimeFactory>>) => Promise<T> | T) {
  const rt = await factory();
  return fn(rt);
}

export function registerPostcardTools(server: McpServer, factory: RuntimeFactory): void {
  server.registerTool(
    "get_workflow_guide",
    {
      title: "Campaign workflow guide",
      description:
        "Read this first. Step-by-step plan for a targeted new-mover or EDDM campaign: estimate → draft → artwork → checkout → Drummond handoff, including which confirm flags are required.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => handleWorkflowGuide()
  );

  server.registerTool(
    "list_products",
    {
      title: "List mail products",
      description:
        "Canonical product catalog (EDDM, targeted/new-mover, saturation, discount zones). Use these slugs as productSlug on create_campaign.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => handleListProducts()
  );

  server.registerTool(
    "get_spend_status",
    {
      title: "API key spend and scopes",
      description:
        "Show the current org-scoped API key: scopes, spend cap, remaining budget, and whether paid/fulfill actions are enabled.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => withRuntime(factory, handleSpendStatus)
  );

  server.registerTool(
    "search_zips",
    {
      title: "Search US ZIP codes",
      description:
        "Mapbox ZIP / postcode autocomplete. Use when the user names a city or partial ZIP. Wraps targeting.searchZips.",
      inputSchema: {
        query: z.string().min(2).max(20).describe("City, ZIP, or postcode fragment, e.g. 8020 or Denver"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async (input) => withRuntime(factory, (rt) => handleSearchZips(rt, input))
  );

  server.registerTool(
    "estimate_audience",
    {
      title: "Estimate audience from ZIPs or polygon",
      description:
        "Census ACS households, income, mover percent, and cost preview for ZCTAs and/or a drawn polygon. Estimate-only — no campaign is created. Wraps targeting.estimateAudience (same response as the campaign wizard map).",
      inputSchema: audienceBase,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async (input) => withRuntime(factory, (rt) => handleEstimateAudience(rt, input))
  );

  server.registerTool(
    "estimate_audience_from_zctas",
    {
      title: "Estimate audience from ZCTA list",
      description:
        "Same Census estimate as targeting.estimateAudienceFromZctas. Prefer this when you already have ZIP codes. Optional baseRateCentsPerPiece override is estimate-only.",
      inputSchema: {
        zctas: z.array(z.string().min(5).max(10)).min(1).max(50),
        filters: z.object(filtersSchema).optional(),
        size: z.string().default("6x11"),
        quantityOverride: z.number().int().min(100).optional(),
        baseRateCentsPerPiece: z.number().int().min(1).optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async (input) => withRuntime(factory, (rt) => handleEstimateAudienceFromZctas(rt, input))
  );

  server.registerTool(
    "get_census_stats",
    {
      title: "Census stats for ZCTAs",
      description:
        "Per-ZCTA ACS demographics plus reach and pricing. Wraps targeting.getCensusStatsForZctas. Estimate-only.",
      inputSchema: {
        zctas: z.array(z.string().min(5).max(10)).min(1).max(50),
        filters: z.object(filtersSchema).optional(),
        size: z.string().default("6x11"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async (input) => withRuntime(factory, (rt) => handleCensusStats(rt, input))
  );

  server.registerTool(
    "calculate_cost",
    {
      title: "Calculate print + postage cost",
      description:
        "Print, postage, list, and fee breakdown from the shared pricing engine. Wraps mailing.calculatePricing (pricing.service). Does not create a checkout.",
      inputSchema: {
        size: z.string().describe("4x6 | 5x7 | 6x9 | 6x11"),
        quantity: z.number().int().min(0),
        productType: z.enum(["EDDM", "TARGETED"]).optional(),
        source: z.enum(["estimate", "final"]).optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (input) => withRuntime(factory, (rt) => handleCalculateCost(rt, input))
  );

  server.registerTool(
    "preview_eddm_routes",
    {
      title: "Preview EDDM carrier routes",
      description:
        "USPS EDDM route + household preview for ZIPs. Wraps mailing.eddmRoutes. Estimate-only — does not finalize a mailing job.",
      inputSchema: {
        zctas: z.array(z.string().min(5).max(10)).min(1).max(20),
        householdByZip: z.record(z.string(), z.number().int().min(0)).optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    async (input) => withRuntime(factory, (rt) => handlePreviewEddmRoutes(rt, input))
  );

  server.registerTool(
    "list_campaigns",
    {
      title: "List organization campaigns",
      description: "All campaigns for the API key's organization, including artwork and production jobs. Wraps campaign.getMine.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => withRuntime(factory, handleListCampaigns)
  );

  server.registerTool(
    "get_campaign",
    {
      title: "Get campaign by id",
      description: "Single campaign with saved map, artwork thumbnails, and production jobs. Wraps campaign.getById. Org-scoped.",
      inputSchema: { id: z.string().describe("Campaign id") },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (input) => withRuntime(factory, (rt) => handleGetCampaign(rt, input))
  );

  server.registerTool(
    "get_order",
    {
      title: "Get paid order detail",
      description: "Paid/in-production/completed order with tracking. Wraps campaign.getOrderDetail.",
      inputSchema: { id: z.string().describe("Campaign / order id") },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (input) => withRuntime(factory, (rt) => handleGetOrder(rt, input))
  );

  server.registerTool(
    "get_mailing_job",
    {
      title: "Get mailing job",
      description: "MailingJob for a campaign (routes, list, manifest URL, totals). Wraps mailing.getByCampaignId.",
      inputSchema: { campaignId: z.string() },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (input) => withRuntime(factory, (rt) => handleGetMailingJob(rt, input))
  );

  server.registerTool(
    "get_payment_readiness",
    {
      title: "Payment readiness checklist",
      description:
        "Whether a draft can go to Stripe: artwork APPROVED, status, blockers, estimated total. Read-only — does not call createCheckoutSession.",
      inputSchema: { campaignId: z.string() },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (input) => withRuntime(factory, (rt) => handlePaymentReadiness(rt, input))
  );

  server.registerTool(
    "create_campaign",
    {
      title: "Create draft campaign",
      description:
        "Create a DRAFT campaign in the API key's organization. Defaults to dryRun=true (preview only). dryRun=false invokes campaign.create with the same payload as the human wizard (SavedMap + targetingMetadata + pricing). wouldCreate.quantity/totalPriceCents match campaign.create: unfiltered ACS households; targeting.quantityOverride only — filters (e.g. minMoverPercent) are stored but do not change the persisted price (same as the wizard). audienceEstimate is the filtered preview. Does not charge or mail.",
      inputSchema: {
        name: z.string().min(1).describe("Campaign name, e.g. Denver new movers — Sept"),
        size: z.string().describe("4x6 | 5x7 | 6x9 | 6x11"),
        quantity: z.number().int().min(100).optional(),
        productType: z.enum(["EDDM", "TARGETED"]).optional(),
        productSlug: z
          .string()
          .optional()
          .describe("every-door-direct-mail | targeted-direct-mail | saturation-mail | discount-zones | newmover"),
        dropDate: z.string().optional().describe("ISO date"),
        notes: z.string().optional(),
        targeting: z.object(targetingSchema).optional(),
        dryRun: z
          .boolean()
          .default(true)
          .describe("Default true. Set false to persist the DRAFT via campaign.create."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (input) => withRuntime(factory, (rt) => handleCreateCampaign(rt, input))
  );

  server.registerTool(
    "update_campaign_draft",
    {
      title: "Update draft campaign",
      description:
        "Patch a DRAFT campaign. dryRun=true by default. dryRun=false invokes campaign.updateDraft. Paid campaigns cannot be updated (same tRPC rule).",
      inputSchema: {
        id: z.string(),
        name: z.string().min(1).optional(),
        size: z.string().optional(),
        productType: z.enum(["EDDM", "TARGETED"]).optional(),
        productSlug: z.string().optional(),
        quantity: z.number().int().min(100).optional(),
        dropDate: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        targeting: z.object(targetingSchema).optional(),
        dryRun: z.boolean().default(true),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (input) => withRuntime(factory, (rt) => handleUpdateDraft(rt, input))
  );

  server.registerTool(
    "attach_artwork",
    {
      title: "Attach campaign artwork",
      description:
        "Attach a PDF/image URL to a campaign. dryRun=true by default. dryRun=false invokes campaign.uploadArtwork (upsert + Inngest thumbnail job). Does not approve artwork or charge.",
      inputSchema: {
        campaignId: z.string(),
        fileUrl: z.string().describe("Public HTTPS URL of the uploaded PDF or image (R2 / UploadThing)."),
        fileName: z.string(),
        fileSize: z.number().optional(),
        pageCount: z.number().optional(),
        dryRun: z.boolean().default(true),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (input) => withRuntime(factory, (rt) => handleAttachArtwork(rt, input))
  );

  server.registerTool(
    "prepare_checkout",
    {
      title: "Create Stripe checkout session",
      description:
        "LIVE spend path. Requires confirm=true, spend scope, and remaining spend cap ≥ campaign total. Artwork must be APPROVED (same as campaign.createCheckoutSession). Returns a Stripe Checkout URL. Does not mail.",
      inputSchema: {
        campaignId: z.string(),
        confirm: z
          .boolean()
          .default(false)
          .describe("Must be true to create the Stripe session. Default false refuses the call."),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (input) => withRuntime(factory, (rt) => handlePrepareCheckout(rt, input))
  );

  server.registerTool(
    "finalize_mailing",
    {
      title: "Finalize mailing + optional Drummond handoff",
      description:
        "LIVE fulfillment. Campaign must be PAID. confirm=true invokes mailing.finalize → finalizeMailingJob. runHandoff defaults FALSE (safer than tRPC, which hands off unless runHandoff=false). To upload the Drummond/R2 manifest, pass confirm=true, runHandoff=true, and confirmHandoff=true. Same manifest builder as drummond-handoff.service.ts.",
      inputSchema: {
        campaignId: z.string(),
        confirm: z.boolean().default(false).describe("Required true to write MailingJob / campaign totals."),
        runHandoff: z
          .boolean()
          .default(false)
          .describe("If true, also requires confirmHandoff=true to call handoffToDrummond."),
        confirmHandoff: z
          .boolean()
          .default(false)
          .describe("Required true together with runHandoff to send the fulfillment package."),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (input) => withRuntime(factory, (rt) => handleFinalizeMailing(rt, input))
  );
}
