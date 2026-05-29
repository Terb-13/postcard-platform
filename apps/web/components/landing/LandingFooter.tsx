import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white py-10 sm:py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-6 text-sm">
          <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
            <span className="h-6 w-6 rounded-lg bg-[var(--color-bg-dark)] flex items-center justify-center" aria-hidden>
              <span className="text-white text-[10px] font-bold">P</span>
            </span>
            <span className="font-medium text-[var(--color-bg-dark)]">Postcard Platform</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[var(--color-text-secondary)]" aria-label="Footer">
            <a href="#problem" className="hover:text-[var(--color-bg-dark)] transition-colors">
              The problem
            </a>
            <a href="#demo" className="hover:text-[var(--color-bg-dark)] transition-colors">
              Live demo
            </a>
            <a href="#how-it-works" className="hover:text-[var(--color-bg-dark)] transition-colors">
              How it works
            </a>
            <Link href="/partner" className="hover:text-[var(--color-bg-dark)] transition-colors">
              For printers
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
