import Link from "next/link";

const FOOTER_LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#demo", label: "Demo" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#results", label: "Results" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white py-10 sm:py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm">
          <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
            <span
              className="h-6 w-6 rounded-lg bg-[var(--color-bg-dark)] flex items-center justify-center"
              aria-hidden
            >
              <span className="text-white text-[10px] font-bold">P</span>
            </span>
            <span className="font-medium text-[var(--color-bg-dark)]">Postcard Platform</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 text-[var(--color-text-secondary)]"
            aria-label="Footer"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-[var(--color-bg-dark)] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link href="/partner" className="hover:text-[var(--color-bg-dark)] transition-colors">
              For printers
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
