import { AuthButtons } from "./AuthButtons";

export function LandingHero() {
  return (
    <section className="section border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="landing-eyebrow mb-4">
            <span
              className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 align-middle"
              aria-hidden
            />
            Census-powered direct mail
          </p>

          <h1 className="display-hero mb-5 text-[var(--color-bg-dark)] lg:mb-6">
            Target the right homes with{" "}
            <span className="text-[var(--color-accent)]">real Census data</span>
          </h1>

          <p className="landing-hero-lead mx-auto mb-8 max-w-2xl lg:mb-10">
            See median income, movers, and household reach on the map — then launch a campaign
            when the numbers look right. No credit card to explore.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
            <AuthButtons variant="hero" />
            <a href="#demo" className="btn-secondary justify-center text-[15px] sm:min-w-[11rem]">
              Try the live map
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--color-text-muted)]">
            <li>US Census ACS</li>
            <li className="hidden sm:list-item">Live reach &amp; cost</li>
            <li className="hidden md:list-item">Pay when you send</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
