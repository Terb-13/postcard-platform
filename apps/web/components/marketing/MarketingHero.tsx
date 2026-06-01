import Image from "next/image";
import Link from "next/link";
import { AuthButtons } from "@/components/landing/AuthButtons";
import { marketingContainer, marketingHeroTitle } from "./marketing-design-system";

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

/** redesign/index.html — Hero */
export function MarketingHero() {
  return (
    <section className="relative bg-[#0A2540] text-white">
      <div className={`${marketingContainer} pb-20 pt-16`}>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-x-2 rounded-3xl bg-white/10 px-4 py-1.5 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-medium">Trusted by 60,000+ marketers</span>
            </div>

            <h1 className={`${marketingHeroTitle} mb-6`}>
              Design, Target,
              <br />
              and Mail Postcard
              <br />
              Campaigns.
            </h1>

            <p className="mb-10 max-w-lg text-xl text-white/75">
              The modern platform for local businesses to run precise, data-driven direct mail
              campaigns — powered by real Census data.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <AuthButtons variant="hero" ctaIcon={<HeroCtaArrow />} />
              <Link href="/products" className="btn-hero-outline">
                Browse All Products
              </Link>
              <a href="#map-tool" className="btn-hero-outline">
                Launch Map Tool
              </a>
            </div>

            <div className="mt-8 flex items-center gap-x-6 text-sm">
              <div className="flex -space-x-2" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border border-[#0A2540] bg-white"
                  />
                ))}
              </div>
              <span className="text-white/60">Join 12,400 businesses this month</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
              <Image
                src="/images/hero.jpg"
                alt="Local business owner planning a precise direct mail campaign"
                width={1280}
                height={800}
                className="aspect-[16/10] w-full object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540]/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
