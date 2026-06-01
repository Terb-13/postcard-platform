/** Solutions hub + product pages — aligned with redesign/*.html */

export const SOLUTIONS_HUB = [
  {
    href: "/every-door-direct-mail",
    title: "Every Door Direct Mail",
    description: "Reach every address in a neighborhood without a mailing list.",
  },
  {
    href: "/targeted-direct-mail",
    title: "Targeted Direct Mail",
    description: "Reach specific households using real Census demographics.",
  },
  {
    href: "/map-tool",
    title: "Saturation Mail",
    description: "Maximum reach within a defined geographic area at the lowest cost.",
  },
] as const;

export const EDDM_BENEFITS = [
  "No mailing list needed",
  "Lowest cost per piece",
  "Great for brand awareness",
  "USPS discounts available",
] as const;

export const TEMPLATE_ITEMS = [
  { name: "Standard Postcard (6x11)" },
  { name: "EDDM Postcard (6.5x9)" },
  { name: "Jumbo Postcard (6x11)" },
  { name: "Slim Jim (4x11)" },
] as const;

export const DESIGN_PACKAGES = [
  { name: "Basic Design", price: "$149" },
  { name: "Premium Design", price: "$349" },
  { name: "Full Branding Package", price: "$799" },
] as const;
