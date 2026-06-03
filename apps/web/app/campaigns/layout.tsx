import { CustomerAccountNav } from "@/components/account/CustomerAccountNav";

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerAccountNav />
      {children}
    </>
  );
}
