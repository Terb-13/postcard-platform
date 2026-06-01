"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuthButtons } from "@/components/landing/AuthButtons";

/** redesign/index.html — Nav links & structure */
const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#map-tool", label: "Map Tool" },
  { href: "/direct-mail-marketing", label: "Solutions" },
] as const;

export function MarketingNav() {
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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 font-semibold tracking-tight text-[#0A2540]"
          onClick={closeMenu}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0A2540] text-2xl font-bold tracking-tighter text-white"
            aria-hidden
          >
            P
          </span>
          <span className="text-2xl">Postcard</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Main">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                className="text-[#0A2540] transition-colors hover:text-[#0EA5E9]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#0A2540] transition-colors hover:text-[#0EA5E9]"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 md:flex">
          <AuthButtons variant="marketing-nav" />
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-[#0A2540] hover:bg-gray-100 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="marketing-mobile-menu"
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
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={closeMenu}
          />
          <div
            id="marketing-mobile-menu"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <span className="font-semibold text-[#0A2540]">Menu</span>
              <button type="button" onClick={closeMenu} className="rounded-xl p-2 hover:bg-gray-100">
                <MenuIcon open />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
              {NAV_LINKS.map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl px-4 py-3 font-medium text-[#0A2540] hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl px-4 py-3 font-medium text-[#0A2540] hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
            <div className="mt-auto border-t border-gray-200 p-5">
              <AuthButtons variant="marketing-nav-mobile" onAction={closeMenu} />
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path strokeLinecap="round" d="M4 8h16M4 16h16" />
      )}
    </svg>
  );
}
