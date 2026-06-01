import type { Product } from "@/lib/products";
import { ProductBenefitIcon } from "./ProductBenefitIcon";

type ProductBenefitsGridProps = {
  product: Product;
};

export function ProductBenefitsGrid({ product }: ProductBenefitsGridProps) {
  return (
    <section>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]">
        Why {product.shortTitle}
      </p>
      <h2 className="mb-8 text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
        Built for results, not guesswork
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {product.benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-[#0EA5E9]/30 sm:p-6"
          >
            <ProductBenefitIcon name={benefit.icon} />
            <div className="min-w-0">
              <h3 className="mb-1 font-semibold text-[#0A2540]">{benefit.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
