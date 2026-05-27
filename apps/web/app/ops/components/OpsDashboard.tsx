"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

import { JobsTable } from "./JobsTable";
import { ActivityFeed } from "./ActivityFeed";
import { StatusUpdateModal } from "./StatusUpdateModal";
import { ReassignModal } from "./ReassignModal";
import { JobDetailDrawer } from "./JobDetailDrawer";
import { CreatePartnerModal } from "./CreatePartnerModal";

import type { RouterOutputs } from "@/lib/trpc/client";

type Job = RouterOutputs["admin"]["productionJobs"]["list"]["items"][number];

interface Filters {
  status?: string;
  partnerId?: string;
  search?: string;
}

export function OpsDashboard() {
  const [filters, setFilters] = useState<Filters>({});
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Modal/Drawer state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showCreatePartnerModal, setShowCreatePartnerModal] = useState(false);

  // Data for filters
  const partnersQuery = trpc.admin.partners.list.useQuery();

  // Main queries
  const jobsQuery = trpc.admin.productionJobs.list.useQuery(
    { ...filters, cursor, limit: 25 },
    { keepPreviousData: true }
  );
  const activityQuery = trpc.admin.activity.recent.useQuery({ limit: 15 });
  const statsQuery = trpc.admin.dashboard.stats.useQuery();
  const analyticsQuery = trpc.admin.dashboard.analytics.useQuery();

  const utils = trpc.useUtils();

  const jobs = jobsQuery.data?.items ?? [];
  const nextCursor = jobsQuery.data?.nextCursor;

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCursor(undefined);
  };

  const openStatusModal = (job: Job) => {
    setSelectedJob(job);
    setShowStatusModal(true);
    setShowDetailDrawer(false);
  };

  const openReassignModal = (job: Job) => {
    setSelectedJob(job);
    setShowReassignModal(true);
    setShowDetailDrawer(false);
  };

  const openDetail = (job: Job) => {
    setSelectedJob(job);
    setShowDetailDrawer(true);
  };

  const handleActionSuccess = () => {
    utils.admin.productionJobs.list.invalidate();
    utils.admin.activity.recent.invalidate();
    utils.admin.partners.list.invalidate();
    utils.admin.dashboard.analytics.invalidate();
  };

  return (
    <div>
      {/* Improved Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Jobs Shown</div>
          <div className="text-2xl font-semibold text-gray-900">{jobs.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Shipped</div>
          <div className="text-2xl font-semibold text-gray-900">{statsQuery.data?.shipped ?? "—"}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Delivered</div>
          <div className="text-2xl font-semibold text-gray-900">{statsQuery.data?.delivered ?? "—"}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Active Partners</div>
          <div className="text-2xl font-semibold text-gray-900">
            {statsQuery.data?.activePartners ?? partnersQuery.data?.filter((p) => p.isActive).length ?? "..."}
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Analytics Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">Total Jobs</div>
            <div className="text-2xl font-semibold text-gray-900">{analyticsQuery.data?.totalJobs ?? "—"}</div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">Avg Delivery (days)</div>
            <div className="text-2xl font-semibold text-gray-900">{analyticsQuery.data?.avgDeliveryDays ?? "—"}</div>
          </div>
          <div className="rounded-lg border bg-white p-4 col-span-2 md:col-span-2">
            <div className="text-sm text-gray-500 mb-1">Jobs by Status</div>
            <div className="flex flex-wrap gap-2 text-sm">
              {analyticsQuery.data?.byStatus
                ? Object.entries(analyticsQuery.data.byStatus).map(([status, count]) => (
                    <span key={status} className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                      {status}: {count}
                    </span>
                  ))
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Jobs Section */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Production Jobs</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreatePartnerModal(true)}
                className="text-sm rounded bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
              >
                + Add Partner
              </button>
              <button
                onClick={() => {
                  setFilters({});
                  setCursor(undefined);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          </div>

          {/* Filters - now includes Partner dropdown */}
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search campaign or customer..."
              className="w-64 rounded border px-3 py-2 text-sm"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />

            <select
              className="rounded border px-3 py-2 text-sm"
              value={filters.status || ""}
              onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
            >
              <option value="">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="SENT_TO_PROVIDER">Sent to Provider</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            {/* New: Partner Filter */}
            <select
              className="rounded border px-3 py-2 text-sm min-w-[160px]"
              value={filters.partnerId || ""}
              onChange={(e) => handleFilterChange({ partnerId: e.target.value || undefined })}
              disabled={partnersQuery.isLoading}
            >
              <option value="">All Partners</option>
              {partnersQuery.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <JobsTable
            jobs={jobs}
            isLoading={jobsQuery.isLoading}
            onLoadMore={() => {
              if (nextCursor) setCursor(nextCursor);
            }}
            hasMore={!!nextCursor}
            onUpdateStatus={openStatusModal}
            onReassign={openReassignModal}
            onRowClick={openDetail}
          />
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <ActivityFeed
            events={activityQuery.data ?? []}
            isLoading={activityQuery.isLoading}
          />
        </div>
      </div>

      {/* Modals */}
      <StatusUpdateModal
        job={selectedJob}
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSuccess={handleActionSuccess}
      />

      <ReassignModal
        job={selectedJob}
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onSuccess={handleActionSuccess}
      />

      {/* New: Job Detail Drawer instead of modal */}
      <JobDetailDrawer
        job={selectedJob}
        isOpen={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
        onUpdateStatus={openStatusModal}
        onReassign={openReassignModal}
      />

      <CreatePartnerModal
        isOpen={showCreatePartnerModal}
        onClose={() => setShowCreatePartnerModal(false)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
