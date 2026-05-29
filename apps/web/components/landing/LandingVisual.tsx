import Image from "next/image";
import { cn } from "@/lib/utils";

type Aspect = "hero" | "wide" | "tall" | "square";

const aspectClasses: Record<Aspect, string> = {
  hero: "aspect-[4/3] sm:aspect-[16/11] lg:aspect-[5/4]",
  wide: "aspect-[16/10] lg:aspect-[2/1]",
  tall: "aspect-[4/5] lg:aspect-[3/4]",
  square: "aspect-square",
};

type Props = {
  src: string;
  alt: string;
  aspect?: Aspect;
  priority?: boolean;
  sizes?: string;
  className?: string;
  caption?: string;
  /** Subtle navy gradient overlay for depth */
  overlay?: boolean;
};

export function LandingVisual({
  src,
  alt,
  aspect = "wide",
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className,
  caption,
  overlay = true,
}: Props) {
  return (
    <figure className={cn("landing-visual", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl lg:rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] shadow-[var(--shadow-md)]",
          aspectClasses[aspect]
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
        {overlay && <div className="landing-visual-overlay" aria-hidden />}
      </div>
      {caption && (
        <figcaption className="mt-3 text-micro text-[var(--color-text-muted)]">{caption}</figcaption>
      )}
    </figure>
  );
}
