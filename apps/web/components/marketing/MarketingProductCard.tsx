import Image from "next/image";
import Link from "next/link";
import { marketingProductCard } from "./marketing-design-system";

export type MarketingProduct = {
  slug: string;
  title: string;
  description: string;
  price: string;
  image: string;
  orderHref: string;
};

type MarketingProductCardProps = {
  product: MarketingProduct;
};

/** Single product tile — matches redesign/index.html “Popular Products” cards */
export function MarketingProductCard({ product }: MarketingProductCardProps) {
  return (
    <article className={marketingProductCard}>
      <div className="mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={product.image}
          alt={product.title}
          width={640}
          height={400}
          className="h-full w-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-[#0A2540]">{product.title}</h3>

      <p className="mb-4 text-sm leading-relaxed text-gray-600">{product.description}</p>

      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 rounded-2xl bg-gray-100 px-3 py-1 text-xs font-medium">
          {product.price}
        </span>
        <Link
          href={product.orderHref}
          className="text-sm font-semibold text-[#0EA5E9] hover:text-[#0A2540]"
        >
          Start Order →
        </Link>
      </div>
    </article>
  );
}
