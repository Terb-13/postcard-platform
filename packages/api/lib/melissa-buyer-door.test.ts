import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PREVIEW_ONLY_BLOCK_MESSAGE,
  PreviewOnlyBlockedError,
  assertNotPreviewOnly,
  canActivatePreviewOnlyAfterStripeTestPayment,
  hasStubCarrierRoutes,
  isMelissaBuyerDoorEnabled,
  isMelissaBuyerDoorEnabledOnClient,
  isPreviewOnlyTargeting,
  isPreviewStripeTestCheckoutAllowed,
  isPreviewStripeTestCheckoutAllowedOnClient,
  isStripeTestSecretKey,
  melissaQuoteQuantity,
  normalizeMelissaMeta,
  shouldRefusePreviewOnlyCheckout,
} from "./melissa-buyer-door";
import { calculatePricing } from "../services/pricing.service";

describe("MELISSA_BUYER_DOOR flag", () => {
  it("is hard-off in Vercel Production even if the env is on", () => {
    assert.equal(
      isMelissaBuyerDoorEnabled({
        VERCEL_ENV: "production",
        MELISSA_BUYER_DOOR: "1",
        NEXT_PUBLIC_MELISSA_BUYER_DOOR: "true",
      }),
      false
    );
  });

  it("defaults on in preview when unset", () => {
    assert.equal(isMelissaBuyerDoorEnabled({ VERCEL_ENV: "preview" }), true);
    assert.equal(isMelissaBuyerDoorEnabled({ NEXT_PUBLIC_VERCEL_ENV: "preview" }), true);
  });

  it("can be explicitly turned off on preview", () => {
    assert.equal(
      isMelissaBuyerDoorEnabled({ VERCEL_ENV: "preview", MELISSA_BUYER_DOOR: "0" }),
      false
    );
  });

  it("honors explicit on outside production when deploy env is preview", () => {
    assert.equal(
      isMelissaBuyerDoorEnabled({ VERCEL_ENV: "preview", MELISSA_BUYER_DOOR: "true" }),
      true
    );
    assert.equal(
      isMelissaBuyerDoorEnabled({
        NEXT_PUBLIC_VERCEL_ENV: "preview",
        NEXT_PUBLIC_MELISSA_BUYER_DOOR: "on",
      }),
      true
    );
  });

  it("client-shaped env with missing/empty deploy env does not enable the door", () => {
    const emptyClient: Record<string, string | undefined> = {};
    assert.equal(isMelissaBuyerDoorEnabledOnClient(emptyClient), false);
    assert.equal(isMelissaBuyerDoorEnabledOnClient({ NEXT_PUBLIC_VERCEL_ENV: "" }), false);
    assert.equal(isMelissaBuyerDoorEnabledOnClient({ NEXT_PUBLIC_VERCEL_ENV: "   " }), false);
    assert.equal(
      isMelissaBuyerDoorEnabledOnClient({ NEXT_PUBLIC_MELISSA_BUYER_DOOR: "1" }),
      false
    );
    assert.equal(
      isMelissaBuyerDoorEnabledOnClient({
        NEXT_PUBLIC_VERCEL_ENV: "production",
        NEXT_PUBLIC_MELISSA_BUYER_DOOR: "1",
      }),
      false
    );
    assert.equal(isMelissaBuyerDoorEnabledOnClient({ NEXT_PUBLIC_VERCEL_ENV: "preview" }), true);
  });

  it("server missing/empty deploy env is off unless local NODE_ENV=development", () => {
    assert.equal(isMelissaBuyerDoorEnabled({}), false);
    assert.equal(isMelissaBuyerDoorEnabled({ VERCEL_ENV: "" }), false);
    assert.equal(isMelissaBuyerDoorEnabled({ VERCEL_ENV: "   " }), false);
    assert.equal(isMelissaBuyerDoorEnabled({ MELISSA_BUYER_DOOR: "1" }), false);
    assert.equal(isMelissaBuyerDoorEnabled({ NODE_ENV: "development" }), true);
  });
});

describe("previewOnly finalize refuse", () => {
  it("detects previewOnly targeting", () => {
    assert.equal(
      isPreviewOnlyTargeting({ previewOnly: true, melissa: { provider: "melissa" } }),
      true
    );
    assert.equal(isPreviewOnlyTargeting({ zctas: ["84037"] }), false);
  });

  it("throws before any buy path", () => {
    assert.throws(() => assertNotPreviewOnly({ previewOnly: true }), PreviewOnlyBlockedError);
    assert.throws(() => assertNotPreviewOnly({ previewOnly: true }), {
      message: PREVIEW_ONLY_BLOCK_MESSAGE,
    });
    assert.doesNotThrow(() => assertNotPreviewOnly({ zctas: ["84037"] }));
  });
});

describe("Preview Stripe test checkout escape hatch", () => {
  const testSecret = { STRIPE_SECRET_KEY: "sk_test_abc" };
  const liveSecret = { STRIPE_SECRET_KEY: "sk_live_abc" };
  const previewOnly = { previewOnly: true, melissa: { provider: "melissa" } };

  it("detects Stripe test secrets and rejects live or missing keys", () => {
    assert.equal(isStripeTestSecretKey("sk_test_123"), true);
    assert.equal(isStripeTestSecretKey("rk_test_123"), true);
    assert.equal(isStripeTestSecretKey("sk_live_123"), false);
    assert.equal(isStripeTestSecretKey("pk_test_123"), false);
    assert.equal(isStripeTestSecretKey(""), false);
    assert.equal(isStripeTestSecretKey(undefined), false);
  });

  it("is hard-off in Vercel Production even with test keys and ALLOW_TEST_ORDERS", () => {
    assert.equal(
      isPreviewStripeTestCheckoutAllowed({
        VERCEL_ENV: "production",
        ALLOW_TEST_ORDERS: "true",
        ...testSecret,
      }),
      false
    );
    assert.equal(
      shouldRefusePreviewOnlyCheckout(previewOnly, {
        VERCEL_ENV: "production",
        ...testSecret,
      }),
      true
    );
  });

  it("allows checkout on Preview when Stripe secret is test-mode", () => {
    assert.equal(
      isPreviewStripeTestCheckoutAllowed({ VERCEL_ENV: "preview", ...testSecret }),
      true
    );
    assert.equal(
      shouldRefusePreviewOnlyCheckout(previewOnly, { VERCEL_ENV: "preview", ...testSecret }),
      false
    );
  });

  it("allows checkout when ALLOW_TEST_ORDERS=true and Stripe is test (local / preview)", () => {
    assert.equal(
      isPreviewStripeTestCheckoutAllowed({
        ALLOW_TEST_ORDERS: "true",
        ...testSecret,
      }),
      true
    );
  });

  it("refuses checkout when Stripe is live or unset", () => {
    assert.equal(
      isPreviewStripeTestCheckoutAllowed({ VERCEL_ENV: "preview", ...liveSecret }),
      false
    );
    assert.equal(isPreviewStripeTestCheckoutAllowed({ VERCEL_ENV: "preview" }), false);
    assert.equal(
      shouldRefusePreviewOnlyCheckout(previewOnly, { VERCEL_ENV: "preview", ...liveSecret }),
      true
    );
  });

  it("does not refuse non-previewOnly targeting", () => {
    assert.equal(
      shouldRefusePreviewOnlyCheckout({ zctas: ["84037"] }, { VERCEL_ENV: "preview" }),
      false
    );
  });

  it("client helper requires pk_test_ and a non-production public deploy env", () => {
    assert.equal(
      isPreviewStripeTestCheckoutAllowedOnClient({
        NEXT_PUBLIC_VERCEL_ENV: "preview",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_abc",
      }),
      true
    );
    assert.equal(
      isPreviewStripeTestCheckoutAllowedOnClient({
        NEXT_PUBLIC_VERCEL_ENV: "production",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_abc",
      }),
      false
    );
    assert.equal(
      isPreviewStripeTestCheckoutAllowedOnClient({
        NEXT_PUBLIC_VERCEL_ENV: "preview",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_abc",
      }),
      false
    );
  });

  it("allows activation after Stripe test payment only", () => {
    assert.equal(
      canActivatePreviewOnlyAfterStripeTestPayment(previewOnly, { paymentIntentId: "pi_test" }, {
        VERCEL_ENV: "preview",
        ...testSecret,
      }),
      true
    );
    assert.equal(
      canActivatePreviewOnlyAfterStripeTestPayment(
        previewOnly,
        { actor: "system:stripe-webhook" },
        { VERCEL_ENV: "preview", ...testSecret }
      ),
      true
    );
    assert.equal(
      canActivatePreviewOnlyAfterStripeTestPayment(previewOnly, {}, { VERCEL_ENV: "preview", ...testSecret }),
      false
    );
    assert.equal(
      canActivatePreviewOnlyAfterStripeTestPayment(
        previewOnly,
        { paymentIntentId: "pi_live" },
        { VERCEL_ENV: "production", ...testSecret }
      ),
      false
    );
    assert.equal(canActivatePreviewOnlyAfterStripeTestPayment({ zctas: ["84037"] }, {}), true);
  });
});

describe("Melissa draft quantity + estimate quote", () => {
  it("prefers attached list preview count over Occupant homes", () => {
    assert.equal(
      melissaQuoteQuantity({
        provider: "melissa",
        isStub: false,
        totalHomes: 4000,
        listPreview: { recipientCount: 912, isStub: false, listProvider: "melissa" },
      }),
      912
    );
  });

  it("uses Occupant totalHomes when no list preview", () => {
    assert.equal(
      melissaQuoteQuantity({ provider: "melissa", isStub: false, totalHomes: 2210 }),
      2210
    );
  });

  it("strips STUB-CR routes from persisted melissa metadata", () => {
    const normalized = normalizeMelissaMeta({
      provider: "melissa",
      isStub: false,
      routes: [
        { carrierRouteId: "C001-84037", zip: "84037", householdCount: 200 },
        { carrierRouteId: "STUB-CR-84037", zip: "84037", householdCount: 99 },
      ],
    });
    assert.equal(hasStubCarrierRoutes(normalized?.routes), false);
    assert.deepEqual(normalized?.routes?.map((r) => r.carrierRouteId), ["C001-84037"]);
  });

  it("prices the draft from the Melissa count with source=estimate", () => {
    const quote = calculatePricing({
      size: "6x11",
      quantity: 912,
      productType: "EDDM",
      source: "estimate",
    });
    assert.equal(quote.source, "estimate");
    assert.equal(quote.quantity, 912);
    assert.ok(quote.totalCents > 0);
  });
});
