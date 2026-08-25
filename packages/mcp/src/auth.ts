import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Organization, User } from "@prisma/client";
import { prisma } from "@postcard-platform/db/client";

export const MCP_SCOPES = ["read", "draft", "spend", "fulfill"] as const;
export type McpScope = (typeof MCP_SCOPES)[number];

export type ResolvedApiKey = {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  user: User;
  scopes: McpScope[];
  spendCapCents: number;
  spentCents: number;
  remainingSpendCents: number;
};

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext.trim()).digest("hex");
}

export function generateApiKey(): { plaintext: string; hash: string; prefix: string } {
  const plaintext = `mcp_${randomBytes(32).toString("base64url")}`;
  return { plaintext, hash: hashApiKey(plaintext), prefix: plaintext.slice(0, 12) };
}

export function parseScopes(value: unknown): McpScope[] {
  const raw = Array.isArray(value) ? value : [];
  const scopes = raw.filter((s): s is McpScope => typeof s === "string" && MCP_SCOPES.includes(s as McpScope));
  return scopes.length > 0 ? scopes : ["read"];
}

export function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || header.trim() || null;
}

function scopesEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function resolveApiKey(plaintext: string | null | undefined): Promise<ResolvedApiKey> {
  const key = plaintext?.trim();
  if (!key) {
    throw new Error("Missing MCP API key. Set MCP_API_KEY or send Authorization: Bearer mcp_…");
  }

  const hash = hashApiKey(key);
  const row = await prisma.mcpApiKey.findUnique({
    where: { keyHash: hash },
    include: { organization: true, user: true },
  });

  if (!row || row.revokedAt) {
    throw new Error("Invalid or revoked MCP API key.");
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    throw new Error("MCP API key has expired.");
  }

  const expected = Buffer.from(row.keyHash, "utf8");
  const actual = Buffer.from(hash, "utf8");
  if (!scopesEqual(expected, actual)) {
    throw new Error("Invalid MCP API key.");
  }

  const user = row.user ?? (await loadOrgActor(row.organizationId));
  if (!user) {
    throw new Error(
      `API key ${row.keyPrefix}… is bound to org ${row.organizationId} but no User exists to impersonate for tRPC.`
    );
  }
  if (user.organizationId !== row.organizationId) {
    throw new Error("API key user does not belong to the key organization.");
  }

  await prisma.mcpApiKey.update({
    where: { id: row.id },
    data: { lastUsedAt: new Date() },
  });

  const spendCapCents = row.spendCapCents;
  const spentCents = row.spentCents;
  return {
    id: row.id,
    name: row.name,
    organizationId: row.organizationId,
    organizationName: row.organization.name,
    user,
    scopes: parseScopes(row.scopes),
    spendCapCents,
    spentCents,
    remainingSpendCents: Math.max(0, spendCapCents - spentCents),
  };
}

async function loadOrgActor(organizationId: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
}

export class SpendCapError extends Error {
  readonly code = "SPEND_CAP" as const;

  constructor(message: string) {
    super(message);
    this.name = "SpendCapError";
  }
}

export type ReservedSpend = {
  reservedCents: number;
  spentCents: number;
  remainingSpendCents: number;
};

/**
 * Atomically increment spentCents only if the remaining cap covers amountCents.
 * Concurrent callers cannot both succeed past the cap.
 */
export async function reserveSpend(apiKeyId: string, amountCents: number): Promise<ReservedSpend> {
  if (amountCents <= 0) {
    return { reservedCents: 0, spentCents: 0, remainingSpendCents: 0 };
  }

  const rows = await prisma.$queryRaw<Array<{ spentCents: number; spendCapCents: number }>>`
    UPDATE "McpApiKey"
    SET "spentCents" = "spentCents" + ${amountCents},
        "updatedAt" = NOW()
    WHERE id = ${apiKeyId}
      AND "revokedAt" IS NULL
      AND "spendCapCents" > 0
      AND "spentCents" + ${amountCents} <= "spendCapCents"
    RETURNING "spentCents", "spendCapCents"
  `;

  if (rows.length === 0) {
    throw new SpendCapError(
      `Insufficient remaining spend cap for ${amountCents} cents, or the key is revoked / has spendCapCents=0.`
    );
  }

  const row = rows[0];
  return {
    reservedCents: amountCents,
    spentCents: row.spentCents,
    remainingSpendCents: Math.max(0, row.spendCapCents - row.spentCents),
  };
}

export async function releaseSpend(apiKeyId: string, amountCents: number): Promise<void> {
  if (amountCents <= 0) return;
  await prisma.$executeRaw`
    UPDATE "McpApiKey"
    SET "spentCents" = GREATEST(0, "spentCents" - ${amountCents}),
        "updatedAt" = NOW()
    WHERE id = ${apiKeyId}
  `;
}

/** @deprecated Use reserveSpend — kept for any leftover callers. */
export async function recordSpend(apiKeyId: string, amountCents: number): Promise<void> {
  await reserveSpend(apiKeyId, amountCents);
}

export async function createApiKeyRecord(input: {
  organization: Organization;
  userId?: string | null;
  name: string;
  scopes: McpScope[];
  spendCapCents: number;
  expiresAt?: Date | null;
}) {
  const generated = generateApiKey();
  const row = await prisma.mcpApiKey.create({
    data: {
      organizationId: input.organization.id,
      userId: input.userId ?? null,
      name: input.name,
      keyHash: generated.hash,
      keyPrefix: generated.prefix,
      scopes: input.scopes,
      spendCapCents: input.spendCapCents,
      expiresAt: input.expiresAt ?? null,
    },
  });
  return { row, plaintext: generated.plaintext };
}
