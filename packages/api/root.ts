import { router } from "./trpc";
import { campaignRouter } from "./routers/campaign";
import { mapRouter } from "./routers/map";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  campaign: campaignRouter,
  map: mapRouter,
  admin: adminRouter,
  // @cursor: Add more routers (production, billing, ai, etc.)
});

export type AppRouter = typeof appRouter;
