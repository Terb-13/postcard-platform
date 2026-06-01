import { initTRPC, TRPCError } from "@trpc/server";
import { prisma } from "@postcard-platform/db/client";

import type { PrismaClient, User } from "@prisma/client";

export type TRPCContext = {
  prisma: PrismaClient;
  user: User | null;
};

interface CreateContextOptions {
  user: User | null;
}

export const createTRPCContext = async (opts: CreateContextOptions): Promise<TRPCContext> => {
  return {
    prisma,
    user: opts.user,
  };
};

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires a logged in user with matching Prisma record
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// @cursor: Add org-level checks, rate limiting, etc. here
