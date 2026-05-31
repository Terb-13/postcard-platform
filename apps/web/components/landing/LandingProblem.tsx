import Image from "next/image";
import { LandingSectionHeader } from "./LandingSectionHeader";

const PAINS = [
  {
    title: "Blanket mail wastes budget",
    description:
      "Every household in a ZIP gets the same piece — including people who will never buy.",
  },
  {
    title: "Audience selection is a guess",
    description:
      "Without Census demographics, you can't see income or mover rates before you commit.",
  },
  {
    title: "No visibility until it's too late",
    description:
      "Quantity and cost are locked in before you know who you're actually mailing.",
  },
] as const;

export function LandingProblem() {
  return (
    <section id="problem" className="section scroll-mt-24 bg-[var(--color-bg)]">
      <div className="container">
        <LandingSectionHeader
          eyebrow="The challenge"
          title="Direct mail works — untargeted mail doesn't"
          description="The hard part is knowing which homes are worth reaching — and proving it before you spend."
          className="mb-10 max-w-3xl lg:mb-14"
        />

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <figure className="landing-visual relative overflow-hidden rounded-3xl border border-[var(--color-border)] shadow-xl">
              <Image
                src="/images/problem.jpg"
                alt="Local business owner frustrated by wasted direct mail spend"
                width={1400}
                height={933}
                className="aspect-[3/2] w-full object-cover lg:aspect-[16/10]"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="landing-visual-overlay" aria-hidden />
            </figure>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
            {PAINS.map((pain, index) => (
              <article key={pain.title} className="pain-card">
                <p className="landing-pillar-index text-base">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--color-bg-dark)]">
                  {pain.title}
                </h3>
                <p className="landing-body mt-2 text-[var(--color-text-secondary)]">
                  {pain.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
