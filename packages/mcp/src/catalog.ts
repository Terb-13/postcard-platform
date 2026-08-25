/**
 * Agent-facing product catalog. Slugs and productType values match
 * apps/web/lib/products.ts and campaign.create — do not invent new slugs.
 */
export const PRODUCT_CATALOG = [
  {
    slug: "every-door-direct-mail",
    aliases: ["eddm"],
    title: "Every Door Direct Mail",
    productType: "EDDM" as const,
    defaultSize: "6x11",
    recommendedSizes: ["6x11", "6x9"],
    whenToUse:
      "Reach every household on selected USPS carrier routes. No mailing list. Best for restaurants, home services, retail.",
  },
  {
    slug: "targeted-direct-mail",
    aliases: ["targeted", "newmover"],
    title: "Targeted Direct Mail",
    productType: "TARGETED" as const,
    defaultSize: "6x9",
    recommendedSizes: ["6x9", "6x11", "5x7", "4x6"],
    whenToUse:
      "Mail only households that match Census filters (income, recent movers). Use alias newmover with minMoverPercent for new-mover campaigns.",
  },
  {
    slug: "saturation-mail",
    aliases: ["saturation"],
    title: "Saturation Mail",
    productType: "EDDM" as const,
    defaultSize: "6x11",
    recommendedSizes: ["6x11", "6x9"],
    whenToUse: "Cover every deliverable address in selected ZIP codes for awareness or launches.",
  },
  {
    slug: "discount-zones",
    aliases: ["discount-zones"],
    title: "Discount Zones",
    productType: "EDDM" as const,
    defaultSize: "6x11",
    recommendedSizes: ["6x11", "6x9"],
    whenToUse: "High-volume EDDM in partner markets with zone pricing.",
  },
] as const;

export const POSTCARD_SIZES = ["4x6", "5x7", "6x9", "6x11"] as const;

export function resolveProduct(slugOrAlias: string) {
  const needle = slugOrAlias.trim().toLowerCase();
  return (
    PRODUCT_CATALOG.find((p) => p.slug === needle || (p.aliases as readonly string[]).includes(needle)) ??
    null
  );
}

export const WORKFLOW_GUIDE = `
Postcard Platform MCP — autonomous campaign workflow

Goal example: "targeted new-mover campaign in these ZIPs".

0. Auth
   - Every org-scoped tool needs an API key (MCP_API_KEY or Authorization: Bearer).
   - get_spend_status first. Keys default to scopes [read, draft] and spendCapCents=0.
   - spend/fulfill scopes + confirm flags are required before money or mail moves.

1. Discover
   - list_products → pick targeted-direct-mail (alias: newmover) for new movers, or every-door-direct-mail for EDDM.
   - search_zips if you only have a city/ZIP fragment.

2. Estimate (read-only, no confirmation)
   - estimate_audience or estimate_audience_from_zctas with zctas + filters.
   - New movers: productType TARGETED, filters.minMoverPercent (e.g. 8–15). Optional minIncome.
   - calculate_cost for a print+postage+list breakdown. get_census_stats for per-ZCTA demographics.
   - preview_eddm_routes only for EDDM/saturation (carrier routes + household counts).

3. Create a DRAFT (default dryRun=true — no database write)
   - create_campaign with name, size, productType, productSlug, targeting.zctas, targeting.filters.
   - Inspect the preview. Set dryRun=false only when the estimate looks right.
   - Equivalent tRPC: campaign.create. Filters are stored on the campaign; quantity uses ACS households (same as the human wizard).
   - update_campaign_draft for later edits. Only DRAFT campaigns can be updated.

4. Artwork
   - attach_artwork with a publicly fetchable fileUrl (R2/UploadThing URL). dryRun=true by default.
   - Artwork must be APPROVED by ops before checkout (same rule as campaign.createCheckoutSession).
   - get_payment_readiness lists blockers.

5. Pay (spend scope + confirm=true)
   - prepare_checkout({ campaignId, confirm: true }) → Stripe Checkout URL.
   - This creates a Stripe session and sets status READY_FOR_PAYMENT. It spends money after the human/agent pays the URL.
   - Refused without confirm, spend scope, or when the remaining spend cap is below the campaign total.

6. Fulfill (fulfill scope + confirm=true)
   - After PAID (Stripe webhook or ops), finalize_mailing.
   - Default runHandoff=false so agents cannot send mail by accident (tRPC mailing.finalize defaults the opposite).
   - To upload a Drummond manifest: confirm=true, runHandoff=true, confirmHandoff=true.
   - That path is mailing.finalize → finalizeMailingJob → handoffToDrummond (R2 manifest). Same side-effects as the human/ops flow.

Safety
   - Read tools never write.
   - Draft tools default dryRun=true.
   - prepare_checkout and finalize_mailing require confirm=true.
   - Drummond/R2 upload requires confirmHandoff=true.
   - Spend is tracked on the API key against spendCapCents (0 = no paid actions).
`.trim();
