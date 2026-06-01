import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { ProductDetailHero } from "@/components/products/ProductDetailHero";
import { ProductBenefitsGrid } from "@/components/products/ProductBenefitsGrid";
import { ProductSizeSelector } from "@/components/products/ProductSizeSelector";
import { ProductFinalCta } from "@/components/products/ProductFinalCta";
import { marketingContainerNarrow } from "@/components/marketing/marketing-design-system";
import { getProductBySlug, products } from "@/lib/products";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.title} | Postcard Platform`,
    description: product.heroHighlight,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 2);

  return (
    <MarketingPageShell>
      <main>
        <ProductDetailHero product={product} />

        <div className={`${marketingContainerNarrow} space-y-16 py-16 pb-20`}>
          <ProductBenefitsGrid product={product} />

          <section>
            <h2 className="mb-4 text-xl font-semibold text-[#0A2540]">Ideal for</h2>
            <div className="flex flex-wrap gap-2">
              {product.idealFor.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          <ProductSizeSelector product={product} />
          <ProductFinalCta product={product} />

          {related.length > 0 ? (
            <section className="border-t border-gray-200 pt-10">
              <p className="text-sm text-gray-600">
                Explore other products:{" "}
                {related.map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 ? " · " : null}
                    <Link
                      href={`/products/${p.slug}`}
                      className="font-medium text-[#0EA5E9] hover:underline"
                    >
                      {p.title}
                    </Link>
                  </span>
                ))}
              </p>
            </section>
          ) : null}
        </div>
      </main>
    </MarketingPageShell>
  );
}
