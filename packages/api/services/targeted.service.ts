import type { TargetingMetadata } from "../lib/targeting-summary";

export type GenerateTargetedListInput = {
  zctas: string[];
  filters?: TargetingMetadata["filters"];
  campaignId: string;
};

export type GenerateTargetedListResult = {
  listProvider: string;
  listRequestId: string;
  recipientCount: number;
  isStub: boolean;
  warnings: string[];
};

/**
 * Phase 1.5 — Melissa / Data Axle list purchase + CASS/DPV.
 * Returns a stub count derived from Census estimate until vendor API keys are configured.
 */
export async function generateTargetedList(
  input: GenerateTargetedListInput,
  estimatedHouseholds: number
): Promise<GenerateTargetedListResult> {
  const provider = process.env.TARGETED_LIST_PROVIDER ?? "melissa";

  if (!process.env.MELISSA_API_KEY && !process.env.DATA_AXLE_API_KEY) {
    return {
      listProvider: provider,
      listRequestId: `stub-${input.campaignId}`,
      recipientCount: estimatedHouseholds,
      isStub: true,
      warnings: [
        "No list vendor API key configured (MELISSA_API_KEY / DATA_AXLE_API_KEY).",
        "Recipient count matches Census estimate — not verified mover addresses.",
      ],
    };
  }

  // TODO: vendor HTTP client, async job polling, encrypted storage
  return {
    listProvider: provider,
    listRequestId: `pending-${input.campaignId}`,
    recipientCount: estimatedHouseholds,
    isStub: true,
    warnings: ["Vendor keys present but targeted.service integration is not implemented yet."],
  };
}
