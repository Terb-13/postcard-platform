import { Database } from "lucide-react";

type ProductCensusTrustBadgeProps = {
  className?: string;
};

/** Subtle trust signal — Census-powered targeting */
export function ProductCensusTrustBadge({ className = "" }: ProductCensusTrustBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-2xl border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 px-4 py-2.5 text-sm text-[#0A2540] ${className}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0EA5E9] shadow-sm">
        <Database className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
      <span>
        <span className="font-semibold">Powered by U.S. Census Data</span>
        <span className="hidden text-gray-600 sm:inline">
          {" "}
          — live household counts on every campaign
        </span>
      </span>
    </div>
  );
}
