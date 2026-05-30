import { Visual } from "@/components/shared/Visual";
import { LandingSectionHeader } from "./LandingSectionHeader";

/** Asset: apps/web/public/images/marketing/solution.jpg (1408×768) */
const SOLUTION_IMAGE = "/images/marketing/solution.jpg";

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
    <section
      id="solution"
      className="section scroll-mt-24 border-y border-[var(--color-border)] bg-white"
    >
      <div className="container">
        <LandingSectionHeader
          align="center"
          eyebrow="Your guide"
          title="Precision targeting without the complexity"
          description="Postcard Platform combines authoritative geo data with a workflow built for operators — so you can see your audience, set your budget, and send with confidence."
          className="mx-auto mb-8 lg:mb-12"
        />

        <div className="mx-auto mb-10 max-w-5xl lg:mb-12">
          <Visual
            treatment="feature"
            aspectRatio="11/6"
            src={SOLUTION_IMAGE}
            alt="Targeted direct mail powered by Postcard Platform software"
            sizes="(max-width: 1024px) 100vw, 72vw"
          />
        </div>

        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3 lg:gap-6">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="landing-pillar-card group">
              <p className="landing-pillar-metric">{pillar.metric}</p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--color-bg-dark)]">
                {pillar.title}
              </h3>
              <p className="landing-body mt-3 flex-1 text-[var(--color-text-secondary)]">
                {pillar.description}
              </p>
              <div className="mt-6 hidden h-px w-full bg-gradient-to-r from-[var(--color-accent)]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
