import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";
import { MarketingSolutionCard } from "@/components/marketing/MarketingSolutionCard";
import { marketingContainer } from "@/components/marketing/marketing-design-system";
import { SOLUTIONS_HUB } from "@/components/marketing/marketing-solutions";

/** redesign/direct-mail-marketing.html */
export default function DirectMailMarketingPage() {
  return (
    <MarketingPageShell>
      <main>
        <MarketingPageHero
          band
          size="hub"
          title="Direct Mail Marketing Solutions"
          description="Choose the right approach for your business. All powered by the same powerful targeting platform."
        />

        <div className={`${marketingContainer} grid gap-6 py-16 pb-20 md:grid-cols-2 lg:grid-cols-3`}>
          {SOLUTIONS_HUB.map((item) => (
            <MarketingSolutionCard
              key={item.href}
              href={item.href}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </main>
    </MarketingPageShell>
  );
}
