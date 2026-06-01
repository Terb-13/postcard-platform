import { marketingSocialEyebrow } from "./marketing-design-system";

const BUSINESSES = [
  "Bloom & Co",
  "Riverside Cafe",
  "Summit Physical Therapy",
  "The Local Market",
  "Driftwood Coffee",
] as const;

/** redesign/index.html — Social proof navy band */
export function MarketingSocialProof() {
  return (
    <section id="results" className="scroll-mt-24 bg-[#0A2540] py-16 text-white">
      <div className="mx-auto max-w-5xl px-8 text-center">
        <p className={marketingSocialEyebrow}>
          TRUSTED BY LOCAL BUSINESSES ACROSS AMERICA
        </p>
        <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-8 opacity-90 md:grid-cols-5">
          {BUSINESSES.map((name) => (
            <li key={name} className="text-2xl font-semibold">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
