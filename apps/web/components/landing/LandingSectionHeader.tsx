import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleAs?: "h1" | "h2";
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleAs = "h2",
}: Props) {
  const TitleTag = titleAs;

  return (
    <header
      className={cn(
        align === "center" && "text-center mx-auto max-w-2xl",
        align === "left" && "text-left max-w-2xl lg:max-w-[36rem]",
        className
      )}
    >
      {eyebrow && <p className="landing-eyebrow mb-3 lg:mb-4">{eyebrow}</p>}
      <TitleTag className={titleAs === "h1" ? "display-hero text-[var(--color-bg-dark)]" : "landing-section-title"}>
        {title}
      </TitleTag>
      {description && <p className="landing-section-desc">{description}</p>}
    </header>
  );
}
