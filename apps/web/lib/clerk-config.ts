/** True when Clerk client SDK can run (publishable key in env). */
export const hasClerkPublishableKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
);

function stripTrailingSlashes(value: string): string {
  let next = value;
  while (next.endsWith("/")) {
    next = next.slice(0, -1);
  }
  return next;
}

/**
 * Production Clerk Frontend API proxy URL (client + handshake).
 * Clerk development instances cannot use a proxy — leave unset for pk_test_.
 * Production (CIO): https://postcard-platform-web.vercel.app/__clerk
 */
export function clerkProxyUrlFromEnv(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  if (!raw) return undefined;
  return stripTrailingSlashes(raw);
}

export const clerkProxyUrl = clerkProxyUrlFromEnv();
