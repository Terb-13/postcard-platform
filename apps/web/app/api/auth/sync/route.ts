import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolvePrismaUserForClerkId } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const user = await resolvePrismaUserForClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "Could not provision user" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error("[auth/sync] failed", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
