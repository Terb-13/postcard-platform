import { Visual } from "@/components/shared/Visual";
import { LandingSectionHeader } from "./LandingSectionHeader";

/** Asset: apps/web/public/images/marketing/workflow.jpg (1408×768) */
const WORKFLOW_IMAGE = "/images/marketing/workflow.jpg";

const STEPS = [
  {
    step: "1",
    title: "Target with Census data",
    description: "Select ZIPs on the map or draw an area. Filter by income and mover rates.",
  },
  {
    step: "2",
    title: "Upload your artwork",
    description: "Add your postcard design. We prep print-ready files and proofs.",
  },
  {
    step: "3",
    title: "Review & pay",
    description: "Confirm reach, audience breakdown, and per-piece cost before you commit.",
  },
  {
    step: "4",
    title: "Print & deliver",
    description: "Drummond handles production and mailing. Track status end to end.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section bg-[var(--color-surface)] scroll-mt-24"
    >
      <div className="container">
        <LandingSectionHeader
          align="center"
          eyebrow="How it works"
          title="From targeting to mailbox in four steps."
          description="A clear, software-guided path from audience selection to delivery — built for operators, not agencies."
          className="mx-auto mb-8 lg:mb-10"
        />

        <div className="max-w-5xl mx-auto mb-8 lg:mb-10">
          {/* How it works: four-step workflow diagram — process explainer */}
          <Visual
            treatment="feature"
            aspectRatio="11/6"
            src={WORKFLOW_IMAGE}
            alt="Four-step Postcard Platform workflow from targeting through delivery"
            sizes="(max-width: 1024px) 100vw, 72vw"
          />
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {STEPS.map((item) => (
            <li key={item.step} className="text-center lg:text-left">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-accent)] text-sm font-bold text-[var(--color-accent)]">
                {item.step}
              </span>
              <h3 className="mt-4 font-semibold text-lg text-[var(--color-bg-dark)] tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
