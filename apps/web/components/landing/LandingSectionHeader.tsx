import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  /** Center on mobile; desktop can override via className */
  align?: "left" | "center";
  className?: string;
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: Props) {
  return (
    <header
      className={cn(
        "mb-10 sm:mb-12 lg:mb-0",
        align === "center" && "text-center mx-auto max-w-2xl",
        align === "left" && "text-left max-w-2xl lg:max-w-[34rem]",
        className
      )}
    >
      <p className="landing-eyebrow mb-3 lg:mb-4">{eyebrow}</p>
      <h2 className="landing-section-title">{title}</h2>
      <p className="landing-section-desc">{description}</p>
    </header>
  );
}
