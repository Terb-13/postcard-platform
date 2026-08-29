import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildLeadgenCountParams,
  countMelissaConsumerList,
  hincDFromIncome,
  MELISSA_LEADGEN_CONSUMER_BASE,
  MelissaLeadgenError,
  parseLeadgenCountXml,
  resLenDForRecentMovers,
} from "../../api/services/melissa-leadgen-consumer.ts";
import { generateTargetedList } from "../../api/services/targeted.service.ts";
import { EddmRoutesNotConfiguredError, fetchEddmRoutesFromProvider } from "../../api/services/usps-eddm.provider.ts";

afterEach(() => {
  delete process.env.MELISSA_API_KEY;
  delete process.env.TARGETED_LIST_PROVIDER;
  delete process.env.EDDM_ROUTES_PROVIDER;
  delete process.env.EDDM_ROUTES_API_URL;
  delete process.env.DATA_AXLE_API_KEY;
});

describe("Melissa LeadGen Consumer filter mapping (published brackets)", () => {
  it("maps $75k+ to hInc-d 7-13", () => {
    expect(hincDFromIncome(75_000)).toBe("7-8-9-10-11-12-13");
  });

  it("maps a bounded income window onto overlapping Melissa brackets", () => {
    expect(hincDFromIncome(50_000, 99_999)).toBe("6-7");
  });

  it("leaves income unfiltered when no min/max", () => {
    expect(hincDFromIncome()).toBeUndefined();
  });

  it("maps any on recent-mover filter to Melissa last-12-month resLen-d", () => {
    expect(resLenDForRecentMovers(5)).toBe("1-2");
    expect(resLenDForRecentMovers(0)).toBeUndefined();
    expect(resLenDForRecentMovers()).toBeUndefined();
  });

  it("builds a get/zip query without a license key in the public params", () => {
    const params = buildLeadgenCountParams({
      zips: ["80202", "80205"],
      filters: { minIncome: 75_000, minMoverPercent: 10, ownHome: true },
    });
    expect(params.get("zip")).toBe("80202,80205");
    expect(params.get("hInc-d")).toBe("7-8-9-10-11-12-13");
    expect(params.get("resLen-d")).toBe("1-2");
    expect(params.get("ownRent-d")).toBe("1");
    expect(params.get("id")).toBeNull();
  });
});

describe("Melissa LeadGen Consumer XML parse + count client", () => {
  it("parses an Approved count", () => {
    const xml = `<Consumer><TotalCount><Count>1842</Count></TotalCount><Result><StatusCode>Approved</StatusCode></Result></Consumer>`;
    expect(parseLeadgenCountXml(xml)).toEqual({ recipientCount: 1842, statusCode: "Approved" });
  });

  it("refuses to invent a count without MELISSA_API_KEY", async () => {
    await expect(countMelissaConsumerList({ zips: ["80202"] }, { licenseKey: "" })).rejects.toBeInstanceOf(
      MelissaLeadgenError
    );
  });

  it("calls Melissa get/zip and returns the Approved count (no buy)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<Consumer><TotalCount><Count>321</Count></TotalCount><Result><StatusCode>Approved</StatusCode></Result></Consumer>`,
    });

    const result = await countMelissaConsumerList(
      { zips: ["80202"], filters: { minMoverPercent: 10 } },
      { licenseKey: "test-license", fetchImpl }
    );

    expect(result.recipientCount).toBe(321);
    expect(result.statusCode).toBe("Approved");
    const calledUrl = String(fetchImpl.mock.calls[0]?.[0]);
    expect(calledUrl.startsWith(`${MELISSA_LEADGEN_CONSUMER_BASE}/get/zip?`)).toBe(true);
    expect(calledUrl).toContain("zip=80202");
    expect(calledUrl).toContain("resLen-d=1-2");
    expect(calledUrl).not.toContain("/buy/");
  });

  it("does not treat Declined as a real zero-count list", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<Consumer><TotalCount><Count>0</Count></TotalCount><Result><StatusCode>Declined</StatusCode></Result></Consumer>`,
    });

    await expect(
      countMelissaConsumerList({ zips: ["80202"] }, { licenseKey: "bad", fetchImpl })
    ).rejects.toMatchObject({ statusCode: "Declined" });
  });
});

describe("targeted.service list door", () => {
  it("fails closed without MELISSA_API_KEY and does not use Census households", async () => {
    await expect(
      generateTargetedList({ zctas: ["80202"], campaignId: "camp_1" }, 12_000)
    ).rejects.toThrow(/MELISSA_API_KEY/);
  });

  it("refuses Data Axle as a provider", async () => {
    process.env.TARGETED_LIST_PROVIDER = "dataaxle";
    process.env.MELISSA_API_KEY = "x";
    await expect(generateTargetedList({ zctas: ["80202"], campaignId: "camp_1" })).rejects.toThrow(
      /Data Axle stays backup/
    );
  });
});

describe("EDDM routes fail closed", () => {
  it("does not return stub carrier routes", async () => {
    await expect(fetchEddmRoutesFromProvider({ zctas: ["80202"] })).rejects.toBeInstanceOf(
      EddmRoutesNotConfiguredError
    );
  });

  it("does not invent a Melissa Occupant route client", async () => {
    process.env.EDDM_ROUTES_PROVIDER = "melissa";
    process.env.MELISSA_API_KEY = "x";
    await expect(fetchEddmRoutesFromProvider({ zctas: ["80202"] })).rejects.toThrow(/not wired/);
  });
});
