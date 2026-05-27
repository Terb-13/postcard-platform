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

  const reviewArtwork = trpc.admin.artwork.review.useMutation({
    onSuccess: () => onRefresh?.(),
  });

  const updateStatusMutation = trpc.admin.updateJobStatus.useMutation({
    onSuccess: () => onRefresh?.(),
  });

  if (!job) return null;

  const events = job.events ?? [];
  const artwork = job.campaign.artwork;

  const handleQuickStatus = async (status: string) => {
    if (!confirm(`Mark as ${status}?`)) return;
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({ jobId: job.id, status: status as any });
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

  const handleArtworkReview = async (status: "APPROVED" | "REJECTED") => {
    const notes = prompt(status === "APPROVED" ? "Notes for customer (optional):" : "Reason for rejection:") || undefined;
    await reviewArtwork.mutateAsync({ campaignId: job.campaignId, status, notes });
  };

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/40 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />

      <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex justify-between items-center border-b px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold">Job Details</h2>
              <p className="text-sm text-gray-600">{job.campaign.name} — {job.campaign.organization.name}</p>
            </div>
            <button onClick={onClose} className="text-2xl">&times;</button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Status: <span className="font-medium">{job.status}</span></div>
              <div>Partner: <span className="font-medium">{job.productionPartner?.name ?? "Unassigned"}</span></div>
              <div>Tracking: <span className="font-mono">{job.trackingNumber || "—"}</span></div>
              <div>Created: {new Date(job.createdAt).toLocaleDateString()}</div>
            </div>

            {/* Artwork */}
            <div>
              <div className="font-medium text-gray-700 mb-2">Artwork</div>
              {artwork ? (
                <div className="space-y-2">
                  <div>Status: <span className={`font-semibold ${artwork.status === "APPROVED" ? "text-green-600" : artwork.status === "REJECTED" ? "text-red-600" : ""}`}>{artwork.status}</span></div>
                  {artwork.fileUrl && <a href={artwork.fileUrl} target="_blank" className="text-blue-600 hover:underline">View File →</a>}
                  {artwork.notes && <div className="text-sm bg-gray-100 p-2 rounded">Review notes: {artwork.notes}</div>}

                  {artwork.status !== "APPROVED" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleArtworkReview("APPROVED")} className="text-sm px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                      <button onClick={() => handleArtworkReview("REJECTED")} className="text-sm px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                    </div>
                  )}
                </div>
              ) : <div className="text-sm text-gray-500">No artwork uploaded</div>}
            </div>

            {/* Quick Status */}
            <div>
              <div className="font-medium mb-2">Quick Status</div>
              <div className="flex gap-2 flex-wrap">
                {QUICK_STATUSES.map(s => (
                  <button key={s} onClick={() => handleQuickStatus(s)} disabled={isUpdating} className="border px-3 py-1 text-sm rounded hover:bg-gray-100">{s.replace("_", " ")}</button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="font-medium mb-2">Internal Notes</div>
              <div className="max-h-32 overflow-auto space-y-2 mb-2">
                {events.filter(e => e.metadata?.type === "INTERNAL_NOTE").map(e => (
                  <div key={e.id} className="text-sm bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">{e.message}</div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add note..." className="flex-1 border rounded px-2 py-1 text-sm" />
                <button onClick={handleAddNote} disabled={!note.trim() || isAddingNote} className="bg-gray-800 text-white px-3 rounded text-sm">Add</button>
              </div>
            </div>

            {/* History */}
            <div>
              <div className="font-medium mb-2">Event History</div>
              <div className="max-h-48 overflow-auto space-y-2 text-sm bg-gray-50 p-3 rounded">
                {events.length ? events.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).map(e => (
                  <div key={e.id} className="border-l pl-3">{e.status} — {e.message}</div>
                )) : <div className="text-gray-500">No events</div>}
              </div>
            </div>
          </div>

          <div className="border-t p-4 flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 border rounded text-sm">Close</button>
            <button onClick={() => onUpdateStatus(job)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Full Status Update</button>
            <button onClick={() => onReassign(job)} className="px-4 py-2 bg-amber-600 text-white rounded text-sm">Reassign</button>
          </div>
        </div>
      </div>
    </>
  );

  async function handleAddNote() {
    if (!note.trim() || !job) return;
    await addNoteMutation.mutateAsync({ jobId: job.id, note: note.trim() });
  }

  async function handleQuickStatus(status: string) {
    await updateStatusMutation.mutateAsync({ jobId: job.id, status: status as any });
  }
}
