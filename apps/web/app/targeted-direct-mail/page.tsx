import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";
import { MarketingPrimaryCta } from "@/components/marketing/MarketingPrimaryCta";
import { marketingContainerNarrow } from "@/components/marketing/marketing-design-system";

/** redesign/targeted-direct-mail.html */
export default function TargetedDirectMailPage() {
  return (
    <MarketingPageShell>
      <main className={marketingContainerNarrow}>
        <MarketingPageHero
          backLink={{ href: "/direct-mail-marketing", label: "← All Solutions" }}
          title="Targeted Direct Mail"
          description="Reach the exact households most likely to become your customers using real Census data."
        />

        <div className="mt-12">
          <MarketingPrimaryCta href="/map-tool">Start Targeting on the Map</MarketingPrimaryCta>
        </div>
      </main>
    </MarketingPageShell>
  );
}
