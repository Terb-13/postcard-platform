import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buyMelissaConsumerList,
  buildLeadgenCountParams,
  countMelissaConsumerList,
  hincDFromIncome,
  MELISSA_LEADGEN_CONSUMER_BASE,
  MelissaLeadgenError,
  parseLeadgenBuyXml,
  parseLeadgenCountXml,
  parseMelissaListCsv,
  resLenDForRecentMovers,
} from "../../api/services/melissa-leadgen-consumer.ts";
import { mapNewMoversRow, shouldUseNewMoversDoor } from "../../api/services/melissa-newmovers.ts";
import { parseOccupantRoutesJson } from "../../api/services/melissa-occupant-routes.ts";
import { generateTargetedList } from "../../api/services/targeted.service.ts";
import { EddmRoutesNotConfiguredError, fetchEddmRoutesFromProvider } from "../../api/services/usps-eddm.provider.ts";

afterEach(() => {
  delete process.env.MELISSA_API_KEY;
  delete process.env.TARGETED_LIST_PROVIDER;
  delete process.env.EDDM_ROUTES_PROVIDER;
  delete process.env.EDDM_ROUTES_API_URL;
  delete process.env.DATA_AXLE_API_KEY;
  vi.unstubAllGlobals();
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

describe("Melissa LeadGen Consumer buy → names/addresses", () => {
  const buyXml = `<Consumer><TotalCount><Count>2</Count></TotalCount><Order><Id>6819006</Id><DownloadURL>https://list.melissadata.com/ListOrderFiles/123456.csv</DownloadURL></Order><Result><StatusCode>Approved</StatusCode></Result></Consumer>`;
  const csv = `FirstName,LastName,AddressLine,City,State,Zip,Plus4
Jane,Doe,123 Main St,Denver,CO,80202,1234
John,Smith,200 Larimer St,Denver,CO,80202,5678`;

  it("parses buy XML order + download URL", () => {
    expect(parseLeadgenBuyXml(buyXml)).toMatchObject({
      statusCode: "Approved",
      orderId: "6819006",
      downloadUrl: "https://list.melissadata.com/ListOrderFiles/123456.csv",
    });
  });

  it("parses a Melissa CSV into doors", () => {
    const rows = parseMelissaListCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      firstName: "Jane",
      lastName: "Doe",
      addressLine: "123 Main St",
      zip: "80202",
      plus4: "1234",
    });
  });

  it("buys then downloads CSV (never Census households)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, text: async () => buyXml })
      .mockResolvedValueOnce({ ok: true, text: async () => csv });

    const result = await buyMelissaConsumerList(
      { zips: ["80202"], filters: { ownHome: true, minIncome: 75_000 } },
      { licenseKey: "test-license", fetchImpl }
    );

    expect(result.orderId).toBe("6819006");
    expect(result.recipients).toHaveLength(2);
    expect(result.recipients[0]?.addressLine).toBe("123 Main St");
    const buyUrl = String(fetchImpl.mock.calls[0]?.[0]);
    expect(buyUrl).toContain("/buy/zip?");
    expect(buyUrl).toContain("ownRent-d=1");
    expect(buyUrl).toContain("hInc-d=7-8-9-10-11-12-13");
    expect(buyUrl).toContain("name=1");
    expect(buyUrl).toContain("zip4=1");
  });

  it("fails closed when buy is Declined (credits/subscription not enabled)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<Consumer><TotalCount><Count>0</Count></TotalCount><Result><StatusCode>Declined</StatusCode></Result></Consumer>`,
    });
    await expect(
      buyMelissaConsumerList({ zips: ["80202"] }, { licenseKey: "credits-only", fetchImpl })
    ).rejects.toThrow(/Cloud credits do not enable every product/);
  });
});

describe("NewMovers vs Consumer door", () => {
  it("uses NewMovers only for mover-only campaigns", () => {
    expect(shouldUseNewMoversDoor({ minMoverPercent: 10 })).toBe(true);
    expect(shouldUseNewMoversDoor({ minMoverPercent: 10, ownHome: true })).toBe(false);
    expect(shouldUseNewMoversDoor({ minIncome: 75_000 })).toBe(false);
  });

  it("maps a NewMovers row to a recipient", () => {
    expect(
      mapNewMoversRow({
        FullName: "Ada Lovelace",
        FirstName: "Ada",
        LastName: "Lovelace",
        AddressLine: "1600 Wynkoop St",
        City: "Denver",
        State: "CO",
        ZIPCode: "80202",
        Plus4: "0001",
      })
    ).toMatchObject({ addressLine: "1600 Wynkoop St", zip: "80202", fullName: "Ada Lovelace" });
  });
});

describe("Occupant routes (no STUB-CR)", () => {
  it("parses Approved Occupant JSON into real route ids", () => {
    const parsed = parseOccupantRoutesJson({
      Occupant: {
        CarrierRoutes: {
          CarrierRoute: [
            { Zip: "80202", Route: "C001", Count: "412" },
            { Zip: "80202", Route: "R002", Count: "198" },
          ],
        },
        Result: { StatusCode: "Approved" },
      },
    });
    expect(parsed.routes.map((r) => r.carrierRouteId)).toEqual(["C001-80202", "R002-80202"]);
    expect(parsed.totalHomes).toBe(610);
    expect(parsed.routes.some((r) => r.carrierRouteId.startsWith("STUB"))).toBe(false);
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

  it("generateTargetedList returns bought doors, not a Census count", async () => {
    process.env.MELISSA_API_KEY = "test-license";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () =>
            `<Consumer><TotalCount><Count>1</Count></TotalCount><Order><Id>99</Id><DownloadURL>https://list.example/x.csv</DownloadURL></Order><Result><StatusCode>Approved</StatusCode></Result></Consumer>`,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => `AddressLine,Zip\n11 Blake St,80202`,
        })
    );

    const result = await generateTargetedList({ zctas: ["80202"], campaignId: "camp_1" }, 12_000);
    expect(result.isStub).toBe(false);
    expect(result.recipientCount).toBe(1);
    expect(result.recipientCount).not.toBe(12_000);
    expect(result.listRequestId).toBe("99");
    expect(result.recipients?.[0]?.addressLine).toBe("11 Blake St");
    expect(result.door).toBe("melissa-consumer");
  });
});

describe("EDDM routes fail closed / Occupant", () => {
  it("does not return stub carrier routes when unconfigured", async () => {
    await expect(fetchEddmRoutesFromProvider({ zctas: ["80202"] })).rejects.toBeInstanceOf(
      EddmRoutesNotConfiguredError
    );
  });

  it("refuses Data Axle EDDM", async () => {
    process.env.EDDM_ROUTES_PROVIDER = "dataaxle";
    await expect(fetchEddmRoutesFromProvider({ zctas: ["80202"] })).rejects.toThrow(/Data Axle stays backup/);
  });

  it("melissa Occupant without a key fails closed (no STUB-CR)", async () => {
    process.env.EDDM_ROUTES_PROVIDER = "melissa";
    await expect(fetchEddmRoutesFromProvider({ zctas: ["80202"] })).rejects.toThrow(/MELISSA_API_KEY/);
  });
});
