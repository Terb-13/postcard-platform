"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency, formatNumber } from "@/lib/utils";

/** Post-checkout: resolve EDDM routes / list counts and show final cost (keeps existing wizard + map unchanged). */
export default function CampaignFinalizePage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = String(params.id ?? "");

  const jobQuery = trpc.mailing.getByCampaignId.useQuery(
    { campaignId },
    { enabled: !!campaignId }
  );
  const finalize = trpc.mailing.finalize.useMutation({
    onSuccess: () => {
      jobQuery.refetch();
    },
  });

  const [error, setError] = useState<string | null>(null);

  const job = jobQuery.data;
  const breakdown = job?.costBreakdown as {
    printCents?: number;
    postageCents?: number;
    listCents?: number;
    feesCents?: number;
    totalCents?: number;
  } | null;

  async function onFinalize() {
    setError(null);
    try {
      await finalize.mutateAsync({ campaignId, runHandoff: true });
      router.push(`/campaigns/${campaignId}/mailing`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Finalize failed");
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold text-[#0A2540]">Review final targeting</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your payment is complete. Confirm carrier routes and final piece count before we send
        files to print.
      </p>

      {jobQuery.isLoading && <p className="mt-6 text-sm text-gray-500">Loading…</p>}

      {job && (
        <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className="font-medium">{job.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated total (paid)</span>
            <span>{formatCurrency(job.estimatedTotalCents)}</span>
          </div>
          {job.finalQuantity != null && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Final quantity</span>
              <span className="font-semibold tabular-nums">
                {formatNumber(job.finalQuantity)} pieces
              </span>
            </div>
          )}
          {breakdown?.totalCents != null && job.finalTotalCents != null && (
            <div className="border-t border-gray-100 pt-4 text-sm">
              <p className="font-medium text-[#0A2540]">Cost breakdown</p>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>Print: {formatCurrency(breakdown.printCents ?? 0)}</li>
                <li>Postage: {formatCurrency(breakdown.postageCents ?? 0)}</li>
                <li>List / data: {formatCurrency(breakdown.listCents ?? 0)}</li>
                <li className="font-medium text-[#0A2540]">
                  Total: {formatCurrency(job.finalTotalCents)}
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {job?.status === "PENDING" && (
        <button
          type="button"
          onClick={onFinalize}
          disabled={finalize.isPending}
          className="mt-6 w-full rounded-3xl bg-[#0EA5E9] py-3 font-semibold text-white hover:bg-[#0284c7] disabled:opacity-60"
        >
          {finalize.isPending ? "Calculating routes…" : "Confirm routes & final cost"}
        </button>
      )}

      {job && job.status !== "PENDING" && (
        <Link
          href={`/campaigns/${campaignId}/mailing`}
          className="mt-6 block w-full rounded-3xl bg-[#0EA5E9] py-3 text-center font-semibold text-white hover:bg-[#0284c7]"
        >
          View mailing status
        </Link>
      )}

      <Link href="/campaigns" className="mt-4 block text-center text-sm text-gray-500 hover:underline">
        Back to campaigns
      </Link>
    </main>
  );
}
