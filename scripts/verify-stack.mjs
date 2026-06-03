#!/usr/bin/env node
/**
 * Verify Clerk + Supabase + Prisma wiring for one email.
 *
 * Usage:
 *   DATABASE_URL='postgresql://...' node scripts/verify-stack.mjs lupylloyd@gmail.com
 *
 * Or from apps/web with .env.local + DATABASE_URL in packages/db/.env:
 *   cd apps/web && node ../../scripts/verify-stack.mjs lupylloyd@gmail.com
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const email = process.argv[2] ?? "lupylloyd@gmail.com";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i);
    const val = t.slice(i + 1).replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(__dirname, "../apps/web/.env.local"));
loadEnvFile(resolve(__dirname, "../apps/web/.env.vercel.production"));
loadEnvFile(resolve(__dirname, "../packages/db/.env"));

if (!process.env.DATABASE_URL?.trim() || process.env.DATABASE_URL.includes("REPLACE_ME")) {
  const prismaUrl = process.env.POSTGRES_PRISMA_URL?.trim();
  const postgresUrl = process.env.POSTGRES_URL?.trim();
  if (prismaUrl) process.env.DATABASE_URL = prismaUrl;
  else if (postgresUrl) process.env.DATABASE_URL = postgresUrl;
}

const checks = [];

function ok(label, detail) {
  checks.push({ ok: true, label, detail });
  console.log(`✓ ${label}${detail ? `: ${detail}` : ""}`);
}

function fail(label, detail) {
  checks.push({ ok: false, label, detail });
  console.log(`✗ ${label}${detail ? `: ${detail}` : ""}`);
}

console.log(`\nPostcard stack verify — ${email}\n`);

// Clerk env (app)
if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_")) {
  ok("Clerk publishable key", "set");
} else {
  fail("Clerk publishable key", "missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}
if (process.env.CLERK_SECRET_KEY?.startsWith("sk_")) {
  ok("Clerk secret key", "set");
} else {
  fail("Clerk secret key", "missing CLERK_SECRET_KEY");
}
if (process.env.CLERK_WEBHOOK_SECRET) {
  ok("Clerk webhook secret", "set (production webhooks)");
} else {
  fail("Clerk webhook secret", "optional locally; required on Vercel for user.created sync");
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("REPLACE_ME")) {
  fail("DATABASE_URL", "set in packages/db/.env or pass on command line");
  console.log("\nStopped — Prisma needs DATABASE_URL.\n");
  process.exit(1);
}
ok("DATABASE_URL", "set");

const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1`;
  ok("Prisma → Supabase", "connected");

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: {
      organization: {
        include: {
          campaigns: {
            select: { id: true, name: true, status: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user) {
    fail("User in Supabase", `no row for ${email} — sign in once on the app or run Clerk webhook`);
  } else {
    ok("User in Supabase", `${user.email} (clerkId ${user.clerkId})`);
    ok("Organization", user.organization.name);

    const orders = user.organization.campaigns.filter((c) =>
      ["PAID", "IN_PRODUCTION", "COMPLETED"].includes(c.status)
    );
    const drafts = user.organization.campaigns.filter((c) => c.status === "DRAFT");

    ok("Campaigns", `${user.organization.campaigns.length} total (${orders.length} orders, ${drafts.length} drafts)`);

    if (orders.length === 0) {
      fail("Order history data", "use Load sample data on /account/orders or seed SQL");
    } else {
      for (const c of orders.slice(0, 3)) {
        const job = await prisma.productionJob.findUnique({ where: { campaignId: c.id } });
        ok(`Order: ${c.name}`, `${c.status}${job?.trackingNumber ? ` · ${job.trackingNumber}` : ""}`);
      }
    }
  }

  const partner = await prisma.productionPartner.count({ where: { isActive: true } });
  if (partner > 0) ok("Production partner", `${partner} active`);
  else fail("Production partner", "none — Stripe webhook / test orders need one");
} catch (e) {
  fail("Prisma query", e instanceof Error ? e.message : String(e));
} finally {
  await prisma.$disconnect();
}

const failed = checks.filter((c) => !c.ok).length;
console.log(failed ? `\n${failed} check(s) need attention.\n` : "\nAll checks passed.\n");
process.exit(failed ? 1 : 0);
