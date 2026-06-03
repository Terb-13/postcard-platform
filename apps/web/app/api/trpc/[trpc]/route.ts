import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth } from "@clerk/nextjs/server";
import { appRouter } from "@postcard-platform/api/root";
import { createTRPCContext } from "@postcard-platform/api/trpc";
import { GUEST_SESSION_HEADER, isValidGuestSessionId } from "@postcard-platform/api/lib/guest-org";
import { hasClerkMiddleware, resolvePrismaUserForClerkId } from "@/lib/auth";

export const runtime = "nodejs";

async function buildContext(req: Request) {
  let user = null;
  let clerkUserId: string | null = null;

  if (hasClerkMiddleware) {
    try {
      // Honors session cookie and Authorization: Bearer from the client tRPC link.
      const clerkAuth = await auth();
      clerkUserId = clerkAuth.userId;
      if (clerkAuth.isAuthenticated && clerkAuth.userId) {
        user = await resolvePrismaUserForClerkId(clerkAuth.userId);
      }
    } catch (error) {
      console.error("[tRPC] Clerk auth or Prisma user resolution failed:", error);
    }
  }

  const guestHeader = req.headers.get(GUEST_SESSION_HEADER);
  const guestSessionId = isValidGuestSessionId(guestHeader) ? guestHeader.trim() : null;

  return createTRPCContext({ user, clerkUserId, guestSessionId });
}

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => buildContext(req),
  });
};

export { handler as GET, handler as POST };
