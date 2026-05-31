import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  centered?: boolean;
};

/** Prototype-aligned section label (teal, uppercase, tracked) */
export function MarketingSectionEyebrow({ children, className, centered }: Props) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.14em] text-[#0EA5E9]",
        centered && "text-center",
        className
      )}
    >
      {children}
    </p>
  );
}
