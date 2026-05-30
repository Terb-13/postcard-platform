import { LandingSectionHeader } from "./LandingSectionHeader";
import { LandingTrustMetrics } from "./LandingTrustMetrics";

const TRUST_SIGNALS = [
  { value: "ACS 5-yr", label: "Census estimates on every ZIP" },
  { value: "ZIP-level", label: "Income, movers & household density" },
  { value: "Transparent", label: "Reach and cost before you print" },
] as const;

const QUOTES = [
  {
    quote: "We finally know exactly who we're mailing — and what it costs before we commit.",
    role: "Local restaurant owner",
  },
  {
    quote: "The map made it click. I picked three ZIPs and had a quote in minutes.",
    role: "Home services contractor",
  },
  {
    quote: "No more back-and-forth with the printer. I can see where every job stands.",
    role: "Marketing manager",
  },
] as const;

export function LandingSocialProof() {
  return (
    <section
      id="results"
      className="section scroll-mt-24 border-b border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <div className="container">
        <LandingSectionHeader
          align="center"
          eyebrow="Results & trust"
          title="Built for operators who need precision"
          description="Restaurants, home services, real estate, and retail use Postcard to reach neighborhoods that match their offer — with data-backed targeting and transparent campaign economics."
          className="mx-auto mb-8 lg:mb-12"
        />

        <ul className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 lg:mb-12">
          {TRUST_SIGNALS.map((signal) => (
            <li key={signal.label} className="landing-pillar-card text-center">
              <p className="landing-pillar-metric">{signal.value}</p>
              <p className="mt-3 text-sm leading-snug text-[var(--color-text-secondary)]">
                {signal.label}
              </p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mb-10 max-w-4xl lg:mb-12">
          <LandingTrustMetrics />
        </div>

        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {QUOTES.map((item, i) => (
            <blockquote
              key={item.role}
              className={`landing-quote-card ${i === 1 ? "lg:translate-y-4" : ""}`}
            >
              <p className="landing-body leading-relaxed text-[var(--color-text-secondary)]">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-6 border-t border-[var(--color-border)] pt-5 text-sm font-medium text-[var(--color-text-muted)]">
                {item.role}
              </footer>
            </blockquote>
          ))}
        </div>

        <p className="mt-10 text-center text-micro text-[var(--color-text-muted)] lg:mt-12">
          Customer stories — placeholders for launch testimonials
        </p>
      </div>
    </section>
  );
}
