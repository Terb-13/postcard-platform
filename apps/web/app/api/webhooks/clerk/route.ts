import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type ClerkEmailAddress = { id?: string; email_address?: string };

type ClerkUserPayload = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
};

/** Clerk "Send example" payloads often omit nested emails; real events usually include them. */
function resolveEmail(data: ClerkUserPayload): string {
  const addresses = data.email_addresses ?? [];
  const primaryId = data.primary_email_address_id;
  if (primaryId) {
    const primary = addresses.find((e) => e.id === primaryId);
    if (primary?.email_address) return primary.email_address;
  }
  const first = addresses[0]?.email_address;
  if (first) return first;
  return `user-${data.id}@users.postcard.local`;
}

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

  let evt: { type: string; data: ClerkUserPayload };
  try {
    evt = wh.verify(payload, headers) as { type: string; data: ClerkUserPayload };
  } catch (err) {
    console.error("Webhook verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { id, first_name, last_name } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const existing = await prisma.user.findUnique({ where: { clerkId: id } });
    if (existing) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    const email = resolveEmail(evt.data);

    try {
      await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: first_name ? `${first_name}'s Company` : "My Company",
          },
        });

        await tx.user.create({
          data: {
            clerkId: id,
            email,
            firstName: first_name ?? undefined,
            lastName: last_name ?? undefined,
            organizationId: org.id,
            role: "OWNER",
          },
        });
      });
    } catch (err) {
      console.error("Clerk webhook user.created failed", err);
      const duplicate = await prisma.user.findUnique({ where: { clerkId: id } });
      if (duplicate) {
        return NextResponse.json({ success: true, duplicate: true });
      }
      return NextResponse.json({ error: "Failed to provision user" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
