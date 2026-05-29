"use client";

export const dynamic = "force-dynamic";

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProblem } from "@/components/landing/LandingProblem";
import { LandingSolution } from "@/components/landing/LandingSolution";
import { LandingDemoSection } from "@/components/landing/LandingDemoSection";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingSocialProof } from "@/components/landing/LandingSocialProof";
import { LandingFinalCta } from "@/components/landing/LandingFinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingSolution />
        <LandingDemoSection />
        <LandingHowItWorks />
        <LandingSocialProof />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
