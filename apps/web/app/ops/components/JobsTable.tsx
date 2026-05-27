"use client";

import { useState } from "react";
import type { RouterOutputs } from "@/lib/trpc/client";

type JobWithDetails = RouterOutputs["admin"]["productionJobs"]["list"]["items"][number];

interface JobsTableProps {
  jobs: JobWithDetails[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  onUpdateStatus: (job: JobWithDetails) => void;
  onReassign: (job: JobWithDetails) => void;
}

export function JobsTable({
  jobs,
  isLoading,
  onLoadMore,
  hasMore,
  onUpdateStatus,
  onReassign,
}: JobsTableProps) {
  if (isLoading && jobs.length === 0) {
    return <div className="py-8 text-center text-gray-500">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return <div className="py-8 text-center text-gray-500">No jobs found.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Customer / Campaign</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Partner</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tracking</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Created</th>
            <th className="px-4 py-3 w-32 text-right text-xs font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">
                <div className="font-medium text-gray-900">
                  {job.campaign.name}
                </div>
                <div className="text-xs text-gray-500">
                  {job.campaign.organization.name}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {job.productionPartner?.name ?? "Unassigned"}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-mono text-gray-600">
                {job.trackingNumber || "—"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onUpdateStatus(job)}
                    className="rounded border px-2.5 py-1 text-xs hover:bg-gray-100"
                  >
                    Status
                  </button>
                  <button
                    onClick={() => onReassign(job)}
                    className="rounded border px-2.5 py-1 text-xs hover:bg-gray-100"
                  >
                    Reassign
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="border-t p-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full rounded border py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
