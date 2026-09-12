/** Shared Clerk session check for campaign server pages. */
export async function isBuyerSignedIn(): Promise<boolean> {
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
    !process.env.CLERK_SECRET_KEY?.trim()
  ) {
    return false;
  }
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const session = await auth();
    return Boolean(session.userId);
  } catch {
    return false;
  }
}
