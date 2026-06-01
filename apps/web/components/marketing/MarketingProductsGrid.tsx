import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import {
  marketingContainer,
  marketingEyebrow,
  marketingSectionPy,
  marketingTitleProducts,
} from "./marketing-design-system";
import { products } from "@/lib/products";

/** Homepage popular products — links to /products hub and detail pages */
export function MarketingProductsGrid() {
  return (
    <section id="products" className={`scroll-mt-24 ${marketingSectionPy}`}>
      <div className={marketingContainer}>
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={`${marketingEyebrow} mb-0`}>Solutions</p>
            <h2 className={marketingTitleProducts}>Popular Products</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[#0EA5E9] hover:text-[#0A2540] hover:underline"
          >
            Browse all products →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
