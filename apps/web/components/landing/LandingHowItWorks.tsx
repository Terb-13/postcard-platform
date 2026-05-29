import { LandingSectionHeader } from "./LandingSectionHeader";
import { LandingVisual } from "./LandingVisual";

const STEPS = [
  {
    step: "01",
    title: "Target with Census data",
    description:
      "Search ZIPs, click boundaries on the map, or draw a custom area. Filter by income and mover rates.",
  },
  {
    step: "02",
    title: "Upload your artwork",
    description:
      "Drop in your postcard design. We handle sizing, proofing, and print-ready preparation.",
  },
  {
    step: "03",
    title: "Review reach & pay",
    description:
      "See household count, audience breakdown, and per-piece cost before you commit.",
  },
  {
    step: "04",
    title: "Drummond prints & ships",
    description:
      "Your campaign goes to production. Track status from proof through delivery.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section section-rhythm bg-[var(--color-bg)] border-b border-[var(--color-border)] scroll-mt-20"
    >
      <div className="container">
        <LandingSectionHeader
          align="center"
          className="lg:mb-14 mx-auto"
          eyebrow="How it works"
          title="From targeting to mailbox in four steps"
          description="A software-guided workflow — the same engine you&apos;ll use in the live demo below."
        />

        <div className="lg:grid lg:grid-cols-12 lg:gap-14 xl:gap-16 lg:items-start">
          <div className="lg:col-span-7 mb-10 lg:mb-0">
            <LandingVisual
              src="/images/workflow.jpg"
              alt="Postcard Platform campaign workflow from targeting through fulfillment"
              aspect="wide"
              sizes="(max-width: 1024px) 100vw, 55vw"
              caption="End-to-end workflow — built into the product"
            />
          </div>

          <ol className="lg:col-span-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:gap-7">
            {STEPS.map((item) => (
              <li key={item.step}>
                <StepCard {...item} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="landing-feature-row h-full lg:border-0 lg:shadow-none lg:bg-transparent lg:p-0 lg:hover:shadow-none lg:hover:border-transparent">
      <span className="landing-step-index lg:w-auto">{step}</span>
      <div className="min-w-0">
        <h3 className="font-semibold text-lg tracking-tight text-[var(--color-bg-dark)]">{title}</h3>
        <p className="mt-2 landing-body text-[var(--color-text-secondary)]">{description}</p>
      </div>
    </div>
  );
}
