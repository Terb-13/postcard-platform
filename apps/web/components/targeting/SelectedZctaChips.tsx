"use client";

import type { SelectedZcta } from "./types";
import { cn } from "@/lib/utils";

type Props = {
  zctas: SelectedZcta[];
  onRemove: (zcta: string) => void;
  onClearAll?: () => void;
  className?: string;
};

/** Removable ZIP chips — used in map sidebar and marketing map panel */
export function SelectedZctaChips({ zctas, onRemove, onClearAll, className }: Props) {
  if (zctas.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {zctas.map((z) => (
          <button
            key={z.zcta}
            type="button"
            onClick={() => onRemove(z.zcta)}
            className="targeting-chip"
            title={`Remove ZIP ${z.zcta}`}
          >
            {z.zcta}
            <span aria-hidden className="opacity-60">
              ×
            </span>
          </button>
        ))}
      </div>
      {onClearAll && zctas.length > 0 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-[#0EA5E9] hover:text-[#0A2540] hover:underline"
        >
          Clear all ZIPs
        </button>
      ) : null}
    </div>
  );
}
