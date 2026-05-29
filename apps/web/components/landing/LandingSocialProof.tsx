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
    <section className="section bg-[var(--color-bg)]">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
          <p className="landing-eyebrow mb-3">Results</p>
          <h2 className="heading-lg text-[var(--color-bg-dark)] tracking-[-0.03em]">
            Built for operators who need precision
          </h2>
          <p className="mt-4 body-lg text-[var(--color-text-secondary)]">
            Restaurants, home services, real estate, and retail use Postcard to reach neighborhoods
            that match their offer — not everyone in the county.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto">
          {QUOTES.map((item) => (
            <blockquote key={item.role} className="quote-card p-6 sm:p-7">
              <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed pt-6">
                {item.quote}
              </p>
              <footer className="mt-4 text-sm font-medium text-[var(--color-text-muted)]">
                — {item.role}
              </footer>
            </blockquote>
          ))}
        </div>

        <p className="mt-10 text-center text-micro text-[var(--color-text-muted)]">
          Customer stories — placeholders for launch testimonials
        </p>
      </div>
    </section>
  );
}
