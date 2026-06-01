import type { PostcardSize } from "@/lib/products";
import { Mail } from "lucide-react";

const ASPECT: Record<PostcardSize, string> = {
  "4x6": "aspect-[3/2]",
  "5x7": "aspect-[7/5]",
  "6x9": "aspect-[3/2]",
  "6x11": "aspect-[11/6]",
};

type PostcardSizePreviewProps = {
  size: PostcardSize;
  dimensions?: string;
  selected?: boolean;
  large?: boolean;
};

/** Mini postcard silhouette for size selector cards */
export function PostcardSizePreview({
  size,
  dimensions,
  selected = false,
  large = false,
}: PostcardSizePreviewProps) {
  const boxClass = large ? "w-20 sm:w-24" : "w-14 sm:w-16";

  return (
    <div
      className={`flex shrink-0 flex-col items-center gap-1.5 ${boxClass}`}
      aria-hidden
    >
      <div
        className={`relative flex w-full items-center justify-center rounded-lg border-2 bg-gradient-to-br from-white to-gray-50 shadow-sm transition-colors ${ASPECT[size]} ${
          selected
            ? "border-[#0EA5E9] shadow-[0_0_0_3px_rgba(14,165,233,0.15)]"
            : "border-gray-200"
        }`}
      >
        <Mail
          className={`text-[#0EA5E9]/70 ${large ? "h-5 w-5" : "h-4 w-4"}`}
          strokeWidth={1.5}
        />
      </div>
      {dimensions ? (
        <span className="text-center text-[10px] font-medium leading-tight text-gray-500">
          {dimensions}
        </span>
      ) : null}
    </div>
  );
}
