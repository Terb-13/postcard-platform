import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * Design Services page (matches redesign/design-services.html)
 */
export default function DesignServicesPage() {
  const packages = [
    { name: "Basic Design", price: "$149", desc: "One postcard design, 2 rounds of revisions" },
    { name: "Premium Design", price: "$349", desc: "Full campaign suite + strategy call" },
    { name: "Full Branding Package", price: "$799", desc: "Logo, colors, 5 postcard concepts, brand guidelines" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#0A2540]">
      <MarketingNav />

      <main className="mx-auto max-w-5xl px-8 py-16">
        <h1 className="text-5xl font-semibold tracking-tight">Professional Design Services</h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-600">
          Let our team create high-converting postcards for you.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {packages.map((pkg, i) => (
            <div key={i} className="rounded-3xl border bg-white p-6">
              <div className="font-semibold">{pkg.name}</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums">{pkg.price}</div>
              <p className="mt-3 text-sm text-gray-600">{pkg.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-3xl bg-[#0A2540] px-8 py-3 text-white font-semibold hover:bg-black"
          >
            Get a Free Quote
          </Link>
          <p className="mt-3 text-xs text-gray-500">
            Or call us at (888) 555-0123 — we’ll help you pick the right package.
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
