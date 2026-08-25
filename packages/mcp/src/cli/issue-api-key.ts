import { prisma } from "@postcard-platform/db/client";
import { createApiKeyRecord, MCP_SCOPES, type McpScope, parseScopes } from "../auth.ts";
import { loadEnv } from "../env.ts";

loadEnv();

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function printHelp() {
  console.error(`Issue an org-scoped MCP API key.

Usage:
  npm run issue-key -w @postcard-platform/mcp -- --org-id <id> --name "Cursor" [options]
  npm run issue-key -w @postcard-platform/mcp -- --org-slug <slug> --user-email you@org.com

Options:
  --org-id            Organization id
  --org-slug          Organization slug
  --user-email        Bind the key to this user (impersonated for tRPC)
  --user-id           Bind the key to this user id
  --name              Label stored on the key (default: mcp)
  --scopes            Comma list: read,draft,spend,fulfill (default: read,draft)
  --spend-cap-cents   Default 0 (paid tools disabled)
  --expires-days      Optional expiry
`);
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }

  const orgId = arg("org-id");
  const orgSlug = arg("org-slug");
  const userEmail = arg("user-email");
  const userId = arg("user-id");
  const name = arg("name") ?? "mcp";
  const scopes = parseScopes((arg("scopes") ?? "read,draft").split(",").map((s) => s.trim()));
  const spendCapCents = Number(arg("spend-cap-cents") ?? "0");
  const expiresDays = arg("expires-days") ? Number(arg("expires-days")) : null;

  if (!orgId && !orgSlug) {
    printHelp();
    throw new Error("Pass --org-id or --org-slug");
  }

  const organization = orgId
    ? await prisma.organization.findUnique({ where: { id: orgId } })
    : await prisma.organization.findUnique({ where: { slug: orgSlug! } });

  if (!organization) throw new Error("Organization not found");

  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : userEmail
      ? await prisma.user.findFirst({ where: { email: userEmail, organizationId: organization.id } })
      : await prisma.user.findFirst({ where: { organizationId: organization.id }, orderBy: { createdAt: "asc" } });

  if (user && user.organizationId !== organization.id) {
    throw new Error("User is not in that organization");
  }

  const unknown = (arg("scopes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !MCP_SCOPES.includes(s as McpScope));
  if (unknown.length) throw new Error(`Unknown scopes: ${unknown.join(", ")}`);

  const { row, plaintext } = await createApiKeyRecord({
    organization,
    userId: user?.id ?? null,
    name,
    scopes,
    spendCapCents: Number.isFinite(spendCapCents) ? spendCapCents : 0,
    expiresAt: expiresDays ? new Date(Date.now() + expiresDays * 86400000) : null,
  });

  console.log(
    JSON.stringify(
      {
        id: row.id,
        name: row.name,
        keyPrefix: row.keyPrefix,
        organizationId: organization.id,
        userId: user?.id ?? null,
        scopes,
        spendCapCents: row.spendCapCents,
        apiKey: plaintext,
        warning: "Store this plaintext key now. Only the SHA-256 hash is saved.",
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
