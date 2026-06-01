import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingTargetingDemo } from "@/components/marketing/MarketingTargetingDemo";

/**
 * Dedicated Precision Targeting Map Tool page.
 * Uses the exact same live, Census-powered component that appears on the homepage
 * (styled to match redesign/map-tool.html + redesign/index.html).
 * This gives the interactive tool its own clean URL for direct linking and marketing.
 */
export default function MapToolPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Link href="/" className="hover:text-[#0A2540]">← Back to Home</Link>
                <span className="text-gray-300">/</span>
                <span>Map Tool</span>
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">Targeting Map</h1>
              <p className="text-gray-600">
                Select areas using real Census data • Live pricing updates
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/sign-up"
                className="rounded-2xl border px-5 py-2.5 text-sm font-medium text-[#0A2540] hover:bg-gray-50"
              >
                Save Targeting
              </Link>
              <Link
                href="/campaigns/new"
                className="rounded-2xl bg-[#0A2540] px-6 py-2.5 text-sm font-semibold text-white hover:bg-black"
              >
                Continue to Design
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* The full interactive demo (3-column layout with live panels) */}
      <div className="pb-12">
        <MarketingTargetingDemo />
      </div>

      <MarketingFooter />
    </div>
  );
}

