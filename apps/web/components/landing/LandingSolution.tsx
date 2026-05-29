import { LandingSectionHeader } from "./LandingSectionHeader";

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
          className="lg:mb-16"
          eyebrow="Your guide"
          title="Precision targeting without the complexity"
          description="Postcard Platform combines authoritative geo data with a workflow built for operators — so you can see your audience, set your budget, and send with confidence."
        />

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
