import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingTargetingWorkspace } from "@/components/marketing/MarketingTargetingWorkspace";

/**
 * Dedicated map tool — redesign/map-tool.html
 * Live Census targeting via MarketingTargetingWorkspace (standalone variant).
 */
export default function MapToolPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />
      <MarketingTargetingWorkspace variant="standalone" showPageChrome showSectionHeader={false} />
      <MarketingFooter />
    </div>
  );
}
