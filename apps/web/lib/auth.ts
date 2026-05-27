import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db"; // re-export from packages

import type { User } from "@prisma/client";

/**
 * Gets the current Prisma User record for the logged in Clerk user.
 * Returns null if not authenticated or no matching record.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = auth();

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  return user;
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

// @cursor: Add requireOrganization() helper when multi-org support is needed
