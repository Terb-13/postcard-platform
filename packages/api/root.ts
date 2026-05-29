import { router } from "./trpc";
import { campaignRouter } from "./routers/campaign";
import { mapRouter } from "./routers/map";
import { targetingRouter } from "./routers/targeting";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  campaign: campaignRouter,
  map: mapRouter,
  targeting: targetingRouter,
  admin: adminRouter,
  // @cursor: Add more routers (production, billing, ai, etc.)
});

export type AppRouter = typeof appRouter;
