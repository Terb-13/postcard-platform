import Link from "next/link";
import { AuthButtons } from "@/components/landing/AuthButtons";
import {
  marketingContainerNarrow,
  marketingCtaOutline,
  marketingSectionPy,
  marketingTitleCta,
} from "./marketing-design-system";

/** redesign/index.html — Final CTA */
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
            <Link href="#map-tool" className={marketingCtaOutline}>
              Try the Map Tool
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
