import { z } from "zod";

export const campaignBasicsSchema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  size: z.enum(["4x6", "5x7", "6x9", "6x11"]),
});

export const campaignReviewSchema = z.object({
  dropDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CampaignBasics = z.infer<typeof campaignBasicsSchema>;
export type CampaignReview = z.infer<typeof campaignReviewSchema>;

export const WIZARD_STEPS = [
  { id: "basics", label: "Basics", shortLabel: "Basics" },
  { id: "targeting", label: "Targeting", shortLabel: "Map" },
  { id: "creative", label: "Creative", shortLabel: "Art" },
  { id: "review", label: "Review", shortLabel: "Review" },
  { id: "checkout", label: "Checkout", shortLabel: "Pay" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];
