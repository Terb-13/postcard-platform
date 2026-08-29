import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CampaignWizard } from "@/components/campaign-wizard/CampaignWizard";
import {
  isProductComingSoon,
  isProductQuoteOnly,
  parseCampaignWizardParams,
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

  if (!campaignId) {
    const params = new URLSearchParams();
    const product = firstParam(raw.product);
    const size = firstParam(raw.size);
    if (product) params.set("product", product);
    if (size) params.set("size", size);

    const parsed = parseCampaignWizardParams(params);
    if (parsed.product) {
      if (isProductComingSoon(parsed.product)) {
        redirect(`/products/${parsed.product.slug}`);
      }
      if (isProductQuoteOnly(parsed.product)) {
        redirect("/map-tool");
      }
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
