import { AuthButtons } from "./AuthButtons";
import { LandingHeroPreview } from "./LandingHeroPreview";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingHero() {
  return (
    <section className="section relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none hidden lg:block"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 90% 80% at 30% 20%, black 15%, transparent 70%)",
        }}
      />

      <div className="container relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-24 lg:items-center">
          <div className="max-w-xl lg:max-w-none">
            <LandingSectionHeader
              titleAs="h1"
              eyebrow="Postcard Platform"
              title="Target the right homes with real data."
              description="Precision direct mail powered by Census data — simple, modern, and effective."
              className="mb-8 lg:mb-10"
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <AuthButtons variant="hero" />
              <a
                href="#demo"
                className="btn-secondary w-full sm:w-auto justify-center text-[15px]"
              >
                See it in action
              </a>
            </div>

            <ul className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-2.5 text-sm text-[var(--color-text-muted)]">
              <li>Live Census ACS on every ZIP</li>
              <li className="hidden sm:list-item">No credit card to explore</li>
              <li className="hidden md:list-item">Pay when you send</li>
            </ul>
          </div>

          <div className="mt-10 lg:mt-0">
            <LandingHeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
