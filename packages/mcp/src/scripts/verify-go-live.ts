import { createHash } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { appRouter } from "../../../api/root.ts";
import { createTRPCContext } from "../../../api/trpc.ts";
import type { ResolvedApiKey } from "../auth.ts";
import { loadEnv } from "../env.ts";
import {
  handleCreateCampaign,
  handleEstimateAudienceFromZctas,
  handlePrepareCheckout,
  handleSpendStatus,
} from "../handlers.ts";
import { createPostcardMcpServer } from "../server.ts";
import { TOOL_CATALOG } from "../tool-catalog.ts";

loadEnv();

function mustEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function listViaProtocol(auth: ResolvedApiKey) {
  const ctx = await createTRPCContext({
    user: auth.user,
    clerkUserId: auth.user.clerkId,
    guestSessionId: null,
  });
  const caller = appRouter.createCaller(ctx);
  const server = createPostcardMcpServer(async () => ({ auth, caller }));
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "verify-go-live", version: "0.1.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  const tools = await client.listTools();
  const resources = await client.listResources();
  const templates = await client.listResourceTemplates();
  const prompts = await client.listPrompts();
  await client.close();
  await server.close();
  return { tools, resources, templates, prompts };
}

async function main() {
  const plaintext = mustEnv("MCP_API_KEY");
  const prefix = process.env.MCP_KEY_PREFIX ?? plaintext.slice(0, 12);
  const hash = createHash("sha256").update(plaintext.trim()).digest("hex");

  const auth = {
    id: process.env.MCP_KEY_ID ?? "cmcpec2684946d484577c3ded591",
    name: "Cursor-dev",
    organizationId: process.env.MCP_ORG_ID ?? "org_lupylloyd_demo",
    organizationName: "Brett's Company",
    user: {
      id: "user_lupylloyd_demo",
      clerkId: "clerk_lupylloyd_demo",
      email: process.env.MCP_USER_EMAIL ?? "lupylloyd@gmail.com",
      firstName: "Brett",
      lastName: null,
      role: "OWNER",
      organizationId: process.env.MCP_ORG_ID ?? "org_lupylloyd_demo",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    scopes: ["read", "draft"] as ResolvedApiKey["scopes"],
    spendCapCents: 0,
    spentCents: 0,
    remainingSpendCents: 0,
  } satisfies ResolvedApiKey;

  const ctx = await createTRPCContext({
    user: auth.user,
    clerkUserId: auth.user.clerkId,
    guestSessionId: null,
  });
  const caller = appRouter.createCaller(ctx);
  const rt = { auth, caller };

  const listed = await listViaProtocol(auth);
  const toolNames = listed.tools.tools.map((t) => t.name).sort();
  const expected = TOOL_CATALOG.map((t) => t.name).sort();
  const resourceUris = [
    ...listed.resources.resources.map((r) => r.uri),
    ...listed.templates.resourceTemplates.map((r) => r.uriTemplate),
  ];

  const spend = handleSpendStatus(rt);
  const checkout = await handlePrepareCheckout(rt, { campaignId: "c1", confirm: true });

  const estimateInput = {
    zctas: ["80202", "80205"],
    filters: { minMoverPercent: 10 },
    size: "6x9",
  };

  let estimateWrapped = null;
  let estimateDirect = null;
  let estimateError: string | null = null;
  try {
    estimateWrapped = await handleEstimateAudienceFromZctas(rt, estimateInput);
    estimateDirect = await caller.targeting.estimateAudienceFromZctas(estimateInput);
  } catch (err) {
    estimateError = err instanceof Error ? err.message : String(err);
  }

  let createDryRun = null;
  let createError: string | null = null;
  try {
    createDryRun = await handleCreateCampaign(rt, {
      name: "Verify new movers 80202/80205",
      size: "6x9",
      productType: "TARGETED",
      productSlug: "newmover",
      targeting: { zctas: ["80202", "80205"], filters: { minMoverPercent: 10 } },
    });
  } catch (err) {
    createError = err instanceof Error ? err.message : String(err);
  }

  const wrappedData =
    estimateWrapped && "data" in (estimateWrapped.structuredContent ?? {})
      ? (estimateWrapped.structuredContent as { data: unknown }).data
      : null;
  const estimateMatch = estimateDirect != null && JSON.stringify(wrappedData) === JSON.stringify(estimateDirect);

  console.log(
    JSON.stringify(
      {
        key: {
          prefix,
          hashPrefix: hash.slice(0, 12),
          startsWithMcp: plaintext.startsWith("mcp_"),
          prefixMatchesSecret: prefix === plaintext.slice(0, 12),
        },
        protocol: {
          toolCount: toolNames.length,
          toolsMatchCatalog: JSON.stringify(toolNames) === JSON.stringify(expected),
          toolNames,
          resourceUris,
          promptNames: listed.prompts.prompts.map((p) => p.name),
          hasSafety: resourceUris.includes("postcard://safety"),
          hasWorkflow: resourceUris.includes("postcard://workflow"),
          hasProducts: resourceUris.includes("postcard://products"),
          hasCampaignTemplate: resourceUris.includes("postcard://campaign/{id}"),
        },
        spendStatus: spend.structuredContent,
        estimate: {
          error: estimateError,
          matchTrpc: estimateMatch,
          wrappedOk: estimateWrapped?.structuredContent,
          censusConfigured: Boolean(process.env.CENSUS_API_KEY),
        },
        createDryRun: {
          error: createError,
          result: createDryRun?.structuredContent,
        },
        prepareCheckout: checkout.structuredContent,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
