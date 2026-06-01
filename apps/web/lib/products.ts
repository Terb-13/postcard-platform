/**
 * Product catalog — single source of truth for marketing pages and campaign wizard pre-selection.
 */

export type PostcardSize = "4x6" | "5x7" | "6x9" | "6x11";

export type ProductBenefitIcon =
  | "reach"
  | "pricing"
  | "speed"
  | "targeting"
  | "scale"
  | "transparency";

export type ProductBenefit = {
  title: string;
  description: string;
  icon: ProductBenefitIcon;
};

export type ProductSize = {
  value: PostcardSize;
  label: string;
  description: string;
  /** Physical dimensions for display */
  dimensions?: string;
  /** Shown on product detail + wizard when this size is the product default */
  recommended?: boolean;
};

export type Product = {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  /** Persuasive one-liner for product detail hero */
  heroHighlight: string;
  description: string;
  image: string;
  priceTeaser: string;
  /** Explains why the default size fits this product */
  sizeRecommendationNote: string;
  /** Maps to backend campaign.productType */
  productType: "EDDM" | "TARGETED";
  defaultSize: PostcardSize;
  sizes: ProductSize[];
  features: string[];
  benefits: ProductBenefit[];
  idealFor: string[];
};

export const POSTCARD_SIZES: ProductSize[] = [
  { value: "6x11", label: "6×11″", description: "Every Door Direct Mail standard", recommended: true },
  { value: "6x9", label: "6×9″", description: "Bold presence, great for offers" },
  { value: "5x7", label: "5×7″", description: "Room for more copy and imagery" },
  { value: "4x6", label: "4×6″", description: "Classic postcard, lowest cost" },
];

export const products: Product[] = [
  {
    slug: "every-door-direct-mail",
    title: "Every Door Direct Mail",
    shortTitle: "EDDM",
    tagline: "Reach every household in a neighborhood — no mailing list required.",
    heroHighlight: "Blanket entire neighborhoods. No list. No waste.",
    description:
      "Blanket entire carrier routes with oversized postcards. Perfect for local businesses that want maximum visibility in a defined area.",
    image: "/images/eddm-product.jpg",
    priceTeaser: "Starting at $0.19/piece",
    sizeRecommendationNote:
      "6×11″ is the USPS Every Door standard — maximum mailbox presence and the format carriers expect on EDDM routes.",
    productType: "EDDM",
    defaultSize: "6x11",
    sizes: [
      {
        value: "6x11",
        label: "6×11″ EDDM",
        dimensions: "11″ × 6″",
        description: "USPS Every Door standard — dominates the mailbox",
        recommended: true,
      },
      {
        value: "6x9",
        label: "6×9″",
        dimensions: "9″ × 6″",
        description: "Strong offer presence at a lower per-piece cost",
      },
    ],
    features: [
      "No mailing list required",
      "USPS carrier route targeting",
      "Interactive map selection",
      "Census household counts",
    ],
    benefits: [
      {
        title: "Maximum neighborhood visibility",
        description: "Every deliverable address on your selected routes receives your piece.",
        icon: "reach",
      },
      {
        title: "Predictable per-piece pricing",
        description: "See household counts and cost before you commit — no surprises.",
        icon: "pricing",
      },
      {
        title: "Launch in days, not weeks",
        description: "Pick routes on the map, upload artwork, and mail in as little as 5 days.",
        icon: "speed",
      },
      {
        title: "Built for local businesses",
        description: "Grand openings, seasonal promos, and route-based awareness that drives foot traffic.",
        icon: "scale",
      },
    ],
    idealFor: ["Restaurants", "Home services", "Retail stores", "Real estate"],
  },
  {
    slug: "targeted-direct-mail",
    title: "Targeted Direct Mail",
    shortTitle: "Targeted",
    tagline: "Reach specific households using real Census demographics.",
    heroHighlight: "Mail only to households that match your ideal customer.",
    description:
      "Filter by income, home ownership, age, and more. Spend your budget on the households most likely to respond.",
    image: "/images/targeted-product.jpg",
    priceTeaser: "Starting at $0.28/piece",
    sizeRecommendationNote:
      "6×9″ balances impact and cost for targeted drops — enough room for a compelling offer without overspending on postage.",
    productType: "TARGETED",
    defaultSize: "6x9",
    sizes: [
      {
        value: "6x9",
        label: "6×9″",
        dimensions: "9″ × 6″",
        description: "Best balance of impact and cost for targeted lists",
        recommended: true,
      },
      {
        value: "6x11",
        label: "6×11″",
        dimensions: "11″ × 6″",
        description: "Premium oversized format for high-value offers",
      },
      {
        value: "5x7",
        label: "5×7″",
        dimensions: "7″ × 5″",
        description: "More room for personalized copy and imagery",
      },
      {
        value: "4x6",
        label: "4×6″",
        dimensions: "6″ × 4″",
        description: "Efficient format for narrow, high-intent audiences",
      },
    ],
    features: [
      "Census demographic filters",
      "Household-level targeting",
      "Live audience estimates",
      "Saved map selections",
    ],
    benefits: [
      {
        title: "Higher response rates",
        description: "Filter out low-fit households so every piece works harder.",
        icon: "targeting",
      },
      {
        title: "Real Census demographics",
        description: "Income, home ownership, age, and more — not purchased lists.",
        icon: "transparency",
      },
      {
        title: "Geography + filters combined",
        description: "Draw on the map, then refine by the attributes that matter to you.",
        icon: "reach",
      },
      {
        title: "Transparent reach before you pay",
        description: "Live household counts update as you adjust targeting.",
        icon: "pricing",
      },
    ],
    idealFor: ["Financial services", "Healthcare", "Luxury home services", "B2B local"],
  },
  {
    slug: "discount-zones",
    title: "Discount Zones",
    shortTitle: "Discount Zones",
    tagline: "High-volume drops in select markets at reduced rates.",
    heroHighlight: "Our lowest rates — available in pre-negotiated partner markets.",
    description:
      "Pre-negotiated zone pricing for businesses willing to mail on shared schedules. Same quality, lower cost in eligible areas.",
    image: "/images/targeted-product.jpg",
    priceTeaser: "Starting at $0.15/piece",
    sizeRecommendationNote:
      "6×11″ EDDM in discount zones delivers the best cost-per-impression — our most popular format for zone drops.",
    productType: "EDDM",
    defaultSize: "6x11",
    sizes: [
      {
        value: "6x11",
        label: "6×11″ EDDM",
        dimensions: "11″ × 6″",
        description: "Best value in discount zones — full mailbox impact",
        recommended: true,
      },
      {
        value: "6x9",
        label: "6×9″",
        dimensions: "9″ × 6″",
        description: "Compact format to stretch zone budgets further",
      },
    ],
    features: [
      "Zone-based pricing",
      "Shared print schedules",
      "Minimum volume tiers",
      "Same map targeting tools",
    ],
    benefits: [
      {
        title: "Lowest per-piece rates",
        description: "Pre-negotiated pricing in eligible markets beats standard drops.",
        icon: "pricing",
      },
      {
        title: "Built for repeat mailers",
        description: "Lock in zone rates for monthly or seasonal campaigns.",
        icon: "scale",
      },
      {
        title: "More households, same budget",
        description: "Stretch spend across more addresses without sacrificing quality.",
        icon: "reach",
      },
      {
        title: "Priority partner slots",
        description: "Reserved production windows in high-demand markets.",
        icon: "speed",
      },
    ],
    idealFor: ["Multi-location brands", "Coupon mailers", "Seasonal promotions", "Franchise networks"],
  },
  {
    slug: "saturation-mail",
    title: "Saturation Mail",
    shortTitle: "Saturation",
    tagline: "Maximum reach within a defined geographic area.",
    heroHighlight: "Cover every address in your ZIP codes — pure awareness at scale.",
    description:
      "Cover every deliverable address in your chosen ZIP codes. Built for awareness campaigns that need blanket coverage.",
    image: "/images/saturation-product.jpg",
    priceTeaser: "Starting at $0.17/piece",
    sizeRecommendationNote:
      "6×11″ gives saturation campaigns the oversized presence needed to stand out when every household gets a piece.",
    productType: "EDDM",
    defaultSize: "6x11",
    sizes: [
      {
        value: "6x11",
        label: "6×11″ EDDM",
        dimensions: "11″ × 6″",
        description: "Dominant mailbox presence for full-ZIP drops",
        recommended: true,
      },
      {
        value: "6x9",
        label: "6×9″",
        dimensions: "9″ × 6″",
        description: "Cost-effective saturation at high volumes",
      },
      {
        value: "5x7",
        label: "5×7″",
        dimensions: "7″ × 5″",
        description: "Flexible creative layout for multi-ZIP campaigns",
      },
    ],
    features: [
      "Full ZIP saturation",
      "Household count previews",
      "Bulk route optimization",
      "Artwork review included",
    ],
    benefits: [
      {
        title: "Unmatched local awareness",
        description: "Every deliverable address in your selected ZIPs receives your piece.",
        icon: "reach",
      },
      {
        title: "Simple geography-based buying",
        description: "Select ZIP codes on the map — no list required.",
        icon: "targeting",
      },
      {
        title: "Scales from one ZIP to dozens",
        description: "Start small or blanket an entire metro area.",
        icon: "scale",
      },
      {
        title: "Artwork review included",
        description: "Our team checks print readiness before your drop goes live.",
        icon: "transparency",
      },
    ],
    idealFor: ["Political campaigns", "Event promotion", "New store openings", "Brand awareness"],
  },
];

/** Legacy marketing slugs → canonical product slug */
const LEGACY_SLUG_ALIASES: Record<string, string> = {
  eddm: "every-door-direct-mail",
  targeted: "targeted-direct-mail",
  saturation: "saturation-mail",
  "discount-zones": "discount-zones",
  newmover: "targeted-direct-mail",
};

export function getProductBySlug(slug: string): Product | undefined {
  const canonical = LEGACY_SLUG_ALIASES[slug] ?? slug;
  return products.find((p) => p.slug === canonical);
}

export function parseProductQueryParam(param: string | null | undefined): Product | undefined {
  if (!param?.trim()) return undefined;
  return getProductBySlug(param.trim());
}

export function resolveSizeForProduct(
  product: Product,
  sizeParam: string | null | undefined
): PostcardSize {
  const allowed = product.sizes.map((s) => s.value);
  if (sizeParam && allowed.includes(sizeParam as PostcardSize)) {
    return sizeParam as PostcardSize;
  }
  return product.defaultSize;
}

export function getSizeOption(product: Product, size: PostcardSize): ProductSize | undefined {
  return product.sizes.find((s) => s.value === size);
}

export function buildCampaignWizardHref(product: Product, size?: PostcardSize): string {
  const params = new URLSearchParams();
  params.set("product", product.slug);
  params.set("size", size ?? product.defaultSize);
  return `/campaigns/new?${params.toString()}`;
}

/** Merge wizard URL params while preserving product context */
export function appendWizardProductParams(
  params: URLSearchParams,
  product: Product | null,
  size: PostcardSize | null | undefined
): URLSearchParams {
  if (product) {
    params.set("product", product.slug);
    if (size) params.set("size", size);
  } else if (size) {
    params.set("size", size);
  }
  return params;
}

export type CampaignWizardProductParams = {
  product: Product | null;
  size: PostcardSize | null;
};

/** Read ?product= & ?size= from URL search params (client or server). */
export function parseCampaignWizardParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
): CampaignWizardProductParams {
  const productParam = searchParams.get("product");
  const sizeParam = searchParams.get("size");

  const product = parseProductQueryParam(productParam);
  if (!product) {
    const validSizes = ["4x6", "5x7", "6x9", "6x11"] as const;
    const size =
      sizeParam && validSizes.includes(sizeParam as PostcardSize)
        ? (sizeParam as PostcardSize)
        : null;
    return { product: null, size };
  }

  return {
    product,
    size: resolveSizeForProduct(product, sizeParam),
  };
}
