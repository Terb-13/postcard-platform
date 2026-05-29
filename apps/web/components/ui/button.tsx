import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" && "bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)] hover:bg-black shadow-sm",
          variant === "secondary" && "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-bg-alt)]",
          variant === "outline" && "border border-[var(--color-border-strong)] bg-transparent hover:bg-[var(--color-bg-alt)]",
          variant === "ghost" && "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]",
          size === "sm" && "text-sm px-3 py-2 rounded-xl min-h-[40px]",
          size === "md" && "text-base px-5 py-2.5 rounded-2xl min-h-[48px]",
          size === "lg" && "text-lg px-6 py-3 rounded-2xl min-h-[56px]",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
