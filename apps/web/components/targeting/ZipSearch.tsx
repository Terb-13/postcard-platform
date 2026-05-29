"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { SelectedZcta } from "./types";

type Props = {
  onSelect: (zcta: SelectedZcta) => void;
  className?: string;
};

export function ZipSearch({ onSelect, className }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = trpc.targeting.searchZips.useQuery(
    { query: debounced },
    { enabled: debounced.length >= 2, staleTime: 30_000 }
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const features = data?.features ?? [];

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        placeholder="Search ZIP code (e.g. 90210)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="pr-10"
      />
      {isFetching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
          …
        </span>
      )}
      {open && debounced.length >= 2 && features.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white shadow-lg overflow-hidden">
          {features.map((f) => (
            <li key={f.zcta}>
              <button
                type="button"
                className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-bg-alt)] transition-colors"
                onClick={() => {
                  onSelect({
                    zcta: f.zcta,
                    placeName: f.placeName,
                    center: f.center,
                  });
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="font-semibold">{f.zcta}</span>
                <span className="text-[var(--color-text-muted)] ml-2 truncate">
                  {f.placeName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
