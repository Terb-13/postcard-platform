import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { buildCampaignWizardHref } from "@/lib/products";
import { marketingContainer, marketingEyebrow } from "@/components/marketing/marketing-design-system";

type ProductDetailHeroProps = {
  product: Product;
};

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className={`${marketingContainer} py-8 sm:py-12 lg:py-16`}>
        <Link
          href="/products"
          className="text-sm text-[#0A2540] transition-colors hover:text-[#0EA5E9]"
        >
          ← All Products
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="order-2 lg:order-1">
            <p className={marketingEyebrow}>{product.shortTitle}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tighter text-[#0A2540] sm:text-5xl lg:text-6xl">
              {product.title}
            </h1>
            <p className="mt-4 text-xl font-medium leading-snug text-[#0A2540] sm:text-2xl">
              {product.heroHighlight}
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              {product.description}
            </p>

            <ul className="mt-6 space-y-2.5">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700 sm:text-base">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0EA5E9]/15 text-[#0EA5E9]"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={buildCampaignWizardHref(product)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-3xl bg-[#0A2540] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-black"
              >
                Start {product.shortTitle} campaign →
              </Link>
              <span className="text-sm font-medium text-gray-600">{product.priceTeaser}</span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 shadow-lg ring-1 ring-gray-200/80 sm:aspect-[16/10]">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
