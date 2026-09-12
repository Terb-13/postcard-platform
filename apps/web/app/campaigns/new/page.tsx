import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CampaignWizard } from "@/components/campaign-wizard/CampaignWizard";
import { isBuyerSignedIn } from "@/lib/buyer-session";
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

export default async function NewCampaignPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const campaignId = firstParam(raw.campaignId);
  const signedIn = await isBuyerSignedIn();
  const buyerDoorEnabled = isMelissaBuyerDoorEnabled();

  // Signed-out cannot mail. Do not 200 a campaign/checkout wizard.
  if (!signedIn) {
    redirect(MAP_QUOTE_HREF);
  }

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
  const melissaDoor = parsed.door === "melissa" && buyerDoorEnabled;

  // Flag off: no Melissa door, including draft resume (?campaignId=).
  if (parsed.door === "melissa" && !buyerDoorEnabled) {
    if (!campaignId) {
      redirect(MAP_QUOTE_HREF);
    }
  }

  if (!campaignId) {
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
      <CampaignWizard buyerDoorEnabled={buyerDoorEnabled} />
    </Suspense>
  );
}
