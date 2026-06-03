import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/** Lightweight prod diagnostic — no secrets in response. */
export async function GET() {
  const hasDbUrl = Boolean(
    process.env.DATABASE_URL?.trim() ||
      process.env.POSTGRES_PRISMA_URL?.trim() ||
      process.env.POSTGRES_URL?.trim()
  );

  let clerk = { isAuthenticated: false, userId: null as string | null };
  try {
    const clerkAuth = await auth();
    clerk = {
      isAuthenticated: clerkAuth.isAuthenticated,
      userId: clerkAuth.userId,
    };
  } catch (e) {
    return NextResponse.json(
      {
        hasDbUrl,
        clerkError: e instanceof Error ? e.message.slice(0, 300) : "auth failed",
      },
      { status: 500 }
    );
  }

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
