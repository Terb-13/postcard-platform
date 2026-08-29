import { proxyClerkFrontendApi } from "@/lib/clerk-fapi-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Literal `/__clerk/*` App Router route.
 * Next.js treats `_`-prefixed folders as private, so the segment is `%5F%5Fclerk`.
 *
 * Official alternative to clerkMiddleware({ frontendApiProxy }) on Clerk v7:
 * https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi
 */
async function handler(req: Request): Promise<Response> {
  return proxyClerkFrontendApi(req);
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
