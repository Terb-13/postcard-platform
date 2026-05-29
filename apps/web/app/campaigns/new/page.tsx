"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { CampaignWizard } from "@/components/campaign-wizard/CampaignWizard";

export default function NewCampaignPage() {
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
