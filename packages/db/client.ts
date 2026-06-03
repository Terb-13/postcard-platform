import { PrismaClient } from "@prisma/client";

/** Vercel + Supabase integration exposes POSTGRES_PRISMA_URL; Prisma expects DATABASE_URL. */
if (!process.env.DATABASE_URL?.trim()) {
  if (process.env.POSTGRES_PRISMA_URL?.trim()) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  } else if (process.env.POSTGRES_URL?.trim()) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }
}

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
