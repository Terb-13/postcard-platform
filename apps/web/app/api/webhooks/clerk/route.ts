import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET not configured" }, { status: 503 });
  }

  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  const wh = new Webhook(webhookSecret);

  let evt: any;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    console.error("Webhook verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { id, email_addresses, first_name } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const email = email_addresses[0]?.email_address;

    // Create Organization + User in Prisma
    const org = await prisma.organization.create({
      data: {
        name: `${first_name || "New"}'s Company`,
      },
    });

    await prisma.user.create({
      data: {
        clerkId: id,
        email,
        organizationId: org.id,
        role: "OWNER",
      },
    });
  }

  return NextResponse.json({ success: true });
}
