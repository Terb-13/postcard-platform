import type { MarketingProduct } from "./MarketingProductCard";

/** Product grid data — aligned with redesign/index.html “Popular Products” */
export const MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: "eddm",
    title: "Every Door Direct Mail",
    description: "Reach every household in a neighborhood without a mailing list.",
    price: "Starting at $0.19/piece",
    image: "/images/eddm-product.jpg",
    orderHref: "/campaigns/new?product=eddm",
  },
  {
    slug: "targeted",
    title: "Targeted Direct Mail",
    description: "Reach specific households using real Census demographics.",
    price: "Starting at $0.28/piece",
    image: "/images/targeted-product.jpg",
    orderHref: "/campaigns/new?product=targeted",
  },
  {
    slug: "saturation",
    title: "Saturation Mail",
    description: "Maximum reach within a defined geographic area.",
    price: "Starting at $0.17/piece",
    image: "/images/saturation-product.jpg",
    orderHref: "/campaigns/new?product=saturation",
  },
  {
    slug: "newmover",
    title: "New Mover Campaigns",
    description: "Target new residents as they move into your area.",
    price: "Starting at $0.32/piece",
    image: "/images/newmover-product.jpg",
    orderHref: "/campaigns/new?product=newmover",
  },
];
