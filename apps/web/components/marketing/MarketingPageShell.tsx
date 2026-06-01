import type { ReactNode } from "react";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";

type Props = {
  children: ReactNode;
};

/** Standard marketing page chrome — nav + footer on cream background */
export function MarketingPageShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  );
}
