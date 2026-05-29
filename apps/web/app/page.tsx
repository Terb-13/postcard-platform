"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { AuthButtons } from "@/components/landing/AuthButtons";
import { LandingTargetingDemo } from "@/components/landing/LandingTargetingDemo";

const VALUE_CARDS = [
  {
    title: "Census-powered targeting",
    description:
      "Reach the right homes using real US Census ACS data — median income, population, and mover rates. No guesswork.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
      </svg>
    ),
  },
  {
    title: "Simple wizard, low cost",
    description:
      "A guided 5-step flow from targeting to checkout. Transparent per-piece pricing with live cost estimates as you build.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Fast fulfillment via Drummond",
    description:
      "Your postcards go straight to a trusted print partner. Professional production, mailing, and delivery — handled for you.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: "Full visibility for Ops & partners",
    description:
      "Track every job from proof to delivery. Give your print partner and team real-time status without email chains.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6.75v6.75" />
      </svg>
    ),
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Target with Census data",
    description: "Select ZIP codes on the map, draw a custom area, or filter by income and movers.",
    image: "/images/target-step.jpg",
  },
  {
    step: "2",
    title: "Upload artwork",
    description: "Drop in your postcard design. We handle sizing, proofing, and print-ready prep.",
    image: "/images/design-step.jpg",
  },
  {
    step: "3",
    title: "Review & pay",
    description: "See your exact reach, cost, and audience breakdown before you commit.",
    image: "/images/results.jpg",
  },
  {
    step: "4",
    title: "Drummond prints & ships",
    description: "Your campaign goes to production. Track status from proof through delivery.",
    image: "/images/track-step.jpg",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">
      {/* Nav */}
      <nav className="nav">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold text-xl tracking-[-0.02em]">
            <div className="h-8 w-8 rounded-2xl bg-[var(--color-bg-dark)]" aria-hidden />
            <span>Postcard</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <AuthButtons variant="nav" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-[var(--color-bg-dark)] text-white pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(10,102,194,0.15),transparent_60%)]" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md mb-6">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              Census-powered direct mail
            </div>

            <h1 className="display-hero mb-6 tracking-[-0.04em]">
              Targeted Postcards Powered by Real Census Data
            </h1>

            <p className="body-lg max-w-2xl mx-auto lg:mx-0 text-white/75 mb-10">
              Reach the right homes by income, population, and recent movers — then send
              professional postcards with simple fulfillment. No spreadsheets. No guessing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <AuthButtons variant="hero" />
              <a
                href="#demo"
                className="btn-secondary border-white/30 text-white hover:bg-white/10 w-full sm:w-auto justify-center text-[15px]"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-white/55">
              <span>No credit card to explore</span>
              <span className="hidden sm:inline">·</span>
              <span>Live Census estimates</span>
              <span className="hidden sm:inline">·</span>
              <span>Pay when you send</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value / Differentiators */}
      <section className="section bg-white border-b border-[var(--color-border)]">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold tracking-[2px] text-[var(--color-accent)] uppercase mb-2">
              Why Postcard
            </p>
            <h2 className="heading-xl tracking-[-0.03em]">
              Precision targeting without the complexity
            </h2>
            <p className="mt-4 body-lg text-[var(--color-text-secondary)]">
              Everything you need to launch a smart postcard campaign — from audience selection
              to print and delivery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUE_CARDS.map((card) => (
              <div key={card.title} className="card p-6 hover:translate-y-0">
                <div className="h-11 w-11 rounded-2xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="font-semibold text-lg tracking-tight mb-2">{card.title}</h3>
                <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="section bg-[var(--color-bg)] scroll-mt-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p className="text-xs font-semibold tracking-[2px] text-[var(--color-accent)] uppercase mb-2">
              Try it now
            </p>
            <h2 className="heading-xl tracking-[-0.03em]">
              See your audience before you send
            </h2>
            <p className="mt-4 body-lg text-[var(--color-text-secondary)]">
              We&apos;ve loaded Beverly Hills area ZIPs (90210 and nearby). Search another ZIP,
              click the map, or draw a custom area — stats update instantly from Census data.
            </p>
          </div>

          <LandingTargetingDemo />
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="section bg-white border-y border-[var(--color-border)] scroll-mt-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-xs font-semibold tracking-[2px] text-[var(--color-accent)] uppercase mb-2">
              How it works
            </p>
            <h2 className="heading-xl tracking-[-0.03em]">
              From targeting to mailbox in four steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={item.step} className="relative text-center lg:text-left">
                {index < HOW_IT_WORKS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-border)]"
                    aria-hidden
                  />
                )}
                <div className="timeline-dot mx-auto lg:mx-0 mb-5">{item.step}</div>
                <div className="rounded-2xl overflow-hidden mb-4 aspect-[4/3] bg-[var(--color-bg-alt)]">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-semibold text-lg tracking-tight mb-2">{item.title}</h3>
                <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section bg-[var(--color-bg)]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[2px] text-[var(--color-accent)] uppercase mb-4">
              Trusted by local businesses
            </p>
            <h2 className="heading-lg tracking-[-0.03em] mb-6">
              Used by local businesses to reach the right homes
            </h2>
            <p className="body-lg text-[var(--color-text-secondary)] mb-10">
              Restaurants, home services, real estate agents, and retailers use Postcard to
              put their message in front of the neighborhoods that matter most.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { quote: "We finally know exactly who we're mailing — and what it costs.", role: "Local restaurant owner" },
                { quote: "The map made it click. I picked three ZIPs and had a quote in minutes.", role: "Home services contractor" },
                { quote: "No more back-and-forth with the printer. I can see where every job stands.", role: "Marketing manager" },
              ].map((item) => (
                <div key={item.role} className="quote-card text-left p-6 sm:p-7">
                  <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed pt-6">
                    {item.quote}
                  </p>
                  <p className="mt-4 text-sm font-medium text-[var(--color-text-muted)]">
                    — {item.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner callout */}
      <section className="py-12 sm:py-16 bg-white border-t border-[var(--color-border)]">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-8 lg:p-10">
            <div className="max-w-xl text-center lg:text-left">
              <p className="text-xs font-semibold tracking-[2px] text-[var(--color-accent)] uppercase mb-2">
                For print partners
              </p>
              <h3 className="heading-md mb-2">Running a print shop?</h3>
              <p className="text-[var(--color-text-secondary)]">
                Get a dedicated partner portal with proofing, job status, and production visibility.
              </p>
            </div>
            <Link href="/partner" className="btn-secondary shrink-0">
              Explore partner platform
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="dark-section section">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[2px] text-white/50 mb-4">
              Ready to reach the right homes?
            </p>
            <h2 className="heading-xl tracking-[-0.03em] mb-4">
              Start your first targeted campaign today
            </h2>
            <p className="body-lg text-white/70 mb-9 max-w-lg mx-auto">
              Sign up free, explore the map, and launch when you&apos;re ready. Pay only for
              the postcards you send.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AuthButtons variant="final" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-6 text-sm">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <div className="h-6 w-6 rounded-xl bg-[var(--color-bg-dark)]" aria-hidden />
              <span className="font-medium text-[var(--color-bg-dark)]">Postcard Platform</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[var(--color-text-secondary)]">
              <a href="#demo" className="hover:text-[var(--color-bg-dark)] transition-colors">
                Live demo
              </a>
              <a href="#how-it-works" className="hover:text-[var(--color-bg-dark)] transition-colors">
                How it works
              </a>
              <Link href="/partner" className="hover:text-[var(--color-bg-dark)] transition-colors">
                For printers
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
