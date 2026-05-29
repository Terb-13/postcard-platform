import { LandingSectionHeader } from "./LandingSectionHeader";

const PAINS = [
  {
    title: "Blanket mail wastes budget",
    description:
      "Every household in a ZIP gets the same piece — including people who will never buy. You pay for reach you don't need.",
  },
  {
    title: "Audience selection is a guess",
    description:
      "Spreadsheets, broker lists, and gut feel can't tell you median income or mover rates for the block you're targeting.",
  },
  {
    title: "No visibility until it's too late",
    description:
      "You commit to quantity and cost before you know who you're actually mailing — then hope the printer got it right.",
  },
] as const;

export function LandingProblem() {
  return (
    <section id="problem" className="section section-rhythm bg-[var(--color-bg)] scroll-mt-20">
      <div className="container">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 xl:gap-20 lg:items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <LandingSectionHeader
              eyebrow="The challenge"
              title="Direct mail works — but untargeted mail doesn't"
              description={
                <>
                  You already know postcards can drive local business. The hard part is knowing{" "}
                  <span className="font-medium text-[var(--color-text)]">which</span> homes are
                  worth reaching — and proving it before you spend.
                </>
              }
            />
          </div>

          <div className="lg:col-span-7 grid gap-4 sm:gap-5">
            {PAINS.map((pain, i) => (
              <article key={pain.title} className="landing-feature-row">
                <span className="landing-step-index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="font-semibold text-lg lg:text-xl tracking-tight text-[var(--color-bg-dark)]">
                    {pain.title}
                  </h3>
                  <p className="mt-2 landing-body text-[var(--color-text-secondary)]">
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
