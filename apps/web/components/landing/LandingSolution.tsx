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
      "Target on the map, upload artwork, review reach and cost, then checkout. One flow.",
    metric: "5-step campaign wizard",
  },
  {
    title: "Professional fulfillment",
    description:
      "Campaigns route to Drummond for print, mailing, and delivery — with status you can track.",
    metric: "Proof → print → delivery",
  },
] as const;

export function LandingSolution() {
  return (
    <section
      id="solution"
      className="section scroll-mt-24 border-y border-[var(--color-border)] bg-white"
    >
      <div className="container">
        <LandingSectionHeader
          align="center"
          eyebrow="The solution"
          title="Precision targeting without the complexity"
          description="Authoritative geo data plus a workflow built for operators — see your audience, set your budget, send with confidence."
          className="mx-auto mb-10 lg:mb-12"
        />

        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3 lg:gap-6">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="landing-pillar-card">
              <p className="landing-pillar-metric">{pillar.metric}</p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--color-bg-dark)]">
                {pillar.title}
              </h3>
              <p className="landing-body mt-3 text-[var(--color-text-secondary)]">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
