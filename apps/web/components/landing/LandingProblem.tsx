import { Visual } from "@/components/shared/Visual";
import { LandingSectionHeader } from "./LandingSectionHeader";

/** Asset: apps/web/public/images/marketing/problem.jpg (1280×896) */
const PROBLEM_IMAGE = "/images/marketing/problem.jpg";

const PAINS = [
  {
    title: "You're paying to reach everyone",
    description:
      "Blanket ZIP mail hits households that will never buy — budget spent on noise, not opportunity.",
  },
  {
    title: "Targeting is guesswork",
    description:
      "Without real demographics, you can't see income, movers, or household density before you commit.",
  },
  {
    title: "No proof before you print",
    description:
      "Quantity and cost are locked in before you know who you're actually mailing.",
  },
] as const;

export function LandingProblem() {
  return (
    <section id="problem" className="section section-rhythm bg-[var(--color-bg)] scroll-mt-24">
      <div className="container">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-20 lg:items-center">
          <div className="space-y-8 lg:space-y-10">
            <LandingSectionHeader
              eyebrow="The problem"
              title="Most direct mail gets ignored."
              description="When you can't target with confidence, every postcard is a gamble — and wasted spend adds up fast."
            />

            <ul className="space-y-4">
              {PAINS.map((pain) => (
                <li
                  key={pain.title}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-5 sm:px-6"
                >
                  <h3 className="font-semibold text-[var(--color-bg-dark)] tracking-tight">
                    {pain.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                    {pain.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Problem: untargeted direct mail / wasted reach — problem section explainer */}
          <Visual
            treatment="feature"
            aspectRatio="10/7"
            src={PROBLEM_IMAGE}
            alt="Untargeted direct mail failing to reach the right households"
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="mt-10 lg:mt-0"
          />
        </div>
      </div>
    </section>
  );
}
