import { initTRPC, TRPCError } from "@trpc/server";
import { prisma } from "@postcard-platform/db/client";
import { getGuestOrganizationId, isValidGuestSessionId } from "./lib/guest-org";
import { assertCampaignAccess } from "./lib/campaign-access";

import type { PrismaClient, User } from "@prisma/client";

export type TRPCContext = {
  prisma: PrismaClient;
  user: User | null;
  /** Set when Clerk session is valid but Prisma user row is missing (DB/sync issue). */
  clerkUserId: string | null;
  guestSessionId: string | null;
};

interface CreateContextOptions {
  user: User | null;
  clerkUserId?: string | null;
  guestSessionId?: string | null;
}

export const createTRPCContext = async (opts: CreateContextOptions): Promise<TRPCContext> => {
  const guestSessionId = isValidGuestSessionId(opts.guestSessionId)
    ? opts.guestSessionId.trim()
    : null;

  return {
    prisma,
    user: opts.user,
    clerkUserId: opts.clerkUserId ?? null,
    guestSessionId,
  };
};

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export type CampaignContext = TRPCContext & {
  user: User | null;
  guestSessionId: string | null;
  organizationId: string;
};

/**
 * Campaign wizard + checkout — authenticated users OR anonymous guest sessions.
 */
export const campaignProcedure = t.procedure.use(async ({ ctx, next }) => {
  let organizationId: string;

  if (ctx.user) {
    organizationId = ctx.user.organizationId;
  } else if (ctx.guestSessionId) {
    organizationId = await getGuestOrganizationId(ctx.prisma, ctx.guestSessionId);
  } else {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Start a campaign without signing in, or log in to continue.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      organizationId,
    } satisfies CampaignContext,
  });
});

/**
 * Protected procedure - requires a logged in user with matching Prisma record
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    if (ctx.clerkUserId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Signed in with Clerk, but your account could not be loaded from the database. Try refreshing the page.",
      });
    }
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export { assertCampaignAccess };

// @cursor: Add org-level checks, rate limiting, etc. here
