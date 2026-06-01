import Link from "next/link";

type Props = {
  href: string;
  title: string;
  description: string;
  className?: string;
};

/** Solutions hub card — redesign/direct-mail-marketing.html */
export function MarketingSolutionCard({ href, title, description, className }: Props) {
  return (
    <Link
      href={href}
      className={`block rounded-3xl border border-gray-200 bg-white p-8 transition hover:border-[#0EA5E9] ${className ?? ""}`}
    >
      <div className="mb-2 text-2xl font-semibold">{title}</div>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
