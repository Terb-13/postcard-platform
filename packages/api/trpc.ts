import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "../db/client";
import type { User } from "@prisma/client";

// Context type that includes the authenticated user from Clerk + Prisma
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
      user: ctx.user, // Now guaranteed to exist
    },
    });
});
