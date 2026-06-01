import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Product } from "@/lib/products";
import { buildCampaignWizardHref } from "@/lib/products";
import { marketingContainer, marketingEyebrow } from "@/components/marketing/marketing-design-system";

type ProductDetailHeroProps = {
  product: Product;
};

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  return (
    <section className="border-b border-gray-200 bg-gradient-to-b from-white to-[#fafaf9]">
      <div className={`${marketingContainer} py-6 sm:py-10 lg:py-14`}>
        <Link
          href="/products"
          className="inline-flex text-sm font-medium text-[#0A2540] transition-colors hover:text-[#0EA5E9]"
        >
          ← All Products
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Copy — full width on mobile, left column on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-6 xl:col-span-7">
            <p className={marketingEyebrow}>{product.shortTitle}</p>
            <h1 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-tighter text-[#0A2540] sm:text-5xl lg:text-[3.25rem]">
              {product.heroHighlight}
            </h1>
            <p className="mt-4 text-lg font-medium leading-snug text-[#0A2540]/85 sm:text-xl">
              {product.tagline}
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600">
              {product.description}
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white/80 px-3 py-2.5 text-sm text-gray-700 shadow-sm"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-white"
                    aria-hidden
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={buildCampaignWizardHref(product)}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-3xl bg-[#0A2540] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-black hover:shadow-xl sm:w-auto"
              >
                Start {product.shortTitle} campaign →
              </Link>
              <div className="text-center sm:text-left">
                <p className="text-lg font-semibold text-[#0A2540]">{product.priceTeaser}</p>
                <p className="text-xs text-gray-500">No payment until you approve your audience</p>
              </div>
            </div>
          </div>

          {/* Image — top on mobile for visual hook */}
          <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-5">
            <div className="relative overflow-hidden rounded-3xl bg-[#0A2540] shadow-2xl ring-1 ring-gray-200/80">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/40 via-transparent to-transparent z-10 pointer-events-none" />
              <Image
                src={product.heroImage}
                alt={product.title}
                width={900}
                height={600}
                className="aspect-[4/3] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5] lg:max-h-[520px]"
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  {product.title}
                </p>
                <p className="mt-1 text-sm font-medium text-white/90">{product.priceTeaser}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
