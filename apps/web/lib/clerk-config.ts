/** True when Clerk client SDK can run (publishable key in env). */
export const hasClerkPublishableKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
);
