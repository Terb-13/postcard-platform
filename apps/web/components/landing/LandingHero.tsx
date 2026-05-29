import { AuthButtons } from "./AuthButtons";
import { LandingVisual } from "./LandingVisual";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none hidden lg:block"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 90% 80% at 20% 30%, black 10%, transparent 72%)",
        }}
      />

      <div className="container relative z-10 pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-14 xl:gap-20 lg:items-center">
          <div className="max-w-3xl lg:max-w-none">
            <p className="landing-eyebrow mb-5 lg:mb-6">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2 align-middle" aria-hidden />
              Census-powered direct mail
            </p>

            <h1 className="display-hero text-[var(--color-bg-dark)] mb-6 lg:mb-7">
              Precision targeting with{" "}
              <span className="text-[var(--color-accent)]">real Census data</span>
            </h1>

            <p className="landing-hero-lead max-w-xl mb-8 lg:mb-10">
              Software that maps US Census demographics to every ZIP — so you see who you&apos;re
              reaching, what it costs, and when mail goes out. No spreadsheets. No guesswork.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5">
              <AuthButtons variant="hero" />
              <a
                href="#demo"
                className="btn-secondary w-full sm:w-auto justify-center text-[15px] lg:px-8"
              >
                Try the live map
              </a>
            </div>

            <ul className="mt-8 lg:mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-x-10 gap-y-3 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                No credit card to explore
              </li>
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                US Census ACS estimates
              </li>
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                Pay when you send
              </li>
            </ul>
          </div>

          <div className="mt-10 lg:mt-0">
            <LandingVisual
              src="/images/hero.jpg"
              alt="Postcard Platform targeting interface showing geo data and audience metrics on a map"
              aspect="hero"
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              caption="Geo-targeting powered by live Census ACS data"
              className="lg:shadow-[var(--shadow-xl)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-emerald-600 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
