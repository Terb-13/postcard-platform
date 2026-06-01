"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import type { Product, PostcardSize } from "@/lib/products";
import { buildCampaignWizardHref, getSizePriceRange } from "@/lib/products";
import { PostcardSizePreview } from "./PostcardSizePreview";
import { ProductCensusTrustBadge } from "./ProductCensusTrustBadge";

type ProductSizeSelectorProps = {
  product: Product;
};

function RecommendedBadge({ tooltip }: { tooltip: string }) {
  return (
    <span className="group relative inline-flex shrink-0 items-center gap-1">
      <span className="rounded-full bg-[#0A2540] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
        Recommended
      </span>
      <HelpCircle
        className="h-3.5 w-3.5 text-[#0EA5E9] cursor-help"
        aria-label={tooltip}
      />
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-2 right-0 z-20 w-56 translate-y-[-100%] rounded-xl border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {tooltip}
      </span>
    </span>
  );
}

export function ProductSizeSelector({ product }: ProductSizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<PostcardSize>(product.defaultSize);

  const sortedSizes = useMemo(() => {
    const recommended = product.sizes.filter((s) => s.recommended);
    const others = product.sizes.filter((s) => !s.recommended);
    return [...recommended, ...others];
  }, [product.sizes]);

  const selectedPrice = getSizePriceRange(product, selectedSize);

  return (
    <section className="rounded-3xl border border-gray-200 bg-gradient-to-b from-white via-white to-gray-50/90 p-5 shadow-sm sm:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]">
            Postcard size
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl">
            Pick the format that fits your offer
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Only sizes available for {product.title}. Your selection carries into the campaign
            wizard — change it anytime before checkout.
          </p>
        </div>
        <ProductCensusTrustBadge className="shrink-0 self-start" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sortedSizes.map((size) => {
          const isSelected = selectedSize === size.value;
          const isRecommended = size.recommended === true;
          const priceRange = getSizePriceRange(product, size.value);

          return (
            <button
              key={size.value}
              type="button"
              onClick={() => setSelectedSize(size.value)}
              className={`relative flex gap-4 text-left transition-all duration-200 ${
                isRecommended ? "sm:col-span-2" : ""
              } ${
                isSelected
                  ? "rounded-3xl border-2 border-[#0EA5E9] bg-[#0EA5E9]/[0.06] p-4 shadow-lg ring-2 ring-[#0EA5E9]/20 sm:p-5"
                  : "rounded-2xl border border-gray-200 bg-white p-4 hover:border-[#0EA5E9]/40 hover:shadow-md sm:p-5"
              }`}
            >
              <PostcardSizePreview
                size={size.value}
                dimensions={size.dimensions}
                selected={isSelected}
                large={isRecommended}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span
                      className={`block font-semibold text-[#0A2540] ${
                        isRecommended ? "text-lg sm:text-xl" : "text-base"
                      }`}
                    >
                      {size.label}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-[#0EA5E9]">
                      {priceRange}
                    </span>
                  </div>
                  {isRecommended ? (
                    <RecommendedBadge tooltip={product.sizeRecommendationNote} />
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{size.description}</p>
                {isSelected ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0EA5E9]/10 px-2.5 py-1 text-xs font-semibold text-[#0EA5E9]">
                    ✓ Selected for your campaign
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Estimated rate for {selectedSize.replace("x", "×")}″
          </p>
          <p className="text-2xl font-semibold tracking-tight text-[#0A2540]">{selectedPrice}</p>
          <p className="text-sm text-gray-600">Final total based on households reached</p>
        </div>
        <Link
          href={buildCampaignWizardHref(product, selectedSize)}
          className="inline-flex min-h-[56px] w-full items-center justify-center rounded-3xl bg-[#0A2540] px-10 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-black hover:shadow-xl sm:w-auto"
        >
          Continue with {selectedSize.replace("x", "×")}″ →
        </Link>
      </div>
    </section>
  );
}
