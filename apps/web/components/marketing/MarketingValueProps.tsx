import {
  marketingContainer,
  marketingEyebrow,
  marketingSectionPy,
  marketingTitleMd,
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

/** redesign/index.html — Value proposition (text only, 4 columns) */
export function MarketingValueProps() {
  return (
    <section
      id="value"
      className={`scroll-mt-24 border-y border-gray-200 bg-white ${marketingSectionPy}`}
    >
      <div className={marketingContainer}>
        <header className="mb-12 text-center">
          <p className={`${marketingEyebrow} mb-3`}>Why Postcard</p>
          <h2 className={marketingTitleMd}>Built for results, not guesswork.</h2>
        </header>

        <div className="grid gap-8 md:grid-cols-4">
          {VALUE_PROPS.map((item) => (
            <article key={item.index}>
              <p className="mb-3 text-3xl font-semibold text-[#0EA5E9]">{item.index}</p>
              <h3 className="mb-2 text-xl font-semibold text-[#0A2540]">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
