import Link from "next/link";
import { MarketingProductCard } from "./MarketingProductCard";
import {
  marketingContainer,
  marketingEyebrow,
  marketingSectionPy,
  marketingTitleProducts,
} from "./marketing-design-system";
import { MARKETING_PRODUCTS } from "./marketing-products";

/** redesign/index.html — Popular Products (#products) */
export function MarketingProductsGrid() {
  return (
    <section id="products" className={`scroll-mt-24 ${marketingSectionPy}`}>
      <div className={marketingContainer}>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className={`${marketingEyebrow} mb-0`}>Solutions</p>
            <h2 className={marketingTitleProducts}>Popular Products</h2>
          </div>
          <Link
            href="/direct-mail-marketing"
            className="hidden text-sm font-medium text-[#0EA5E9] hover:underline md:block"
          >
            Browse all products →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {MARKETING_PRODUCTS.map((product) => (
            <MarketingProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
