"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./client";
import { GUEST_SESSION_HEADER } from "@postcard-platform/api/lib/guest-org";
import { ensureGuestSessionId } from "@/lib/guest-session";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          fetch(url, options) {
            return fetch(url, { ...options, credentials: "include" });
          },
          headers() {
            const guestSessionId = ensureGuestSessionId();
            return guestSessionId
              ? { [GUEST_SESSION_HEADER]: guestSessionId }
              : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
