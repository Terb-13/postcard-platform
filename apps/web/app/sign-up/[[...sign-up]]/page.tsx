import Link from 'next/link'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Brand + story header — low-friction continuation of the journey */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 font-semibold text-2xl tracking-[-0.02em] text-[#0A2540]">
            <div className="h-8 w-8 rounded-2xl bg-[#0A2540]" aria-hidden />
            Postcard
          </Link>
          <p className="mt-3 text-[var(--color-text-secondary)] text-[15px]">
            Start your first campaign in minutes.<br />No credit card required.
          </p>
        </div>

        <div className="card p-8">
          <SignUp
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
                footerActionLink: "text-[#0A66C2]",
              },
            }}
          />
        </div>

        <p className="text-center mt-8 text-sm text-[var(--color-text-muted)]">
          Already have an account? <Link href="/sign-in" className="text-[#0A66C2] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
