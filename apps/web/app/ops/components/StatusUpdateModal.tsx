"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

import type { RouterOutputs } from "@/lib/trpc/client";

type Job = RouterOutputs["admin"]["productionJobs"]["list"]["items"][number];

interface StatusUpdateModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUSES = ["RECEIVED", "SENT_TO_PROVIDER", "SHIPPED", "DELIVERED"] as const;

export function StatusUpdateModal({ job, isOpen, onClose, onSuccess }: StatusUpdateModalProps) {
  const [status, setStatus] = useState<(typeof STATUSES)[number] | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [message, setMessage] = useState("");

  const updateMutation = trpc.admin.updateJobStatus.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setStatus("");
    setTrackingNumber("");
    setMessage("");
  };

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    updateMutation.mutate({
      jobId: job.id,
      status,
      trackingNumber: trackingNumber || undefined,
      message: message || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">Update Status</h3>
        <p className="text-sm text-gray-600 mb-4">
          {job.campaign.name} — {job.campaign.organization.name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded border px-3 py-2"
              required
            >
              <option value="">Select status...</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tracking Number (if shipped)</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full rounded border px-3 py-2 font-mono"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={2}
              placeholder="Internal note..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!status || updateMutation.isPending}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
