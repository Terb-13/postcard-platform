import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { activateOrderForProduction, isTestOrdersEnabled } from "./activate-order-for-production";

export function assertTestOrdersEnabled() {
  if (!isTestOrdersEnabled()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Test orders are disabled. Set ALLOW_TEST_ORDERS=true in development.",
    });
  }
}

/** Create a paid + in-production order without Stripe (dev / demo). */
export async function createTestOrderForOrganization(
  prisma: PrismaClient,
  organizationId: string,
  input: {
    campaignId?: string;
    name?: string;
    simulateShipped?: boolean;
  }
) {
  assertTestOrdersEnabled();

  let campaign = input.campaignId
    ? await prisma.campaign.findFirst({
        where: { id: input.campaignId, organizationId },
        include: { savedMap: true },
      })
    : null;

  if (input.campaignId && !campaign) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
  }

  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        organizationId,
        name: input.name ?? `Test order ${new Date().toLocaleDateString()}`,
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
  }

  const { productionJob } = await activateOrderForProduction(prisma, campaign, {
    amountPaidCents: campaign.totalPriceCents ?? 12500,
    actor: "system:test-order",
  });

  if (input.simulateShipped) {
    const trackingNumber = "1Z999AA10123456784";
    await prisma.productionJob.update({
      where: { id: productionJob.id },
      data: {
        status: "SHIPPED",
        trackingNumber,
        shippedAt: new Date(),
      },
    });
    await prisma.jobEvent.create({
      data: {
        productionJobId: productionJob.id,
        status: "SHIPPED",
        note: `Test shipment — tracking ${trackingNumber}`,
        actor: "system:test-order",
      },
    });
  }

  return prisma.campaign.findUniqueOrThrow({
    where: { id: campaign.id },
    include: {
      productionJobs: {
        include: {
          productionPartner: { select: { id: true, name: true } },
          events: { orderBy: { createdAt: "desc" } },
        },
      },
      mailingJob: true,
    },
  });
}
