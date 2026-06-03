import { NextResponse } from "next/server";
import { resolvePrismaUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { user, clerkUserId } = await resolvePrismaUserFromRequest(req);

    if (!clerkUserId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: "Could not provision user" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error("[auth/sync] failed", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
