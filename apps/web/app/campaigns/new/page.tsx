import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CampaignWizard } from "@/components/campaign-wizard/CampaignWizard";
import { parseCampaignWizardParams, unpersistedWizardEntryRedirect } from "@/lib/products";

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

  if (!campaignId) {
    const params = new URLSearchParams();
    const product = firstParam(raw.product);
    const size = firstParam(raw.size);
    if (product) params.set("product", product);
    if (size) params.set("size", size);

    const parsed = parseCampaignWizardParams(params);
    const entryRedirect = unpersistedWizardEntryRedirect(
      parsed.product,
      await isBuyerSignedIn()
    );
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
