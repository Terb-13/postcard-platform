import Image from "next/image";
import { LandingSectionHeader } from "./LandingSectionHeader";

const PILLARS = [
  {
    index: "01",
    title: "Real Census data",
    description:
      "Target by income, home ownership, and recent movers with actual U.S. Census ACS estimates on every ZIP.",
  },
  {
    index: "02",
    title: "Live map targeting",
    description:
      "See exact reach and cost update in real time as you draw on the map — no spreadsheets required.",
  },
  {
    index: "03",
    title: "Full transparency",
    description:
      "Review household count, audience breakdown, and per-piece cost before you commit to send.",
  },
  {
    index: "04",
    title: "Professional fulfillment",
    description:
      "From proof through print and delivery — track every piece with status you can trust.",
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
          eyebrow="Why Postcard"
          title="Built for results, not guesswork"
          description="Authoritative geo data and a workflow built for operators — see your audience, set your budget, and send with confidence."
          className="mx-auto mb-12 max-w-3xl lg:mb-16"
        />

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <figure className="landing-visual relative overflow-hidden rounded-3xl border border-[var(--color-border)] shadow-xl">
              <Image
                src="/images/solution.jpg"
                alt="Local business owner reviewing a successful direct mail campaign"
                width={1200}
                height={750}
                className="aspect-[16/10] w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="landing-visual-overlay" aria-hidden />
            </figure>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6 lg:gap-8">
            {PILLARS.slice(0, 2).map((pillar) => (
              <PillarBlock key={pillar.index} {...pillar} />
            ))}
          </div>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6 lg:order-2 lg:gap-8">
            {PILLARS.slice(2).map((pillar) => (
              <PillarBlock key={pillar.index} {...pillar} />
            ))}
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <figure className="landing-visual relative overflow-hidden rounded-3xl border border-[var(--color-border)] shadow-xl">
              <Image
                src="/images/data.jpg"
                alt="Census demographic data powering precise household targeting on a map"
                width={1200}
                height={750}
                className="aspect-[16/10] w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="landing-visual-overlay" aria-hidden />
            </figure>
            <p className="landing-body mt-5 max-w-md text-[var(--color-text-secondary)]">
              Real ACS data mapped to every boundary you select — so you mail to homes that match
              your ideal customer, not everyone in a ZIP.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarBlock({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <article className="landing-pillar-card border-[var(--color-border)] hover:border-[#0EA5E9]/30">
      <p className="landing-pillar-index">{index}</p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-[var(--color-bg-dark)]">
        {title}
      </h3>
      <p className="landing-body mt-2 text-[var(--color-text-secondary)]">{description}</p>
    </article>
  );
}
