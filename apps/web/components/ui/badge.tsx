import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "accent" | "success" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]",
        variant === "accent" && "bg-[var(--color-accent-light)] text-[var(--color-accent)]",
        variant === "success" && "bg-[var(--color-success-light)] text-[var(--color-success)]",
        className
      )}
      {...props}
    />
  );
}
