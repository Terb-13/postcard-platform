import { router } from "./trpc";
import { campaignRouter } from "./routers/campaign";
import { mapRouter } from "./routers/map";
import { targetingRouter } from "./routers/targeting";
import { adminRouter } from "./routers/admin";
import { mailingRouter } from "./routers/mailing";

export const appRouter = router({
  campaign: campaignRouter,
  map: mapRouter,
  targeting: targetingRouter,
  mailing: mailingRouter,
  admin: adminRouter,
  // @cursor: Add more routers (production, billing, ai, etc.)
});

export type AppRouter = typeof appRouter;
