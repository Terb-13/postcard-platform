import {
  bodyText,
  marketingContainer,
  marketingSectionPy,
  marketingTitleLg,
} from "./marketing-design-system";

const STEPS = [
  {
    number: "1",
    title: "Design or Choose",
    description: "Upload your design or pick from hundreds of professional templates.",
  },
  {
    number: "2",
    title: "Target on the Map",
    description: "Draw on the map or filter by real Census demographics.",
  },
  {
    number: "3",
    title: "Review & Pay",
    description: "See exact pricing and approve your campaign.",
  },
  {
    number: "4",
    title: "Track Results",
    description: "Get notified when your mail hits mailboxes with proof of delivery.",
  },
] as const;

/** Matches prototype How It Works — clean, confident 4-step flow */
export function MarketingHowItWorks() {
  return (
    <section id="how-it-works" className={`scroll-mt-24 ${marketingSectionPy}`}>
      <div className={marketingContainer}>
        <header className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]">
            4 SIMPLE STEPS
          </p>
          <h2 className={marketingTitleLg}>How it works</h2>
        </header>

        <div className="grid gap-8 md:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0A2540] text-2xl font-semibold text-white">
                {step.number}
              </div>
              <p className="mb-3 text-lg font-semibold text-[#0A2540]">{step.title}</p>
              <p className={bodyText}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
