"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

type Props = {
  message: string;
  hint?: string;
};

export function AuthRequiredCard({ message, hint }: Props) {
  const { isLoaded, isSignedIn } = useAuth();

  const isDbSyncIssue =
    message.includes("database") || message.includes("account could not be loaded");
  const signedInButBlocked = isLoaded && isSignedIn && isDbSyncIssue;
  const signedInSessionNotOnServer =
    isLoaded && isSignedIn && !isDbSyncIssue && message.toLowerCase().includes("logged in");

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 sm:p-14 text-center max-w-lg mx-auto">
      <h2 className="heading-sm mb-2">
        {signedInButBlocked
          ? "Account sync issue"
          : signedInSessionNotOnServer
            ? "Session not reaching the server"
            : "Sign in required"}
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-4">
        {signedInButBlocked
          ? "You're signed in with Clerk, but we could not load your account from the database. Try refresh below — no need to sign in again."
          : signedInSessionNotOnServer
            ? "Clerk shows you as signed in, but API requests are not authenticated yet. Hard refresh (Cmd+Shift+R), or sign out and sign in once on this tab."
            : message}
      </p>
      {hint && !signedInButBlocked ? (
        <p className="text-small text-[var(--color-text-muted)] mb-6">{hint}</p>
      ) : null}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {signedInButBlocked || signedInSessionNotOnServer ? (
          <>
            <Button size="lg" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
            <Link href="/account/orders">
              <Button size="lg" variant="secondary">
                Try Your orders
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/sign-in">
              <Button size="lg">Sign in</Button>
            </Link>
            <a href="https://postcard-platform-web.vercel.app/campaigns">
              <Button size="lg" variant="secondary">
                Open production app
              </Button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}
