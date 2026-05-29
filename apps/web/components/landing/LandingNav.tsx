"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuthButtons } from "./AuthButtons";

const NAV_LINKS = [
  { href: "#problem", label: "The Problem" },
  { href: "#demo", label: "Live Demo" },
  { href: "#how-it-works", label: "How It Works" },
] as const;

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="landing-nav">
      <div className="container landing-nav-inner">
        <Link href="/" className="landing-nav-logo" onClick={closeMenu}>
          <span className="landing-nav-mark" aria-hidden>
            P
          </span>
          <span className="landing-nav-wordmark">
            <span className="hidden min-[420px]:inline">Postcard </span>Platform
          </span>
        </Link>

        <nav className="landing-nav-links hidden md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="landing-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <AuthButtons variant="nav" />
        </div>

        <button
          type="button"
          className="landing-nav-menu-btn md:hidden"
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="landing-nav-backdrop md:hidden"
            onClick={closeMenu}
          />
          <div
            id="landing-mobile-menu"
            className="landing-nav-drawer md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-bg-dark)] tracking-tight">
                Menu
              </span>
              <button
                type="button"
                onClick={closeMenu}
                className="p-2 -mr-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] transition-colors"
                aria-label="Close menu"
              >
                <MenuIcon open />
              </button>
            </div>

            <nav className="flex flex-col p-3" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="landing-nav-drawer-link"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto p-5 pt-2 border-t border-[var(--color-border)] flex flex-col gap-3">
              <AuthButtons variant="nav-mobile" onAction={closeMenu} />
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="w-6 h-6 text-[var(--color-bg-dark)]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path strokeLinecap="round" d="M4 8h16M4 16h16" />
      )}
    </svg>
  );
}
