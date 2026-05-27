import { router } from "./trpc";
import { campaignRouter } from "./routers/campaign";
import { mapRouter } from "./routers/map";

export const appRouter = router({
  campaign: campaignRouter,
  map: mapRouter,
  // @cursor: Add more routers (production, billing, ai, etc.)
});

export type AppRouter = typeof appRouter;
