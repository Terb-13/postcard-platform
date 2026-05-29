import { AuthButtons } from "./AuthButtons";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 75%)",
        }}
      />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(10,102,194,0.06),transparent_55%)] pointer-events-none" />

      <div className="container relative z-10 pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-3xl">
          <p className="landing-eyebrow mb-5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2 align-middle" aria-hidden />
            Census-powered direct mail
          </p>

          <h1 className="display-hero text-[var(--color-bg-dark)] mb-6">
            Reach the right homes — with real Census data, not guesswork
          </h1>

          <p className="body-lg text-[var(--color-text-secondary)] max-w-2xl mb-10">
            You run a local business. Every postcard should land in neighborhoods that match
            your offer — by income, movers, and population. Postcard Platform shows you exactly
            who you&apos;re reaching before you print a single piece.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <AuthButtons variant="hero" />
            <a href="#demo" className="btn-secondary w-full sm:w-auto justify-center text-[15px]">
              Try the live map
            </a>
          </div>

          <ul className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-2 text-sm text-[var(--color-text-muted)]">
            <li className="flex items-center gap-2">
              <CheckIcon />
              No credit card to explore
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon />
              US Census ACS estimates
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon />
              Pay when you send
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
