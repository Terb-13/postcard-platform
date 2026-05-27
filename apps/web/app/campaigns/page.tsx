import { ProductionTimeline } from "@/components/ProductionTimeline";

// ... inside the campaign card, after the status section for in-production campaigns

{isInProduction && (
  <div className="mt-4 pt-4 border-t">
    <div className="text-xs font-medium text-gray-500 mb-2">Timeline</div>
    <ProductionTimeline campaign={campaign} />
  </div>
)}
