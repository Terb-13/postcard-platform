import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAP_QUOTE_HREF,
  MELISSA_PLAN_HREF,
  buildMelissaPlanHref,
  buildMelissaWizardHref,
  isMelissaBuyerDoorQuery,
  parseCampaignWizardParams,
  parseZipQueryParam,
  unpersistedWizardEntryRedirect,
  getProductBySlug,
} from "./products";

describe("Melissa buyer-door product helpers", () => {
  it("parses zips and door=melissa", () => {
    assert.deepEqual(parseZipQueryParam("84037,84003"), ["84037", "84003"]);
    assert.equal(isMelissaBuyerDoorQuery("melissa"), true);
    assert.equal(isMelissaBuyerDoorQuery("census"), false);

    const parsed = parseCampaignWizardParams(
      new URLSearchParams("door=melissa&product=every-door-direct-mail&zips=84037")
    );
    assert.equal(parsed.door, "melissa");
    assert.deepEqual(parsed.zips, ["84037"]);
    assert.equal(parsed.product?.slug, "every-door-direct-mail");
  });

  it("builds plan and wizard hrefs", () => {
    assert.equal(
      buildMelissaPlanHref({ zips: ["84037"], product: "every-door-direct-mail" }),
      `${MELISSA_PLAN_HREF}?zips=84037&product=every-door-direct-mail`
    );
    assert.match(
      buildMelissaWizardHref({ zips: ["84037"] }),
      /door=melissa.*product=every-door-direct-mail.*zips=84037/
    );
  });

  it("keeps signed-out and flag-off traffic on the Census map", () => {
    const eddm = getProductBySlug("every-door-direct-mail")!;
    assert.equal(unpersistedWizardEntryRedirect(eddm, false), MAP_QUOTE_HREF);
    assert.equal(unpersistedWizardEntryRedirect(eddm, true), MAP_QUOTE_HREF);
    assert.equal(
      unpersistedWizardEntryRedirect(eddm, true, { melissaDoor: true, buyerDoorEnabled: false }),
      MAP_QUOTE_HREF
    );
  });

  it("allows signed-in melissa door entry for quote-only EDDM when the flag is on", () => {
    const eddm = getProductBySlug("every-door-direct-mail")!;
    assert.equal(
      unpersistedWizardEntryRedirect(eddm, true, { melissaDoor: true, buyerDoorEnabled: true }),
      null
    );
  });
});
