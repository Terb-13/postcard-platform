import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkProxyUrlFromEnv } from "@/lib/clerk-config";
import { isClerkFrontendApiProxyPath } from "@/lib/clerk-fapi-proxy";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/maps(.*)",
  "/ops(.*)",
  "/account(.*)",
  "/production(.*)",
]);

/** Campaign list + detail require auth. Signed-out /campaigns/new is not a mail door. */
const isProtectedCampaignRoute = createRouteMatcher([
  "/campaigns",
  "/campaigns/((?!new).*)",
]);

const isCampaignWizard = createRouteMatcher(["/campaigns/new"]);

/** Machine routes — must not run auth.protect(). MCP uses Authorization: Bearer mcp_…, not Clerk. */
const isWebhookApiRoute = createRouteMatcher([
  "/api/webhooks/clerk(.*)",
  "/api/stripe/webhook(.*)",
  "/api/inngest(.*)",
  "/mcp",
  "/mcp/(.*)",
]);

const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

const clerkProxyUrl = clerkProxyUrlFromEnv();

async function clerkAuthHandler(auth, req: NextRequest) {
  try {
    // FAPI proxy is a machine path — never auth.protect() or handshake it.
    if (isClerkFrontendApiProxyPath(req.nextUrl.pathname)) return;
    if (isWebhookApiRoute(req)) return;
    if (isCampaignWizard(req)) {
      try {
        const { userId } = await auth();
        if (userId) return;
      } catch {
        // Treat auth errors as signed-out — never 200 a wizard.
      }
      const quote = req.nextUrl.clone();
      quote.pathname = "/map-tool";
      quote.search = "";
      return NextResponse.redirect(quote);
    }
    if (isProtectedCampaignRoute(req)) {
      await auth.protect();
      return;
    }
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  } catch (error) {
    console.error("Clerk middleware invocation failed:", error);
    // Re-throw to let Clerk handle its error responses where possible
    throw error;
  }
}

const clerkHandler = clerkProxyUrl
  ? clerkMiddleware(clerkAuthHandler, { proxyUrl: clerkProxyUrl })
  : clerkMiddleware(clerkAuthHandler);

// Graceful fallback middleware: prevents MIDDLEWARE_INVOCATION_FAILED (and 500s)
// on deployments where Clerk keys are not yet configured (e.g. fresh preview envs).
// Public landing page and static assets will load cleanly. Protected routes
// will not be guarded until keys are added via Vercel dashboard / vc env.
const passthroughMiddleware = (req: NextRequest) => {
  return NextResponse.next();
};

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // /__clerk is served by app/%5F%5Fclerk — skip Clerk handshake so it is not a 404.
  if (isClerkFrontendApiProxyPath(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return hasClerkKeys ? clerkHandler(req, event) : passthroughMiddleware(req);
}

export const config = {
  matcher: [
    // Skip /mcp so Clerk never inspects Authorization: Bearer mcp_…
    '/((?!_next|mcp(?:/|$)|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Clerk Dashboard requires '/__clerk/:path*'. Official SDK docs also use '(.*)'.
    '/__clerk/:path*',
    '/__clerk/(.*)',
    '/(api|trpc)(.*)',
  ],
};
