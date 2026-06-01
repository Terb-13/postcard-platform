import {
  marketingContainer,
  marketingEyebrowWide,
  marketingSectionPy,
  marketingTitleMd,
  marketingValueBody,
  marketingValueIndex,
  marketingValueTitle,
} from "./marketing-design-system";

const VALUE_PROPS = [
  {
    index: "01",
    title: "Real Census Data",
    description:
      "Target by income, age, home ownership, and recent movers with actual U.S. Census data.",
  },
  {
    index: "02",
    title: "Live Map Targeting",
    description: "See exact reach and cost update in real time as you draw on the map.",
  },
  {
    index: "03",
    title: "Full Transparency",
    description: "Track every piece from design approval through delivery with photos.",
  },
  {
    index: "04",
    title: "Fast & Affordable",
    description: "Get campaigns in the mail in as little as 5 business days.",
  },
] as const;

/** redesign/index.html — Value proposition (#value) */
export function MarketingValueProps() {
  return (
    <section
      id="value"
      className={`scroll-mt-24 border-y border-gray-200 bg-white ${marketingSectionPy}`}
    >
      <div className={marketingContainer}>
        <header className="mb-12 text-center">
          <p className={`mb-3 ${marketingEyebrowWide}`}>WHY POSTCARD</p>
          <h2 className={marketingTitleMd}>Built for results, not guesswork.</h2>
        </header>

        <div className="grid gap-8 md:grid-cols-4">
          {VALUE_PROPS.map((item) => (
            <article key={item.index}>
              <p className={marketingValueIndex}>{item.index}</p>
              <p className={marketingValueTitle}>{item.title}</p>
              <p className={marketingValueBody}>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
