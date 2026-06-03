import { CustomerAccountNav } from "@/components/account/CustomerAccountNav";
import { SyncAccountOnSignIn } from "@/components/auth/SyncAccountOnSignIn";

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SyncAccountOnSignIn />
      <CustomerAccountNav />
      {children}
    </>
  );
}
