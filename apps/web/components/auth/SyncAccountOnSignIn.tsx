"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { hasClerkPublishableKey } from "@/lib/clerk-config";

export function SyncAccountOnSignIn() {
  if (!hasClerkPublishableKey) return null;
  return <SyncAccountOnSignInInner />;
}

function SyncAccountOnSignInInner() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || synced.current) return;
    synced.current = true;

    void (async () => {
      const token = await getToken();
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/auth/sync", {
        method: "POST",
        credentials: "include",
        headers,
      });
      if (res.ok) {
        router.refresh();
      } else {
        synced.current = false;
        console.warn("[sync] account sync failed", res.status);
      }
    })().catch(() => {
      synced.current = false;
    });
  }, [isLoaded, isSignedIn, getToken, router]);

  return null;
}
