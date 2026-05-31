import Image from "next/image";
import { LandingSectionHeader } from "./LandingSectionHeader";

const STEPS = [
  {
    number: "1",
    title: "Design or choose",
    description:
      "Upload your postcard design or start from a template — we handle sizing and print-ready prep.",
  },
  {
    number: "2",
    title: "Target on the map",
    description:
      "Draw on the map, select ZIPs, or filter by real Census demographics. Reach updates live.",
  },
  {
    number: "3",
    title: "Review & pay",
    description:
      "See exact household count, audience breakdown, and per-piece cost before you approve.",
  },
  {
    number: "4",
    title: "Track results",
    description:
      "Follow your campaign from proof through print and delivery — know when mail hits mailboxes.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="section scroll-mt-24 bg-[var(--color-bg)]">
      <div className="container">
        <LandingSectionHeader
          align="center"
          eyebrow="4 simple steps"
          title="How it works"
          description="A guided flow designed for clarity — from first design to mail in the mailbox."
          className="mx-auto mb-10 max-w-3xl lg:mb-12"
        />

        <figure className="landing-visual relative mx-auto mb-12 max-w-6xl overflow-hidden rounded-3xl border border-[var(--color-border)] shadow-xl lg:mb-14">
          <Image
            src="/images/workflow.jpg"
            alt="Local business owner moving through the direct mail campaign workflow"
            width={1400}
            height={560}
            className="aspect-[21/9] w-full object-cover sm:aspect-[16/7]"
            sizes="(max-width: 1024px) 100vw, 72rem"
          />
          <div className="landing-visual-overlay" aria-hidden />
        </figure>

        <ol className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((item) => (
            <li key={item.number} className="text-center">
              <span className="landing-step-badge">{item.number}</span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-[var(--color-bg-dark)]">
                {item.title}
              </h3>
              <p className="landing-body mx-auto mt-2 max-w-[16rem] text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
