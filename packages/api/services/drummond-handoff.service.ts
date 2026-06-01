import type { MailingJob } from "@prisma/client";
import { hasR2Config, uploadMailingManifest } from "../lib/storage";
import { buildEddmManifestCsv } from "./eddm.service";
import type { EddmRouteSelection } from "./types";

export type HandoffInput = {
  mailingJob: MailingJob;
  campaignName: string;
  size: string;
  campaignId: string;
};

export type HandoffResult = {
  manifestUrl: string | null;
  manifestKey: string | null;
  manifestFormat: "csv" | "json";
  uploaded: boolean;
  warnings: string[];
};

/** Drummond-facing package metadata (extend when partner spec is finalized). */
export type DrummondManifestMeta = {
  version: "1";
  campaignName: string;
  campaignId: string;
  mailingJobId: string;
  productType: string;
  postcardSize: string;
  finalQuantity: number | null;
  dropDate: string | null;
  routes?: EddmRouteSelection[];
  recipientCount?: number | null;
};

function buildDrummondJsonMeta(input: HandoffInput, routes: EddmRouteSelection[]): string {
  const meta: DrummondManifestMeta = {
    version: "1",
    campaignName: input.campaignName,
    campaignId: input.campaignId,
    mailingJobId: input.mailingJob.id,
    productType: input.mailingJob.type,
    postcardSize: input.size,
    finalQuantity: input.mailingJob.finalQuantity,
    dropDate: input.mailingJob.dropDate?.toISOString() ?? null,
    recipientCount: input.mailingJob.recipientCount,
    routes: input.mailingJob.type === "EDDM" ? routes : undefined,
  };
  return JSON.stringify(meta, null, 2);
}

/**
 * Build fulfillment package for Drummond (or any ProductionPartner).
 * EDDM: route CSV + JSON sidecar. Targeted: JSON until list file format is defined.
 */
export async function handoffToDrummond(input: HandoffInput): Promise<HandoffResult> {
  const warnings: string[] = [];
  const routes = (input.mailingJob.selectedRoutes ?? []) as EddmRouteSelection[];
  const baseKey = `manifests/${input.campaignId}/${input.mailingJob.id}`;

  let manifestFormat: "csv" | "json" = "csv";
  let manifestBody: string;

  if (input.mailingJob.type === "EDDM" && routes.length > 0) {
    manifestBody = buildEddmManifestCsv(routes);
  } else {
    manifestFormat = "json";
    manifestBody = buildDrummondJsonMeta(input, routes);
  }

  if (!hasR2Config()) {
    warnings.push(
      "R2 storage not configured — manifest was not uploaded. Set R2_* env vars on staging/production."
    );
    return {
      manifestUrl: null,
      manifestKey: null,
      manifestFormat,
      uploaded: false,
      warnings,
    };
  }

  try {
    const ext = manifestFormat === "csv" ? "csv" : "json";
    const key = `${baseKey}/drummond.${ext}`;
    const contentType = manifestFormat === "csv" ? "text/csv" : "application/json";
    const { url } = await uploadMailingManifest(manifestBody, key, contentType);

    if (manifestFormat === "csv") {
      const metaKey = `${baseKey}/drummond-meta.json`;
      await uploadMailingManifest(buildDrummondJsonMeta(input, routes), metaKey, "application/json");
    }

    return {
      manifestUrl: url,
      manifestKey: key,
      manifestFormat,
      uploaded: true,
      warnings,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    warnings.push(message);
    return {
      manifestUrl: null,
      manifestKey: null,
      manifestFormat,
      uploaded: false,
      warnings,
    };
  }
}
