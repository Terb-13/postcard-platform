import {
  marketingContainer,
  marketingEyebrowWide,
  marketingSectionPy,
  marketingStepBadge,
  marketingStepBody,
  marketingStepTitle,
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

/** redesign/index.html — How it works (#how-it-works) */
export function MarketingHowItWorks() {
  return (
    <section id="how-it-works" className={`scroll-mt-24 ${marketingSectionPy}`}>
      <div className={marketingContainer}>
        <header className="mb-12 text-center">
          <p className={`mb-3 ${marketingEyebrowWide}`}>4 SIMPLE STEPS</p>
          <h2 className={marketingTitleLg}>How it works</h2>
        </header>

        <div className="grid gap-6 md:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className={marketingStepBadge}>{step.number}</div>
              <p className={marketingStepTitle}>{step.title}</p>
              <p className={marketingStepBody}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
