/** Solutions hub — links to canonical /products catalog */
export const SOLUTIONS_HUB = [
  {
    href: "/products/every-door-direct-mail",
    title: "Every Door Direct Mail",
    description: "Quote Census ZIP reach on the map. Carrier routes are not live yet.",
  },
  {
    href: "/products/targeted-direct-mail",
    title: "Targeted Direct Mail",
    description: "Quote Census ZIP reach with demographic filters. Not a live mail drop.",
  },
  {
    href: "/products/saturation-mail",
    title: "Saturation Mail",
    description: "Coming soon — not a live mail drop.",
  },
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
