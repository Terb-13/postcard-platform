import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";

// Gate the entire Clerk tree on the publishable key so the public marketing site
// never throws a client-side exception on Preview deploys before the keys are added.
const hasClerkKeys = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Make the entire app dynamic so `next build` does not attempt static prerender of pages that use Clerk (and other env-dependent clients like Resend/Stripe at import time). This allows clean `turbo run build --filter=web` without a .env.local file.
export const dynamic = "force-dynamic";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Postcard | Target the right homes with real Census data",
  description:
    "Precision direct mail powered by Census data — simple, modern, and effective. See who you can reach before you send.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {hasClerkKeys ? (
          <ClerkProvider
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/campaigns"
            afterSignUpUrl="/campaigns"
            appearance={{
              elements: {
                // Premium, on-brand modal styling — feels native to Postcard
                rootBox: "font-sans",
                card: "bg-white border border-[#e7e5e4] shadow-2xl rounded-3xl overflow-hidden",
                headerTitle: "text-[#0A2540] text-[22px] font-semibold tracking-[-0.02em]",
                headerSubtitle: "text-[#475569] text-[15px]",
                formButtonPrimary: 
                  "bg-[#0A2540] hover:bg-black active:bg-[#0A2540] text-white rounded-2xl font-semibold normal-case py-3.5 text-[15px] transition-all active:scale-[0.985] shadow-sm",
                formButtonReset: "text-[#0A66C2] hover:text-[#084d96] font-medium",
                socialButtonsBlockButton: 
                  "border-[#e7e5e4] hover:bg-[#fafaf9] hover:border-[#d1d0cf] rounded-2xl normal-case py-3 text-[#0f172a]",
                socialButtonsProviderIcon: "w-5 h-5",
                formFieldInput: "rounded-xl border-[#e7e5e4] focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]/20 text-[15px] py-3 transition-all",
                formFieldLabel: "text-[#475569] text-sm font-medium mb-1.5",
                footerActionLink: "text-[#0A66C2] hover:text-[#084d96] font-medium",
                identityPreview: "bg-[#fafaf9] border border-[#e7e5e4] rounded-xl",
                dividerLine: "bg-[#e7e5e4]",
                dividerText: "text-[#64748b] text-xs",
              },
              variables: {
                colorPrimary: "#0A2540",
                colorText: "#0f172a",
                colorTextSecondary: "#475569",
                borderRadius: "1rem",
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
              },
            }}
          >
            {/* No intrusive global header — landing owns its premium nav, auth pages are full immersive experiences, and protected app routes manage their own chrome. */}
            <TRPCProvider>{children}</TRPCProvider>
          </ClerkProvider>
        ) : (
          // Graceful public-only mode (no Clerk keys yet) — beautiful marketing only
          <TRPCProvider>{children}</TRPCProvider>
        )}
      </body>
    </html>
  );
}
