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

  const signedInButBlocked =
    isLoaded &&
    isSignedIn &&
    (message.includes("logged in") ||
      message.includes("database") ||
      message.includes("account could not be loaded"));

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 sm:p-14 text-center max-w-lg mx-auto">
      <h2 className="heading-sm mb-2">
        {signedInButBlocked ? "Account sync issue" : "Sign in required"}
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-4">
        {signedInButBlocked
          ? "You're signed in with Clerk (see your profile icon), but the app could not load your account from the database. You do not need to sign in again — try refresh or account sync below."
          : message}
      </p>
      {hint && !signedInButBlocked ? (
        <p className="text-small text-[var(--color-text-muted)] mb-6">{hint}</p>
      ) : null}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {signedInButBlocked ? (
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
