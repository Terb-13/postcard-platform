"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { formatNumber, formatTrpcError } from "@/lib/utils";
import type { MelissaListPreviewMeta } from "@/lib/melissa-buyer-door";
import type { TargetingFilters } from "@/components/targeting";

export type MelissaListPreviewResult = MelissaListPreviewMeta;

type Props = {
  zctas: string[];
  filters?: TargetingFilters & { ownHome?: boolean; homeowners?: boolean };
  campaignId?: string | null;
  attached?: MelissaListPreviewResult | null;
  onAttach?: (result: MelissaListPreviewResult | null) => void;
};

export function MelissaListPreviewPanel({
  zctas,
  filters,
  campaignId,
  attached,
  onAttach,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const [pending, setPending] = useState(false);

  const enabled = zctas.length > 0;

  async function attachPreview() {
    if (!enabled) return;
    setPending(true);
    setError(null);
    try {
      const data = await utils.mailing.targetedListCount.fetch({
        zctas,
        filters,
        campaignId: campaignId ?? undefined,
      });
      if (data.isStub) {
        setError("List preview returned a stub count. This door will not attach a stub.");
        onAttach?.(null);
        return;
      }
      onAttach?.({
        recipientCount: data.recipientCount,
        isStub: false,
        listProvider: data.listProvider,
        door: data.door,
        listRequestId: data.listRequestId,
      });
    } catch (e) {
      setError(formatTrpcError(e));
      onAttach?.(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Melissa list preview</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Optional Consumer get / NewMovers doCount. Count only — never buy or doLookup.
          </p>
        </div>
        {attached && (
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
            Attached · {formatNumber(attached.recipientCount)}
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {attached && (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[var(--color-text-muted)]">Count</dt>
            <dd className="font-semibold tabular-nums">{formatNumber(attached.recipientCount)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Provider</dt>
            <dd className="font-semibold">{attached.listProvider}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Door</dt>
            <dd className="font-semibold">{attached.door ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Stub</dt>
            <dd className="font-semibold">{String(attached.isStub)}</dd>
          </div>
        </dl>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={attachPreview}
          disabled={!enabled || pending}
        >
          {pending ? "Counting…" : attached ? "Refresh list preview" : "Attach list preview"}
        </Button>
        {attached && (
          <Button type="button" variant="ghost" onClick={() => onAttach?.(null)}>
            Remove
          </Button>
        )}
      </div>
    </section>
  );
}
