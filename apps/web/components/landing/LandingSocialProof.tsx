import { LandingSectionHeader } from "./LandingSectionHeader";
import { LandingVisual } from "./LandingVisual";

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
    <section className="section section-rhythm bg-white border-b border-[var(--color-border)]">
      <div className="container">
        <div className="lg:grid lg:grid-cols-12 lg:gap-14 xl:gap-16 lg:items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start space-y-8">
            <LandingSectionHeader
              eyebrow="Results"
              title="Built for operators who need precision"
              description="Reach the neighborhoods that match your offer — with data-backed targeting and clear campaign economics."
            />
            <LandingVisual
              src="/images/results.jpg"
              alt="Campaign results and performance visibility for targeted postcard mailings"
              aspect="tall"
              sizes="(max-width: 1024px) 100vw, 40vw"
              caption="Measurable reach and cost before you print"
              className="hidden sm:block"
            />
          </div>

          <div className="lg:col-span-7 mt-8 lg:mt-0 space-y-5">
            <LandingVisual
              src="/images/results.jpg"
              alt="Campaign results and performance visibility for targeted postcard mailings"
              aspect="wide"
              sizes="100vw"
              className="sm:hidden"
            />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
              {QUOTES.map((item) => (
                <blockquote key={item.role} className="landing-quote-card">
                  <p className="landing-body text-[var(--color-text-secondary)] leading-relaxed">
                    {item.quote}
                  </p>
                  <footer className="mt-6 pt-5 border-t border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)]">
                    {item.role}
                  </footer>
                </blockquote>
              ))}
            </div>

            <p className="text-center lg:text-left text-micro text-[var(--color-text-muted)] pt-2">
              Customer stories — placeholders for launch testimonials
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
