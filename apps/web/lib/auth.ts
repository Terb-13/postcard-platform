import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

import type { User } from "@prisma/client";

/** Match middleware.ts — auth() throws if only the publishable key is set. */
export const hasClerkMiddleware =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

/**
 * Gets the current Prisma User record for the logged in Clerk user.
 * Auto-provisions org + user when Clerk session exists but webhook sync is pending.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!hasClerkMiddleware) return null;

  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) return null;

  return resolvePrismaUserForClerkId(userId);
}

/** Load or create the Prisma user row for a known Clerk user id. */
export async function resolvePrismaUserForClerkId(clerkId: string): Promise<User | null> {
  const existing = await prisma.user.findUnique({
    where: { clerkId },
    include: { organization: true },
  });

  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== clerkId) return null;

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `user-${clerkId}@users.postcard.local`;

  try {
    const org = await prisma.organization.create({
      data: {
        name: clerkUser.firstName ? `${clerkUser.firstName}'s Company` : "My Company",
      },
    });

    return await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        organizationId: org.id,
        role: "OWNER",
      },
      include: { organization: true },
    });
  } catch (error) {
    console.error("[auth] Failed to provision Prisma user", { clerkId, error });
    return prisma.user.findUnique({
      where: { clerkId },
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
