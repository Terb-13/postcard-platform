"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function CampaignMailingStatusPage() {
  const campaignId = String(useParams().id ?? "");

  const jobQuery = trpc.mailing.getByCampaignId.useQuery(
    { campaignId },
    { enabled: !!campaignId }
  );

  const job = jobQuery.data;

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold text-[#0A2540]">Mailing job status</h1>

      {jobQuery.isLoading && <p className="mt-6 text-sm text-gray-500">Loading…</p>}

      {!jobQuery.isLoading && !job && (
        <p className="mt-6 text-sm text-gray-600">
          No mailing job yet. Complete payment first, then{" "}
          <Link href={`/campaigns/${campaignId}/finalize`} className="text-[#0EA5E9] underline">
            finalize targeting
          </Link>
          .
        </p>
      )}

      {job && (
        <div className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-white p-6 text-sm">
          <Row label="Type" value={job.type} />
          <Row label="Status" value={job.status} />
          <Row label="Final quantity" value={job.finalQuantity != null ? formatNumber(job.finalQuantity) : "—"} />
          <Row
            label="Final total"
            value={job.finalTotalCents != null ? formatCurrency(job.finalTotalCents) : "—"}
          />
          {job.manifestUrl && (
            <p className="pt-2">
              <a href={job.manifestUrl} className="text-[#0EA5E9] underline" target="_blank" rel="noreferrer">
                Download manifest (ops)
              </a>
            </p>
          )}
          {job.errorMessage && (
            <p className="text-red-600">{job.errorMessage}</p>
          )}
        </div>
      )}

      <Link href="/campaigns" className="mt-6 block text-center text-sm text-gray-500 hover:underline">
        Back to campaigns
      </Link>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-[#0A2540]">{value}</span>
    </div>
  );
}
