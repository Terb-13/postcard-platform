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
    <section
      id="how-it-works"
      className="section section-rhythm bg-white border-b border-[var(--color-border)] scroll-mt-20"
    >
      <div className="container">
        <LandingSectionHeader
          align="center"
          className="lg:mb-16 mx-auto"
          eyebrow="How it works"
          title="From targeting to mailbox in four steps"
          description="A guided flow designed for clarity — no agency hand-holding required."
        />

        {/* Mobile / tablet: stacked steps */}
        <ol className="grid gap-8 sm:grid-cols-2 lg:hidden">
          {STEPS.map((item) => (
            <li key={item.step}>
              <StepCard {...item} />
            </li>
          ))}
        </ol>

        {/* Desktop: unified step rail */}
        <ol className="hidden lg:grid lg:grid-cols-4 landing-steps-rail">
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
    <div className="h-full flex flex-col">
      <span className="landing-step-index">{step}</span>
      <h3 className="mt-5 font-semibold text-lg tracking-tight text-[var(--color-bg-dark)]">{title}</h3>
      <p className="mt-2 landing-body text-[var(--color-text-secondary)] flex-1">{description}</p>
    </div>
  );
}
