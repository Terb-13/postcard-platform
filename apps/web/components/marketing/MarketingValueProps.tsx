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
      "Target by income and recent movers with actual U.S. Census data.",
  },
  {
    index: "02",
    title: "Live Map Targeting",
    description: "See exact reach and cost update in real time as you draw on the map.",
  },
  {
    index: "03",
    title: "Full Transparency",
    description:
      "Household counts come from published U.S. Census data you can inspect on the map.",
  },
  {
    index: "04",
    title: "Quote Before You Commit",
    description:
      "See ZIP reach and a live estimate on the map. This is not a live mail drop.",
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
