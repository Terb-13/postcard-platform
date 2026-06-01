import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { buildCampaignWizardHref } from "@/lib/products";
import { marketingProductCard } from "@/components/marketing/marketing-design-system";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={`${marketingProductCard} flex h-full flex-col`}>
      <Link href={`/products/${product.slug}`} className="block flex-1">
        <div className="mb-4 aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 sm:mb-5">
          <Image
            src={product.image}
            alt={product.title}
            width={640}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]">
          {product.shortTitle}
        </p>
        <h3 className="mb-2 text-lg font-semibold text-[#0A2540] sm:text-xl">{product.title}</h3>
        <p className="mb-1 text-sm font-medium leading-snug text-[#0A2540]/90">
          {product.heroHighlight}
        </p>
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">{product.tagline}</p>
      </Link>

      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="w-fit rounded-2xl bg-gray-100 px-3 py-1.5 text-xs font-medium text-[#0A2540]">
          {product.priceTeaser}
        </span>
        <Link
          href={buildCampaignWizardHref(product)}
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[#0EA5E9] hover:text-[#0A2540]"
        >
          Start order →
        </Link>
      </div>
    </article>
  );
}
