"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type Variant = "nav" | "nav-mobile" | "hero" | "final" | "demo";

type AuthButtonsProps = {
  variant?: Variant;
  /** Called after a navigation/auth action (e.g. close mobile drawer) */
  onAction?: () => void;
};

function FallbackButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      disabled
      className={className}
      title="Sign up opens as soon as authentication is connected"
    >
      {label}
    </button>
  );
}

function StartTargetingLink({ className }: { className?: string }) {
  return (
    <>
      <SignedOut>
        <Link href="/sign-up" className={className}>
          Start Targeting
        </Link>
      </SignedOut>
      <SignedIn>
        <Link href="/campaigns/new" className={className}>
          Start Targeting
        </Link>
      </SignedIn>
    </>
  );
}

export function AuthButtons({ variant = "nav", onAction }: AuthButtonsProps) {
  if (!hasClerk) {
    if (variant === "nav" || variant === "nav-mobile") {
      const stack = variant === "nav-mobile";
      return (
        <div className={stack ? "flex flex-col gap-3 w-full" : "flex items-center gap-2.5"}>
          <Link
            href="/sign-in"
            className={stack ? "btn-nav-secondary w-full justify-center" : "btn-nav-secondary"}
            onClick={onAction}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={stack ? "btn-nav-primary w-full justify-center" : "btn-nav-primary"}
            onClick={onAction}
          >
            Start Targeting
          </Link>
        </div>
      );
    }
    if (variant === "demo") {
      return (
        <Link
          href="/sign-up"
          className="btn-primary auth-button inline-flex items-center gap-2 text-[15px]"
        >
          Build your own campaign →
        </Link>
      );
    }
    const label =
      variant === "final" ? "Start your first campaign free" : "Start Targeting";
    return (
      <FallbackButton
        label={label}
        className={
          variant === "final"
            ? "btn-primary btn-cta auth-button px-12 text-[15px] opacity-80 cursor-not-allowed"
            : "btn-primary btn-cta auth-button w-full sm:w-auto justify-center text-[15px] opacity-80 cursor-not-allowed"
        }
      />
    );
  }

  if (variant === "nav" || variant === "nav-mobile") {
    const stack = variant === "nav-mobile";
    return (
      <div className={stack ? "flex flex-col gap-3 w-full" : "flex items-center gap-2.5"}>
        <SignedOut>
          <SignInButton mode="modal" fallbackRedirectUrl="/campaigns">
            <button
              type="button"
              className={stack ? "btn-nav-secondary w-full" : "btn-nav-secondary"}
              onClick={onAction}
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns/new">
            <button
              type="button"
              className={stack ? "btn-nav-primary w-full" : "btn-nav-primary"}
              onClick={onAction}
            >
              Start Targeting
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/campaigns"
            className={stack ? "btn-nav-secondary w-full justify-center" : "btn-nav-secondary"}
            onClick={onAction}
          >
            My Campaigns
          </Link>
          <Link
            href="/campaigns/new"
            className={stack ? "btn-nav-primary w-full justify-center" : "btn-nav-primary"}
            onClick={onAction}
          >
            Start Targeting
          </Link>
          <div className={stack ? "flex justify-center pt-1" : ""}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    );
  }

  if (variant === "demo") {
    return (
      <>
        <SignedOut>
          <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns/new">
            <button className="btn-primary auth-button inline-flex items-center gap-2 text-[15px]">
              Build your own campaign →
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/campaigns/new"
            className="btn-primary auth-button inline-flex items-center gap-2 text-[15px]"
          >
            Build your own campaign →
          </Link>
        </SignedIn>
      </>
    );
  }

  if (variant === "final") {
    return (
      <>
        <SignedOut>
          <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns/new">
            <button className="btn-primary btn-cta auth-button px-12 text-[15px]">
              Start your first campaign free
            </button>
          </SignUpButton>
          <SignInButton mode="modal" fallbackRedirectUrl="/campaigns">
            <button className="btn-secondary border-white/30 text-white hover:bg-white/10 px-9 text-[15px]">
              I already have an account
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/campaigns/new"
            className="btn-primary btn-cta auth-button px-12 text-[15px]"
          >
            Start a new campaign
          </Link>
          <Link
            href="/campaigns"
            className="btn-secondary border-white/30 text-white hover:bg-white/10 px-9 text-[15px]"
          >
            View my campaigns
          </Link>
        </SignedIn>
      </>
    );
  }

  // Hero variant
  return (
    <>
      <SignedOut>
        <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns/new">
          <button className="btn-primary btn-cta auth-button w-full sm:w-auto justify-center text-[15px]">
            Start Targeting
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link
          href="/campaigns/new"
          className="btn-primary btn-cta auth-button w-full sm:w-auto justify-center text-[15px]"
        >
          Start Targeting
        </Link>
      </SignedIn>
    </>
  );
}

export function StartTargetingCta({ className }: { className?: string }) {
  if (!hasClerk) {
    return (
      <Link href="/sign-up" className={className}>
        Start Targeting
      </Link>
    );
  }
  return <StartTargetingLink className={className} />;
}
