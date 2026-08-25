import { appRouter } from "../../../api/root.ts";
import { createTRPCContext } from "../../../api/trpc.ts";
import { loadEnv } from "../env.ts";
import { handleCalculateCost, handleEstimateAudience } from "../handlers.ts";
import type { ResolvedApiKey } from "../auth.ts";

loadEnv();

const fakeAuth = {
  id: "live-ab",
  name: "live-ab",
  organizationId: "org_live_ab",
  organizationName: "live-ab",
  user: {
    id: "user_live_ab",
    clerkId: "clerk_live_ab",
    email: "live-ab@test.local",
    firstName: "Live",
    lastName: "AB",
    role: "OWNER",
    organizationId: "org_live_ab",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  scopes: ["read", "draft"],
  spendCapCents: 0,
  spentCents: 0,
  remainingSpendCents: 0,
} as ResolvedApiKey;

async function main() {
  const ctx = await createTRPCContext({ user: null });
  const caller = appRouter.createCaller(ctx);
  const input = { zctas: ["80202"], size: "6x9", filters: { minMoverPercent: 10 } };

  const direct = await caller.targeting.estimateAudience(input);
  const wrapped = await handleEstimateAudience({ auth: fakeAuth, caller }, input);
  const data = wrapped.structuredContent && "data" in wrapped.structuredContent
    ? wrapped.structuredContent.data
    : null;

  const audienceMatch = JSON.stringify(direct) === JSON.stringify(data);
  console.log(
    JSON.stringify(
      {
        audienceMatch,
        censusReach: (direct as { reach?: number }).reach,
        censusHouseholds: (direct as { households?: number }).households,
        zctaCount: (direct as { zctaCount?: number }).zctaCount,
        note: "handleEstimateAudience data === targeting.estimateAudience (publicProcedure, no user)",
      },
      null,
      2
    )
  );
  if (!audienceMatch) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
