import type { ReactNode } from "react";
import { LandingSectionHeader } from "./LandingSectionHeader";
import { LandingTargetingDemo } from "./LandingTargetingDemo";

export function LandingDemoSection() {
  return (
    <section
      id="demo"
      className="section section-rhythm scroll-mt-20 bg-[var(--color-bg)] border-y border-[var(--color-border)]"
    >
      <div className="container">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 lg:items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start mb-8 sm:mb-10 lg:mb-0">
            <LandingSectionHeader
              eyebrow="See it yourself"
              title="See your audience before you send"
              description="We've loaded Beverly Hills area ZIPs (90210 and nearby). Search another ZIP, click boundaries, or draw a custom area — stats update from live Census data."
            />
            <ul className="hidden lg:flex flex-col gap-3 mt-10 text-sm text-[var(--color-text-secondary)]">
              <DemoHint>Click ZIP boundaries to add or remove</DemoHint>
              <DemoHint>Draw a custom area with the lasso tool</DemoHint>
              <DemoHint>Audience and cost update in real time</DemoHint>
            </ul>
          </div>

          <div className="lg:col-span-8">
            <div className="demo-stage">
              <LandingTargetingDemo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoHint({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--color-accent)] shrink-0" />
      <span>{children}</span>
    </li>
  );
}
