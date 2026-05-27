import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "../db/client";
import { getCurrentUser } from "../../apps/web/lib/auth"; // note: cross-package import - consider moving auth helpers to packages later

import type { User } from "@prisma/client";

interface CreateContextOptions {
  user: User | null;
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  return {
    prisma,
    user: opts.user,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

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
