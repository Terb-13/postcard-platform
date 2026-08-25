import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateCampaignPricing } from "../../api/lib/pricing.ts";
import { calculatePricing } from "../../api/services/pricing.service.ts";

vi.mock("./auth.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./auth.ts")>();
  return {
    ...actual,
    reserveSpend: vi.fn().mockResolvedValue({ reservedCents: 25000, spentCents: 25000, remainingSpendCents: 75000 }),
    releaseSpend: vi.fn().mockResolvedValue(undefined),
    recordSpend: vi.fn().mockResolvedValue(undefined),
  };
});

import { releaseSpend, reserveSpend, SpendCapError } from "./auth.ts";
import type { ResolvedApiKey } from "./auth.ts";
import type { ToolRuntime } from "./context.ts";
import {
  checkoutTotalCents,
  handleAttachArtwork,
  handleCalculateCost,
  handleCreateCampaign,
  handleEstimateAudience,
  handleFinalizeMailing,
  handlePaymentReadiness,
  handlePrepareCheckout,
  handleUpdateDraft,
} from "./handlers.ts";

function auth(overrides: Partial<ResolvedApiKey> = {}): ResolvedApiKey {
  return {
    id: "key_1",
    name: "test",
    organizationId: "org_1",
    organizationName: "Acme",
    user: {
      id: "user_1",
      clerkId: "clerk_1",
      email: "ops@acme.test",
      firstName: "Ops",
      lastName: null,
      role: "OWNER",
      organizationId: "org_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    scopes: ["read", "draft", "spend", "fulfill"],
    spendCapCents: 1_000_00,
    spentCents: 0,
    remainingSpendCents: 1_000_00,
    ...overrides,
  };
}

function runtime(caller: Record<string, unknown>, authOverrides?: Partial<ResolvedApiKey>): ToolRuntime {
  return { auth: auth(authOverrides), caller: caller as ToolRuntime["caller"] };
}

beforeEach(() => {
  vi.mocked(reserveSpend).mockClear();
  vi.mocked(releaseSpend).mockClear();
  vi.mocked(reserveSpend).mockResolvedValue({
    reservedCents: 25000,
    spentCents: 25000,
    remainingSpendCents: 75000,
  });
});

describe("safety defaults", () => {
  it("create_campaign dry-runs by default and does not call campaign.create", async () => {
    const create = vi.fn();
    const getCensusStatsForZctas = vi.fn().mockResolvedValue({
      reach: 8000,
      households: 8000,
      population: 20000,
    });
    const estimateAudience = vi.fn().mockResolvedValue({
      reach: 1200,
      households: 1200,
      population: 3000,
      avgMedianIncome: 80000,
      avgMoverPercent: 12,
      zctaCount: 1,
      zctas: [],
      pricing: { quantity: 1200, unitPriceCents: 53, totalPriceCents: 63600 },
    });
    const rt = runtime({
      campaign: { create },
      targeting: { estimateAudience, getCensusStatsForZctas },
    });

    const result = await handleCreateCampaign(rt, {
      name: "Denver movers",
      size: "6x9",
      quantity: 500,
      productType: "TARGETED",
      productSlug: "newmover",
      targeting: { zctas: ["80202"], filters: { minMoverPercent: 10 } },
    });

    expect(create).not.toHaveBeenCalled();
    expect(getCensusStatsForZctas).toHaveBeenCalledWith({ zctas: ["80202"], size: "6x9" });
    expect(estimateAudience).toHaveBeenCalledWith({
      zctas: ["80202"],
      geoJson: undefined,
      filters: { minMoverPercent: 10 },
      size: "6x9",
      quantityOverride: undefined,
    });
    expect(result.structuredContent).toMatchObject({ ok: true, dryRun: true });
    const data = result.structuredContent as {
      data: { wouldCreate: { quantity: number }; audienceEstimate: { reach: number } };
    };
    expect(data.data.wouldCreate.quantity).toBe(8000);
    expect(data.data.audienceEstimate.reach).toBe(1200);
  });

  it("create_campaign dry-run without targeting predicts null prices like campaign.create", async () => {
    const create = vi.fn();
    const result = await handleCreateCampaign(
      runtime({ campaign: { create }, targeting: {} }),
      { name: "EDDM drop", size: "6x11", quantity: 500, productType: "EDDM" }
    );
    expect(create).not.toHaveBeenCalled();
    const expected = checkoutTotalCents({ size: "6x11", quantity: 500 });
    const printOnly = calculateCampaignPricing({ size: "6x11", estimatedReach: 500 });
    const withPostage = calculatePricing({ size: "6x11", quantity: 500, productType: "EDDM", source: "estimate" });
    expect(result.structuredContent).toMatchObject({
      ok: true,
      dryRun: true,
      data: {
        wouldCreate: {
          quantity: 500,
          unitPriceCents: null,
          totalPriceCents: null,
        },
        checkoutEstimate: expected,
      },
    });
    expect(expected.totalPriceCents).toBe(printOnly.totalPriceCents);
    expect(expected.totalPriceCents).toBeLessThan(withPostage.totalCents);
  });

  it("prepare_checkout without confirm does not create a Stripe session", async () => {
    const createCheckoutSession = vi.fn();
    const getById = vi.fn();
    const result = await handlePrepareCheckout(
      runtime({ campaign: { createCheckoutSession, getById } }),
      { campaignId: "c1" }
    );
    expect(createCheckoutSession).not.toHaveBeenCalled();
    expect(getById).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({ code: "CONFIRM_REQUIRED" });
  });

  it("prepare_checkout refuses when spend scope is missing", async () => {
    const createCheckoutSession = vi.fn();
    const result = await handlePrepareCheckout(
      runtime({ campaign: { createCheckoutSession } }, { scopes: ["read", "draft"] }),
      { campaignId: "c1", confirm: true }
    );
    expect(createCheckoutSession).not.toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({ code: "SCOPE_DENIED" });
  });

  it("finalize_mailing without confirm does not call mailing.finalize", async () => {
    const finalize = vi.fn();
    const result = await handleFinalizeMailing(runtime({ mailing: { finalize } }), {
      campaignId: "c1",
    });
    expect(finalize).not.toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({ code: "CONFIRM_REQUIRED" });
  });

  it("finalize_mailing refuses handoff without confirmHandoff", async () => {
    const finalize = vi.fn();
    const result = await handleFinalizeMailing(runtime({ mailing: { finalize } }), {
      campaignId: "c1",
      confirm: true,
      runHandoff: true,
    });
    expect(finalize).not.toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({ code: "HANDOFF_CONFIRM_REQUIRED" });
  });
});

describe("tRPC equivalence wrappers", () => {
  it("create_campaign dryRun=false calls campaign.create with the same payload", async () => {
    const created = { id: "c1", name: "Denver movers", status: "DRAFT" };
    const create = vi.fn().mockResolvedValue(created);
    const rt = runtime({ campaign: { create }, targeting: { estimateAudience: vi.fn() } });

    const input = {
      name: "Denver movers",
      size: "6x9",
      quantity: 500,
      productType: "TARGETED" as const,
      productSlug: "newmover",
      targeting: { zctas: ["80202", "80205"], filters: { minMoverPercent: 10 } },
      dryRun: false,
    };

    const result = await handleCreateCampaign(rt, input);
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({
      name: "Denver movers",
      size: "6x9",
      quantity: 500,
      productType: "TARGETED",
      productSlug: "targeted-direct-mail",
      dropDate: undefined,
      notes: undefined,
      targeting: input.targeting,
    });
    expect(result.structuredContent).toMatchObject({
      ok: true,
      dryRun: false,
      procedure: "campaign.create",
      data: created,
    });
  });

  it("estimate_audience calls targeting.estimateAudience", async () => {
    const estimate = { reach: 10, households: 10 };
    const estimateAudience = vi.fn().mockResolvedValue(estimate);
    const result = await handleEstimateAudience(runtime({ targeting: { estimateAudience } }), {
      zctas: ["80202"],
      size: "6x11",
    });
    expect(estimateAudience).toHaveBeenCalledWith({ zctas: ["80202"], size: "6x11" });
    expect(result.structuredContent).toMatchObject({ ok: true, dryRun: true, data: estimate });
  });

  it("calculate_cost calls mailing.calculatePricing", async () => {
    const breakdown = { totalCents: 1000, quantity: 100 };
    const calculatePricing = vi.fn().mockResolvedValue(breakdown);
    const result = await handleCalculateCost(runtime({ mailing: { calculatePricing } }), {
      size: "6x11",
      quantity: 100,
      productType: "EDDM",
      source: "estimate",
    });
    expect(calculatePricing).toHaveBeenCalledWith({
      size: "6x11",
      quantity: 100,
      productType: "EDDM",
      source: "estimate",
    });
    expect(result.structuredContent).toMatchObject({ data: breakdown });
  });

  it("update and artwork dryRun=false call the matching mutations", async () => {
    const updateDraft = vi.fn().mockResolvedValue({ id: "c1" });
    const uploadArtwork = vi.fn().mockResolvedValue({ id: "a1" });
    await handleUpdateDraft(runtime({ campaign: { updateDraft, getById: vi.fn() } }), {
      id: "c1",
      name: "Renamed",
      dryRun: false,
    });
    await handleAttachArtwork(runtime({ campaign: { uploadArtwork, getById: vi.fn() } }), {
      campaignId: "c1",
      fileUrl: "https://files.example/art.pdf",
      fileName: "art.pdf",
      dryRun: false,
    });
    expect(updateDraft).toHaveBeenCalledWith({
      id: "c1",
      name: "Renamed",
    });
    expect(uploadArtwork).toHaveBeenCalledWith({
      campaignId: "c1",
      fileUrl: "https://files.example/art.pdf",
      fileName: "art.pdf",
    });
  });

  it("prepare_checkout confirm=true calls campaign.createCheckoutSession", async () => {
    const createCheckoutSession = vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/c/cs_test" });
    const getById = vi.fn().mockResolvedValue({
      id: "c1",
      size: "6x9",
      quantity: 500,
      productType: "TARGETED",
      totalPriceCents: 25000,
    });
    const result = await handlePrepareCheckout(
      runtime({ campaign: { createCheckoutSession, getById } }),
      { campaignId: "c1", confirm: true }
    );
    expect(createCheckoutSession).toHaveBeenCalledWith({ campaignId: "c1" });
    expect(reserveSpend).toHaveBeenCalledWith("key_1", 25000);
    expect(releaseSpend).not.toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({
      ok: true,
      procedure: "campaign.createCheckoutSession",
      data: { url: "https://checkout.stripe.com/c/cs_test", reservedSpendCents: 25000 },
    });
  });

  it("prepare_checkout releases the reservation when Stripe throws", async () => {
    const createCheckoutSession = vi.fn().mockRejectedValue(new Error("stripe down"));
    const getById = vi.fn().mockResolvedValue({
      id: "c1",
      size: "6x9",
      quantity: 500,
      productType: "TARGETED",
      totalPriceCents: 25000,
    });
    const result = await handlePrepareCheckout(
      runtime({ campaign: { createCheckoutSession, getById } }),
      { campaignId: "c1", confirm: true }
    );
    expect(reserveSpend).toHaveBeenCalledWith("key_1", 25000);
    expect(releaseSpend).toHaveBeenCalledWith("key_1", 25000);
    expect(result.isError).toBe(true);
  });

  it("prepare_checkout does not call Stripe when the atomic reserve fails", async () => {
    vi.mocked(reserveSpend).mockRejectedValueOnce(
      new SpendCapError("Insufficient remaining spend cap for 25000 cents, or the key is revoked / has spendCapCents=0.")
    );
    const createCheckoutSession = vi.fn();
    const getById = vi.fn().mockResolvedValue({
      id: "c1",
      size: "6x9",
      quantity: 500,
      productType: "TARGETED",
      totalPriceCents: 25000,
    });
    const result = await handlePrepareCheckout(
      runtime({ campaign: { createCheckoutSession, getById } }),
      { campaignId: "c1", confirm: true }
    );
    expect(createCheckoutSession).not.toHaveBeenCalled();
    expect(releaseSpend).not.toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({ code: "SPEND_CAP" });
  });

  it("prepare_checkout refuses a zero spend cap", async () => {
    const createCheckoutSession = vi.fn();
    const getById = vi.fn().mockResolvedValue({
      id: "c1",
      size: "6x9",
      quantity: 500,
      productType: "TARGETED",
      totalPriceCents: 25000,
    });
    const result = await handlePrepareCheckout(
      runtime({ campaign: { createCheckoutSession, getById } }, { spendCapCents: 0, remainingSpendCents: 0 }),
      { campaignId: "c1", confirm: true }
    );
    expect(createCheckoutSession).not.toHaveBeenCalled();
    expect(result.structuredContent).toMatchObject({ code: "SPEND_CAP" });
  });

  it("finalize_mailing passes runHandoff only when both confirm flags are set", async () => {
    const finalize = vi.fn().mockResolvedValue({ mailingJobId: "m1", status: "SENT_TO_PRINTER" });
    await handleFinalizeMailing(runtime({ mailing: { finalize } }), {
      campaignId: "c1",
      confirm: true,
      runHandoff: false,
    });
    await handleFinalizeMailing(runtime({ mailing: { finalize } }), {
      campaignId: "c1",
      confirm: true,
      runHandoff: true,
      confirmHandoff: true,
    });
    expect(finalize).toHaveBeenNthCalledWith(1, { campaignId: "c1", runHandoff: false });
    expect(finalize).toHaveBeenNthCalledWith(2, { campaignId: "c1", runHandoff: true });
  });

  it("get_payment_readiness does not call createCheckoutSession", async () => {
    const createCheckoutSession = vi.fn();
    const getById = vi.fn().mockResolvedValue({
      id: "c1",
      name: "Test",
      status: "DRAFT",
      productType: "TARGETED",
      productSlug: "targeted-direct-mail",
      size: "6x9",
      quantity: 500,
      unitPriceCents: 50,
      totalPriceCents: 25000,
      artwork: { status: "UPLOADED" },
    });
    const result = await handlePaymentReadiness(
      runtime({ campaign: { getById, createCheckoutSession } }),
      { campaignId: "c1" }
    );
    expect(createCheckoutSession).not.toHaveBeenCalled();
    const expected = checkoutTotalCents({
      size: "6x9",
      quantity: 500,
      unitPriceCents: 50,
      totalPriceCents: 25000,
    });
    expect(result.structuredContent).toMatchObject({
      data: {
        canCreateCheckout: false,
        checkoutEstimate: expected,
        checkoutRequires: { spendCapCents: 25000 },
      },
    });
  });
});
