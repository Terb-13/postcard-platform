import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@postcard-platform/api/root";
import { createTRPCContext } from "@postcard-platform/api/trpc";
import { GUEST_SESSION_HEADER, isValidGuestSessionId } from "@postcard-platform/api/lib/guest-org";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const handler = async (req: Request) => {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // Public procedures (e.g. landing demo) must work even if Clerk context fails.
    console.warn("[tRPC] getCurrentUser failed; continuing as anonymous:", error);
  }

  const guestHeader = req.headers.get(GUEST_SESSION_HEADER);
  const guestSessionId = isValidGuestSessionId(guestHeader) ? guestHeader.trim() : null;

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ user, guestSessionId }),
  });
};

export { handler as GET, handler as POST };
