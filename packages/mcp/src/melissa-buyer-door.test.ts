import { afterEach, describe, expect, it } from "vitest";
import {
  PREVIEW_ONLY_BLOCK_MESSAGE,
  PreviewOnlyBlockedError,
  assertNotPreviewOnly,
  hasStubCarrierRoutes,
  isMelissaBuyerDoorEnabled,
  isPreviewOnlyTargeting,
  melissaQuoteQuantity,
  normalizeMelissaMeta,
} from "../../api/lib/melissa-buyer-door.ts";
import { calculatePricing } from "../../api/services/pricing.service.ts";

afterEach(() => {
  delete process.env.MELISSA_BUYER_DOOR;
  delete process.env.NEXT_PUBLIC_MELISSA_BUYER_DOOR;
  delete process.env.VERCEL_ENV;
  delete process.env.NEXT_PUBLIC_VERCEL_ENV;
});

describe("MELISSA_BUYER_DOOR flag", () => {
  it("is hard-off in Vercel Production even if the env is on", () => {
    expect(
      isMelissaBuyerDoorEnabled({
        VERCEL_ENV: "production",
        MELISSA_BUYER_DOOR: "1",
        NEXT_PUBLIC_MELISSA_BUYER_DOOR: "true",
      })
    ).toBe(false);
  });

  it("defaults on in preview when unset so acceptance can run", () => {
    expect(isMelissaBuyerDoorEnabled({ VERCEL_ENV: "preview" })).toBe(true);
    expect(isMelissaBuyerDoorEnabled({ NEXT_PUBLIC_VERCEL_ENV: "preview" })).toBe(true);
  });

  it("can be explicitly turned off on preview", () => {
    expect(
      isMelissaBuyerDoorEnabled({ VERCEL_ENV: "preview", MELISSA_BUYER_DOOR: "0" })
    ).toBe(false);
  });

  it("honors explicit on outside production", () => {
    expect(isMelissaBuyerDoorEnabled({ MELISSA_BUYER_DOOR: "true" })).toBe(true);
    expect(isMelissaBuyerDoorEnabled({ NEXT_PUBLIC_MELISSA_BUYER_DOOR: "on" })).toBe(true);
  });
});

describe("previewOnly finalize refuse", () => {
  it("detects previewOnly targeting", () => {
    expect(isPreviewOnlyTargeting({ previewOnly: true, melissa: { provider: "melissa" } })).toBe(
      true
    );
    expect(isPreviewOnlyTargeting({ zctas: ["84037"] })).toBe(false);
  });

  it("assertNotPreviewOnly throws before any buy path", () => {
    expect(() => assertNotPreviewOnly({ previewOnly: true })).toThrow(PreviewOnlyBlockedError);
    expect(() => assertNotPreviewOnly({ previewOnly: true })).toThrow(PREVIEW_ONLY_BLOCK_MESSAGE);
    expect(() => assertNotPreviewOnly({ zctas: ["84037"] })).not.toThrow();
  });
});

describe("Melissa draft quantity + estimate quote", () => {
  it("prefers attached list preview count over Occupant homes", () => {
    expect(
      melissaQuoteQuantity({
        provider: "melissa",
        isStub: false,
        totalHomes: 4000,
        listPreview: { recipientCount: 912, isStub: false, listProvider: "melissa" },
      })
    ).toBe(912);
  });

  it("uses Occupant totalHomes when no list preview", () => {
    expect(
      melissaQuoteQuantity({ provider: "melissa", isStub: false, totalHomes: 2210 })
    ).toBe(2210);
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
    expect(hasStubCarrierRoutes(normalized?.routes)).toBe(false);
    expect(normalized?.routes?.map((r) => r.carrierRouteId)).toEqual(["C001-84037"]);
  });

  it("prices the draft from the Melissa count with source=estimate", () => {
    const quote = calculatePricing({
      size: "6x11",
      quantity: 912,
      productType: "EDDM",
      source: "estimate",
    });
    expect(quote.source).toBe("estimate");
    expect(quote.quantity).toBe(912);
    expect(quote.totalCents).toBeGreaterThan(0);
  });
});
