import { clerkClient } from "@clerk/nextjs/server";

export type ClerkRequestAuth = {
  isAuthenticated: boolean;
  userId: string | null;
};

/** Origins allowed to present Clerk session tokens (mitigates CSRF). */
export function getClerkAuthorizedParties(): string[] {
  const parties = new Set<string>([
    "http://localhost:3000",
    "https://postcard-platform-web.vercel.app",
  ]);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) parties.add(`https://${vercelUrl}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) parties.add(appUrl.replace(/\/$/, ""));

  return [...parties];
}

/**
 * Authenticate an incoming Request without relying on clerkMiddleware ALS.
 * Required on Vercel serverless API routes where auth() throws ERR_AUTH_MIDDLEWARE.
 */
export async function authenticateClerkRequest(req: Request): Promise<ClerkRequestAuth> {
  if (!process.env.CLERK_SECRET_KEY?.trim() || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()) {
    return { isAuthenticated: false, userId: null };
  }

  try {
    const client = await clerkClient();
    const state = await client.authenticateRequest(req, {
      authorizedParties: getClerkAuthorizedParties(),
    });

    if (!state.isAuthenticated) {
      return { isAuthenticated: false, userId: null };
    }

    const auth = state.toAuth();
    return {
      isAuthenticated: true,
      userId: auth.userId,
    };
  } catch (error) {
    console.error("[clerk] authenticateRequest failed:", error);
    return { isAuthenticated: false, userId: null };
  }
}
