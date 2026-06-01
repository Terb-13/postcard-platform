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
  /** Estimated per-piece price range — computed if omitted */
  priceRange?: string;
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
  /** Section headline above benefits grid on product detail page */
  benefitsHeadline: string;
  description: string;
  /** Card/thumbnail image */
  image: string;
  /** Large hero image on product detail page */
  heroImage: string;
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

export const POSTCARD_SIZE_MULTIPLIERS: Record<PostcardSize, number> = {
  "4x6": 1,
  "5x7": 1.15,
  "6x9": 1.35,
  "6x11": 1.5,
};

/** Parse base rate from priceTeaser e.g. "Starting at $0.19/piece" */
function parseBasePriceCents(teaser: string): number {
  const match = teaser.match(/\$([\d.]+)/);
  if (!match) return 25;
  return Math.round(parseFloat(match[1]) * 100);
}

/** Estimated per-piece range for a size, derived from product base rate × size multiplier */
export function getSizePriceRange(product: Product, size: PostcardSize): string {
  const sizeOption = product.sizes.find((s) => s.value === size);
  if (sizeOption?.priceRange) return sizeOption.priceRange;

  const baseCents = parseBasePriceCents(product.priceTeaser);
  const mult = POSTCARD_SIZE_MULTIPLIERS[size] ?? 1;
  const low = (baseCents * mult) / 100;
  const high = low * 1.08;
  const fmt = (n: number) => n.toFixed(2);
  return `$${fmt(low)} – $${fmt(high)}/pc`;
}

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
    tagline: "The proven way to reach every household on a carrier route — no list required.",
    heroHighlight: "Reach every customer in your area. No mailing list to buy.",
    benefitsHeadline: "Why local businesses choose Every Door Direct Mail",
    description:
      "Select USPS carrier routes on the map and mail oversized postcards to every deliverable address. Ideal for restaurants, home services, and retailers who want neighborhood-wide visibility without list costs.",
    image: "/images/eddm-product.jpg",
    heroImage: "/images/marketing/hero.jpg",
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
        title: "No mailing list needed",
        description: "USPS delivers to every address on your selected routes — skip list brokers entirely.",
        icon: "reach",
      },
      {
        title: "Lowest cost per impression",
        description: "EDDM rates plus route-based targeting keep costs predictable from the first quote.",
        icon: "pricing",
      },
      {
        title: "Dominates the mailbox",
        description: "6×11″ postcards stand out against letters and flyers — built for local offers that get noticed.",
        icon: "scale",
      },
      {
        title: "Live in as little as 5 days",
        description: "Pick routes, upload artwork, and mail fast with Census household counts before you pay.",
        icon: "speed",
      },
    ],
    idealFor: ["Restaurants", "Home services", "Retail stores", "Real estate"],
  },
  {
    slug: "targeted-direct-mail",
    title: "Targeted Direct Mail",
    shortTitle: "Targeted",
    tagline: "Mail only to households that match your ideal customer profile.",
    heroHighlight: "Stop paying to reach people who will never buy.",
    benefitsHeadline: "Precision targeting that beats blanket mail",
    description:
      "Layer Census demographics on top of your map selection — income, home ownership, age, and more — so every piece lands with a household that fits.",
    image: "/images/targeted-product.jpg",
    heroImage: "/images/marketing/data.jpg",
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
        title: "Higher response, less waste",
        description: "Exclude low-fit households before you print — spend only on prospects that match your criteria.",
        icon: "targeting",
      },
      {
        title: "Real U.S. Census data",
        description: "Not purchased lists — filter by verified demographics attached to each household.",
        icon: "transparency",
      },
      {
        title: "Map + filters in one flow",
        description: "Draw your geography, apply filters, and watch reach and cost update in real time.",
        icon: "reach",
      },
      {
        title: "Know your audience before checkout",
        description: "Household counts and estimates are locked in before you upload artwork or pay.",
        icon: "pricing",
      },
    ],
    idealFor: ["Financial services", "Healthcare", "Luxury home services", "B2B local"],
  },
  {
    slug: "discount-zones",
    title: "Discount Zones",
    shortTitle: "Discount Zones",
    tagline: "Pre-negotiated zone pricing for high-volume mailers in select markets.",
    heroHighlight: "Our lowest rates — mail more households for the same budget.",
    benefitsHeadline: "Volume pricing without cutting corners",
    description:
      "Qualify for shared print schedules and zone-based rates in partner markets. Same map tools and artwork review — just a lower per-piece price when you commit to volume.",
    image: "/images/targeted-product.jpg",
    heroImage: "/images/marketing/results.jpg",
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
        title: "Lowest per-piece rates we offer",
        description: "Zone pricing beats standard EDDM when your drop qualifies in an eligible market.",
        icon: "pricing",
      },
      {
        title: "Built for repeat campaigns",
        description: "Lock in rates for monthly, seasonal, or multi-location programs that mail on schedule.",
        icon: "scale",
      },
      {
        title: "More reach, same spend",
        description: "Stretch budget across additional households without downgrading print quality.",
        icon: "reach",
      },
      {
        title: "Reserved production windows",
        description: "Priority slots in busy markets so your drop ships on time, even at peak volume.",
        icon: "speed",
      },
    ],
    idealFor: ["Multi-location brands", "Coupon mailers", "Seasonal promotions", "Franchise networks"],
  },
  {
    slug: "saturation-mail",
    title: "Saturation Mail",
    shortTitle: "Saturation",
    tagline: "Blanket every deliverable address in the ZIP codes you choose.",
    heroHighlight: "Own the mailbox across entire ZIP codes — pure awareness at scale.",
    benefitsHeadline: "Maximum coverage when share of voice matters",
    description:
      "Cover 100% of deliverable addresses in your selected ZIPs. Built for launches, events, and awareness campaigns where being everywhere locally is the goal.",
    image: "/images/saturation-product.jpg",
    heroImage: "/images/marketing/solution.jpg",
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
        title: "100% ZIP coverage",
        description: "Every deliverable address in your selected ZIPs receives your piece — no gaps.",
        icon: "reach",
      },
      {
        title: "Geography-only buying",
        description: "Select ZIPs on the map and see household counts instantly. No list required.",
        icon: "targeting",
      },
      {
        title: "One ZIP or fifty",
        description: "Start with a single neighborhood or blanket a metro — the same simple workflow scales.",
        icon: "scale",
      },
      {
        title: "Print-ready artwork review",
        description: "Our team verifies your PDF before production so saturation drops ship without surprises.",
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

export function resolveProductFromCampaign(input: {
  productSlug?: string | null;
  productType?: string | null;
  size?: string | null;
}): Product | null {
  if (input.productSlug) {
    return getProductBySlug(input.productSlug) ?? null;
  }
  if (input.productType === "TARGETED") {
    return getProductBySlug("targeted-direct-mail") ?? null;
  }
  return getProductBySlug("every-door-direct-mail") ?? null;
}

export function buildCampaignDraftHref(
  campaignId: string,
  product?: Product | null,
  size?: PostcardSize | null
): string {
  const params = new URLSearchParams();
  params.set("campaignId", campaignId);
  if (product) appendWizardProductParams(params, product, size ?? product.defaultSize);
  else if (size) params.set("size", size);
  return `/campaigns/new?${params.toString()}`;
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
