"use client";

import type { RouterOutputs } from "@/lib/trpc/client";

type Job = RouterOutputs["admin"]["productionJobs"]["list"]["items"][number];

interface JobDetailDrawerProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (job: Job) => void;
  onReassign: (job: Job) => void;
}

export function JobDetailDrawer({
  job,
  isOpen,
  onClose,
  onUpdateStatus,
  onReassign,
}: JobDetailDrawerProps) {
  if (!job) return null;

  const events = job.events ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold">Job Details</h2>
              <p className="text-sm text-gray-600">
                {job.campaign.name} — {job.campaign.organization.name}
              </p>
            </div>
            <button onClick={onClose} className="text-2xl leading-none">&times;</button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
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

            {/* Proof Section - New */}
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Proof</div>
              {job.proofUrl ? (
                <a
                  href={job.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded border border-blue-300 bg-blue-50 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100"
                >
                  View Proof PDF
                </a>
              ) : (
                <div className="text-sm text-gray-500">No proof uploaded yet.</div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Actions</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onUpdateStatus(job)}
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Update Status
                </button>
                <button
                  onClick={() => onReassign(job)}
                  className="rounded bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700"
                >
                  Reassign Partner
                </button>
              </div>
            </div>

            {/* Full Event History */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">Event History</div>
              {events.length > 0 ? (
                <div className="space-y-3 rounded-lg border bg-gray-50 p-4 max-h-[400px] overflow-auto">
                  {events
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((event) => (
                      <div key={event.id} className="border-l-2 border-gray-300 pl-3 text-sm">
                        <div className="font-medium">{event.status}</div>
                        <div className="text-gray-600">{event.message}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(event.createdAt).toLocaleString()}
                        </div>
                        {event.metadata && (
                          <pre className="mt-1 rounded bg-white p-2 text-xs overflow-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No events yet.</div>
              )}
            </div>
          </div>

          <div className="border-t p-4 flex justify-end">
            <button onClick={onClose} className="rounded border px-4 py-2 text-sm hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
