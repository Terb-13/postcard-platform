"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ArtworkPreview } from "@/components/ArtworkPreview";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [note, setNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const addNoteMutation = trpc.admin.productionJobs.addNote.useMutation({
    onSuccess: () => {
      setNote("");
      onRefresh?.();
    },
  });

  const reviewArtwork = trpc.admin.artwork.review.useMutation({
    onSuccess: () => onRefresh?.(),
  });

  if (!job) return null;

  const events = job.events ?? [];
  const artwork = job.campaign.artwork;

  // Build thumbnails map for ArtworkPreview
  const thumbnails = artwork?.thumbnails?.reduce((acc, t) => {
    acc[t.page] = t.url;
    return acc;
  }, {} as Record<number, string>) || {};

  const handleAddNote = async () => {
    if (!note.trim() || !job) return;
    setIsAddingNote(true);
    try {
      await addNoteMutation.mutateAsync({ jobId: job.id, note: note.trim() });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleArtworkReview = async (status: "APPROVED" | "REJECTED") => {
    const notes = prompt(status === "APPROVED" ? "Notes (optional):" : "Reason for rejection:") || undefined;
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

            {/* Artwork with Multi-Page + Server Thumbnails */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                <span>Artwork</span>
                {artwork && totalPages > 1 && (
                  <span className="text-xs text-gray-500">Page {currentPage} / {totalPages}</span>
                )}
              </div>

              {artwork ? (
                <div className="space-y-3">
                  <ArtworkPreview
                    fileUrl={artwork.fileUrl}
                    thumbnails={thumbnails}
                    thumbnailUrl={artwork.thumbnailUrl}
                    pageNumber={currentPage}
                    pageCount={artwork.pageCount ?? undefined}
                    rejectionNotes={artwork.notes}
                    onPageCountChange={setTotalPages}
                    className="h-64 w-full object-contain border rounded bg-white"
                  />

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
                      >
                        ← Prev
                      </button>
                      <span className="text-sm tabular-nums">{currentPage} / {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
                      >
                        Next →
                      </button>
                    </div>
                  )}

                  {artwork.notes && (
                    <div className="text-sm bg-red-50 border border-red-200 p-2 rounded">
                      <strong>Review notes:</strong> {artwork.notes}
                    </div>
                  )}

                  {artwork.status !== "APPROVED" && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleArtworkReview("APPROVED")} className="text-sm px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                      <button onClick={() => handleArtworkReview("REJECTED")} className="text-sm px-3 py-1 bg-red-600 text-white rounded">Reject / Request Changes</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No artwork uploaded yet.</div>
              )}
            </div>

            {/* Quick Status */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Quick Status</div>
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

            {/* Internal Notes + History (simplified for brevity) */}
            {/* ... keep your existing notes and history sections ... */}
          </div>

          <div className="border-t p-4 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Close</button>
            <button onClick={() => onUpdateStatus(job)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded">Full Status Update</button>
            <button onClick={() => onReassign(job)} className="px-4 py-2 text-sm bg-amber-600 text-white rounded">Reassign</button>
          </div>
        </div>
      </div>
    </>
  );

  // ... (keep your existing handleQuickStatus, handleAddNote, etc.)
}
