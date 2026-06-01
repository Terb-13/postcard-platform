import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { marketingContainer } from "@/components/marketing/marketing-design-system";
import { TEMPLATE_ITEMS } from "@/components/marketing/marketing-solutions";

/** redesign/templates.html */
export default function TemplatesPage() {
  return (
    <MarketingPageShell>
      <main className={`${marketingContainer} py-12`}>
        <h1 className="mb-8 text-4xl font-semibold tracking-tight">All Templates</h1>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {TEMPLATE_ITEMS.map((t) => (
            <div key={t.name} className="rounded-3xl border border-gray-200 bg-white p-4">
              <div className="mb-3 aspect-video rounded-2xl bg-gray-100" aria-hidden />
              <div className="font-medium">{t.name}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-gray-600">
          More templates inside the{" "}
          <Link href="/campaigns/new" className="font-medium text-[#0EA5E9] hover:underline">
            campaign builder
          </Link>
          . Need custom creative?{" "}
          <Link href="/design-services" className="font-medium text-[#0EA5E9] hover:underline">
            Design services →
          </Link>
        </p>
      </main>
    </MarketingPageShell>
  );
}
