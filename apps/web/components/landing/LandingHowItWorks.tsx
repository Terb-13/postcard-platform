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
    <section id="how-it-works" className="section bg-white border-y border-[var(--color-border)] scroll-mt-20">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <p className="landing-eyebrow mb-3">How it works</p>
          <h2 className="heading-lg text-[var(--color-bg-dark)] tracking-[-0.03em]">
            From targeting to mailbox in four steps
          </h2>
          <p className="mt-4 body-lg text-[var(--color-text-secondary)]">
            A guided flow designed for clarity — no agency hand-holding required.
          </p>
        </div>

        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 max-w-6xl mx-auto">
          {STEPS.map((item, index) => (
            <li key={item.step} className="relative">
              {index < STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-5 left-[calc(50%+1.5rem)] w-[calc(100%-3rem)] h-px bg-[var(--color-border)]"
                  aria-hidden
                />
              )}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="font-mono text-sm font-semibold text-[var(--color-accent)] tracking-wider">
                  {item.step}
                </span>
                <div className="mt-4 h-px w-8 bg-[var(--color-bg-dark)] lg:hidden" aria-hidden />
                <h3 className="mt-4 font-semibold text-lg tracking-tight text-[var(--color-bg-dark)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto lg:mx-0">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
