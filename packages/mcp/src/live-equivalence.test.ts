import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.ts";

loadEnv();

const hasCensus = Boolean(process.env.CENSUS_API_KEY);

describe("live A/B vs tRPC caller", () => {
  it.skipIf(!hasCensus)("estimate_audience matches targeting.estimateAudience", async () => {
    const { appRouter } = await import("../../api/root.ts");
    const { createTRPCContext } = await import("../../api/trpc.ts");
    const { handleEstimateAudience } = await import("./handlers.ts");

    const ctx = await createTRPCContext({ user: null });
    const caller = appRouter.createCaller(ctx);
    const auth = {
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
    } as unknown as import("./auth.ts").ResolvedApiKey;

    const input = { zctas: ["80202"], size: "6x9", filters: { minMoverPercent: 10 } };
    let direct;
    try {
      direct = await caller.targeting.estimateAudience(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/fetch failed|ENOTFOUND|EAI_AGAIN|BAD_GATEWAY/i.test(message)) {
        return;
      }
      throw err;
    }
    const wrapped = await handleEstimateAudience({ auth, caller }, input);
    expect(wrapped.structuredContent).toMatchObject({ ok: true, data: direct });
    expect((direct as { zctaCount?: number }).zctaCount).toBeGreaterThan(0);

    const { handleCreateCampaign } = await import("./handlers.ts");
    const preview = await handleCreateCampaign(
      { auth: { ...auth, scopes: ["read", "draft"] }, caller },
      {
        name: "A/B new movers",
        size: "6x9",
        quantity: 500,
        productType: "TARGETED",
        targeting: { zctas: ["80202"], filters: { minMoverPercent: 10 } },
      }
    );
    const createStats = await caller.targeting.getCensusStatsForZctas({
      zctas: ["80202"],
      size: "6x9",
    });
    const previewData = preview.structuredContent as {
      data: { wouldCreate: { quantity: number; totalPriceCents: number } };
    };
    expect(previewData.data.wouldCreate.quantity).toBe(createStats.pricing.quantity);
    expect(previewData.data.wouldCreate.totalPriceCents).toBe(createStats.pricing.totalPriceCents);
  });
});
