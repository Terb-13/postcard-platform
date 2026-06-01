import Link from "next/link";
import { AuthButtons } from "@/components/landing/AuthButtons";
import {
  bodyText,
  marketingContainerNarrow,
  marketingSectionPy,
  marketingTitleCta,
} from "./marketing-design-system";

/** redesign/index.html — Final CTA (centered, confident, text-only) */
export function MarketingFinalCta() {
  return (
    <section className={`scroll-mt-24 ${marketingSectionPy}`}>
      <div className={marketingContainerNarrow}>
        <div className="text-center">
          <h2 className={`${marketingTitleCta} mb-6`}>
            Ready to run smarter direct mail?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-xl text-gray-600">
            Join thousands of local businesses using data to grow.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <AuthButtons variant="marketing-final" />
            <Link
              href="#map-tool"
              className="inline-flex items-center justify-center rounded-3xl border-2 border-[#0A2540] bg-transparent px-10 py-4 text-lg font-semibold text-[#0A2540] transition-colors hover:bg-gray-50"
            >
              Try the Map Tool
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
