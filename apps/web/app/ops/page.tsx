import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { trpc } from "@/lib/trpc/client"; // We'll use this on client

import { OpsDashboard } from "./components/OpsDashboard";

/**
 * Internal Operations Dashboard
 * This is the ERP-style view for your team.
 */
export default async function OpsPage() {
  const user = await getCurrentUser();

  if (!user || !["ADMIN", "OPERATIONS"].includes(user.role)) {
    redirect("/dashboard"); // or show access denied
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Operations Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Monitor all orders, production jobs, and partner activity in real time.
        </p>
      </div>

      <OpsDashboard />
    </div>
  );
}
