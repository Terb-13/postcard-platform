import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PRODUCT_CATALOG, WORKFLOW_GUIDE } from "./catalog.ts";
import type { RuntimeFactory } from "./context.ts";
import { TOOL_CATALOG } from "./tool-catalog.ts";
import { registerPostcardTools } from "./tools.ts";

export const SERVER_INFO = { name: "postcard-platform", version: "0.1.0" as const };

export function createPostcardMcpServer(factory: RuntimeFactory): McpServer {
  const server = new McpServer(SERVER_INFO, {
    capabilities: { tools: {}, resources: {}, prompts: {} },
  });

  registerPostcardTools(server, factory);

  server.registerResource(
    "workflow",
    "postcard://workflow",
    {
      title: "Campaign workflow",
      description: "How an agent runs a campaign end-to-end without extra prompting.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: WORKFLOW_GUIDE }],
    })
  );

  server.registerResource(
    "products",
    "postcard://products",
    {
      title: "Product catalog",
      description: "Mail products and slugs.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(PRODUCT_CATALOG, null, 2) }],
    })
  );

  server.registerResource(
    "safety",
    "postcard://safety",
    {
      title: "Safety policy",
      description: "Dry-run defaults, confirm flags, scopes, spend caps.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              dryRunDefault: true,
              spendRequires: ["confirm=true", "scope:spend", "spendCapCents > estimated total"],
              handoffRequires: ["confirm=true", "runHandoff=true", "confirmHandoff=true", "scope:fulfill"],
              tools: TOOL_CATALOG,
            },
            null,
            2
          ),
        },
      ],
    })
  );

  server.registerResource(
    "campaign",
    new ResourceTemplate("postcard://campaign/{id}", { list: undefined }),
    {
      title: "Campaign",
      description: "Live campaign JSON for the authenticated organization.",
      mimeType: "application/json",
    },
    async (uri, vars) => {
      const rt = await factory();
      const campaign = await rt.caller.campaign.getById({ id: String(vars.id) });
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(campaign) }],
      };
    }
  );

  server.registerPrompt(
    "targeted_new_mover_campaign",
    {
      title: "Targeted new-mover campaign",
      description: "Plan and (after confirmation) execute a targeted new-mover drop in given ZIPs.",
      argsSchema: {
        zips: z.string().describe("Comma-separated ZIP codes, e.g. 80202,80205"),
        minMoverPercent: z.string().optional().describe("Default 10"),
        name: z.string().optional().describe("Campaign name"),
      },
    },
    ({ zips, minMoverPercent, name }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Create a targeted new-mover postcard campaign for ZIPs: ${zips}.`,
              `Use productSlug targeted-direct-mail (alias newmover), productType TARGETED, size 6x9.`,
              `Filters: minMoverPercent=${minMoverPercent || "10"}.`,
              `Name: ${name || "New movers — " + zips}.`,
              "Steps: get_workflow_guide → get_spend_status → estimate_audience_from_zctas → calculate_cost → create_campaign (dryRun true, then false) → get_payment_readiness.",
              "Do NOT call prepare_checkout or finalize_mailing unless I explicitly ask and you have confirm flags + remaining spend cap.",
            ].join("\n"),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "eddm_neighborhood_drop",
    {
      title: "EDDM neighborhood drop",
      description: "Plan an Every Door Direct Mail drop for ZIP codes.",
      argsSchema: {
        zips: z.string().describe("Comma-separated ZIP codes"),
        name: z.string().optional(),
      },
    },
    ({ zips, name }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Plan an EDDM campaign for ZIPs: ${zips}.`,
              "Use productSlug every-door-direct-mail, productType EDDM, size 6x11.",
              `Name: ${name || "EDDM — " + zips}.`,
              "Steps: estimate_audience → preview_eddm_routes → calculate_cost → create_campaign dryRun.",
              "Do not pay or hand off to Drummond without explicit confirm.",
            ].join("\n"),
          },
        },
      ],
    })
  );

  return server;
}
