"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { SelectedZcta } from "./types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function normalizeZipInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 5);
}

async function geocodeZipClient(zcta: string): Promise<SelectedZcta | null> {
  if (!MAPBOX_TOKEN || zcta.length !== 5) return null;

  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    types: "postcode",
    country: "us",
    limit: "1",
  });

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(zcta)}.json?${params}`
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    features?: { place_name: string; center: [number, number]; text: string }[];
  };

  const f = data.features?.[0];
  if (!f) return null;

  const zip = f.text.replace(/\D/g, "").slice(0, 5) || zcta;
  return {
    zcta: zip,
    placeName: f.place_name,
    center: f.center,
  };
}

type Props = {
  onSelect: (zcta: SelectedZcta) => void;
  className?: string;
};

export function ZipSearch({ onSelect, className }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching, isError } = trpc.targeting.searchZips.useQuery(
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

  const commitSelection = useCallback(
    async (item: SelectedZcta) => {
      setQuery("");
      setOpen(false);
      setHint(null);
      onSelect(item);
    },
    [onSelect]
  );

  const addZipByCode = useCallback(
    async (raw: string) => {
      const zcta = normalizeZipInput(raw);
      if (zcta.length !== 5) {
        setHint("Enter a 5-digit US ZIP code.");
        return;
      }

      setAdding(true);
      setHint(null);

      const fromList = features.find((f) => f.zcta === zcta);
      if (fromList) {
        await commitSelection({
          zcta: fromList.zcta,
          placeName: fromList.placeName,
          center: fromList.center,
        });
        setAdding(false);
        return;
      }

      const geocoded = await geocodeZipClient(zcta);
      if (geocoded) {
        await commitSelection(geocoded);
        setAdding(false);
        return;
      }

      await commitSelection({ zcta, placeName: `ZIP ${zcta}` });
      setAdding(false);
    },
    [commitSelection, features]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void addZipByCode(query);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative targeting-search z-20", className)}>
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="search"
          inputMode="numeric"
          placeholder="Search ZIP or press Enter…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHint(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="targeting-search-input"
          autoComplete="postal-code"
          aria-label="Search ZIP code"
        />
        {(isFetching || adding) && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <span className="inline-block h-4 w-4 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
          </span>
        )}
      </div>

      {hint && (
        <p className="mt-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          {hint}
        </p>
      )}

      {open && debounced.length >= 2 && !isFetching && features.length === 0 && !isError && (
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)] px-1">
          No matches — press Enter to add a 5-digit ZIP directly.
        </p>
      )}

      {isError && debounced.length >= 2 && (
        <p className="mt-1.5 text-xs text-amber-800 px-1">
          Search unavailable — press Enter to add a valid 5-digit ZIP.
        </p>
      )}

      {open && debounced.length >= 2 && features.length > 0 && (
        <ul className="targeting-search-dropdown" role="listbox">
          {features.map((f) => (
            <li key={f.zcta}>
              <button
                type="button"
                role="option"
                className="targeting-search-result"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void commitSelection({
                  zcta: f.zcta,
                  placeName: f.placeName,
                  center: f.center,
                })}
              >
                <span className="targeting-search-zip">{f.zcta}</span>
                <span className="targeting-search-place truncate">{f.placeName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
