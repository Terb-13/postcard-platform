import { verifyToken } from "@clerk/backend";
import { clerkClient } from "@clerk/nextjs/server";

export type ClerkRequestAuth = {
  isAuthenticated: boolean;
  userId: string | null;
};

function partiesFromRequest(req: Request): string[] {
  const parties = new Set<string>([
    "http://localhost:3000",
    "https://postcard-platform-web.vercel.app",
  ]);

  const origin = req.headers.get("origin")?.trim();
  if (origin) parties.add(origin);

  const referer = req.headers.get("referer")?.trim();
  if (referer) {
    try {
      parties.add(new URL(referer).origin);
    } catch {
      /* ignore */
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) parties.add(`https://${vercelUrl}`);

  return [...parties];
}

/**
 * Authenticate an incoming Request without clerkMiddleware ALS (Vercel serverless).
 */
function getClerkSecretKey(): string | undefined {
  return process.env.CLERK_SECRET_KEY?.trim() || undefined;
}

function getClerkPublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || undefined;
}

export async function authenticateClerkRequest(req: Request): Promise<ClerkRequestAuth> {
  const secretKey = getClerkSecretKey();
  const publishableKey = getClerkPublishableKey();

  const bearer = req.headers.get("authorization")?.trim();
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    if (!secretKey) {
      console.warn("[clerk] Bearer token present but CLERK_SECRET_KEY missing on server");
      return { isAuthenticated: false, userId: null };
    }
    const token = bearer.slice(7).trim();
    if (token) {
      try {
        const payload = await verifyToken(token, { secretKey });
        const userId = payload.sub;
        if (userId) {
          return { isAuthenticated: true, userId };
        }
      } catch (error) {
        console.warn("[clerk] verifyToken failed:", error);
      }
    }
  }

  if (!secretKey || !publishableKey) {
    console.warn("[clerk] Missing server Clerk env", {
      hasSecretKey: Boolean(secretKey),
      hasPublishableKey: Boolean(publishableKey),
    });
    return { isAuthenticated: false, userId: null };
  }

  try {
    const client = await clerkClient();
    const state = await client.authenticateRequest(req, {
      secretKey,
      publishableKey,
      authorizedParties: partiesFromRequest(req),
    });

    if (!state.isAuthenticated) {
      console.warn("[clerk] authenticateRequest not authenticated", {
        reason: state.reason,
        message: state.message,
        status: state.status,
        hasCookie: Boolean(req.headers.get("cookie")),
        hasBearer: Boolean(bearer),
      });
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
