"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";

type Props = {
  variant?: "primary" | "secondary";
  redirectToOrders?: boolean;
};

export function LoadDemoDataButton({ variant = "primary", redirectToOrders = true }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const seed = trpc.campaign.seedDemoData.useMutation({
    onSuccess: () => {
      void utils.campaign.getMine.invalidate();
      void utils.campaign.getOrderHistory.invalidate();
      if (redirectToOrders) {
        router.push("/account/orders");
        router.refresh();
      }
    },
    onError: (e) => {
      const extra =
        e.data?.code === "UNAUTHORIZED"
          ? "\n\nTip: Open https://postcard-platform-web.vercel.app and sign in there. Preview deploy URLs often lack server env vars."
          : "";
      alert(e.message + extra);
    },
  });

  return (
    <Button
      variant={variant}
      disabled={seed.isPending}
      onClick={() => seed.mutate()}
    >
      {seed.isPending ? "Loading sample data…" : "Load sample data for my account"}
    </Button>
  );
}
