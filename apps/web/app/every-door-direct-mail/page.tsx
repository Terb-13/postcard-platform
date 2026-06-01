import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * Every Door Direct Mail landing page
 * Matches the structure and tone of redesign/every-door-direct-mail.html
 * while using the shared marketing chrome and real CTAs.
 */
export default function EveryDoorDirectMailPage() {
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
          Every Door Direct Mail
        </h1>
        <p className="mt-3 max-w-2xl text-xl text-gray-600">
          Reach every household in a neighborhood — no mailing list required.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold text-lg">Key Benefits</h3>
            <ul className="space-y-2.5 text-gray-700">
              <li className="flex items-start gap-2">✓ No mailing list needed</li>
              <li className="flex items-start gap-2">✓ Lowest cost per piece</li>
              <li className="flex items-start gap-2">✓ Great for brand awareness and local reach</li>
              <li className="flex items-start gap-2">✓ USPS discounts available</li>
            </ul>
          </div>

          <div className="flex items-start">
            <Link
              href="/campaigns/new?product=eddm"
              className="inline-flex w-full items-center justify-center rounded-3xl bg-[#0A2540] px-8 py-4 text-center text-lg font-semibold text-white transition hover:bg-black sm:w-auto"
            >
              Launch EDDM Map Tool
            </Link>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-10 text-sm text-gray-600">
          Ready to go broader?{" "}
          <Link href="/targeted-direct-mail" className="font-medium text-[#0EA5E9] hover:underline">
            Try Targeted Direct Mail →
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
