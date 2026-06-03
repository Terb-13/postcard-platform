import { redirect } from "next/navigation";

/** Legacy URL — customer tracking lives under /account/orders */
export default async function ProductionRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const params = await searchParams;
  if (params.campaign) {
    redirect(`/account/orders/${params.campaign}`);
  }
  redirect("/account/orders");
}
