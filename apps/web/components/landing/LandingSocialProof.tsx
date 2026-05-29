import { Visual } from "@/components/shared/Visual";
import { LandingSectionHeader } from "./LandingSectionHeader";

/** Asset: apps/web/public/images/marketing/results.jpg (1280×896) */
const RESULTS_IMAGE = "/images/marketing/results.jpg";

const OUTCOMES = [
  { stat: "Minutes", label: "to quote a targeted campaign" },
  { stat: "ZIP-level", label: "Census income & mover data" },
  { stat: "Full", label: "visibility before you print" },
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
    <section id="results" className="section section-rhythm bg-[var(--color-bg)] border-b border-[var(--color-border)] scroll-mt-24">
      <div className="container">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-20 lg:items-start">
          <div>
            <LandingSectionHeader
              eyebrow="Results & trust"
              title="Real businesses. Real results."
              description="Operators use Postcard to reach neighborhoods that match their offer — with data-backed targeting and transparent campaign economics."
              className="mb-8"
            />

            <ul className="grid grid-cols-3 gap-3 mb-8">
              {OUTCOMES.map((o) => (
                <li
                  key={o.label}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-4 text-center"
                >
                  <p className="text-sm font-bold text-[var(--color-bg-dark)]">{o.stat}</p>
                  <p className="mt-1 text-micro text-[var(--color-text-muted)] leading-snug">{o.label}</p>
                </li>
              ))}
            </ul>

            {/* Social proof: campaign results photography — desktop sidebar placement */}
            <Visual
              treatment="socialProof"
              aspectRatio="10/7"
              src={RESULTS_IMAGE}
              alt="Targeted postcard campaign results and measurable outreach outcomes"
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="hidden lg:block"
            />
          </div>

          <div className="mt-10 lg:mt-0 space-y-5">
            {/* Social proof: campaign results photography — mobile stack above testimonials */}
            <Visual
              treatment="socialProof"
              aspectRatio="10/7"
              src={RESULTS_IMAGE}
              alt="Targeted postcard campaign results and measurable outreach outcomes"
              sizes="100vw"
              className="lg:hidden"
            />

            <div className="space-y-5">
              {QUOTES.map((item) => (
                <blockquote
                  key={item.role}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
                >
                  <p className="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <footer className="mt-4 text-sm font-medium text-[var(--color-text-muted)]">
                    — {item.role}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
