"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/client";

type Job = RouterOutputs["admin"]["productionJobs"]["list"]["items"][number];

interface JobDetailDrawerProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (job: Job) => void;
  onReassign: (job: Job) => void;
  onRefresh?: () => void;
}

const QUICK_STATUSES = ["SENT_TO_PROVIDER", "SHIPPED", "DELIVERED"] as const;

export function JobDetailDrawer({
  job,
  isOpen,
  onClose,
  onUpdateStatus,
  onReassign,
  onRefresh,
}: JobDetailDrawerProps) {
  const [note, setNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const addNoteMutation = trpc.admin.productionJobs.addNote.useMutation({
    onSuccess: () => {
      setNote("");
      onRefresh?.();
    },
  });

  const updateStatusMutation = trpc.admin.updateJobStatus.useMutation({
    onSuccess: () => {
      onRefresh?.();
    },
  });

  if (!job) return null;

  const events = job.events ?? [];

  const handleQuickStatus = async (newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({ jobId: job.id, status: newStatus as any });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setIsAddingNote(true);
    try {
      await addNoteMutation.mutateAsync({ jobId: job.id, note: note.trim() });
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold">Job Details</h2>
              <p className="text-sm text-gray-600">
                {job.campaign.name} — {job.campaign.organization.name}
              </p>
            </div>
            <button onClick={onClose} className="text-2xl leading-none">&times;</button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-lg font-medium">{job.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Partner</div>
                <div className="text-lg font-medium">{job.productionPartner?.name ?? "Unassigned"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Tracking Number</div>
                <div className="font-mono text-lg">{job.trackingNumber || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div>{new Date(job.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Proof */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Proof</div>
              {job.proofUrl ? (
                <a href={job.proofUrl} target="_blank" className="text-blue-600 hover:underline text-sm">
                  View Proof PDF →
                </a>
              ) : (
                <span className="text-sm text-gray-500">No proof yet</span>
              )}
            </div>

            {/* Quick Status Buttons */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Quick Status Update</div>
              <div className="flex flex-wrap gap-2">
                {QUICK_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleQuickStatus(status)}
                    disabled={isUpdating || job.status === status}
                    className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes Section (New) */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Internal Notes</div>

              <div className="space-y-3 mb-3 max-h-48 overflow-auto">
                {events
                  .filter((e) => e.metadata?.type === "INTERNAL_NOTE")
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((event) => (
                    <div key={event.id} className="bg-yellow-50 border-l-2 border-yellow-400 p-3 rounded text-sm">
                      <div>{event.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(event.createdAt).toLocaleString()} • {event.metadata?.addedBy}
                      </div>
                    </div>
                  ))}
                {events.filter((e) => e.metadata?.type === "INTERNAL_NOTE").length === 0 && (
                  <div className="text-sm text-gray-400 italic">No internal notes yet.</div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add internal note..."
                  className="flex-1 rounded border px-3 py-2 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && note.trim()) {
                      handleAddNote();
                    }
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!note.trim() || isAddingNote}
                  className="rounded bg-gray-800 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Full Event History */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">Full Event History</div>
              {events.length > 0 ? (
                <div className="space-y-3 rounded-lg border bg-gray-50 p-4 max-h-[320px] overflow-auto text-sm">
                  {events
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((event) => (
                      <div key={event.id} className="border-l-2 border-gray-300 pl-3">
                        <div className="font-medium">{event.status}</div>
                        <div className="text-gray-600">{event.message}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(event.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No events recorded.</div>
              )}
            </div>
          </div>

          <div className="border-t p-4 flex justify-end gap-3">
            <button onClick={onClose} className="rounded border px-4 py-2 text-sm hover:bg-gray-50">
              Close
            </button>
            <button
              onClick={() => onUpdateStatus(job)}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Full Status Update
            </button>
          </div>
        </div>
      </div>
    </>
  );

  async function handleAddNote() {
    if (!note.trim() || !job) return;
    await addNoteMutation.mutateAsync({ jobId: job.id, note: note.trim() });
  }
}
