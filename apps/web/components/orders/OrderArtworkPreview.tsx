"use client";

import { useState } from "react";
import {
  ArtworkPreview,
  type PostcardSide,
} from "@/components/campaign-wizard/ArtworkPreview";

/** Matches tRPC/Prisma artwork thumbnail rows (page + url may be optional in inferred types). */
export type ArtworkThumbnailInput = { page?: number | null; url?: string | null };

type OrderArtworkPreviewProps = {
  size?: string | null;
  thumbnailUrl?: string | null;
  thumbnails?: ArtworkThumbnailInput[] | null;
  className?: string;
  compact?: boolean;
};

function thumbnailsMap(
  rows: ArtworkThumbnailInput[] | null | undefined
): Record<number, string> {
  if (!rows?.length) return {};
  return rows.reduce<Record<number, string>>((acc, t) => {
    if (t.page != null && t.url) acc[t.page] = t.url;
    return acc;
  }, {});
}

export function OrderArtworkPreview({
  size,
  thumbnailUrl,
  thumbnails,
  className,
  compact = false,
}: OrderArtworkPreviewProps) {
  const [activeSide, setActiveSide] = useState<PostcardSide>("front");
  const map = thumbnailsMap(thumbnails);
  const frontSrc = map[1] ?? thumbnailUrl ?? null;
  const backSrc = map[2] ?? null;

  if (!frontSrc && !backSrc) {
    return (
      <div
        className={
          compact
            ? "h-20 w-32 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-center text-xs text-[var(--color-text-muted)]"
            : "rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center text-sm text-[var(--color-text-muted)]"
        }
      >
        No artwork preview
      </div>
    );
  }

  return (
    <ArtworkPreview
      frontSrc={frontSrc}
      backSrc={backSrc}
      activeSide={activeSide}
      onActiveSideChange={setActiveSide}
      postcardSize={size ?? undefined}
      className={className ?? (compact ? "max-h-28" : "max-h-[320px] w-full")}
      isLoading={false}
    />
  );
}
