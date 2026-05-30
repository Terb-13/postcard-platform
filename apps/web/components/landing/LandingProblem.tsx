import { LandingSectionHeader } from "./LandingSectionHeader";

const PAINS = [
  {
    title: "Blanket mail wastes budget",
    description:
      "Every household in a ZIP gets the same piece — including people who will never buy.",
  },
  {
    title: "Audience selection is a guess",
    description:
      "Without Census demographics, you can't see income or mover rates before you commit.",
  },
  {
    title: "No visibility until it's too late",
    description:
      "Quantity and cost are locked in before you know who you're actually mailing.",
  },
] as const;

export function LandingProblem() {
  return (
    <section id="problem" className="section scroll-mt-24 bg-[var(--color-bg)]">
      <div className="container">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <LandingSectionHeader
              eyebrow="The challenge"
              title="Direct mail works — untargeted mail doesn't"
              description="The hard part is knowing which homes are worth reaching — and proving it before you spend."
            />
          </div>

          <div className="mt-8 grid gap-4 lg:col-span-7 lg:mt-0">
            {PAINS.map((pain, i) => (
              <article key={pain.title} className="landing-feature-row">
                <span className="landing-step-index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--color-bg-dark)]">
                    {pain.title}
                  </h3>
                  <p className="landing-body mt-2 text-[var(--color-text-secondary)]">
                    {pain.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
