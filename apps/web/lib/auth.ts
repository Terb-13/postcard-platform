import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

import type { User } from "@prisma/client";

/** Match middleware.ts — auth() throws if only the publishable key is set. */
const hasClerkMiddleware =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

/**
 * Gets the current Prisma User record for the logged in Clerk user.
 * Auto-provisions org + user when Clerk session exists but webhook sync is pending.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!hasClerkMiddleware) return null;

  const { userId } = await auth();

  if (!userId) return null;

  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `user-${userId}@users.postcard.local`;

  try {
    const org = await prisma.organization.create({
      data: {
        name: clerkUser.firstName ? `${clerkUser.firstName}'s Company` : "My Company",
      },
    });

    return await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        organizationId: org.id,
        role: "OWNER",
      },
      include: { organization: true },
    });
  } catch {
    // Race: another request may have created the user
    return prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    });
  }
}

/**
 * Throws if no user. Use in server components / tRPC procedures.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized - no user found");
  }

  return user;
}
