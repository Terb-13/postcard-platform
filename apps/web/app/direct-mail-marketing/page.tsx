import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * Direct Mail Marketing Solutions hub
 * Matches the structure and tone of redesign/direct-mail-marketing.html
 */
export default function DirectMailMarketingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />

      <main>
        {/* Hero band */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-8 py-16">
            <h1 className="text-6xl font-semibold tracking-tighter">
              Direct Mail Marketing Solutions
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-600">
              Choose the right approach for your business. All powered by the same powerful
              targeting platform with live Census data and real pricing.
            </p>
          </div>
        </div>

        {/* Solutions grid */}
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/every-door-direct-mail"
              className="group block rounded-3xl border border-gray-200 bg-white p-8 transition hover:border-[#0EA5E9]/40"
            >
              <div className="font-semibold text-2xl mb-3 group-hover:text-[#0EA5E9]">
                Every Door Direct Mail
              </div>
              <p className="text-gray-600">
                Reach every address in a neighborhood without a mailing list. Lowest cost option for
                broad local awareness.
              </p>
              <div className="mt-6 text-sm font-semibold text-[#0EA5E9]">
                Learn more →
              </div>
            </Link>

            <Link
              href="/targeted-direct-mail"
              className="group block rounded-3xl border border-gray-200 bg-white p-8 transition hover:border-[#0EA5E9]/40"
            >
              <div className="font-semibold text-2xl mb-3 group-hover:text-[#0EA5E9]">
                Targeted Direct Mail
              </div>
              <p className="text-gray-600">
                Reach specific households using real Census demographics — income, homeowners,
                recent movers, and more. Highest precision and ROI.
              </p>
              <div className="mt-6 text-sm font-semibold text-[#0EA5E9]">
                Start targeting →
              </div>
            </Link>

            <Link
              href="/campaigns/new?product=saturation"
              className="group block rounded-3xl border border-gray-200 bg-white p-8 transition hover:border-[#0EA5E9]/40"
            >
              <div className="font-semibold text-2xl mb-3 group-hover:text-[#0EA5E9]">
                Saturation Mail
              </div>
              <p className="text-gray-600">
                Maximum reach within a defined geographic area at the lowest possible cost per piece.
                Ideal for retail and restaurants.
              </p>
              <div className="mt-6 text-sm font-semibold text-[#0EA5E9]">
                Launch campaign →
              </div>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/#map-tool"
              className="inline-flex items-center justify-center rounded-3xl border-2 border-[#0A2540] px-8 py-3 text-sm font-semibold text-[#0A2540] transition hover:bg-gray-50"
            >
              Try the Precision Targeting Map
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
