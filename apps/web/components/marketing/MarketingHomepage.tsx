"use client";

/**
 * Marketing homepage — composition mirrors redesign/index.html section order.
 *
 * 1. MarketingNav
 * 2. MarketingHero
 * 3. MarketingProductsGrid
 * 4. MarketingValueProps
 * 5. MarketingHowItWorks
 * 6. MarketingSocialProof
 * 7. MarketingFinalCta
 * 8. MarketingTargetingDemo
 * 9. MarketingFooter
 *
 * See: redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md
 */
import { MarketingNav } from "./MarketingNav";
import { MarketingHero } from "./MarketingHero";
import { MarketingProductsGrid } from "./MarketingProductsGrid";
import { MarketingValueProps } from "./MarketingValueProps";
import { MarketingHowItWorks } from "./MarketingHowItWorks";
import { MarketingSocialProof } from "./MarketingSocialProof";
import { MarketingFinalCta } from "./MarketingFinalCta";
import { MarketingTargetingDemo } from "./MarketingTargetingDemo";
import { MarketingFooter } from "./MarketingFooter";

export function MarketingHomepage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />
      <main>
        <MarketingHero />
        <MarketingProductsGrid />
        <MarketingValueProps />
        <MarketingHowItWorks />
        <MarketingSocialProof />
        <MarketingFinalCta />
        <MarketingTargetingDemo />
      </main>
      <MarketingFooter />
    </div>
  );
}
