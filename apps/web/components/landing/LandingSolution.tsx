import { LandingSectionHeader } from "./LandingSectionHeader";
import { LandingVisual } from "./LandingVisual";

const PILLARS = [
  {
    title: "Real Census data",
    description:
      "Median income, population, and mover rates from US Census ACS — mapped to every ZIP you select.",
    metric: "ACS 5-year estimates",
  },
  {
    title: "Simple, guided workflow",
    description:
      "Target on the map, upload artwork, review reach and cost, then checkout. One flow, no spreadsheets.",
    metric: "5-step campaign wizard",
  },
  {
    title: "Professional fulfillment",
    description:
      "Campaigns route to Drummond for print, mailing, and delivery — with status you can track end to end.",
    metric: "Proof → print → delivery",
  },
] as const;

export function LandingSolution() {
  return (
    <section className="section section-rhythm bg-white border-y border-[var(--color-border)]">
      <div className="container">
        <LandingSectionHeader
          align="center"
          className="lg:mb-14 mx-auto"
          eyebrow="Your guide"
          title="Data and software — built for precise direct mail"
          description="Postcard Platform turns authoritative Census geo data into a clear workflow: see your audience, set your budget, and send with confidence."
        />

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6 mb-10 lg:mb-14 max-w-6xl mx-auto">
          <div className="lg:col-span-7">
            <LandingVisual
              src="/images/solution.jpg"
              alt="Postcard Platform solution showing targeted direct mail powered by data"
              aspect="wide"
              sizes="(max-width: 1024px) 100vw, 58vw"
              caption="Targeted campaigns driven by software, not guesswork"
            />
          </div>
          <div className="lg:col-span-5">
            <LandingVisual
              src="/images/data.jpg"
              alt="Census demographic data layers applied to geographic targeting"
              aspect="tall"
              sizes="(max-width: 1024px) 100vw, 38vw"
              caption="US Census ACS — income, movers, population by ZIP"
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6 max-w-6xl mx-auto">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="landing-pillar-card group">
              <p className="landing-pillar-metric">{pillar.metric}</p>
              <h3 className="mt-4 font-semibold text-xl tracking-tight text-[var(--color-bg-dark)]">
                {pillar.title}
              </h3>
              <p className="mt-3 landing-body text-[var(--color-text-secondary)] flex-1">
                {pillar.description}
              </p>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-[var(--color-accent)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
