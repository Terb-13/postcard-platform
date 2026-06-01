import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";
import { MarketingPricingCard } from "@/components/marketing/MarketingPricingCard";
import { MarketingPrimaryCta } from "@/components/marketing/MarketingPrimaryCta";
import { marketingContainerNarrow } from "@/components/marketing/marketing-design-system";
import { DESIGN_PACKAGES } from "@/components/marketing/marketing-solutions";

/** redesign/design-services.html */
export default function DesignServicesPage() {
  return (
    <MarketingPageShell>
      <main className={marketingContainerNarrow}>
        <MarketingPageHero
          title="Professional Design Services"
          description="Let our team create high-converting postcards for you."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DESIGN_PACKAGES.map((pkg) => (
            <MarketingPricingCard key={pkg.name} name={pkg.name} price={pkg.price} />
          ))}
        </div>

        <div className="mt-8">
          <MarketingPrimaryCta href="/sign-up" className="px-8 py-3 text-base">
            Get a Free Quote
          </MarketingPrimaryCta>
        </div>
      </main>
    </MarketingPageShell>
  );
}
