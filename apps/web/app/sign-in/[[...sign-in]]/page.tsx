import Link from 'next/link'
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Brand + story header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 font-semibold text-2xl tracking-[-0.02em] text-[#0A2540]">
            <div className="h-8 w-8 rounded-2xl bg-[#0A2540]" aria-hidden />
            Postcard
          </Link>
          <p className="mt-3 text-[var(--color-text-secondary)] text-[15px]">
            Welcome back. Your next campaign is waiting.
          </p>
        </div>

        <div className="card p-8">
          <SignIn
            fallbackRedirectUrl="/campaigns"
            forceRedirectUrl="/campaigns"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-[#0A2540] hover:bg-black text-white rounded-2xl font-semibold py-3 text-[15px]",
                formFieldInput: "rounded-xl border-[#e7e5e4] focus:border-[#0A66C2]",
              },
            }}
          />
        </div>

        <p className="text-center mt-8 text-sm text-[var(--color-text-muted)]">
          New here? <Link href="/sign-up" className="text-[#0A66C2] font-medium hover:underline">Create your free account</Link>
        </p>
      </div>
    </div>
  )
}
