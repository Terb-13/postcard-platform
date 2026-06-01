"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product, PostcardSize } from "@/lib/products";
import { buildCampaignWizardHref } from "@/lib/products";

type ProductSizeSelectorProps = {
  product: Product;
};

export function ProductSizeSelector({ product }: ProductSizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<PostcardSize>(product.defaultSize);

  const sortedSizes = useMemo(() => {
    const recommended = product.sizes.filter((s) => s.recommended);
    const others = product.sizes.filter((s) => !s.recommended);
    return [...recommended, ...others];
  }, [product.sizes]);

  const recommendedSize = product.sizes.find((s) => s.recommended);

  return (
    <section className="rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/80 p-5 shadow-sm sm:p-8">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]">
        Postcard size
      </p>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl">
        Choose the format for your drop
      </h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
        Only sizes available for {product.title} are shown. Your pick carries into the campaign wizard.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {sortedSizes.map((size) => {
          const isSelected = selectedSize === size.value;
          const isRecommended = size.recommended === true;

          return (
            <button
              key={size.value}
              type="button"
              onClick={() => setSelectedSize(size.value)}
              className={`relative text-left transition-all duration-200 ${
                isRecommended ? "sm:col-span-2" : ""
              } ${
                isSelected
                  ? isRecommended
                    ? "rounded-3xl border-2 border-[#0EA5E9] bg-[#0EA5E9]/5 p-5 shadow-lg ring-2 ring-[#0EA5E9]/20 sm:p-6"
                    : "rounded-2xl border-2 border-[#0EA5E9] bg-[#0EA5E9]/5 p-4 shadow-md ring-2 ring-[#0EA5E9]/20"
                  : isRecommended
                    ? "rounded-3xl border border-gray-200 bg-white p-5 hover:border-[#0EA5E9]/50 hover:shadow-md sm:p-6"
                    : "rounded-2xl border border-gray-200 bg-white p-4 hover:border-[#0EA5E9]/40 hover:shadow-sm"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span
                    className={`block font-semibold text-[#0A2540] ${
                      isRecommended ? "text-lg sm:text-xl" : ""
                    }`}
                  >
                    {size.label}
                  </span>
                  {size.dimensions ? (
                    <span className="mt-0.5 block text-xs font-medium text-gray-500">
                      {size.dimensions}
                    </span>
                  ) : null}
                </div>
                {isRecommended ? (
                  <span className="shrink-0 rounded-full bg-[#0A2540] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Recommended
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-2 text-gray-600 ${
                  isRecommended ? "text-sm sm:text-base" : "text-sm"
                }`}
              >
                {size.description}
              </p>
              {isSelected ? (
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0EA5E9]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0EA5E9] text-[10px] text-white">
                    ✓
                  </span>
                  Selected
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {recommendedSize ? (
        <p className="mt-5 rounded-2xl border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 px-4 py-3 text-sm leading-relaxed text-gray-700">
          <span className="font-semibold text-[#0A2540]">Why {recommendedSize.label}? </span>
          {product.sizeRecommendationNote}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-[#0A2540]">{product.priceTeaser}</p>
          <p className="text-sm text-gray-600">Final price based on audience size</p>
        </div>
        <Link
          href={buildCampaignWizardHref(product, selectedSize)}
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-3xl bg-[#0A2540] px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-black hover:shadow-lg sm:w-auto"
        >
          Continue with {selectedSize.replace("x", "×")}″ →
        </Link>
      </div>
    </section>
  );
}
