'use client';

import { MarketingNav } from './MarketingNav';
import { MarketingHero } from './MarketingHero';
import { MarketingProductsGrid } from './MarketingProductsGrid';
import { MarketingValueProps } from './MarketingValueProps';
import { MarketingHowItWorks } from './MarketingHowItWorks';
import { MarketingSocialProof } from './MarketingSocialProof';
import { MarketingFinalCta } from './MarketingFinalCta';
import { MarketingTargetingDemo } from './MarketingTargetingDemo';
import { MarketingFooter } from './MarketingFooter';

/**
 * Marketing Homepage
 * 
 * This component is intentionally structured to closely follow the layout
 * and visual priorities from redesign/index.html.
 * 
 * We are building the marketing experience to match the approved prototype,
 * while wrapping the existing technical capabilities (TargetingMap, etc.).
 */
export function MarketingHomepage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />

      <main>
        {/* 1. Hero */}
        <MarketingHero />

        {/* 2. Explore Popular Products */}
        <MarketingProductsGrid />

        {/* 3. Value Proposition */}
        <MarketingValueProps />

        {/* 4. How It Works */}
        <MarketingHowItWorks />

        {/* 5. Social Proof */}
        <MarketingSocialProof />

        {/* 6. Final CTA */}
        <MarketingFinalCta />

        {/* 7. Map Tool (first-class experience at the bottom) */}
        <MarketingTargetingDemo />
      </main>

      <MarketingFooter />
    </div>
  );
}
