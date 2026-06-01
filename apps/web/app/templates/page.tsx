import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * Templates gallery page (matches redesign/templates.html tone)
 */
export default function TemplatesPage() {
  const templates = [
    { name: "Standard Postcard (6x11)", desc: "Classic 4x6 or 6x11 postcard" },
    { name: "EDDM Postcard (6.5x9)", desc: "Optimized for Every Door Direct Mail" },
    { name: "Jumbo Postcard (6x11)", desc: "Maximum visual impact" },
    { name: "Slim Jim (4x11)", desc: "Fits in standard envelopes" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />

      <main className="mx-auto max-w-7xl px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight">All Templates</h1>
          <Link href="/design-services" className="text-sm font-medium text-[#0EA5E9] hover:underline">
            Need custom design? →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {templates.map((t, i) => (
            <div key={i} className="rounded-3xl border bg-white p-4">
              <div className="mb-3 aspect-video rounded-2xl bg-gray-100" />
              <div className="font-medium">{t.name}</div>
              <div className="mt-1 text-sm text-gray-600">{t.desc}</div>
              <Link
                href="/campaigns/new"
                className="mt-4 inline-block text-sm font-semibold text-[#0EA5E9] hover:text-[#0A2540]"
              >
                Use this template →
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-gray-600">
          Hundreds more professional templates available inside the campaign builder.
        </p>
      </main>

      <MarketingFooter />
    </div>
  );
}
