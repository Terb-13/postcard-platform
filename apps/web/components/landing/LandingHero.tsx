import Image from "next/image";
import { AuthButtons } from "./AuthButtons";

function HeroCtaArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7V3"
      />
    </svg>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-bg-dark)] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(14,165,233,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#0EA5E9]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-8 pb-20 pt-16 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-x-2 rounded-3xl bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-medium">Trusted by thousands of local businesses</span>
            </div>

            <h1 className="mb-6 text-[clamp(2.75rem,6.5vw,4.5rem)] font-semibold leading-[1.05] tracking-tighter">
              Design, Target,
              <br />
              and Mail Postcard
              <br />
              Campaigns.
            </h1>

            <p className="mb-10 max-w-lg text-xl leading-relaxed text-white/75">
              The modern platform for local businesses to run precise, data-driven direct mail
              campaigns — powered by real Census data.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <AuthButtons variant="hero" ctaIcon={<HeroCtaArrow />} />
              <a href="#map-tool" className="btn-hero-outline">
                Launch Map Tool
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <div className="flex -space-x-2" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-[var(--color-bg-dark)] bg-white/90 shadow-sm"
                  />
                ))}
              </div>
              <span className="text-white/60">
                Join growing businesses using data-driven direct mail
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#0EA5E9]/25 to-transparent opacity-60 blur-xl lg:-inset-4"
                aria-hidden
              />
              <figure className="landing-visual relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
                <Image
                  src="/images/hero.jpg"
                  alt="Local business owner planning a precise direct mail campaign"
                  width={1280}
                  height={800}
                  className="aspect-[16/10] w-full object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-dark)]/60 via-[var(--color-bg-dark)]/15 to-transparent" />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
