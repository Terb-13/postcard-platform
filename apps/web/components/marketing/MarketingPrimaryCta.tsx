import type { ReactNode } from "react";
import Link from "next/link";
import { marketingCtaPrimary } from "./marketing-design-system";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function MarketingPrimaryCta({ href, children, className }: Props) {
  return (
    <Link href={href} className={`${marketingCtaPrimary} ${className ?? ""}`}>
      {children}
    </Link>
  );
}
