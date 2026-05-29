import { Visual } from "@/components/shared/Visual";
import { AuthButtons } from "./AuthButtons";
import { LandingSectionHeader } from "./LandingSectionHeader";

/** Asset: apps/web/public/images/marketing/hero.jpg (1408×768) */
const HERO_IMAGE = "/images/marketing/hero.jpg";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container relative z-10 pt-14 pb-14 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-24 lg:items-center">
          <div className="max-w-xl lg:max-w-none">
            <LandingSectionHeader
              titleAs="h1"
              eyebrow="Postcard Platform"
              title="Target the right homes with real data."
              description="Precision direct mail powered by Census data — simple, modern, and effective."
              className="mb-8 lg:mb-10"
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <AuthButtons variant="hero" />
              <a
                href="#demo"
                className="btn-secondary w-full sm:w-auto justify-center text-[15px]"
              >
                See it in action
              </a>
            </div>

            <ul className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-2.5 text-sm text-[var(--color-text-muted)]">
              <li>Live Census ACS on every ZIP</li>
              <li className="hidden sm:list-item">No credit card to explore</li>
              <li className="hidden md:list-item">Pay when you send</li>
            </ul>
          </div>

          <div className="mt-10 lg:mt-0">
            {/* Hero: Census-powered targeting map — primary value proposition visual */}
            <Visual
              treatment="hero"
              aspectRatio="11/6"
              src={HERO_IMAGE}
              alt="Postcard Platform map interface with Census-powered household and income targeting"
              priority={true}
              sizes="(max-width: 1024px) 100vw, 46vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
