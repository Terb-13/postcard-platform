import Link from "next/link";
import { AuthButtons } from "./AuthButtons";

const NAV_LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#demo", label: "Live demo" },
  { href: "#how-it-works", label: "How it works" },
] as const;

export function LandingNav() {
  return (
    <nav className="nav">
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-lg tracking-[-0.02em] shrink-0"
        >
          <span
            className="h-8 w-8 rounded-xl bg-[var(--color-bg-dark)] flex items-center justify-center"
            aria-hidden
          >
            <span className="text-white text-xs font-bold">P</span>
          </span>
          <span>Postcard</span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <AuthButtons variant="nav" />
        </div>
      </div>
    </nav>
  );
}
