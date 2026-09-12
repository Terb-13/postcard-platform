import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CampaignWizard } from "@/components/campaign-wizard/CampaignWizard";
import { isBuyerSignedIn } from "@/lib/buyer-session";
import {
  isMelissaBuyerDoorEnabled,
  isPreviewStripeTestCheckoutAllowed,
} from "@/lib/melissa-buyer-door";
import { MAP_QUOTE_HREF } from "@/lib/products";

export const dynamic = "force-dynamic";

/**
 * Signed-in Melissa buyer door. Public /map-tool stays Census-only.
 * Flag off (including Production) redirects to the Census map.
 */
export default async function MelissaPlanPage() {
  const buyerDoorEnabled = isMelissaBuyerDoorEnabled();
  if (!buyerDoorEnabled) {
    redirect(MAP_QUOTE_HREF);
  }

  const signedIn = await isBuyerSignedIn();
  if (!signedIn) {
    redirect(MAP_QUOTE_HREF);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">
          Loading Melissa plan…
        </div>
      }
    >
      <CampaignWizard
        melissaDoorForced
        buyerDoorEnabled={buyerDoorEnabled}
        previewTestCheckoutEnabled={isPreviewStripeTestCheckoutAllowed()}
      />
    </Suspense>
  );
}
