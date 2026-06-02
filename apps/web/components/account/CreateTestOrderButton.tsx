"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";

type Props = {
  variant?: "primary" | "secondary";
  simulateShipped?: boolean;
  label?: string;
};

/** Shown when ALLOW_TEST_ORDERS=true or NODE_ENV=development */
export function CreateTestOrderButton({
  variant = "secondary",
  simulateShipped = false,
  label,
}: Props) {
  const router = useRouter();
  const { data: enabled } = trpc.campaign.canCreateTestOrder.useQuery();

  const create = trpc.campaign.createTestOrder.useMutation({
    onSuccess: (order) => {
      router.push(`/account/orders/${order.id}`);
      router.refresh();
    },
    onError: (e) => alert(e.message),
  });

  if (!enabled) return null;

  return (
    <Button
      variant={variant}
      disabled={create.isPending}
      onClick={() =>
        create.mutate({
          simulateShipped,
          name: simulateShipped ? "Test order (shipped)" : "Test order",
        })
      }
    >
      {create.isPending
        ? "Creating…"
        : label ?? (simulateShipped ? "Create test order (with tracking)" : "Create test order")}
    </Button>
  );
}
