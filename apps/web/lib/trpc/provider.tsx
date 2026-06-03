"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useAuth } from "@clerk/nextjs";
import { useMemo, useState } from "react";
import { trpc } from "./client";
import { GUEST_SESSION_HEADER } from "@postcard-platform/api/lib/guest-org";
import { ensureGuestSessionId } from "@/lib/guest-session";
import { hasClerkPublishableKey } from "@/lib/clerk-config";

type GetToken = () => Promise<string | null>;

function createTrpcClient(getToken: GetToken) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
        async headers() {
          const headers: Record<string, string> = {};
          const token = await getToken();
          if (token) headers.Authorization = `Bearer ${token}`;
          const guestSessionId = ensureGuestSessionId();
          if (guestSessionId) headers[GUEST_SESSION_HEADER] = guestSessionId;
          return headers;
        },
      }),
    ],
  });
}

function TRPCProviderInner({
  children,
  getToken,
}: {
  children: React.ReactNode;
  getToken: GetToken;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const trpcClient = useMemo(() => createTrpcClient(getToken), [getToken]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

function TRPCProviderWithClerk({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();

  const getTokenStable = useMemo<GetToken>(
    () => async () => {
      if (!isLoaded) return null;
      return getToken();
    },
    [getToken, isLoaded]
  );

  if (!isLoaded) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-[var(--color-text-muted)] text-sm">
        Loading…
      </div>
    );
  }

  return <TRPCProviderInner getToken={getTokenStable}>{children}</TRPCProviderInner>;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  if (hasClerkPublishableKey) {
    return <TRPCProviderWithClerk>{children}</TRPCProviderWithClerk>;
  }
  return <TRPCProviderInner getToken={async () => null}>{children}</TRPCProviderInner>;
}
