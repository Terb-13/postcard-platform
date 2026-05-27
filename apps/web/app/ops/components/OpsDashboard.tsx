"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

import { JobsTable } from "./JobsTable";
import { ActivityFeed } from "./ActivityFeed";

interface Filters {
  status?: string;
  partnerId?: string;
  search?: string;
}

export function OpsDashboard() {
  const [filters, setFilters] = useState<Filters>({});
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Main jobs query (uses the powerful admin procedure)
  const jobsQuery = trpc.admin.productionJobs.list.useQuery(
    {
      ...filters,
      cursor,
      limit: 25,
    },
    {
      keepPreviousData: true,
    }
  );

  // Recent activity feed
  const activityQuery = trpc.admin.activity.recent.useQuery({ limit: 15 });

  const jobs = jobsQuery.data?.items ?? [];
  const nextCursor = jobsQuery.data?.nextCursor;

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCursor(undefined); // reset pagination when filters change
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Main Jobs Section */}
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Production Jobs</h2>
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

        {/* Simple Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search campaign or customer..."
            className="rounded border px-3 py-2 text-sm"
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

          {/* TODO: Add partner dropdown once we have partners query wired */}
        </div>

        <JobsTable
          jobs={jobs}
          isLoading={jobsQuery.isLoading}
          onLoadMore={() => {
            if (nextCursor) setCursor(nextCursor);
          }}
          hasMore={!!nextCursor}
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
  );
}
