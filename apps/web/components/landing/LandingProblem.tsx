import { Visual } from "@/components/shared/Visual";
import { LandingSectionHeader } from "./LandingSectionHeader";

/** Asset: apps/web/public/images/marketing/problem.jpg (1280×896) */
const PROBLEM_IMAGE = "/images/marketing/problem.jpg";

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
    <section id="problem" className="section scroll-mt-24 bg-[var(--color-bg)]">
      <div className="container">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <LandingSectionHeader
              eyebrow="The challenge"
              title="Direct mail works — but untargeted mail doesn't"
              description={
                <>
                  You already know postcards can drive local business. The hard part is knowing{" "}
                  <span className="font-medium text-[var(--color-text)]">which</span> homes are
                  worth reaching — and proving it before you spend.
                </>
              }
            />
          </div>

          <div className="mt-8 grid gap-4 sm:gap-5 lg:col-span-7 lg:mt-0">
            {PAINS.map((pain, i) => (
              <article key={pain.title} className="landing-feature-row">
                <span className="landing-step-index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--color-bg-dark)] lg:text-xl">
                    {pain.title}
                  </h3>
                  <p className="landing-body mt-2 text-[var(--color-text-secondary)]">
                    {pain.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl lg:mt-12">
          <Visual
            treatment="feature"
            aspectRatio="10/7"
            src={PROBLEM_IMAGE}
            alt="Untargeted direct mail failing to reach the right households"
            sizes="(max-width: 1024px) 100vw, 56vw"
          />
        </div>
      </div>
    </section>
  );
}
