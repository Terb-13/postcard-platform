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
    title: "Review your quote",
    description:
      "See household counts and a live estimate. This is not checkout and not a mail drop.",
  },
] as const;

/** redesign/index.html — How it works (#how-it-works) */
export function MarketingHowItWorks() {
  return (
    <section id="how-it-works" className={`scroll-mt-24 ${marketingSectionPy}`}>
      <div className={marketingContainer}>
        <header className="mb-12 text-center">
          <p className={`mb-3 ${marketingEyebrowWide}`}>3 SIMPLE STEPS</p>
          <h2 className={marketingTitleLg}>How it works</h2>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
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
