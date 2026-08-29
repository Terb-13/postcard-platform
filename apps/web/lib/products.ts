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
  /** Buyer chrome must not show start/order CTAs or live prices. */
  comingSoon?: boolean;
  /** Census ZIP quote only — not a live mail drop. No start-order / start-campaign doors. */
  quoteOnly?: boolean;
};

export const POSTCARD_SIZE_MULTIPLIERS: Record<PostcardSize, number> = {
  "4x6": 1,
  "5x7": 1.15,
  "6x9": 1.35,
  "6x11": 1.5,
};

/** Honest placeholder until CIO wires a real partner/USPS rate. Do not invent a dollar amount. */
export const LIVE_ESTIMATE_PLACEHOLDER = "See live estimate on the map";

export const COMING_SOON_LABEL = "Coming soon";
export const QUOTE_ONLY_LABEL = "Census ZIP quote";
export const MAP_QUOTE_HREF = "/map-tool";

export function isProductComingSoon(product: Product): boolean {
  return product.comingSoon === true;
}

export function isProductQuoteOnly(product: Product): boolean {
  return product.quoteOnly === true && !isProductComingSoon(product);
}

/** Start-order / start-campaign / artwork-continue doors. */
export function canStartProductOrder(product: Product): boolean {
  return !isProductComingSoon(product) && !isProductQuoteOnly(product);
}

/** Size rate label — never invent a starting-at dollar figure from marketing copy. */
export function getSizePriceRange(product: Product, size: PostcardSize): string {
  if (isProductComingSoon(product)) return COMING_SOON_LABEL;
  const sizeOption = product.sizes.find((s) => s.value === size);
  if (sizeOption?.priceRange) return sizeOption.priceRange;
  return product.priceTeaser || LIVE_ESTIMATE_PLACEHOLDER;
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
    tagline: "Quote household reach from Census ZIP counts. Carrier routes are not live.",
    heroHighlight: "Census ZIP quotes — carrier-route EDDM is coming soon.",
    benefitsHeadline: "Why local businesses choose Every Door Direct Mail",
    description:
      "Select ZIP codes on the map for a Census household quote. This is not a live USPS Every Door drop — carrier-route selection is not available yet. No mailing list required.",
    image: "/images/eddm-product.jpg",
    heroImage: "/images/marketing/hero.jpg",
    priceTeaser: LIVE_ESTIMATE_PLACEHOLDER,
    quoteOnly: true,
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
      "Interactive map selection",
      "Census household counts",
    ],
    benefits: [
      {
        title: "No mailing list needed",
        description: "Skip list brokers — choose ZIP codes on the map and see Census household counts.",
        icon: "reach",
      },
      {
        title: "Lowest cost per impression",
        description: "See a live household count and estimate on the map before you pay.",
        icon: "pricing",
      },
      {
        title: "Dominates the mailbox",
        description: "6×11″ postcards stand out against letters and flyers — built for local offers that get noticed.",
        icon: "scale",
      },
      {
        title: "Census quote before you plan",
        description: "Pick ZIP codes and see a Census household quote. This page does not start a mail drop.",
        icon: "speed",
      },
    ],
    idealFor: ["Restaurants", "Home services", "Retail stores", "Real estate"],
  },
  {
    slug: "targeted-direct-mail",
    title: "Targeted Direct Mail",
    shortTitle: "Targeted",
    tagline: "Quote Census household reach with income and recent-mover filters. Not a live mail drop.",
    heroHighlight: "Census ZIP quotes with demographic filters — not a live list or drop.",
    benefitsHeadline: "Precision targeting that beats blanket mail",
    description:
      "Layer Census income and recent-mover filters on the ZIP codes you select. Household counts are a quote — names, addresses, and a live mail drop are not available. Homeownership and age filters are coming soon.",
    image: "/images/targeted-product.jpg",
    heroImage: "/images/marketing/data.jpg",
    priceTeaser: LIVE_ESTIMATE_PLACEHOLDER,
    quoteOnly: true,
    sizeRecommendationNote:
      "6×9″ is the planned default for targeted quotes — enough room for an offer without implying a live drop.",
    productType: "TARGETED",
    defaultSize: "6x9",
    sizes: [
      {
        value: "6x9",
        label: "6×9″",
        dimensions: "9″ × 6″",
        description: "Best balance of impact and cost for targeted quotes",
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
      "ZIP-level household quotes",
      "Live Census estimates",
      "Not a live mail drop",
    ],
    benefits: [
      {
        title: "Filter before you quote",
        description: "Exclude low-fit ZIP codes on the map. This does not buy a mailing list or start a drop.",
        icon: "targeting",
      },
      {
        title: "Real U.S. Census data",
        description: "Not a purchased name-and-address list — filter by Census demographics on selected ZIPs.",
        icon: "transparency",
      },
      {
        title: "Map + filters in one quote",
        description: "Draw your geography, apply Census filters, and watch household counts update.",
        icon: "reach",
      },
      {
        title: "Quote only — no checkout here",
        description: "Household counts are a Census quote. This page does not open artwork upload or payment.",
        icon: "pricing",
      },
    ],
    idealFor: ["Financial services", "Healthcare", "Luxury home services", "B2B local"],
  },
  {
    slug: "discount-zones",
    title: "Discount Zones",
    shortTitle: "Discount Zones",
    tagline: "Shared print windows in partner markets — not available to order yet.",
    heroHighlight: "Coming soon. Zone rates are not live.",
    benefitsHeadline: "Volume pricing without cutting corners",
    description:
      "Discount Zones will offer shared print schedules in partner markets. Eligible ZIPs and rates are not published yet — this is not a live product and cannot be ordered.",
    image: "/images/targeted-product.jpg",
    heroImage: "/images/marketing/results.jpg",
    priceTeaser: COMING_SOON_LABEL,
    comingSoon: true,
    sizeRecommendationNote:
      "6×11″ is the planned default when Discount Zones launch. No zone rate is published.",
    productType: "EDDM",
    defaultSize: "6x11",
    sizes: [
      {
        value: "6x11",
        label: "6×11″ EDDM",
        dimensions: "11″ × 6″",
        description: "Planned default format when Discount Zones launch",
        recommended: true,
      },
      {
        value: "6x9",
        label: "6×9″",
        dimensions: "9″ × 6″",
        description: "Planned alternate format — no zone rate published",
      },
    ],
    features: [
      "Coming soon",
      "No live zone rates",
      "Not available to order",
    ],
    benefits: [
      {
        title: "Planned for high-volume mailers",
        description: "Shared print windows in partner markets are on the roadmap. No zone rates are published.",
        icon: "pricing",
      },
      {
        title: "Built for repeat campaigns",
        description: "Intended for monthly, seasonal, or multi-location programs once the product launches.",
        icon: "scale",
      },
      {
        title: "Same Census ZIP map",
        description: "The quote-only map stays Census ZIP. Discount Zones will not invent a separate rate sheet.",
        icon: "reach",
      },
      {
        title: "Not for sale yet",
        description: "You cannot start a Discount Zones order. No start-campaign path while this is coming soon.",
        icon: "speed",
      },
    ],
    idealFor: ["Multi-location brands", "Coupon mailers", "Seasonal promotions", "Franchise networks"],
  },
  {
    slug: "saturation-mail",
    title: "Saturation Mail",
    shortTitle: "Saturation",
    tagline: "Full-ZIP coverage is coming soon — not a live mail drop.",
    heroHighlight: "Coming soon. Saturation is not for sale yet.",
    benefitsHeadline: "Maximum coverage when share of voice matters",
    description:
      "Saturation Mail will cover selected ZIP codes when it launches. Carrier routes are not live, and this is not available to order.",
    image: "/images/saturation-product.jpg",
    heroImage: "/images/marketing/solution.jpg",
    priceTeaser: COMING_SOON_LABEL,
    comingSoon: true,
    sizeRecommendationNote:
      "6×11″ is the planned default when Saturation launches. Not a live mail drop.",
    productType: "EDDM",
    defaultSize: "6x11",
    sizes: [
      {
        value: "6x11",
        label: "6×11″ EDDM",
        dimensions: "11″ × 6″",
        description: "Planned default format when Saturation launches",
        recommended: true,
      },
      {
        value: "6x9",
        label: "6×9″",
        dimensions: "9″ × 6″",
        description: "Planned alternate format — not a live drop",
      },
      {
        value: "5x7",
        label: "5×7″",
        dimensions: "7″ × 5″",
        description: "Flexible creative layout for multi-ZIP campaigns",
      },
    ],
    features: [
      "Coming soon",
      "Census ZIP quotes only",
      "Not available to order",
    ],
    benefits: [
      {
        title: "Planned ZIP coverage",
        description: "Saturation will use selected ZIPs when it launches. Carrier routes are not live.",
        icon: "reach",
      },
      {
        title: "Geography-only planning",
        description: "The map stays a Census ZIP quote. Saturation cannot be ordered from this page.",
        icon: "targeting",
      },
      {
        title: "One ZIP or fifty",
        description: "The same quote-only ZIP workflow will scale when this product ships.",
        icon: "scale",
      },
      {
        title: "Not for sale yet",
        description: "You cannot start a Saturation order. No start-campaign path while this is coming soon.",
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

/** Marketing CTA target — quote-only products go to the Census map, never the wizard. */
export function buildProductActionHref(product: Product, size?: PostcardSize): string {
  if (isProductComingSoon(product)) return `/products/${product.slug}`;
  if (isProductQuoteOnly(product)) return MAP_QUOTE_HREF;
  return buildCampaignWizardHref(product, size);
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
