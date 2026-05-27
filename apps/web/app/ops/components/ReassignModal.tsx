"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

import type { RouterOutputs } from "@/lib/trpc/client";

type Job = RouterOutputs["admin"]["productionJobs"]["list"]["items"][number];

interface ReassignModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReassignModal({ job, isOpen, onClose, onSuccess }: ReassignModalProps) {
  const [newPartnerId, setNewPartnerId] = useState("");
  const [reason, setReason] = useState("");

  const partnersQuery = trpc.admin.partners.list.useQuery();
  const reassignMutation = trpc.admin.productionJobs.reassign.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setNewPartnerId("");
    setReason("");
  };

  if (!isOpen || !job) return null;

  const availablePartners =
    partnersQuery.data?.filter((p) => p.id !== job.productionPartnerId) ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerId) return;

    reassignMutation.mutate({
      jobId: job.id,
      newPartnerId,
      reason: reason || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="text-lg font-semibold mb-4">Reassign Job</h3>
        <p className="text-sm text-gray-600 mb-4">
          Current: {job.productionPartner?.name ?? "Unassigned"} → {job.campaign.name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Print Partner</label>
            <select
              value={newPartnerId}
              onChange={(e) => setNewPartnerId(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
              disabled={partnersQuery.isLoading}
            >
              <option value="">Select partner...</option>
              {availablePartners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={2}
              placeholder="Why are you reassigning this job?"
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
              disabled={!newPartnerId || reassignMutation.isPending}
              className="px-4 py-2 text-sm rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {reassignMutation.isPending ? "Reassigning..." : "Reassign Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
