"use client";

import Link from "next/link";
import {
  marketingContainer,
  marketingEyebrow,
  marketingProductCard,
  marketingSectionPy,
  marketingTitleProducts,
} from "./marketing-design-system";

const products = [
  {
    slug: "eddm",
    title: "Every Door Direct Mail",
    description: "Reach every household in a neighborhood without a mailing list.",
    price: "Starting at $0.19/piece",
    image: "/images/eddm-product.jpg",
  },
  {
    slug: "targeted",
    title: "Targeted Direct Mail",
    description: "Reach specific households using real Census demographics.",
    price: "Starting at $0.28/piece",
    image: "/images/targeted-product.jpg",
  },
  {
    slug: "saturation",
    title: "Saturation Mail",
    description: "Maximum reach within a defined geographic area.",
    price: "Starting at $0.17/piece",
    image: "/images/saturation-product.jpg",
  },
  {
    slug: "newmover",
    title: "New Mover Campaigns",
    description: "Target new residents as they move into your area.",
    price: "Starting at $0.32/piece",
    image: "/images/newmover-product.jpg",
  },
] as const;

/** redesign/index.html — Popular Products */
export function MarketingProductsGrid() {
  return (
    <section id="products" className={`scroll-mt-24 ${marketingSectionPy}`}>
      <div className={marketingContainer}>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className={`${marketingEyebrow} mb-0 tracking-[1.5px]`}>Solutions</p>
            <h2 className={marketingTitleProducts}>Popular Products</h2>
          </div>
          <Link
            href="/direct-mail-marketing"
            className="hidden text-sm font-medium text-[#0EA5E9] hover:underline md:block"
          >
            Browse all solutions →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.slug} className={marketingProductCard}>
              <div className="mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <h3 className="mb-2 text-xl font-semibold text-[#0A2540]">{product.title}</h3>

              <p className="mb-4 text-sm leading-relaxed text-gray-600">{product.description}</p>

              <div className="flex items-center justify-between">
                <span className="rounded-2xl bg-gray-100 px-3 py-1 text-xs font-medium">
                  {product.price}
                </span>
                <Link
                  href={`/campaigns/new?product=${product.slug}`}
                  className="text-sm font-semibold text-[#0EA5E9] hover:text-[#0A2540]"
                >
                  Start Order →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
