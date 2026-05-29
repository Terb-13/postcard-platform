import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@postcard-platform/api/root";
import { createTRPCContext } from "@postcard-platform/api/trpc";
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

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ user }),
  });
};

export { handler as GET, handler as POST };
