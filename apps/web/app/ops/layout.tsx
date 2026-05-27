import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/ops" className="text-xl font-semibold text-gray-900">
              Operations
            </Link>
            <nav className="flex gap-4 text-sm text-gray-600">
              <Link href="/ops" className="hover:text-gray-900">
                Dashboard
              </Link>
              {/* Add more nav items later */}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
              Internal Only
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
