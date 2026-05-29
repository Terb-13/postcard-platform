"use client";

import type { RouterOutputs } from "@/lib/trpc/client";

type Job = RouterOutputs["admin"]["productionJobs"]["list"]["items"][number];

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (job: Job) => void;
  onReassign: (job: Job) => void;
}

export function JobDetailModal({
  job,
  isOpen,
  onClose,
  onUpdateStatus,
  onReassign,
}: JobDetailModalProps) {
  if (!isOpen || !job) return null;

  const events = job.events ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Job Details</h2>
            <p className="text-sm text-gray-600">
              {job.campaign.name} — {job.campaign.organization.name}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Job Information</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Status:</strong> {job.status}</div>
              <div><strong>Partner:</strong> {job.productionPartner?.name ?? "Unassigned"}</div>
              <div><strong>Tracking:</strong> {job.trackingNumber || "—"}</div>
              <div><strong>Created:</strong> {new Date(job.createdAt).toLocaleString()}</div>
              <div><strong>Campaign Size:</strong> {job.campaign.size} × {job.campaign.quantity}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onUpdateStatus(job)}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Update Status
              </button>
              <button
                onClick={() => onReassign(job)}
                className="px-4 py-2 text-sm rounded bg-amber-600 text-white hover:bg-amber-700"
              >
                Reassign Partner
              </button>
            </div>
          </div>

          {/* Full Event History */}
          <div className="md:col-span-2">
            <h3 className="font-medium text-gray-900 mb-3">Event History</h3>
            {events.length > 0 ? (
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50 max-h-80 overflow-auto">
                {events
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((event) => (
                    <div key={event.id} className="border-l-2 border-gray-300 pl-3 text-sm">
                      <div className="font-medium">{event.status}</div>
                      <div className="text-gray-600">{event.note}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(event.createdAt).toLocaleString()}
                      </div>
                      {event.metadata && (
                        <pre className="text-xs bg-white p-1 mt-1 rounded overflow-auto">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No events recorded yet.</div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
