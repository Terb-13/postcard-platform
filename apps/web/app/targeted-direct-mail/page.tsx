import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * Targeted Direct Mail landing page
 * Matches the structure and tone of redesign/targeted-direct-mail.html
 */
export default function TargetedDirectMailPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />

      <main className="max-w-5xl mx-auto px-8 py-16">
        <Link
          href="/direct-mail-marketing"
          className="text-sm text-[#0A2540] hover:text-[#0EA5E9] transition-colors"
        >
          ← All Solutions
        </Link>

        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          Targeted Direct Mail
        </h1>
        <p className="mt-3 max-w-2xl text-xl text-gray-600">
          Reach the exact households most likely to become your customers using real Census data.
        </p>

        <div className="mt-12">
          <Link
            href="/campaigns/new?product=targeted"
            className="inline-flex items-center justify-center rounded-3xl bg-[#0A2540] px-10 py-4 text-lg font-semibold text-white transition hover:bg-black"
          >
            Start Targeting on the Map
          </Link>
        </div>

        <div className="mt-16 max-w-prose text-sm text-gray-600">
          Use income, home ownership, age, recent movers, and other verified Census filters.
          See live household counts and exact pricing update as you draw or filter on the map.
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
