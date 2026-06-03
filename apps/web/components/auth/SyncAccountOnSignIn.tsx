"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * After Clerk sign-in, hit a server route that provisions the Prisma user
 * (same logic as tRPC context). Helps when the first tRPC batch ran before cookies settled.
 */
export function SyncAccountOnSignIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || synced.current) return;
    synced.current = true;

    void fetch("/api/auth/sync", { method: "POST", credentials: "include" })
      .then((res) => {
        if (res.ok) router.refresh();
      })
      .catch(() => {
        synced.current = false;
      });
  }, [isLoaded, isSignedIn, router]);

  return null;
}
