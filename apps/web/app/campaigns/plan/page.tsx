import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CampaignWizard } from "@/components/campaign-wizard/CampaignWizard";
import { isMelissaBuyerDoorEnabled } from "@/lib/melissa-buyer-door";
import { MAP_QUOTE_HREF } from "@/lib/products";

export const dynamic = "force-dynamic";

async function isBuyerSignedIn(): Promise<boolean> {
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
    !process.env.CLERK_SECRET_KEY?.trim()
  ) {
    return false;
  }
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const session = await auth();
    return Boolean(session.userId);
  } catch {
    return false;
  }
}

/**
 * Signed-in Melissa buyer door. Public /map-tool stays Census-only.
 * Flag off (including Production) redirects to the Census map.
 */
export default async function MelissaPlanPage() {
  if (!isMelissaBuyerDoorEnabled()) {
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
      <CampaignWizard melissaDoorForced />
    </Suspense>
  );
}
