"use client";

import React, { useState } from "react";

// Force dynamic to avoid requiring Clerk keys (and other envs) during `next build` prerender in CI/local without .env
export const dynamic = "force-dynamic";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

// Safe auth actions for the story-driven landing.
// When Clerk keys are not present in the build (common on early previews),
// we render attractive fallbacks instead of letting the buttons throw.
const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function AuthButtons({ variant = "nav" }: { variant?: "nav" | "hero" | "final" }) {
  if (!hasClerk) {
    // Graceful, premium-looking fallback that keeps the entire buyer-as-hero narrative intact
    const label = variant === "nav" ? "Start free" : "Start my first campaign free";
    return (
      <button
        disabled
        className={variant === "nav" 
          ? "btn-primary auth-button text-sm px-6 py-2.5 sm:px-7 opacity-70 cursor-not-allowed" 
          : "btn-primary btn-cta auth-button w-full sm:w-auto justify-center text-[15px] opacity-80 cursor-not-allowed"}
        title="Sign up opens as soon as authentication is connected"
      >
        {label}
      </button>
    );
  }

  // Real Clerk-powered CTAs (modals) when keys are present
  if (variant === "nav") {
    return (
      <>
        <SignedOut>
          <SignInButton mode="modal" fallbackRedirectUrl="/campaigns">
            <button className="nav-link hidden sm:block">Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns">
            <button className="btn-primary auth-button text-sm px-6 py-2.5 sm:px-7">
              Start free
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/campaigns" className="nav-link hidden md:block">
            My Campaigns
          </Link>
          <div className="ml-1">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </>
    );
  }

  if (variant === "final") {
    return (
      <>
        <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns">
          <button className="btn-primary btn-cta auth-button px-12 text-[15px]">
            Start my first campaign free
          </button>
        </SignUpButton>
        <SignInButton mode="modal" fallbackRedirectUrl="/campaigns">
          <button className="btn-secondary border-white/30 text-white hover:bg-white/10 px-9 text-[15px]">
            I already have an account
          </button>
        </SignInButton>
      </>
    );
  }

  // Hero variant
  return (
    <SignUpButton mode="modal" fallbackRedirectUrl="/campaigns">
      <button className="btn-primary btn-cta auth-button w-full sm:w-auto justify-center text-[15px]">
        Design my first campaign — free
      </button>
    </SignUpButton>
  );
}

/**
 * Postcard Platform — Technology-first landing
 * Precision targeting software for local businesses.
 * Interactive maps. Exact audience selection. Scheduled mailings. Real-time tracking.
 */

// Lightweight delightful interactive widget — puts the buyer in control
function AudienceEstimator() {
  const [quantity, setQuantity] = useState(2500);

  // Simple transparent pricing model (demo only — real calc happens in app)
  const pricePerCard = 0.28;
  const estimatedCost = Math.round(quantity * pricePerCard);
  const estimatedReach = Math.round(quantity * 0.96); // realistic delivery

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  return (
    <div className="estimator mt-8">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-xs font-semibold tracking-[1.5px] text-[#0A66C2] mb-1">LIVE ESTIMATOR</div>
          <div className="font-semibold text-xl tracking-tight">See your reach &amp; cost instantly</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-semibold tabular-nums tracking-tighter text-[#0A2540]">{quantity.toLocaleString()}</div>
          <div className="text-xs text-[#64748B] -mt-1">postcards</div>
        </div>
      </div>

      <input
        type="range"
        min="500"
        max="25000"
        step="100"
        value={quantity}
        onChange={handleSliderChange}
        className="estimator-slider mb-6"
        aria-label="Choose how many postcards to send"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="metric">
          <div className="text-xs text-[#64748B] mb-1">Estimated total</div>
          <div className="text-3xl font-semibold tabular-nums tracking-tighter text-[#0A2540]">
            ${estimatedCost.toLocaleString()}
          </div>
          <div className="text-xs text-[#64748B]">Pay only when you send</div>
        </div>
        <div className="metric">
          <div className="text-xs text-[#64748B] mb-1">Expected delivered</div>
          <div className="text-3xl font-semibold tabular-nums tracking-tighter text-[#0A2540]">
            {estimatedReach.toLocaleString()}
          </div>
          <div className="text-xs text-[#64748B]">~96% delivery rate</div>
        </div>
        <div className="metric flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#64748B] mb-1">Typical response</div>
            <div className="font-semibold text-[#15803D]">3–8% new customers</div>
          </div>
          <div className="text-xs text-[#64748B]">Real businesses. Real results.</div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#64748B]">
        Adjust the slider — this is exactly how targeting feels inside your first campaign.
      </p>
    </div>
  );
}

// =============================================
// INTERACTIVE TARGETING DEMO - Technology showcase
// This is the centerpiece that demonstrates real software power
// =============================================
function InteractiveTargetingDemo() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Downtown', 'Riverside']);
  const [radius, setRadius] = useState(1.5);
  const [targetType, setTargetType] = useState<'all' | 'residential' | 'business'>('all');
  const [scheduledDate, setScheduledDate] = useState('2025-06-12');

  const neighborhoods = [
    { id: 'Downtown', reach: 12400, type: 'mixed' },
    { id: 'Riverside', reach: 8700, type: 'residential' },
    { id: 'West End', reach: 15300, type: 'business' },
    { id: 'Northgate', reach: 6200, type: 'residential' },
    { id: 'Harbor District', reach: 9800, type: 'mixed' },
    { id: 'Tech Corridor', reach: 7400, type: 'business' },
  ];

  const toggleArea = (name: string) => {
    setSelectedAreas(prev =>
      prev.includes(name)
        ? prev.filter(a => a !== name)
        : [...prev, name]
    );
  };

  const filteredNeighborhoods = neighborhoods.filter(n =>
    targetType === 'all' || n.type === targetType || n.type === 'mixed'
  );

  const totalReach = selectedAreas.reduce((sum, name) => {
    const n = neighborhoods.find(x => x.id === name);
    return sum + (n?.reach || 0);
  }, 0);

  const estimatedCost = Math.round(totalReach * 0.28);
  const deliveryRate = 0.96;

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white shadow-xl overflow-hidden">
      <div className="grid lg:grid-cols-5">
        {/* Map / Selection Area */}
        <div className="lg:col-span-3 p-8 bg-[#f8fafc] relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[2px] text-[#0A66C2] font-semibold">LIVE TARGETING MAP</div>
              <div className="text-xl font-semibold tracking-tight mt-1">Select neighborhoods or draw a radius</div>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] hidden sm:block">Click to toggle</div>
          </div>

          {/* Visual Map Area - High-fidelity demo */}
          <div className="relative bg-white rounded-2xl border border-[var(--color-border)] h-[420px] flex items-center justify-center overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[length:4px_4px]" />
            
            {/* Stylized Map Representation */}
            <div className="relative w-full max-w-[520px] h-[340px]">
              {/* Base map shape */}
              <div className="absolute inset-0 bg-[#e0f0fe] rounded-2xl" />
              
              {/* Neighborhood zones - clickable */}
              {neighborhoods.map((n, index) => {
                const isSelected = selectedAreas.includes(n.id);
                const positions = [
                  { top: '18%', left: '22%' },   // Downtown
                  { top: '52%', left: '68%' },   // Riverside
                  { top: '28%', left: '72%' },   // West End
                  { top: '62%', left: '18%' },   // Northgate
                  { top: '74%', left: '55%' },   // Harbor
                  { top: '35%', left: '42%' },   // Tech Corridor
                ];
                const pos = positions[index] || { top: '40%', left: '40%' };

                return (
                  <button
                    key={n.id}
                    onClick={() => toggleArea(n.id)}
                    className={`absolute px-4 py-2 text-sm font-medium rounded-2xl border-2 transition-all active:scale-[0.985] ${
                      isSelected 
                        ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-lg z-10' 
                        : 'bg-white/90 text-[#0f172a] border-[#64748b40] hover:border-[#0A66C2] hover:bg-white'
                    }`}
                    style={{ top: pos.top, left: pos.left }}
                  >
                    {n.id}
                    {isSelected && <span className="ml-1.5 text-[10px] opacity-70">✓</span>}
                  </button>
                );
              })}

              {/* Radius overlay indicator */}
              <div className="absolute top-[35%] left-[42%] w-32 h-32 rounded-full border-2 border-[#0A66C2] border-dashed opacity-40" 
                   style={{ transform: `scale(${radius / 1.5})` }} />
            </div>

            <div className="absolute bottom-4 right-4 bg-white/95 px-3 py-1.5 rounded-xl text-xs font-medium border border-[var(--color-border)]">
              Drag or click zones • Live updates
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(['all', 'residential', 'business'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTargetType(type)}
                className={`px-4 py-1.5 text-sm rounded-2xl border transition-colors ${
                  targetType === type 
                    ? 'bg-[#0A2540] text-white border-[#0A2540]' 
                    : 'bg-white border-[var(--color-border)] hover:bg-[#f8fafc]'
                }`}
              >
                {type === 'all' ? 'All properties' : type === 'residential' ? 'Residential only' : 'Businesses only'}
              </button>
            ))}
          </div>
        </div>

        {/* Live Control Panel */}
        <div className="lg:col-span-2 p-8 flex flex-col bg-white">
          <div>
            <div className="uppercase tracking-[1.5px] text-xs font-semibold text-[#0A66C2] mb-1">LIVE CAMPAIGN BUILDER</div>
            <div className="text-2xl font-semibold tracking-tight mb-6">Your targeting in real time</div>
          </div>

          {/* Selected Areas */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">SELECTED AREAS</div>
            <div className="flex flex-wrap gap-2 min-h-[42px]">
              {selectedAreas.length > 0 ? (
                selectedAreas.map(area => (
                  <div key={area} className="inline-flex items-center gap-2 bg-[#f1f5f9] text-sm px-3 py-1 rounded-2xl">
                    {area}
                    <button onClick={() => toggleArea(area)} className="text-[var(--color-text-muted)] hover:text-red-500">×</button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[var(--color-text-muted)]">Select areas on the map →</div>
              )}
            </div>
          </div>

          {/* Radius Control */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <div className="font-medium">Search radius</div>
              <div className="tabular-nums font-semibold text-[#0A2540]">{radius} miles</div>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="w-full accent-[#0A2540]"
            />
          </div>

          {/* Results */}
          <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">Estimated reach</div>
                <div className="text-4xl font-semibold tabular-nums tracking-tighter text-[#0A2540] mt-1">
                  {totalReach.toLocaleString()}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">addresses</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">Estimated cost</div>
                <div className="text-4xl font-semibold tabular-nums tracking-tighter text-[#0A2540] mt-1">
                  ${estimatedCost}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">at $0.28 per card</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-[var(--color-text-muted)] mb-1">Schedule your mailing</div>
              <input 
                type="date" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border border-[var(--color-border)] rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-[#0A66C2]"
              />
            </div>

            <button 
              onClick={() => alert('This would open the full campaign builder with these exact targeting parameters.')}
              disabled={selectedAreas.length === 0}
              className="w-full btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedAreas.length > 0 
                ? `Schedule ${totalReach.toLocaleString()} postcards for ${new Date(scheduledDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}` 
                : 'Select areas to continue'}
            </button>

            <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-3">
              ~{Math.round(totalReach * deliveryRate).toLocaleString()} expected delivered • Full tracking included
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">
      {/* ==================== PREMIUM STICKY NAV ==================== */}
      <nav className="nav">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold text-xl tracking-[-0.02em]">
            <div className="h-8 w-8 rounded-2xl bg-[#0A2540]" aria-hidden />
            <span>Postcard</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <AuthButtons variant="nav" />
          </div>
        </div>
      </nav>

      {/* ==================== HERO — TECHNOLOGY FIRST ==================== */}
      <section className="relative bg-[var(--color-bg-dark)] text-white pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24 overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md mb-6">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              Professional-grade targeting software
            </div>

            <h1 className="display-hero mb-6 tracking-[-0.04em]">
              The most precise<br />postcard marketing platform.
            </h1>

            <p className="body-lg max-w-2xl text-white/75 mb-10">
              Interactive maps. Surgical audience targeting. Automated scheduling. 
              Full production visibility. Built for local businesses that want real control.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <AuthButtons variant="hero" />

              <a 
                href="#targeting" 
                className="btn-secondary border-white/30 text-white hover:bg-white/10 w-full sm:w-auto justify-center text-[15px]"
              >
                See the targeting engine
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
              <div>No credit card required</div>
              <div className="hidden sm:block">•</div>
              <div>Pay only when you send</div>
              <div className="hidden sm:block">•</div>
              <div>Cancel anytime</div>
            </div>
          </div>
        </div>

        {/* Hero visual — map-focused */}
        <div className="relative mt-12 lg:absolute lg:inset-y-0 lg:right-0 lg:w-5/12 xl:w-1/2 lg:mt-0">
          <div className="relative h-[420px] sm:h-[520px] lg:h-full">
            <img
              src="/images/hero.jpg"
              alt="Postcard Platform targeting interface showing interactive neighborhood map with precise geo-targeting controls"
              className="absolute inset-0 h-full w-full object-cover lg:object-[65%_center] hero-image"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/70 via-[#0A2540]/85 to-[#0A2540] lg:bg-gradient-to-r lg:from-[#0A2540] lg:via-[#0A2540]/95 lg:to-transparent" />
          </div>
        </div>
      </section>

      {/* ==================== THE TARGETING ENGINE (Core Technology) ==================== */}
      <section id="targeting" className="section bg-white border-b border-[var(--color-border)]">
        <div className="container">
          <div className="max-w-2xl mb-10">
            <div className="text-xs font-semibold tracking-[2px] text-[#0A66C2] mb-2">CORE TECHNOLOGY</div>
            <h2 className="heading-xl tracking-[-0.03em]">
              Interactive maps.<br />Surgical precision targeting.
            </h2>
            <p className="mt-4 body-lg text-[var(--color-text-secondary)]">
              This is what made Growmail different — and we built it even better. 
              Select exact neighborhoods, draw radii, filter by business type or demographics. 
              See live reach and cost before you send a single card.
            </p>
          </div>

          {/* Interactive Targeting Demo - The star of the show */}
          <InteractiveTargetingDemo />
        </div>
      </section>

      {/* ==================== MORE POWERFUL SOFTWARE CAPABILITIES ==================== */}
      <section className="section bg-[var(--color-bg)]">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-[2px] text-[#0A66C2] mb-2">THE FULL PLATFORM</div>
            <h2 className="heading-xl tracking-[-0.03em]">Everything you need.<br />Nothing you don’t.</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI Design & Copy Studio",
                desc: "Generate on-brand postcard designs and copy tailored to specific neighborhoods in seconds. Upload your logo and brand guidelines once.",
              },
              {
                title: "Intelligent Scheduling",
                desc: "Schedule single campaigns or set up recurring mailings. Choose optimal send dates based on seasonality, local events, or your sales cycles.",
              },
              {
                title: "Real-time Production Tracking",
                desc: "Watch your jobs move through our 4-stage production pipeline with photos of your actual printed pieces and live status updates.",
              },
              {
                title: "Proofing & Approval Workflow",
                desc: "Review digital proofs before anything goes to press. Request changes with comments that go straight to the production team.",
              },
              {
                title: "Delivery & Attribution Analytics",
                desc: "See exactly which neighborhoods responded. Tie postcard sends to website traffic, phone calls, and in-store visits.",
              },
              {
                title: "Partner & Team Access",
                desc: "Give your print partner secure access or invite your team with role-based permissions. Full API available for advanced workflows.",
              },
            ].map((feature, i) => (
              <div key={i} className="card p-7">
                <h3 className="font-semibold text-xl tracking-tight mb-3">{feature.title}</h3>
                <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BUILT FOR PRINTERS & TEAMS ==================== */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="uppercase tracking-[2px] text-xs font-semibold text-[#0A66C2] mb-3">FOR PRODUCTION PARTNERS</div>
              <h2 className="heading-xl tracking-[-0.03em] mb-5">A real software platform<br />for high-volume printers.</h2>
              
              <div className="space-y-3 text-[15px] text-[var(--color-text-secondary)] mb-8 max-w-md">
                <div>• Secure partner portal with proofing, notes, and status updates</div>
                <div>• Production API for direct job ingestion from your systems</div>
                <div>• Real-time visibility that reduces support tickets</div>
              </div>

              <Link href="/partner" className="btn-primary">
                Explore the Partner Platform
              </Link>
            </div>

            <div className="partner-surface rounded-3xl p-8 lg:p-12 border border-[var(--color-border)]">
              <div className="text-sm font-medium mb-3">Trusted by growing print businesses</div>
              <p className="text-[var(--color-text-secondary)]">
                We built this with real production teams who were tired of email chains, lost proofs, and angry customers asking where their jobs are. 
                Clean software that actually improves your margins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="dark-section section">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs font-semibold tracking-[2px] text-white/50 mb-4">READY TO TARGET WITH PRECISION?</div>
            
            <h2 className="heading-xl tracking-[-0.03em] mb-4">
              Stop spraying and praying.<br />Start targeting.
            </h2>
            
            <p className="body-lg text-white/70 mb-9 max-w-lg mx-auto">
              The same interactive mapping and scheduling tools that power serious local marketing teams — now available for your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AuthButtons variant="final" />
            </div>

            <p className="mt-6 text-sm text-white/50">
              Full software platform. Pay only for the postcards you send.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-[var(--color-border)] bg-white py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-6 text-sm">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <div className="h-6 w-6 rounded-xl bg-[#0A2540]" aria-hidden />
              <span className="font-medium text-[#0A2540]">Postcard Platform</span>
              <span>© {new Date().getFullYear()}</span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[var(--color-text-secondary)]">
              <a href="#targeting" className="hover:text-[#0A2540] transition-colors">Targeting Engine</a>
              <Link href="/partner" className="hover:text-[#0A2540] transition-colors">For Printers</Link>
              <span className="text-[var(--color-border-strong)]">•</span>
              <span className="text-[var(--color-text-muted)]">Modern software for local marketing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
