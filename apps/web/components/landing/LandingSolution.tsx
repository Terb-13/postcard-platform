const PILLARS = [
  {
    title: "Real Census data",
    description:
      "Median income, population, and mover rates from US Census ACS — mapped to every ZIP you select.",
    icon: DataIcon,
  },
  {
    title: "Simple, guided workflow",
    description:
      "Target on the map, upload artwork, review reach and cost, then checkout. One flow, no spreadsheets.",
    icon: FlowIcon,
  },
  {
    title: "Professional fulfillment",
    description:
      "Campaigns route to Drummond for print, mailing, and delivery — with status you can track end to end.",
    icon: FulfillmentIcon,
  },
] as const;

export function LandingSolution() {
  return (
    <section className="section bg-white border-y border-[var(--color-border)]">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-14">
          <p className="landing-eyebrow mb-3">Your guide</p>
          <h2 className="heading-lg text-[var(--color-bg-dark)] tracking-[-0.03em]">
            Precision targeting without the complexity
          </h2>
          <p className="mt-4 body-lg text-[var(--color-text-secondary)]">
            Postcard Platform combines authoritative geo data with a workflow built for operators —
            so you can see your audience, set your budget, and send with confidence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 sm:p-7"
            >
              <div className="h-10 w-10 rounded-xl bg-[var(--color-bg-dark)] text-white flex items-center justify-center mb-5">
                <pillar.icon />
              </div>
              <h3 className="font-semibold text-lg tracking-tight text-[var(--color-bg-dark)] mb-2">
                {pillar.title}
              </h3>
              <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DataIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function FlowIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function FulfillmentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}
