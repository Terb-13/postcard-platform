/**
 * Marketing Site Design System
 * 
 * This is modeled directly after the visual language and quality in
 * redesign/index.html and redesign/map-tool.html.
 * 
 * Use these for all marketing pages and components.
 */

export const colors = {
  navy: '#0A2540',
  cream: '#fafaf9',
  teal: '#0EA5E9',
  white: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  border: '#e7e5e4',
};

/** Generous, premium section padding (prototype uses py-20) */
export const section = 'py-20';

/** Map tool section (prototype uses slightly different rhythm) */
export const mapSection = 'pt-16 pb-20';

/** Standard wide container */
export const container = 'max-w-7xl mx-auto px-8';

/** Narrow centered container (Final CTA style) */
export const containerNarrow = 'max-w-4xl mx-auto px-8';

/** Eyebrow label — clean and confident */
export const eyebrow =
  'text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]';

/** Large section titles — matching prototype's confident scale */
export const titleLg = 'text-5xl font-semibold tracking-tighter text-[#0A2540]';

/** Value props style headline */
export const titleMd = 'text-4xl font-semibold tracking-tight text-[#0A2540]';

/** Final CTA headline — very strong */
export const titleCta = 'text-6xl font-semibold tracking-tighter text-[#0A2540]';

/** Hero headline — large and impactful */
export const heroTitle =
  'text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.05] text-white';

/** Product card — clean, minimal hover, premium */
export const productCard =
  'group bg-white border border-gray-200 rounded-3xl p-6 transition-colors hover:border-[#0EA5E9]/40';

/** Navy band (Social Proof style) */
export const navyBand = 'bg-[#0A2540] text-white/90';

/** Teal accent for interactive elements */
export const teal = 'text-[#0EA5E9]';
export const tealHover = 'hover:text-[#0284C8]';

/** Light, premium card shadow (prototype is relatively flat) */
export const cardShadow = 'shadow-sm';

/** Consistent generous body text treatment (premium, readable, less text-heavy) */
export const bodyText = 'text-base leading-[1.7] text-gray-600';

/* =========================================================
   MARKETING ALIASES (expected by components + barrel)
   These are the authoritative tokens modeled on redesign/index.html
   ========================================================= */

export const marketingContainer = 'max-w-7xl mx-auto px-8';
export const marketingContainerNarrow = 'max-w-4xl mx-auto px-8';
export const marketingSectionPy = 'py-20';
export const marketingMapSectionPy = 'pt-16 pb-20';

/** Eyebrow — prototype exact: text-[#0EA5E9] uppercase tracking-[1.5px] xs semibold */
export const marketingEyebrow =
  'text-xs font-semibold uppercase tracking-[1.5px] text-[#0EA5E9]';

/** Products / How / Map title — text-5xl semibold tracking-tighter (prototype) */
export const marketingTitleLg = 'text-5xl font-semibold tracking-tighter text-[#0A2540]';
export const marketingTitleProducts = 'text-5xl font-semibold tracking-tighter text-[#0A2540]';

/** Value props headline */
export const marketingTitleMd = 'text-4xl font-semibold tracking-tight text-[#0A2540]';

/** Final CTA super headline */
export const marketingTitleCta = 'text-6xl font-semibold tracking-tighter text-[#0A2540]';

/** Hero h1 — matches prototype text-7xl leading tight */
export const marketingHeroTitle =
  'text-6xl lg:text-7xl font-semibold tracking-[-0.025em] leading-[1.05] text-white';

/** Product card — white, rounded-3xl, border, hover teal tint, prototype hover */
export const marketingProductCard =
  'card bg-white border border-gray-200 rounded-3xl p-6 hover:border-[#0EA5E9]/30 transition-all';

/** Navy social proof band */
export const marketingNavyBand = 'bg-[#0A2540] text-white/90';

/** Eyebrow — WHY POSTCARD / 4 SIMPLE STEPS (tracking-widest) */
export const marketingEyebrowWide =
  'text-xs font-semibold uppercase tracking-widest text-[#0EA5E9]';

/** Social proof band label */
export const marketingSocialEyebrow =
  'mb-6 text-sm tracking-widest text-white/70';

/** Value props — numbered column */
export const marketingValueIndex = 'mb-3 text-3xl text-[#0EA5E9]';
export const marketingValueTitle = 'mb-2 text-xl font-semibold text-[#0A2540]';
export const marketingValueBody = 'text-gray-600';

/** How it works — step */
export const marketingStepBadge =
  'mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0A2540] text-2xl font-semibold text-white';
export const marketingStepTitle = 'mb-2 font-semibold text-[#0A2540]';
export const marketingStepBody = 'text-sm text-gray-600';

/** Final CTA primary button (prototype) */
export const marketingCtaPrimary =
  'inline-flex items-center justify-center rounded-3xl bg-[#0A2540] px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-black';

/** Final CTA outline button */
export const marketingCtaOutline =
  'inline-flex items-center justify-center rounded-3xl border-2 border-[#0A2540] bg-transparent px-10 py-4 text-lg font-semibold text-[#0A2540] transition-colors hover:bg-gray-50';
