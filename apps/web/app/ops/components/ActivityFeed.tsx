"use client";

import type { RouterOutputs } from "@/lib/trpc/client";

type ActivityEvent = RouterOutputs["admin"]["activity"]["recent"][number];

interface ActivityFeedProps {
  events: ActivityEvent[];
  isLoading: boolean;
}

export function ActivityFeed({ events, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading activity...</div>;
  }

  if (events.length === 0) {
    return <div className="text-sm text-gray-500">No recent activity.</div>;
  }

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      {events.map((event) => {
        const job = event.productionJob;
        const campaign = job?.campaign;
        const org = campaign?.organization;

        return (
          <div key={event.id} className="border-l-2 border-gray-200 pl-3 text-sm">
            <div className="font-medium text-gray-900">
              {event.status}
            </div>
            <div className="text-gray-600">
              {campaign?.name} — {org?.name}
            </div>
            <div className="text-xs text-gray-500">
              {job?.productionPartner?.name} • {new Date(event.createdAt).toLocaleString()}
            </div>
            {event.message && (
              <div className="mt-0.5 text-xs italic text-gray-500">{event.message}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
