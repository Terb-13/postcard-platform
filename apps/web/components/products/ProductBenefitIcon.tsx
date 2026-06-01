import {
  BarChart3,
  Eye,
  MapPin,
  Rocket,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { ProductBenefitIcon as IconName } from "@/lib/products";

const ICON_MAP: Record<IconName, LucideIcon> = {
  reach: MapPin,
  pricing: TrendingUp,
  speed: Rocket,
  targeting: Target,
  scale: BarChart3,
  transparency: Eye,
};

type ProductBenefitIconProps = {
  name: IconName;
  className?: string;
};

export function ProductBenefitIcon({ name, className = "" }: ProductBenefitIconProps) {
  const Icon = ICON_MAP[name];
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0EA5E9]/15 to-[#0EA5E9]/5 text-[#0EA5E9] ring-1 ring-[#0EA5E9]/10 ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
    </span>
  );
}
