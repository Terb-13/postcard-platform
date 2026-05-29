import type { RouterOutputs } from "@/lib/trpc/client";

type Job = RouterOutputs["admin"]["productionJobs"]["list"]["items"][number];

interface JobsTableProps {
  jobs: Job[]
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  onUpdateStatus?: (job: Job) => void
  onReassign?: (job: Job) => void
  onRowClick?: (job: Job) => void
}

export function JobsTable({
  jobs,
  isLoading,
  onLoadMore,
  hasMore,
  onUpdateStatus,
  onReassign,
  onRowClick,
}: JobsTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading jobs...</div>
  }

  if (!jobs || jobs.length === 0) {
    return <div className="p-8 text-center text-gray-500">No jobs found.</div>
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Payment</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Tracking</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {jobs.map((job) => (
            <tr
              key={job.id}
              onClick={() => onRowClick?.(job)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {job.campaign?.stripePaymentIntentId || job.campaign?.paidAt ? (
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
                    Not Paid
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-gray-600">
                {job.trackingNumber || "—"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onUpdateStatus?.(job)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Update
                </button>
                <button
                  onClick={() => onReassign?.(job)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Reassign
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="border-t p-4 text-center">
          <button
            onClick={onLoadMore}
            className="text-sm text-blue-600 hover:underline"
          >
            Load more jobs →
          </button>
        </div>
      )}
    </div>
  )
}
