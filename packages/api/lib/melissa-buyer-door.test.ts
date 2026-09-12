import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PREVIEW_ONLY_BLOCK_MESSAGE,
  PreviewOnlyBlockedError,
  assertNotPreviewOnly,
  hasStubCarrierRoutes,
  isMelissaBuyerDoorEnabled,
  isMelissaBuyerDoorEnabledOnClient,
  isPreviewOnlyTargeting,
  melissaQuoteQuantity,
  normalizeMelissaMeta,
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
