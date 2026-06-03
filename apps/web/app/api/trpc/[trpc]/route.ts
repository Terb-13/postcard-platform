import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@postcard-platform/api/root";
import { createTRPCContext } from "@postcard-platform/api/trpc";
import { GUEST_SESSION_HEADER, isValidGuestSessionId } from "@postcard-platform/api/lib/guest-org";
import { resolvePrismaUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const handler = async (req: Request) => {
  const { user, clerkUserId } = await resolvePrismaUserFromRequest(req);

  const guestHeader = req.headers.get(GUEST_SESSION_HEADER);
  const guestSessionId = isValidGuestSessionId(guestHeader) ? guestHeader.trim() : null;

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ user, clerkUserId, guestSessionId }),
  });
};

export { handler as GET, handler as POST };
