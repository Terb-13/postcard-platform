import { Visual } from "@/components/shared/Visual";
import { AuthButtons } from "./AuthButtons";

/** Asset: apps/web/public/images/marketing/hero.jpg (1408×768) */
const HERO_IMAGE = "/images/marketing/hero.jpg";

export function LandingHero() {
  return (
    <section className="section relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-[0.35] lg:block"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 30% 20%, black 15%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-2/3 bg-[radial-gradient(ellipse_at_top_right,rgba(10,102,194,0.07),transparent_60%)]"
        aria-hidden
      />

      <div className="container relative z-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12 xl:gap-20">
          <div className="max-w-3xl lg:max-w-none">
            <p className="landing-eyebrow mb-4 lg:mb-5">
              <span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 align-middle"
                aria-hidden
              />
              Census-powered direct mail
            </p>

            <h1 className="display-hero mb-5 text-[var(--color-bg-dark)] lg:mb-6">
              Precision targeting with{" "}
              <span className="text-[var(--color-accent)]">real Census data</span>
            </h1>

            <p className="landing-hero-lead mb-8 max-w-xl lg:mb-10">
              Stop mailing everyone in a ZIP. See median income, movers, and household reach on
              the map — then send with confidence through a guided workflow and professional
              fulfillment.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <AuthButtons variant="hero" />
              <a
                href="#demo"
                className="btn-secondary w-full justify-center text-[15px] sm:w-auto sm:min-w-[11rem] lg:px-8"
              >
                Try the live map
              </a>
            </div>

            <ul className="mt-8 flex flex-col gap-3 text-sm text-[var(--color-text-muted)] sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-x-8 lg:mt-12">
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                No credit card to explore
              </li>
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                US Census ACS estimates
              </li>
              <li className="flex items-center gap-2.5">
                <CheckIcon />
                Pay when you send
              </li>
            </ul>
          </div>

          <div className="mt-10 lg:mt-0">
            <Visual
              treatment="hero"
              aspectRatio="11/6"
              src={HERO_IMAGE}
              alt="Postcard Platform map interface with Census-powered household and income targeting"
              priority
              overlay
              sizes="(max-width: 1024px) 100vw, 46vw"
              containerClassName="shadow-[var(--shadow-xl)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-emerald-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
