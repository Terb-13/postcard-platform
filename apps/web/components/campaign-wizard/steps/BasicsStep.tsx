"use client";

import type { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { WizardStepHeader } from "../WizardStepHeader";
import type { CampaignBasics } from "../schema";
import type { Product, PostcardSize } from "@/lib/products";
import { POSTCARD_SIZES } from "@/lib/products";

type BasicsStepProps = {
  form: UseFormReturn<CampaignBasics>;
  product?: Product | null;
  preselectedSize?: PostcardSize | null;
  onSizeChange?: (size: PostcardSize) => void;
};

function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

export function BasicsStep({ form, product, preselectedSize, onSizeChange }: BasicsStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const selectedSize = watch("size");

  const sizeOptions = product?.sizes ?? POSTCARD_SIZES;
  const lockedSize = preselectedSize ?? null;
  const recommendedSize = product?.sizes.find((s) => s.recommended);

  const handleSizeSelect = (value: PostcardSize) => {
    setValue("size", value);
    onSizeChange?.(value);
  };

  return (
    <div className="max-w-none space-y-6 md:max-w-xl md:space-y-8">
      {product ? (
        <div className="rounded-2xl border border-[var(--color-accent)]/40 bg-gradient-to-r from-[var(--color-accent-subtle)] to-[var(--color-accent-subtle)]/40 px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
            Product selected
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--color-text)] sm:text-lg">
            Creating an {product.title} campaign
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {product.priceTeaser} · {product.shortTitle} sizes only
          </p>
        </div>
      ) : null}

      <WizardStepHeader
        title={product ? "Name your campaign" : "Start with the essentials"}
        description={
          product
            ? "You're almost ready to pick your audience. Confirm your postcard size below."
            : "Name your campaign and choose a postcard size. You can refine targeting and creative next."
        }
      />

      <div className="space-y-2">
        <Label htmlFor="name">Campaign name</Label>
        <Input
          id="name"
          placeholder={
            product
              ? `e.g. ${product.shortTitle} — Spring 2026`
              : "e.g. Spring 2026 neighborhood drop"
          }
          {...register("name")}
        />
        {errors.name ? (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <Label>{product ? `${product.shortTitle} postcard size` : "Postcard size"}</Label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sizeOptions.map((s) => {
            const isSelected = selectedSize === s.value;
            const isLockedSelection = lockedSize === s.value && isSelected;
            const isRecommended = s.recommended === true;

            return (
              <button
                key={s.value}
                type="button"
                onClick={() => handleSizeSelect(s.value)}
                className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isRecommended && product ? "sm:col-span-2" : ""
                } ${
                  isSelected
                    ? isLockedSelection
                      ? "min-h-[96px] border-[var(--color-accent)] bg-[var(--color-accent-subtle)] shadow-[var(--shadow-md)] ring-[3px] ring-[var(--color-accent)]/40 sm:p-5"
                      : "min-h-[76px] border-[var(--color-accent)] bg-[var(--color-accent-subtle)] shadow-[var(--shadow-sm)] ring-2 ring-[var(--color-accent)]/20"
                    : "min-h-[76px] border-[var(--color-border)] opacity-90 hover:border-[var(--color-border-strong)] hover:opacity-100 hover:shadow-[var(--shadow-sm)]"
                }`}
              >
                {isLockedSelection ? (
                  <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    <LockIcon />
                    Your selection
                  </span>
                ) : isRecommended && product ? (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-[var(--color-bg-dark)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Recommended
                  </span>
                ) : null}

                <span className={`block font-semibold ${isRecommended && product ? "text-base sm:text-lg" : ""}`}>
                  {s.label}
                </span>
                {"dimensions" in s && s.dimensions ? (
                  <span className="text-micro text-[var(--color-text-muted)]">{s.dimensions}</span>
                ) : null}
                <span className="mt-1 block text-small text-[var(--color-text-muted)]">
                  {s.description}
                </span>
              </button>
            );
          })}
        </div>

        {product && (lockedSize || recommendedSize) ? (
          <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/60 px-4 py-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {lockedSize && lockedSize === selectedSize ? (
              <>
                <span className="font-medium text-[var(--color-text)]">
                  Size locked from product page.{" "}
                </span>
                You can change it here if needed.
              </>
            ) : null}
            {recommendedSize && (!lockedSize || lockedSize !== selectedSize) ? (
              <>
                <span className="font-medium text-[var(--color-text)]">
                  Why {recommendedSize.label}?{" "}
                </span>
                {product.sizeRecommendationNote}
              </>
            ) : null}
            {lockedSize && lockedSize === selectedSize && recommendedSize ? (
              <span className="mt-2 block">{product.sizeRecommendationNote}</span>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
