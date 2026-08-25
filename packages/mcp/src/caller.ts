import { appRouter } from "../../api/root.ts";
import { createTRPCContext } from "../../api/trpc.ts";
import type { ResolvedApiKey } from "./auth.ts";

export type AppRouterCaller = ReturnType<typeof appRouter.createCaller>;

export async function createOrgCaller(auth: ResolvedApiKey): Promise<AppRouterCaller> {
  const ctx = await createTRPCContext({
    user: auth.user,
    clerkUserId: auth.user.clerkId,
    guestSessionId: null,
  });
  return appRouter.createCaller(ctx);
}
