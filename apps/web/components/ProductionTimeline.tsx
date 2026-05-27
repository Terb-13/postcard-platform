"use client";

import type { RouterOutputs } from "@/lib/trpc/client";

type CampaignWithProduction = RouterOutputs["campaign"]["getMine"][number];

interface ProductionTimelineProps {
  campaign: CampaignWithProduction;
}

// Define the customer-facing stages
const STAGES = [
  { key: "PAID", label: "Paid & Confirmed" },
  { key: "ARTWORK", label: "Artwork Review" },
  { key: "IN_PRODUCTION", label: "In Production" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

export function ProductionTimeline({ campaign }: ProductionTimelineProps) {
  const job = campaign.productionJobs?.[0];
  const artwork = campaign.artwork;

  const getCurrentStage = (): StageKey => {
    if (campaign.status === "PAID" || campaign.status === "IN_PRODUCTION") {
      if (artwork?.status === "REJECTED") return "ARTWORK";
      if (job?.status === "SHIPPED" || job?.status === "DELIVERED") {
        return job.status === "DELIVERED" ? "DELIVERED" : "SHIPPED";
      }
      return "IN_PRODUCTION";
    }
    if (campaign.stripePaymentIntentId) return "PAID";
    return "PAID"; // fallback
  };

  const currentStage = getCurrentStage();
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center flex-1 relative">
              {/* Line */}
              {index < STAGES.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 h-0.5 w-full -translate-y-1/2 ${isCompleted ? "bg-blue-600" : "bg-gray-200"}`}
                  style={{ width: "calc(100% - 2rem)" }}
                />
              )}

              {/* Circle */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium
                  ${isCompleted || isCurrent
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-400"}
                `}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Label */}
              <div
                className={`mt-2 text-center text-xs ${isCurrent ? "font-semibold text-blue-600" : "text-gray-600"}`}
              >
                {stage.label}
              </div>

              {/* Extra info */}
              {stage.key === "SHIPPED" && job?.trackingNumber && isCompleted && (
                <div className="mt-1 text-[10px] text-center text-blue-600 font-mono">
                  {job.trackingNumber}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current status message */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {currentStage === "ARTWORK" && artwork?.status === "REJECTED" ? (
          <span className="text-red-600">Artwork needs revision — see notes below</span>
        ) : (
          <span>Current stage: <strong>{STAGES[currentIndex]?.label}</strong></span>
        )}
      </div>
    </div>
  );
}
