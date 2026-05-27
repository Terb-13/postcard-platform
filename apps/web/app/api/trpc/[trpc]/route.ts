import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@packages/api/root"; // placeholder - will fix path

import { createTRPCContext } from "@packages/api/trpc"; // placeholder

export const runtime = "nodejs";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ user: null }), // TODO: integrate real Clerk user
  });

export { handler as GET, handler as POST };
