import Link from "next/link";
import type { Product } from "@/lib/products";
import { buildCampaignWizardHref } from "@/lib/products";

type ProductFinalCtaProps = {
  product: Product;
};

export function ProductFinalCta({ product }: ProductFinalCtaProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#0A2540] px-6 py-12 text-center sm:px-12 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,165,233,0.35), transparent 70%)",
        }}
      />
      <div className="relative">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]">
          Ready to mail
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Launch your {product.shortTitle} campaign
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/80">
          Product and recommended size are pre-selected. Name your campaign, pick your audience on
          the map, and go live in days.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={buildCampaignWizardHref(product)}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-3xl bg-white px-10 py-3.5 text-base font-semibold text-[#0A2540] shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl sm:w-auto"
          >
            Get started — it&apos;s free to plan →
          </Link>
          <span className="text-sm text-white/70">{product.priceTeaser}</span>
        </div>
      </div>
    </section>
  );
}
