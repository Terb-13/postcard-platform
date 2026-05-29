import { LandingTargetingDemo } from "./LandingTargetingDemo";

export function LandingDemoSection() {
  return (
    <section id="demo" className="section bg-[var(--color-bg)] scroll-mt-20">
      <div className="container">
        <div className="max-w-2xl mb-8 sm:mb-10">
          <p className="landing-eyebrow mb-3">See it yourself</p>
          <h2 className="heading-lg text-[var(--color-bg-dark)] tracking-[-0.03em]">
            See your audience before you send
          </h2>
          <p className="mt-4 body-lg text-[var(--color-text-secondary)]">
            We&apos;ve loaded Beverly Hills area ZIPs (90210 and nearby). Search another ZIP, tap
            the map, or draw a custom area — stats update from live Census data.
          </p>
        </div>

        <LandingTargetingDemo />
      </div>
    </section>
  );
}
