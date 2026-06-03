#!/usr/bin/env node
/**
 * Seed demo campaigns/orders for an organization.
 * Usage:
 *   DATABASE_URL='postgresql://...' ORG_ID=org_lupylloyd_demo node scripts/seed-demo-for-org.mjs
 */
import { PrismaClient } from "@prisma/client";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const orgId = process.env.ORG_ID;

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL (Supabase direct URI, port 5432).");
  process.exit(1);
}
if (!orgId) {
  console.error("Set ORG_ID (e.g. org_lupylloyd_demo).");
  process.exit(1);
}

// Load compiled seed from api package via dynamic import path
const { seedDemoDataForOrganization } = await import(
  "../packages/api/lib/seed-demo-data.ts"
).catch(() =>
  import("../packages/api/lib/seed-demo-data.js")
);

const prisma = new PrismaClient();

try {
  const result = await seedDemoDataForOrganization(prisma, orgId);
  console.log("Seeded demo data:", JSON.stringify(result, null, 2));
} finally {
  await prisma.$disconnect();
}
