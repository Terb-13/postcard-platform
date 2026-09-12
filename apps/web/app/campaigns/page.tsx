import {
  isMelissaBuyerDoorEnabled,
  isPreviewStripeTestCheckoutAllowed,
} from "@/lib/melissa-buyer-door";
import CampaignsListClient from "./CampaignsListClient";

export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  return (
    <CampaignsListClient
      buyerDoorEnabled={isMelissaBuyerDoorEnabled()}
      previewTestCheckoutEnabled={isPreviewStripeTestCheckoutAllowed()}
    />
  );
}
