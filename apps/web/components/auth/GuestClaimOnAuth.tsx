"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { getGuestSessionId } from "@/lib/guest-session";
import { hasClerkPublishableKey } from "@/lib/clerk-config";

/**
 * When a guest completes checkout then signs in, move their campaigns into the user's org.
 * No-op when Clerk is not configured (must not call useAuth outside ClerkProvider).
 */
export function GuestClaimOnAuth() {
  if (!hasClerkPublishableKey) return null;
  return <GuestClaimOnAuthInner />;
}

function GuestClaimOnAuthInner() {
  const { isSignedIn } = useAuth();
  const claimedRef = useRef(false);
  const utils = trpc.useUtils();
  const claim = trpc.campaign.claimGuestCampaigns.useMutation({
    onSuccess: (result) => {
      if (result.claimedCount > 0) {
        void utils.campaign.getMine.invalidate();
        void utils.campaign.getOrderHistory.invalidate();
      }
    },
  });

  useEffect(() => {
    if (!isSignedIn || claimedRef.current) return;

    const guestSessionId = getGuestSessionId();
    if (!guestSessionId) return;

    claimedRef.current = true;
    claim.mutate({ guestSessionId });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per sign-in
  }, [isSignedIn]);

  return null;
}
