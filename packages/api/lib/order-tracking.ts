/** Customer-facing order & production tracking (derived from Campaign + ProductionJob). */

export const CUSTOMER_TRACKING_STEPS = [
  { key: "PAID", label: "Paid & confirmed" },
  { key: "ARTWORK", label: "Artwork review" },
  { key: "IN_PRODUCTION", label: "In production" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

export type CustomerTrackingStepKey = (typeof CUSTOMER_TRACKING_STEPS)[number]["key"];

export type TimelineStepState = "complete" | "current" | "upcoming";

export type OrderTrackingSummary = {
  stepKey: CustomerTrackingStepKey;
  stepIndex: number;
  stepLabel: string;
  headline: string;
  detail: string;
  progressPercent: number;
  trackingNumber: string | null;
  trackingUrl: string | null;
  carrier: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  partnerName: string | null;
  timeline: Array<{
    key: CustomerTrackingStepKey;
    label: string;
    state: TimelineStepState;
  }>;
  activity: Array<{
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
  }>;
};

type ArtworkLike = { status?: string | null } | null | undefined;
type JobLike = {
  status?: string | null;
  trackingNumber?: string | null;
  shippedAt?: Date | string | null;
  deliveredAt?: Date | string | null;
  productionPartner?: { name?: string | null } | null;
  events?: Array<{
    id: string;
    status: string;
    note?: string | null;
    createdAt: Date | string;
  }>;
} | null | undefined;

type CampaignLike = {
  status: string;
  paidAt?: Date | string | null;
};

function iso(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  return typeof d === "string" ? d : d.toISOString();
}

/** Guess carrier and build a tracking URL when possible. */
export function resolveTrackingUrl(trackingNumber: string): {
  carrier: string;
  url: string;
} {
  const tn = trackingNumber.trim();
  const upper = tn.toUpperCase();

  if (/^1Z[0-9A-Z]{16}$/i.test(tn)) {
    return {
      carrier: "UPS",
      url: `https://www.ups.com/track?tracknum=${encodeURIComponent(tn)}`,
    };
  }
  if (/^(94|92|93|95)\d{20}$/.test(tn.replace(/\s/g, "")) || /^\d{22}$/.test(tn.replace(/\s/g, ""))) {
    return {
      carrier: "USPS",
      url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(tn)}`,
    };
  }
  if (/^\d{12,15}$/.test(tn.replace(/\s/g, "")) && upper.startsWith("7")) {
    return {
      carrier: "FedEx",
      url: `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(tn)}`,
    };
  }

  return {
    carrier: "Carrier",
    url: `https://www.google.com/search?q=${encodeURIComponent(tn + " tracking")}`,
  };
}

function resolveCurrentStep(
  campaign: CampaignLike,
  artwork: ArtworkLike,
  job: JobLike
): CustomerTrackingStepKey {
  if (job?.status === "DELIVERED" || campaign.status === "COMPLETED") {
    return "DELIVERED";
  }
  if (job?.status === "SHIPPED" || job?.trackingNumber) {
    return "SHIPPED";
  }
  if (
    job?.status === "RECEIVED" ||
    job?.status === "SENT_TO_PROVIDER" ||
    campaign.status === "IN_PRODUCTION"
  ) {
    return "IN_PRODUCTION";
  }
  if (artwork?.status === "PENDING" || artwork?.status === "REJECTED") {
    return "ARTWORK";
  }
  if (campaign.status === "PAID" || campaign.paidAt) {
    return "PAID";
  }
  return "PAID";
}

function headlineForStep(step: CustomerTrackingStepKey, job: JobLike): string {
  switch (step) {
    case "DELIVERED":
      return "Delivered";
    case "SHIPPED":
      return "On the way";
    case "IN_PRODUCTION":
      if (job?.status === "SENT_TO_PROVIDER") return "Sent to print partner";
      return "In production";
    case "ARTWORK":
      return "Artwork under review";
    default:
      return "Order confirmed";
  }
}

function detailForStep(
  step: CustomerTrackingStepKey,
  job: JobLike,
  artwork: ArtworkLike
): string {
  switch (step) {
    case "DELIVERED":
      return "Your mail drop has been completed.";
    case "SHIPPED":
      return job?.trackingNumber
        ? "Use your tracking number below to follow the shipment."
        : "Your order has shipped — tracking will appear shortly.";
    case "IN_PRODUCTION":
      return job?.productionPartner?.name
        ? `${job.productionPartner.name} is preparing your print run.`
        : "Your postcards are being prepared for print.";
    case "ARTWORK":
      if (artwork?.status === "REJECTED") {
        return "Please upload revised artwork from My Campaigns.";
      }
      return "Our team is reviewing your artwork before production.";
    default:
      return "Payment received. We'll move to production when artwork is approved.";
  }
}

export function buildOrderTracking(
  campaign: CampaignLike,
  artwork: ArtworkLike,
  job: JobLike
): OrderTrackingSummary {
  const stepKey = resolveCurrentStep(campaign, artwork, job);
  const stepIndex = CUSTOMER_TRACKING_STEPS.findIndex((s) => s.key === stepKey);
  const stepLabel = CUSTOMER_TRACKING_STEPS[stepIndex]?.label ?? stepKey;

  const trackingNumber = job?.trackingNumber?.trim() || null;
  const trackingResolved = trackingNumber ? resolveTrackingUrl(trackingNumber) : null;

  const timeline = CUSTOMER_TRACKING_STEPS.map((step, index) => {
    let state: TimelineStepState = "upcoming";
    if (index < stepIndex) state = "complete";
    else if (index === stepIndex) state = "current";
    return { key: step.key, label: step.label, state };
  });

  const progressPercent = Math.round(
    ((stepIndex + 1) / CUSTOMER_TRACKING_STEPS.length) * 100
  );

  return {
    stepKey,
    stepIndex,
    stepLabel,
    headline: headlineForStep(stepKey, job),
    detail: detailForStep(stepKey, job, artwork),
    progressPercent,
    trackingNumber,
    trackingUrl: trackingResolved?.url ?? null,
    carrier: trackingResolved?.carrier ?? null,
    shippedAt: iso(job?.shippedAt),
    deliveredAt: iso(job?.deliveredAt),
    partnerName: job?.productionPartner?.name ?? null,
    timeline,
    activity: (job?.events ?? []).map((e) => ({
      id: e.id,
      status: e.status,
      note: e.note ?? null,
      createdAt: iso(e.createdAt) ?? new Date().toISOString(),
    })),
  };
}
