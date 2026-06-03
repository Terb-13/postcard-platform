import Link from "next/link";

/** Shown on /sign-in and /sign-up when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. */
export function ClerkNotConfigured({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-left text-sm text-amber-950">
      <p className="font-semibold mb-2">Clerk is not configured on this server</p>
      <p className="mb-4 text-amber-900/90">
        {mode === "sign-in" ? "Sign-in" : "Sign-up"} needs{" "}
        <code className="text-xs bg-white/80 px-1 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
        in <code className="text-xs bg-white/80 px-1 rounded">apps/web/.env.local</code>, or use your
        deployed site where Vercel already has Clerk keys.
      </p>
      <ol className="list-decimal list-inside space-y-1 text-amber-900/90 mb-4">
        <li>Copy <code className="text-xs">apps/web/.env.example</code> → <code className="text-xs">.env.local</code></li>
        <li>Paste keys from Clerk Dashboard → API Keys</li>
        <li>Restart <code className="text-xs">npm run dev</code></li>
      </ol>
      <Link href="/" className="text-[#0A66C2] font-medium hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
