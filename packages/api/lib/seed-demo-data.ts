import type { PrismaClient } from "@prisma/client";
import { activateOrderForProduction } from "./activate-order-for-production";

export type SeedDemoDataResult = {
  draftCampaignId: string;
  orderIds: string[];
};

/** Sample campaigns + orders for the signed-in customer's organization. */
export async function seedDemoDataForOrganization(
  prisma: PrismaClient,
  organizationId: string
): Promise<SeedDemoDataResult> {
  const partner = await prisma.productionPartner.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!partner) {
    await prisma.productionPartner.create({
      data: {
        id: "seed_default_partner",
        name: "Default Print Partner",
        apiKey: "seed_change_in_ops",
        isActive: true,
      },
    });
  }

  const draft = await prisma.campaign.create({
    data: {
      organizationId,
      name: "Spring EDDM — Draft",
      size: "6x11",
      quantity: 3200,
      productType: "EDDM",
      productSlug: "every-door-direct-mail",
      totalPriceCents: 16800,
      unitPriceCents: 5,
      status: "DRAFT",
      notes: "Sample draft — finish targeting and artwork in My campaigns.",
    },
  });

  const orderInProduction = await prisma.campaign.create({
    data: {
      organizationId,
      name: "Neighborhood Saturation Mail",
      size: "6x11",
      quantity: 2500,
      productType: "EDDM",
      productSlug: "every-door-direct-mail",
      totalPriceCents: 12500,
      unitPriceCents: 5,
      status: "DRAFT",
    },
    include: { savedMap: true },
  });

  await activateOrderForProduction(prisma, orderInProduction, {
    amountPaidCents: 12500,
    purchaserEmail: null,
    actor: "system:demo-seed",
  });

  const orderShipped = await prisma.campaign.create({
    data: {
      organizationId,
      name: "Targeted Movers Campaign",
      size: "4x6",
      quantity: 1800,
      productType: "TARGETED",
      productSlug: "targeted-direct-mail",
      totalPriceCents: 9900,
      unitPriceCents: 5,
      status: "DRAFT",
    },
    include: { savedMap: true },
  });

  const { productionJob: shippedJob } = await activateOrderForProduction(prisma, orderShipped, {
    amountPaidCents: 9900,
    actor: "system:demo-seed",
  });

  const trackingNumber = "1Z999AA10123456784";
  await prisma.productionJob.update({
    where: { id: shippedJob.id },
    data: {
      status: "SHIPPED",
      trackingNumber,
      shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.jobEvent.create({
    data: {
      productionJobId: shippedJob.id,
      status: "SHIPPED",
      note: `Demo shipment — tracking ${trackingNumber}`,
      actor: "system:demo-seed",
    },
  });

  return {
    draftCampaignId: draft.id,
    orderIds: [orderInProduction.id, orderShipped.id],
  };
}
