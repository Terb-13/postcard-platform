import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";
import { marketingContainer } from "@/components/marketing/marketing-design-system";
import { ProductCard } from "@/components/products/ProductCard";
import { products } from "@/lib/products";

export const metadata = {
  title: "Direct Mail Products | Postcard Platform",
  description:
    "Choose the right direct mail product for your business — EDDM, targeted mail, discount zones, and saturation campaigns.",
};

/** Product hub — guided product selection before campaign wizard */
export default function ProductsPage() {
  return (
    <MarketingPageShell>
      <main>
        <MarketingPageHero
          band
          size="hub"
          title="Direct Mail Products"
          description="Pick a product built for your goal. Each path pre-configures sizes and pricing so you can launch faster."
        />

        <div className={`${marketingContainer} grid gap-5 py-12 pb-20 sm:gap-6 sm:py-16 md:grid-cols-2 xl:grid-cols-4`}>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </main>
    </MarketingPageShell>
  );
}
