import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateClerkRequest } from "@/lib/clerk-request-auth";

export const runtime = "nodejs";

/** Lightweight prod diagnostic — no secrets in response. */
export async function GET(req: Request) {
  const hasDbUrl = Boolean(
    process.env.DATABASE_URL?.trim() ||
      process.env.POSTGRES_PRISMA_URL?.trim() ||
      process.env.POSTGRES_URL?.trim()
  );

  const clerk = await authenticateClerkRequest(req);

  let dbOk = false;
  let dbError: string | null = null;
  let prismaUser: { id: string; email: string } | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;

    if (clerk.userId) {
      prismaUser = await prisma.user.findUnique({
        where: { clerkId: clerk.userId },
        select: { id: true, email: true },
      });
    }
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    hasDbUrl,
    dbOk,
    dbError: dbError ? dbError.slice(0, 300) : null,
    clerk: {
      isAuthenticated: clerk.isAuthenticated,
      userId: clerk.userId ? `${clerk.userId.slice(0, 14)}…` : null,
    },
    prismaUser,
  });
}
