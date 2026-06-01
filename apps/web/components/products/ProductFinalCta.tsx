import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { buildCampaignWizardHref } from "@/lib/products";

type ProductFinalCtaProps = {
  product: Product;
};

export function ProductFinalCta({ product }: ProductFinalCtaProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#0A2540] px-6 py-14 text-center shadow-2xl sm:px-12 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(14,165,233,0.45), transparent 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#0EA5E9]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]">
          Ready to mail
        </p>
        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          Launch your {product.shortTitle} campaign today
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
          Product and recommended size are pre-selected. Name your campaign, draw your audience on
          the map, and see live Census counts before you pay.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href={buildCampaignWizardHref(product)}
            className="inline-flex min-h-[56px] w-full max-w-md items-center justify-center gap-2 rounded-3xl bg-white px-10 py-4 text-lg font-semibold text-[#0A2540] shadow-xl transition-all hover:scale-[1.02] hover:bg-gray-50 hover:shadow-2xl sm:w-auto"
          >
            Get started — free to plan
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
          <p className="text-sm text-white/60">
            {product.priceTeaser} · No credit card required to build your campaign
          </p>
        </div>
      </div>
    </section>
  );
}
