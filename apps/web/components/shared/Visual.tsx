import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Image presentation treatment — maps 1:1 to the Image Treatment Matrix.
 *
 * - **`hero`** — Emotional / value proposition. `object-cover`, locked aspect, fixed container.
 * - **`feature`** — Feature / explainer sections. `object-contain`, flexible or locked aspect.
 * - **`functional`** — Maps, previews, demos. Clean presentation; aspect is caller-defined.
 * - **`artwork`** — User-uploaded postcard creative. Native `<img>`, white canvas, original proportions.
 * - **`socialProof`** — Results / testimonials. Natural photography, locked aspect, light overlays.
 *
 * @see docs/frontend-ux-ui-image-architecture-v1.0.md
 */
export type VisualTreatment =
  | "hero"
  | "feature"
  | "functional"
  | "artwork"
  | "socialProof";

type TreatmentConfig = {
  description: string;
  /** Native `<img>` for blob URLs and dynamic upload previews (`artwork` only). */
  useNativeImg: boolean;
  container: string;
  image: string;
  /** Locked default aspect; omitted when aspect is component-defined. */
  defaultAspectRatio?: string;
};

/**
 * Image Treatment Matrix — Tailwind implementation.
 *
 * | Treatment   | Engine     | Object fit | Radius           | Shadow | Background |
 * |-------------|------------|------------|------------------|--------|------------|
 * | hero        | next/image | cover      | rounded-2xl/3xl  | lg     | bg-alt     |
 * | feature     | next/image | contain    | rounded-xl       | md     | bg-alt     |
 * | functional  | next/image | contain    | rounded-xl       | sm     | surface    |
 * | artwork     | `<img>`    | contain    | rounded-xl       | sm     | white      |
 * | socialProof | next/image | contain    | rounded-xl       | md     | bg-alt     |
 *
 * @see docs/frontend-ux-ui-image-architecture-v1.0.md
 */
const TREATMENT_CONFIG: Record<VisualTreatment, TreatmentConfig> = {
  /**
   * **hero** — Emotional / value proposition.
   * `object-cover` with intentional crop. Locked aspect (11/6 or 16/9).
   * Fixed container. High-quality source required.
   */
  hero: {
    description: "Emotional / value proposition — immersive hero with intentional crop.",
    useNativeImg: false,
    container:
      "relative overflow-hidden rounded-2xl lg:rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-[var(--shadow-lg)]",
    image: "object-cover object-center",
    defaultAspectRatio: "11/6",
  },

  /**
   * **feature** — Feature / explainer (solution, how it works).
   * `object-contain` preferred. Flexible or locked aspect. Avoid distortion.
   */
  feature: {
    description: "Feature / explainer — full asset visible, no distortion.",
    useNativeImg: false,
    container:
      "relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-[var(--shadow-md)]",
    image: "object-contain object-center",
    defaultAspectRatio: "10/7",
  },

  /**
   * **functional** — Maps, previews, demos.
   * Clean presentation. Aspect ratio is component-defined — never force marketing ratios.
   */
  functional: {
    description: "Maps, previews, demos — caller defines aspect; no marketing presets.",
    useNativeImg: false,
    container:
      "relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]",
    image: "object-contain object-center",
    defaultAspectRatio: undefined,
  },

  /**
   * **artwork** — Front/back postcard preview.
   * Clean white background. Maintain original proportions. Native `<img>` for blobs.
   * Critical for the Creative step.
   */
  artwork: {
    description: "User-uploaded creative — white canvas, native img, original proportions.",
    useNativeImg: true,
    container:
      "relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]",
    image: "object-contain object-center w-full h-full",
    defaultAspectRatio: undefined,
  },

  /**
   * **socialProof** — Results / testimonials.
   * Natural photography. Locked aspect. Fixed container. Light or no heavy overlays.
   */
  socialProof: {
    description: "Results / testimonials — natural photography in a fixed frame.",
    useNativeImg: false,
    container:
      "relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-[var(--shadow-md)]",
    image: "object-contain object-center",
    defaultAspectRatio: "10/7",
  },
};

const DEFAULT_SIZES = "(max-width: 1024px) 100vw, 50vw";
const DEFAULT_QUALITY = 85;

/** Converts `"16/9"` → Tailwind arbitrary aspect class `aspect-[16/9]`. */
function aspectRatioClass(ratio: string | undefined): string | undefined {
  if (!ratio) return undefined;
  const normalized = ratio.replace(/\s+/g, "").replace(":", "/");
  if (!/^\d+(\.\d+)?\/\d+(\.\d+)?$/.test(normalized)) return undefined;
  return `aspect-[${normalized}]`;
}

type SharedProps = {
  src: string;
  alt: string;
  /** Image Treatment Matrix preset. Defaults to `feature`. */
  treatment?: VisualTreatment;
  /**
   * Container aspect ratio as a fraction string, e.g. `"16/9"` or `"11/6"`.
   * Required for `functional` when no intrinsic sizing is available.
   * Falls back to the treatment default when one is defined.
   */
  aspectRatio?: string;
  className?: string;
  containerClassName?: string;
  imageClassName?: string;
  caption?: ReactNode;
  /** Light gradient overlay — use sparingly; supported on `hero` only. */
  overlay?: boolean;
  /** User-uploaded creative — elevates artwork framing (postcard preview). */
  isUserContent?: boolean;
  priority?: boolean;
  sizes?: string;
  /** next/image quality (1–100). Ignored for `artwork`. */
  quality?: number;
  loading?: "lazy" | "eager";
  onLoad?: ComponentPropsWithoutRef<"img">["onLoad"];
  onError?: ComponentPropsWithoutRef<"img">["onError"];
};

type VisualProps = SharedProps &
  (
    | {
        treatment?: Exclude<VisualTreatment, "artwork">;
        width?: never;
        height?: never;
      }
    | {
        treatment: "artwork";
        /** Intrinsic width hint for native `<img>` (optional). */
        width?: number;
        /** Intrinsic height hint for native `<img>` (optional). */
        height?: number;
      }
  );

/**
 * Production image wrapper implementing the Image Treatment Matrix.
 *
 * - **Marketing / functional** (`hero`, `feature`, `functional`, `socialProof`):
 *   optimized `next/image` with `fill` inside an aspect-ratio container.
 * - **Artwork** (`artwork`): native `<img>` for blob URLs and upload previews.
 *
 * @see docs/frontend-ux-ui-image-architecture-v1.0.md
 *
 * @example
 * ```tsx
 * <Visual
 *   treatment="hero"
 *   aspectRatio="11/6"
 *   src="/images/marketing/hero.jpg"
 *   alt="Census-powered targeting map"
 *   priority
 * />
 * ```
 */
export function Visual({
  src,
  alt,
  treatment = "feature",
  aspectRatio,
  className,
  containerClassName,
  imageClassName,
  caption,
  overlay = false,
  isUserContent = false,
  priority = false,
  sizes = DEFAULT_SIZES,
  quality = DEFAULT_QUALITY,
  loading,
  onLoad,
  onError,
  width,
  height,
}: VisualProps) {
  const config = TREATMENT_CONFIG[treatment];
  const resolvedAspect = aspectRatio ?? config.defaultAspectRatio;
  const aspectClass = aspectRatioClass(resolvedAspect);
  const isComponentControlled =
    treatment === "functional" || treatment === "artwork";

  const userContentFrame =
    isUserContent && treatment === "artwork"
      ? "shadow-[var(--shadow-md)] ring-1 ring-black/[0.04]"
      : undefined;

  const figureClassName = cn("m-0", className);
  const frameClassName = cn(
    config.container,
    aspectClass,
    !aspectClass &&
      isComponentControlled &&
      "relative flex min-h-[12rem] w-full items-center justify-center",
    userContentFrame,
    containerClassName
  );
  const mediaClassName = cn(config.image, imageClassName);

  return (
    <figure className={figureClassName}>
      <div className={frameClassName}>
        {config.useNativeImg ? (
          // eslint-disable-next-line @next/next/no-img-element -- artwork: blob URLs and dynamic previews
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            decoding="async"
            loading={loading ?? (priority ? "eager" : "lazy")}
            onLoad={onLoad}
            onError={onError}
            className={cn(
              mediaClassName,
              !aspectClass && "max-h-[32rem] w-auto max-w-full"
            )}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            quality={quality}
            loading={loading}
            onLoad={onLoad}
            onError={onError}
            className={mediaClassName}
          />
        )}

        {overlay && treatment === "hero" && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(10,37,64,0.04)] via-transparent to-[rgba(10,37,64,0.06)]"
            aria-hidden
          />
        )}
      </div>

      {caption ? (
        <figcaption className="mt-3 text-micro text-[var(--color-text-muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export { TREATMENT_CONFIG as VISUAL_TREATMENT_MATRIX };
