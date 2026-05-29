import { LandingSectionHeader } from "./LandingSectionHeader";
import { LandingTargetingDemo } from "./LandingTargetingDemo";

export function LandingDemoSection() {
  return (
    <section
      id="demo"
      className="section section-rhythm scroll-mt-24 bg-[var(--color-bg-subtle)] border-y border-[var(--color-border)]"
    >
      <div className="container">
        <LandingSectionHeader
          align="center"
          eyebrow="See it in action"
          title="See exactly who you can reach."
          description="Explore live Census estimates on the map — search ZIPs, select boundaries, and watch audience and cost update instantly. No login required."
          className="mx-auto mb-10 lg:mb-12"
        />

        <div className="max-w-6xl mx-auto">
          <div className="demo-stage">
            <LandingTargetingDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
