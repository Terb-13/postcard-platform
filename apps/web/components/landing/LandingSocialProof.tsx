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
    <section className="section section-rhythm bg-[var(--color-bg)]">
      <div className="container">
        <LandingSectionHeader
          align="center"
          className="lg:mb-14 mx-auto"
          eyebrow="Results"
          title="Built for operators who need precision"
          description="Restaurants, home services, real estate, and retail use Postcard to reach neighborhoods that match their offer — not everyone in the county."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 max-w-6xl mx-auto">
          {QUOTES.map((item, i) => (
            <blockquote
              key={item.role}
              className={`landing-quote-card ${i === 1 ? "lg:translate-y-4" : ""}`}
            >
              <p className="landing-body text-[var(--color-text-secondary)] leading-relaxed">
                {item.quote}
              </p>
              <footer className="mt-6 pt-5 border-t border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)]">
                {item.role}
              </footer>
            </blockquote>
          ))}
        </div>

        <p className="mt-12 lg:mt-14 text-center text-micro text-[var(--color-text-muted)]">
          Customer stories — placeholders for launch testimonials
        </p>
      </div>
    </section>
  );
}
