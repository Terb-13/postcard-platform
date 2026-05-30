import { LandingSectionHeader } from "./LandingSectionHeader";

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
          eyebrow="Results"
          title="Built for operators who need precision"
          description="Restaurants, home services, real estate, and retail use Postcard to reach neighborhoods that match their offer."
          className="mx-auto mb-10 lg:mb-12"
        />

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
      </div>
    </section>
  );
}
