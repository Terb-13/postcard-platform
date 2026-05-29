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
    <section id="problem" className="section bg-[var(--color-bg)] scroll-mt-20">
      <div className="container">
        <div className="max-w-2xl mb-12 sm:mb-14">
          <p className="landing-eyebrow mb-3">The challenge</p>
          <h2 className="heading-lg text-[var(--color-bg-dark)] tracking-[-0.03em]">
            Direct mail works — but untargeted mail doesn&apos;t
          </h2>
          <p className="mt-4 body-lg text-[var(--color-text-secondary)]">
            You already know postcards can drive local business. The hard part is knowing{" "}
            <em className="not-italic font-medium text-[var(--color-text)]">which</em> homes are
            worth reaching — and proving it before you spend.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PAINS.map((pain, i) => (
            <article key={pain.title} className="pain-card">
              <span className="text-micro font-mono font-semibold text-[var(--color-text-muted)]">
                0{i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-lg tracking-tight text-[var(--color-bg-dark)]">
                {pain.title}
              </h3>
              <p className="mt-2 text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                {pain.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
