import Link from "next/link";
import { marketingContainer, marketingContainerNarrow } from "./marketing-design-system";

type HeroSize = "hub" | "page" | "compact";

const titleClass: Record<HeroSize, string> = {
  hub: "text-6xl font-semibold tracking-tighter",
  page: "text-5xl font-semibold tracking-tight",
  compact: "text-4xl font-semibold tracking-tight",
};

type Props = {
  title: string;
  description?: string;
  size?: HeroSize;
  /** e.g. ← All Solutions */
  backLink?: { href: string; label: string };
  /** Hub-style white band with bottom border */
  band?: boolean;
};

/** Secondary page hero — redesign/*.html */
export function MarketingPageHero({
  title,
  description,
  size = "page",
  backLink,
  band = false,
}: Props) {
  const container = size === "hub" ? marketingContainer : marketingContainerNarrow;
  const inner = (
    <div className={`${container} py-16`}>
      {backLink ? (
        <Link
          href={backLink.href}
          className="text-sm text-[#0A2540] transition-colors hover:text-[#0EA5E9]"
        >
          {backLink.label}
        </Link>
      ) : null}
      <h1 className={backLink ? `mt-4 ${titleClass[size]}` : titleClass[size]}>{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-xl text-gray-600">{description}</p>
      ) : null}
    </div>
  );

  if (band) {
    return <div className="border-b border-gray-200 bg-white">{inner}</div>;
  }

  return <header>{inner}</header>;
}
