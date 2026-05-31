import type { ReactNode } from "react";
import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Every Door Direct Mail", href: "/campaigns/new?product=eddm" },
  { label: "Targeted Direct Mail", href: "/campaigns/new?product=targeted" },
  { label: "Saturation Mail", href: "/campaigns/new?product=saturation" },
  { label: "New Mover Campaigns", href: "/campaigns/new?product=newmover" },
] as const;

const PLATFORM_LINKS = [
  { label: "Map Targeting Tool", href: "#map-tool" },
  { label: "Templates", href: "/templates" },
  { label: "Design Services", href: "/design-services" },
] as const;

/** redesign/index.html — Footer */
export function MarketingFooter() {
  return (
    <footer className="bg-[#0A2540] py-12 text-sm text-white/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-8 md:grid-cols-5">
        <FooterColumn title="Products">
          {PRODUCT_LINKS.map((item) => (
            <FooterLink key={item.label} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Platform">
          {PLATFORM_LINKS.map((item) => (
            <FooterLink key={item.label} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
          <span className="block py-0.5">API & Integrations</span>
        </FooterColumn>

        <FooterColumn title="Resources">
          <span className="block py-0.5">Blog</span>
          <span className="block py-0.5">Case Studies</span>
          <span className="block py-0.5">USPS Guides</span>
          <span className="block py-0.5">Webinars</span>
        </FooterColumn>

        <div className="col-span-2 md:col-span-1">
          <p className="mb-4 font-semibold text-white">Company</p>
          <div className="space-y-1.5">
            <span className="block py-0.5">About Us</span>
            <span className="block py-0.5">USPS Partnership</span>
            <span className="block py-0.5">Careers</span>
            <p className="mt-4 text-xs">© {new Date().getFullYear()} Postcard Platform</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-4 font-semibold text-white">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className="block py-0.5 transition-colors hover:text-white">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="block py-0.5 transition-colors hover:text-white">
      {children}
    </Link>
  );
}
