import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl(): string | undefined {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct && !direct.includes("REPLACE_ME")) return direct;

  const prismaUrl = process.env.POSTGRES_PRISMA_URL?.trim();
  if (prismaUrl) return prismaUrl;

  const postgresUrl = process.env.POSTGRES_URL?.trim();
  if (postgresUrl) return postgresUrl;

  return undefined;
}

const databaseUrl = resolveDatabaseUrl();
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const url = resolveDatabaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    ...(url
      ? {
          datasources: {
            db: { url },
          },
        }
      : {}),
  });
}

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
