import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";
import { MarketingPrimaryCta } from "@/components/marketing/MarketingPrimaryCta";
import { marketingContainerNarrow } from "@/components/marketing/marketing-design-system";
import { EDDM_BENEFITS } from "@/components/marketing/marketing-solutions";

/** redesign/every-door-direct-mail.html */
export default function EveryDoorDirectMailPage() {
  return (
    <MarketingPageShell>
      <main className={marketingContainerNarrow}>
        <MarketingPageHero
          backLink={{ href: "/direct-mail-marketing", label: "← All Solutions" }}
          title="Every Door Direct Mail"
          description="Reach every household in a neighborhood — no mailing list required."
        />

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-3 font-semibold">Key Benefits</h2>
            <ul className="space-y-2 text-gray-700">
              {EDDM_BENEFITS.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-start">
            <MarketingPrimaryCta href="/map-tool" className="w-full text-center sm:w-auto">
              Launch EDDM Map Tool
            </MarketingPrimaryCta>
          </div>
        </div>

        <p className="mt-16 border-t border-gray-200 pt-10 text-sm text-gray-600">
          Ready for more precision?{" "}
          <Link href="/targeted-direct-mail" className="font-medium text-[#0EA5E9] hover:underline">
            Try Targeted Direct Mail →
          </Link>
        </p>
      </main>
    </MarketingPageShell>
  );
}
