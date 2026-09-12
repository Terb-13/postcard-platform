"use client";

import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { formatNumber, formatTrpcError } from "@/lib/utils";
import { hasStubCarrierRoutes } from "@/lib/melissa-buyer-door";
import type { MelissaRouteMeta } from "@/lib/melissa-buyer-door";

export type MelissaRoutesResult = {
  provider: string;
  isStub: boolean;
  totalHomes: number;
  routes: MelissaRouteMeta[];
  warnings: string[];
};

type Props = {
  zctas: string[];
  onResult?: (result: MelissaRoutesResult | null, error?: string | null) => void;
};

export function MelissaRoutesPanel({ zctas, onResult }: Props) {
  const enabled = zctas.length > 0;
  const query = trpc.mailing.eddmRoutes.useQuery(
    { zctas },
    { enabled, staleTime: 60_000, retry: 1 }
  );

  const stubBlocked = Boolean(
    query.data &&
      (query.data.isStub ||
        query.data.provider !== "melissa" ||
        hasStubCarrierRoutes(query.data.routes))
  );

  const errorMessage = query.isError
    ? formatTrpcError(query.error)
    : stubBlocked
      ? "Occupant did not return live Melissa routes (stub or wrong provider). This door will not invent STUB-CR rows."
      : null;

  const result = useMemo<MelissaRoutesResult | null>(() => {
    if (!query.data || stubBlocked) return null;
    return {
      provider: query.data.provider,
      isStub: query.data.isStub,
      totalHomes: query.data.totalHomes,
      routes: query.data.routes.map((r) => ({
        carrierRouteId: r.carrierRouteId,
        zip: r.zip,
        householdCount: r.householdCount,
        walkSequence: r.walkSequence,
      })),
      warnings: query.data.warnings ?? [],
    };
  }, [query.data, stubBlocked]);

  useEffect(() => {
    if (!onResult) return;
    if (!enabled) {
      onResult(null, null);
      return;
    }
    if (query.isFetching && !query.data) return;
    onResult(result, errorMessage);
  }, [enabled, errorMessage, onResult, query.data, query.isFetching, result]);

  if (!enabled) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Melissa Occupant routes</h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Select a ZIP on the map to load live carrier routes. No purchase.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Melissa Occupant routes</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Live EDDM carrier routes for {zctas.join(", ")}. Occupant get only — no buy.
          </p>
        </div>
        {result && (
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            provider={result.provider} · isStub={String(result.isStub)}
          </span>
        )}
      </div>

      {query.isFetching && (
        <p className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
          Loading Occupant routes…
        </p>
      )}

      {errorMessage && (
        <div role="alert" className="mt-4 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {formatNumber(result.totalHomes)} households across {result.routes.length} route
            {result.routes.length === 1 ? "" : "s"}
          </p>
          <div className="max-h-56 overflow-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-bg-alt)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Route</th>
                  <th className="px-3 py-2 font-medium">ZIP</th>
                  <th className="px-3 py-2 font-medium text-right">Households</th>
                </tr>
              </thead>
              <tbody>
                {result.routes.map((route) => (
                  <tr key={`${route.carrierRouteId}-${route.zip}`} className="border-t border-[var(--color-border)]">
                    <td className="px-3 py-2 font-mono">{route.carrierRouteId}</td>
                    <td className="px-3 py-2">{route.zip}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatNumber(route.householdCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
