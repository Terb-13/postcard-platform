import type { Product } from "@/lib/products";
import { ProductBenefitIcon } from "./ProductBenefitIcon";

type ProductBenefitsGridProps = {
  product: Product;
};

export function ProductBenefitsGrid({ product }: ProductBenefitsGridProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]">
        Why {product.shortTitle}
      </p>
      <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#0A2540] sm:text-4xl">
        {product.benefitsHeadline}
      </h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600">
        {product.tagline}
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
        {product.benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="group flex gap-5 rounded-2xl border border-gray-200 bg-[#fafaf9]/50 p-5 transition-all hover:border-[#0EA5E9]/35 hover:bg-white hover:shadow-md sm:p-6"
          >
            <ProductBenefitIcon
              name={benefit.icon}
              className="transition-transform group-hover:scale-105"
            />
            <div className="min-w-0 pt-0.5">
              <h3 className="mb-2 text-lg font-semibold leading-snug text-[#0A2540]">
                {benefit.title}
              </h3>
              <p className="text-sm leading-[1.65] text-gray-600">{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
