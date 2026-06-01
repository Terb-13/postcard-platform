"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type Variant =
  | "nav"
  | "nav-mobile"
  | "hero"
  | "final"
  | "demo"
  | "marketing-nav"
  | "marketing-nav-mobile"
  | "marketing-final";

type AuthButtonsProps = {
  variant?: Variant;
  /** Called after a navigation/auth action (e.g. close mobile drawer) */
  onAction?: () => void;
  /** Optional icon after hero CTA label (e.g. arrow) */
  ctaIcon?: ReactNode;
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

const heroCtaClass = "btn-hero-primary auth-button w-full sm:w-auto justify-center";
const MARKETING_ORDER_CTA = "Start an Order";
/** redesign/index.html — Final CTA primary button */
const MARKETING_FINAL_CTA = "Start Your First Campaign";

const marketingNavPrimaryClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-3xl bg-[#0A2540] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black";

export function AuthButtons({ variant = "nav", onAction, ctaIcon }: AuthButtonsProps) {
  if (!hasClerk) {
    if (variant === "marketing-nav" || variant === "marketing-nav-mobile") {
      const stack = variant === "marketing-nav-mobile";
      return (
        <div className={stack ? "flex flex-col gap-3 w-full" : "flex items-center gap-4"}>
          <Link
            href="/sign-in"
            className={
              stack
                ? "inline-flex min-h-[44px] w-full items-center justify-center rounded-3xl px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                : "rounded-3xl px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
            }
            onClick={onAction}
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className={stack ? `${marketingNavPrimaryClass} w-full` : marketingNavPrimaryClass}
            onClick={onAction}
          >
            {MARKETING_ORDER_CTA}
          </Link>
        </div>
      );
    }
    if (variant === "marketing-final") {
      return (
        <Link href="/sign-up" className={`${marketingNavPrimaryClass} px-10 py-4 text-lg`}>
          {MARKETING_FINAL_CTA}
        </Link>
      );
    }
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
    if (variant === "hero") {
      return (
        <Link href="/sign-up" className={heroCtaClass}>
          {MARKETING_ORDER_CTA}
          {ctaIcon}
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

  if (variant === "marketing-nav" || variant === "marketing-nav-mobile") {
    const stack = variant === "marketing-nav-mobile";
    return (
      <div className={stack ? "flex flex-col gap-3 w-full" : "flex items-center gap-4"}>
        <SignedOut>
          <SignInButton mode="modal" fallbackRedirectUrl="/campaigns">
            <button
              type="button"
              className={
                stack
                  ? "inline-flex min-h-[44px] w-full items-center justify-center rounded-3xl px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                  : "rounded-3xl px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
              }
              onClick={onAction}
            >
              Log in
            </button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns/new">
            <button
              type="button"
              className={stack ? `${marketingNavPrimaryClass} w-full` : marketingNavPrimaryClass}
              onClick={onAction}
            >
              {MARKETING_ORDER_CTA}
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/campaigns"
            className={
              stack
                ? "inline-flex min-h-[44px] w-full items-center justify-center rounded-3xl px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
                : "rounded-3xl px-5 py-2.5 text-sm font-medium hover:bg-gray-100"
            }
            onClick={onAction}
          >
            My Campaigns
          </Link>
          <Link
            href="/campaigns/new"
            className={stack ? `${marketingNavPrimaryClass} w-full` : marketingNavPrimaryClass}
            onClick={onAction}
          >
            {MARKETING_ORDER_CTA}
          </Link>
        </SignedIn>
      </div>
    );
  }

  if (variant === "marketing-final") {
    return (
      <>
        <SignedOut>
          <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns/new">
            <button
              type="button"
              className={`${marketingNavPrimaryClass} px-10 py-4 text-lg`}
            >
              {MARKETING_FINAL_CTA}
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/campaigns/new" className={`${marketingNavPrimaryClass} px-10 py-4 text-lg`}>
            {MARKETING_FINAL_CTA}
          </Link>
        </SignedIn>
      </>
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

  // Hero variant — commercial landing CTA
  return (
    <>
      <SignedOut>
        <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns/new">
          <button type="button" className={heroCtaClass}>
            {MARKETING_ORDER_CTA}
            {ctaIcon}
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link href="/campaigns/new" className={heroCtaClass}>
          {MARKETING_ORDER_CTA}
          {ctaIcon}
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
