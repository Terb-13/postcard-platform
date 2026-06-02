import type { PrismaClient } from "@prisma/client";

export const GUEST_SESSION_HEADER = "x-guest-session-id";

const GUEST_SLUG_PREFIX = "guest-";

export function isValidGuestSessionId(id: string | null | undefined): id is string {
  if (!id?.trim()) return false;
  return /^[a-zA-Z0-9_-]{8,128}$/.test(id.trim());
}

export function guestOrgSlug(guestSessionId: string): string {
  return `${GUEST_SLUG_PREFIX}${guestSessionId}`;
}

/** Find or create an organization scoped to an anonymous browser session. */
export async function getGuestOrganizationId(
  prisma: PrismaClient,
  guestSessionId: string
): Promise<string> {
  const slug = guestOrgSlug(guestSessionId);
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) return existing.id;

  try {
    const created = await prisma.organization.create({
      data: {
        name: "Guest campaign",
        slug,
      },
    });
    return created.id;
  } catch {
    const retry = await prisma.organization.findUnique({ where: { slug } });
    if (retry) return retry.id;
    throw new Error("Could not create guest organization");
  }
}
