"use client";

export const dynamic = "force-dynamic";

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingDemoSection } from "@/components/landing/LandingDemoSection";
import { LandingProblem } from "@/components/landing/LandingProblem";
import { LandingSolution } from "@/components/landing/LandingSolution";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingSocialProof } from "@/components/landing/LandingSocialProof";
import { LandingFinalCta } from "@/components/landing/LandingFinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingDemoSection />
        <LandingProblem />
        <LandingSolution />
        <LandingHowItWorks />
        <LandingSocialProof />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
