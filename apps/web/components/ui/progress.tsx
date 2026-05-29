"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressProps = React.ComponentProps<"div"> & {
  value?: number;
};

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-alt)]",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
