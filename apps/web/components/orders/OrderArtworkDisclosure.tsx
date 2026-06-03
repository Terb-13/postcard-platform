"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { OrderArtworkPreview } from "@/components/orders/OrderArtworkPreview";

type ThumbnailRow = { page: number; url: string };

type OrderArtworkDisclosureProps = {
  size?: string | null;
  thumbnailUrl?: string | null;
  thumbnails?: ThumbnailRow[] | null;
  className?: string;
  /** Shown below the preview when expanded (e.g. upload, status). */
  footer?: ReactNode;
  /** Optional meta line on the right of the summary (filename, page count). */
  meta?: ReactNode;
};

function hasArtwork(
  thumbnailUrl?: string | null,
  thumbnails?: ThumbnailRow[] | null
): boolean {
  if (thumbnailUrl) return true;
  return Boolean(thumbnails?.some((t) => t.url));
}

export function OrderArtworkDisclosure({
  size,
  thumbnailUrl,
  thumbnails,
  className,
  footer,
  meta,
}: OrderArtworkDisclosureProps) {
  const panelId = useId();

  if (!hasArtwork(thumbnailUrl, thumbnails)) {
    return null;
  }

  const pageCount = thumbnails?.length ?? (thumbnailUrl ? 1 : 0);
  const pageLabel =
    pageCount >= 2 ? "front & back" : pageCount === 1 ? "front" : "artwork";

  return (
    <details
      className={cn(
        "group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60",
        className
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-surface)]/80 transition-colors rounded-xl",
          "[&::-webkit-details-marker]:hidden"
        )}
        aria-controls={panelId}
      >
        <span className="flex items-center gap-2">
          <ChevronIcon className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-open:rotate-90" />
          View postcard artwork
          <span className="font-normal text-[var(--color-text-muted)]">({pageLabel})</span>
        </span>
        <span className="text-xs font-normal text-[var(--color-accent)] group-open:hidden">
          Show
        </span>
        <span className="hidden text-xs font-normal text-[var(--color-text-muted)] group-open:inline">
          Hide
        </span>
        {meta ? (
          <span className="hidden text-xs font-normal text-[var(--color-text-muted)] sm:inline sm:max-w-[40%] sm:truncate sm:text-right">
            {meta}
          </span>
        ) : null}
      </summary>

      <div
        id={panelId}
        className={cn(
          "border-t border-[var(--color-border)] px-4 pb-4 pt-3 overflow-hidden",
          "[&_section]:border-0 [&_section]:bg-transparent [&_section]:p-0 [&_section]:shadow-none",
          "[&_img]:max-h-[min(240px,42vh)] [&_img]:w-auto [&_img]:mx-auto"
        )}
      >
        <OrderArtworkPreview
          size={size}
          thumbnailUrl={thumbnailUrl}
          thumbnails={thumbnails}
          className="w-full"
        />
        {footer ? (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">{footer}</div>
        ) : null}
      </div>
    </details>
  );
}

/** Disclosure for campaigns list: preview and/or PDF fallback + optional footer. */
export function CampaignArtworkDisclosure({
  size,
  thumbnailUrl,
  thumbnails,
  fileName,
  pageCount,
  className,
  footer,
  fallbackPreview,
}: {
  size?: string | null;
  thumbnailUrl?: string | null;
  thumbnails?: ThumbnailRow[] | null;
  fileUrl?: string | null;
  fileName?: string | null;
  pageCount?: number;
  className?: string;
  footer?: ReactNode;
  fallbackPreview?: ReactNode;
}) {
  const hasImages = hasArtwork(thumbnailUrl, thumbnails);
  const meta =
    fileName || pageCount
      ? `${fileName ?? ""}${fileName && pageCount ? " · " : ""}${
          pageCount ? `${pageCount} page${pageCount > 1 ? "s" : ""}` : ""
        }`
      : null;

  if (!hasImages && !fallbackPreview) return null;

  if (hasImages) {
    return (
      <OrderArtworkDisclosure
        className={className}
        size={size}
        thumbnailUrl={thumbnailUrl}
        thumbnails={thumbnails}
        meta={meta || undefined}
        footer={footer}
      />
    );
  }

  const panelId = useId();
  return (
    <details
      className={cn(
        "group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60",
        className
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-surface)]/80 transition-colors rounded-xl",
          "[&::-webkit-details-marker]:hidden"
        )}
      >
        <span className="flex items-center gap-2">
          <ChevronIcon className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-open:rotate-90" />
          View artwork preview
        </span>
        {meta ? (
          <span className="text-xs font-normal text-[var(--color-text-muted)]">{meta}</span>
        ) : null}
      </summary>
      <div id={panelId} className="border-t border-[var(--color-border)] px-4 pb-4 pt-3 overflow-hidden">
        {fallbackPreview}
        {footer ? (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">{footer}</div>
        ) : null}
      </div>
    </details>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}
