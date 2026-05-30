import { LandingSectionHeader } from "./LandingSectionHeader";

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
    <section id="how-it-works" className="section scroll-mt-24 bg-[var(--color-surface)]">
      <div className="container">
        <LandingSectionHeader
          align="center"
          eyebrow="How it works"
          title="From targeting to mailbox in four steps"
          description="A guided flow designed for clarity — no agency hand-holding required."
          className="mx-auto mb-10 lg:mb-12"
        />

        <ol className="grid gap-6 sm:grid-cols-2 lg:hidden">
          {STEPS.map((item) => (
            <li key={item.step}>
              <StepCard {...item} />
            </li>
          ))}
        </ol>

        <ol className="landing-steps-rail hidden lg:grid lg:grid-cols-4">
          {STEPS.map((item, index) => (
            <li key={item.step} className="landing-step-cell">
              {index < STEPS.length - 1 && (
                <span className="landing-step-connector" aria-hidden />
              )}
              <StepCard {...item} />
            </li>
          ))}
        </ol>
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
    <div className="flex h-full flex-col">
      <span className="landing-step-index">{step}</span>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--color-bg-dark)]">
        {title}
      </h3>
      <p className="landing-body mt-2 flex-1 text-[var(--color-text-secondary)]">
        {description}
      </p>
    </div>
  );
}
