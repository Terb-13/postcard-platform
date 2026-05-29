"use client";

import type { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CampaignBasics } from "../schema";

const SIZES = [
  { value: "6x11", label: "6×11″ EDDM", desc: "Every Door Direct Mail" },
  { value: "4x6", label: "4×6″", desc: "Classic postcard" },
  { value: "5x7", label: "5×7″", desc: "Room for more copy" },
  { value: "6x9", label: "6×9″", desc: "Bold presence" },
] as const;

export function BasicsStep({ form }: { form: UseFormReturn<CampaignBasics> }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const selectedSize = watch("size");

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="heading-sm">Campaign basics</h2>
        <p className="text-small text-[var(--color-text-muted)] mt-1">
          Name your campaign and choose a postcard size.
        </p>
      </div>

      <div>
        <Label htmlFor="name">Campaign name</Label>
        <Input
          id="name"
          placeholder="e.g. Spring 2026 neighborhood drop"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>Postcard size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setValue("size", s.value)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                selectedSize === s.value
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] ring-2 ring-[var(--color-accent)]/20"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
              }`}
            >
              <span className="font-semibold block">{s.label}</span>
              <span className="text-small text-[var(--color-text-muted)]">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
