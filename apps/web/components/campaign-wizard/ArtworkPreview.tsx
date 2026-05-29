"use client";

import { useCallback, useId, useState, type SyntheticEvent } from "react";

import { Visual } from "@/components/shared/Visual";
import { cn } from "@/lib/utils";

export type PostcardSide = "front" | "back";

export type ArtworkPreviewProps = {
  /** Resolved image URL for the front of the postcard (page 1). */
  frontSrc?: string | null;
  /** Resolved image URL for the back of the postcard (page 2). */
  backSrc?: string | null;
  /** Controlled active side — parent owns toggle state. */
  activeSide: PostcardSide;
  onActiveSideChange: (side: PostcardSide) => void;
  frontAlt?: string;
  backAlt?: string;
  className?: string;
  /** Thumbnails or PDF pages are still resolving. */
  isLoading?: boolean;
  onImageLoad?: (side: PostcardSide, dimensions: { width: number; height: number }) => void;
  onImageError?: (side: PostcardSide) => void;
};

const SIDES: { id: PostcardSide; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
];

function EmptyArtworkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
      />
    </svg>
  );
}

function PreviewSkeleton() {
  return (
    <div
      className="flex min-h-[16rem] w-full max-w-md flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-6 py-10 shadow-[var(--shadow-sm)] sm:min-h-[18rem]"
      aria-hidden
    >
      <div className="h-28 w-full max-w-[14rem] animate-pulse rounded-lg bg-[var(--color-bg-alt)]" />
      <div className="h-3 w-32 animate-pulse rounded bg-[var(--color-bg-alt)]" />
      <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-bg-alt)]" />
    </div>
  );
}

function EmptyPreviewState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[16rem] w-full max-w-md flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-white px-6 py-10 text-center shadow-[var(--shadow-sm)] sm:min-h-[18rem]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/60 text-[var(--color-text-muted)]">
        <EmptyArtworkIcon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-[var(--color-bg-dark)]">{title}</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
        {description}
      </p>
    </div>
  );
}

export function ArtworkPreview({
  frontSrc,
  backSrc,
  activeSide,
  onActiveSideChange,
  frontAlt = "Postcard front artwork preview",
  backAlt = "Postcard back artwork preview",
  className,
  isLoading = false,
  onImageLoad,
  onImageError,
}: ArtworkPreviewProps) {
  const baseId = useId();
  const [imageDimensions, setImageDimensions] = useState<
    Partial<Record<PostcardSide, { width: number; height: number }>>
  >({});

  const hasAnyArtwork = Boolean(frontSrc || backSrc);
  const activeSrc = activeSide === "front" ? frontSrc : backSrc;
  const activeAlt = activeSide === "front" ? frontAlt : backAlt;
  const activeDimensions = imageDimensions[activeSide];

  const handleImageLoad = useCallback(
    (side: PostcardSide) => (event: SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
      setImageDimensions((prev) => ({ ...prev, [side]: dimensions }));
      onImageLoad?.(side, dimensions);
    },
    [onImageLoad]
  );

  const handleImageError = useCallback(
    (side: PostcardSide) => () => {
      onImageError?.(side);
    },
    [onImageError]
  );

  const emptyTitle =
    activeSide === "front"
      ? "Upload your artwork or choose a template"
      : "Back side not available yet";

  const emptyDescription =
    activeSide === "front"
      ? "Your print-ready front design will appear here exactly as Drummond will receive it."
      : frontSrc
        ? "Include a second page in your PDF to preview the back of your postcard."
        : "Upload a 2-page PDF to preview both sides before you send.";

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/40 p-4 sm:p-6",
        className
      )}
      aria-label="Postcard artwork preview"
    >
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Print preview
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            Review your artwork before it goes to production.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Postcard side"
          className="inline-flex w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-sm)] sm:w-auto"
        >
          {SIDES.map(({ id, label }) => {
            const isActive = activeSide === id;
            const tabId = `${baseId}-${id}-tab`;
            const panelId = `${baseId}-${id}-panel`;

            return (
              <button
                key={id}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={() => onActiveSideChange(id)}
                className={cn(
                  "min-h-[40px] flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:flex-none sm:min-w-[5.5rem]",
                  isActive
                    ? "bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`${baseId}-${activeSide}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-${activeSide}-tab`}
        className="flex justify-center"
      >
        {isLoading ? (
          <PreviewSkeleton />
        ) : activeSrc ? (
          <Visual
            treatment="artwork"
            isUserContent
            src={activeSrc}
            alt={activeAlt}
            width={activeDimensions?.width}
            height={activeDimensions?.height}
            containerClassName="w-full max-w-md bg-white"
            imageClassName="max-h-[min(32rem,70vh)] w-auto max-w-full"
            onLoad={handleImageLoad(activeSide)}
            onError={handleImageError(activeSide)}
          />
        ) : (
          <EmptyPreviewState
            title={hasAnyArtwork ? emptyTitle : "Upload your artwork or choose a template"}
            description={
              hasAnyArtwork
                ? emptyDescription
                : "Add your front and back designs as separate PDF pages. You'll see an accurate preview here before sending to Drummond."
            }
          />
        )}
      </div>

      {hasAnyArtwork && (
        <p className="mt-4 text-center text-micro text-[var(--color-text-muted)]">
          Preview shows your artwork at original proportions — no cropping applied.
        </p>
      )}
    </section>
  );
}
