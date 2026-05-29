import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/campaigns(.*)",
  "/maps(.*)",
  "/ops(.*)",
  "/api/trpc(.*)",
]);

const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

const clerkHandler = clerkMiddleware(async (auth, req) => {
  try {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  } catch (error) {
    console.error("Clerk middleware invocation failed:", error);
    // Re-throw to let Clerk handle its error responses where possible
    throw error;
  }
});

// Graceful fallback middleware: prevents MIDDLEWARE_INVOCATION_FAILED (and 500s)
// on deployments where Clerk keys are not yet configured (e.g. fresh preview envs).
// Public landing page and static assets will load cleanly. Protected routes
// will not be guarded until keys are added via Vercel dashboard / vc env.
const passthroughMiddleware = (req: NextRequest) => {
  return NextResponse.next();
};

export default hasClerkKeys ? clerkHandler : passthroughMiddleware;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/(.*)',
    '/(api|trpc)(.*)',
  ],
};
