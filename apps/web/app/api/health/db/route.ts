import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Lightweight prod diagnostic — no secrets in response. */
export async function GET() {
  const hasDbUrl = Boolean(
    process.env.DATABASE_URL?.trim() ||
      process.env.POSTGRES_PRISMA_URL?.trim() ||
      process.env.POSTGRES_URL?.trim()
  );

  let clerk: { isAuthenticated: boolean; userId: string | null } = {
    isAuthenticated: false,
    userId: null,
  };
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const clerkAuth = await auth();
    clerk = {
      isAuthenticated: clerkAuth.isAuthenticated,
      userId: clerkAuth.userId,
    };
  } catch (e) {
    return NextResponse.json(
      {
        hasDbUrl,
        clerkError: e instanceof Error ? e.message.slice(0, 200) : "auth failed",
      },
      { status: 500 }
    );
  }

  let dbOk = false;
  let dbError: string | null = null;
  let prismaUser: { id: string; email: string } | null = null;

  try {
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;

    if (clerk.userId) {
      const u = await prisma.user.findUnique({
        where: { clerkId: clerk.userId },
        select: { id: true, email: true },
      });
      prismaUser = u;
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
