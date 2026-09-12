import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CampaignWizard } from "@/components/campaign-wizard/CampaignWizard";
import { isMelissaBuyerDoorEnabled } from "@/lib/melissa-buyer-door";
import {
  MAP_QUOTE_HREF,
  parseCampaignWizardParams,
  unpersistedWizardEntryRedirect,
} from "@/lib/products";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

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

export default async function NewCampaignPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const campaignId = firstParam(raw.campaignId);
  const signedIn = await isBuyerSignedIn();

  // Signed-out cannot mail. Do not 200 a campaign/checkout wizard.
  if (!signedIn) {
    redirect(MAP_QUOTE_HREF);
  }

  if (!campaignId) {
    const params = new URLSearchParams();
    const product = firstParam(raw.product);
    const size = firstParam(raw.size);
    const door = firstParam(raw.door);
    const zips = firstParam(raw.zips);
    if (product) params.set("product", product);
    if (size) params.set("size", size);
    if (door) params.set("door", door);
    if (zips) params.set("zips", zips);

    const parsed = parseCampaignWizardParams(params);
    const buyerDoorEnabled = isMelissaBuyerDoorEnabled();
    const melissaDoor = parsed.door === "melissa" && buyerDoorEnabled;
    if (parsed.door === "melissa" && !buyerDoorEnabled) {
      redirect(MAP_QUOTE_HREF);
    }
    const entryRedirect = unpersistedWizardEntryRedirect(parsed.product, signedIn, {
      melissaDoor,
      buyerDoorEnabled,
    });
    if (entryRedirect) {
      redirect(entryRedirect);
    }
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)]">
          Loading campaign wizard…
        </div>
      }
    >
      <CampaignWizard />
    </Suspense>
  );
}
