import { Visual } from "@/components/shared/Visual";
import { LandingSectionHeader } from "./LandingSectionHeader";

/** Asset: apps/web/public/images/marketing/solution.jpg (1408×768) */
const SOLUTION_IMAGE = "/images/marketing/solution.jpg";
/** Asset: apps/web/public/images/marketing/data.jpg (1280×896) */
const DATA_IMAGE = "/images/marketing/data.jpg";

const VALUES = [
  {
    title: "US Census ACS data",
    description: "Median income, population, and mover rates for every ZIP you select — authoritative, not estimated.",
  },
  {
    title: "Modern campaign software",
    description: "Target on a live map, preview reach and cost, upload creative, and checkout in one guided flow.",
  },
  {
    title: "Professional fulfillment",
    description: "Print and mail through Drummond with production status you can track from proof to delivery.",
  },
] as const;

export function LandingSolution() {
  return (
    <section id="solution" className="section section-rhythm bg-white border-y border-[var(--color-border)] scroll-mt-24">
      <div className="container">
        <LandingSectionHeader
          align="center"
          eyebrow="The solution"
          title="Reach the right people. Not everyone."
          description="Postcard Platform combines real Census geo data with a simple, modern workflow — so you mail with precision, not hope."
          className="mx-auto mb-12 lg:mb-16"
        />

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6 max-w-6xl mx-auto mb-12 lg:mb-16">
          <div className="lg:col-span-7">
            {/* Solution: targeted direct mail workflow — primary solution explainer */}
            <Visual
              treatment="feature"
              aspectRatio="11/6"
              src={SOLUTION_IMAGE}
              alt="Targeted direct mail powered by Postcard Platform software"
              sizes="(max-width: 1024px) 100vw, 56vw"
            />
          </div>
          <div className="lg:col-span-5">
            {/* Solution: Census demographic data overlay — supporting data visual */}
            <Visual
              treatment="feature"
              aspectRatio="10/7"
              src={DATA_IMAGE}
              alt="Census demographic data applied to ZIP-level geographic targeting"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>

        <ul className="grid gap-5 sm:grid-cols-3 max-w-6xl mx-auto">
          {VALUES.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 lg:p-7"
            >
              <h3 className="font-semibold text-lg text-[var(--color-bg-dark)] tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
