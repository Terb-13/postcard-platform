"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { clsx } from "clsx";
import { hasClerkPublishableKey } from "@/lib/clerk-config";

const TABS = [
  { href: "/campaigns", label: "My campaigns", description: "Drafts, artwork, checkout" },
  { href: "/account/orders", label: "Your orders", description: "Production & shipping" },
] as const;

export function CustomerAccountNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container max-w-5xl py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1" aria-label="Account">
          {TABS.map((tab) => {
            const active =
              tab.href === "/account/orders"
                ? pathname.startsWith("/account/orders")
                : pathname.startsWith("/campaigns");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]"
                )}
                title={tab.description}
              >
                {tab.label}
              </Link>
            );
          })}
          <Link
            href="/campaigns/new"
            className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]"
          >
            + New campaign
          </Link>
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
            ← Marketing site
          </Link>
          {hasClerkPublishableKey ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Link href="/sign-in" className="text-sm text-[var(--color-accent)] hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
