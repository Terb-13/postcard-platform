import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { authenticateClerkRequest } from "@/lib/clerk-request-auth";

import type { User } from "@prisma/client";

/** Match middleware.ts — auth() throws if only the publishable key is set. */
export const hasClerkMiddleware =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

/**
 * Resolve Clerk user id from a Route Handler / tRPC Request (no middleware ALS).
 */
export async function getClerkUserIdFromRequest(req: Request): Promise<string | null> {
  const { isAuthenticated, userId } = await authenticateClerkRequest(req);
  return isAuthenticated && userId ? userId : null;
}

/**
 * Gets the current Prisma User for App Router server components (uses auth()).
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!hasClerkMiddleware) return null;

  try {
    const { userId, isAuthenticated } = await auth();
    if (!isAuthenticated || !userId) return null;
    return resolvePrismaUserForClerkId(userId);
  } catch {
    return null;
  }
}

/** Load or create the Prisma user row for a known Clerk user id. */
export async function resolvePrismaUserForClerkId(clerkId: string): Promise<User | null> {
  const existing = await prisma.user.findUnique({
    where: { clerkId },
    include: { organization: true },
  });

  if (existing) return existing;

  let email: string;
  let firstName: string | null = null;
  let lastName: string | null = null;

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    email =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      `user-${clerkId}@users.postcard.local`;
    firstName = clerkUser.firstName;
    lastName = clerkUser.lastName;
  } catch (error) {
    console.error("[auth] Clerk users.getUser failed", { clerkId, error });
    return null;
  }

  try {
    const org = await prisma.organization.create({
      data: {
        name: firstName ? `${firstName}'s Company` : "My Company",
      },
    });

    return await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
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
 * Prisma user for an API Request (tRPC, sync route, etc.).
 */
export async function resolvePrismaUserFromRequest(req: Request): Promise<{
  user: User | null;
  clerkUserId: string | null;
}> {
  const clerkUserId = await getClerkUserIdFromRequest(req);
  if (!clerkUserId) {
    return { user: null, clerkUserId: null };
  }
  const user = await resolvePrismaUserForClerkId(clerkUserId);
  return { user, clerkUserId };
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
