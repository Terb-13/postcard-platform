# Proposed Landing Page Architecture (Based on Prototype)

This document defines the target UI/UX structure for the marketing site, driven by the successful prototype in `redesign/index.html`.

## Core Principle
The **UI/UX architecture** (how sections are organized, their visual priority, and information flow) should be dictated by the new design direction, not preserved from the old structure.

The **technical React component architecture** can (and should) be adapted or refactored to support the new UI vision cleanly.

---

## Target Section Order & Purpose (Homepage)

This order comes directly from `redesign/index.html` and the feedback you've given:

1. **Navbar** (consistent, minimal)
2. **Hero** (high-impact, buyer-as-hero, strong visual + CTAs)
3. **Explore Popular Products** (grid of 4 product cards – this was missing or buried before)
4. **Value Proposition** (short, benefit-focused)
5. **How It Works** (clear 4-step flow, heavy use of workflow image)
6. **Social Proof** (light, not overdone)
7. **Final CTA** (dark, strong close)
8. **Footer**

**Important Note**: The interactive Map Tool is treated as a **major destination**, not just one section among many. On the homepage it can be teased or linked prominently.

---

## Recommended Component Structure

Instead of forcing new visuals into the old component names, we propose this cleaner mapping:

### Marketing Site Components (new or refactored)
- `LandingNav.tsx`
- `LandingHero.tsx` (big visual + buyer as hero)
- `LandingProductsGrid.tsx` (new – the "Explore Popular Products" section)
- `LandingValueProps.tsx` (replaces or evolves current Solution/Pillars)
- `LandingHowItWorks.tsx` (strong visual flow)
- `LandingSocialProof.tsx`
- `LandingFinalCta.tsx`
- `LandingFooter.tsx`

### Interactive / Tool Components
- `TargetingMap.tsx` (or keep/enhance `LandingTargetingDemo.tsx`)
- `MapToolPage.tsx` (dedicated page, modeled after `redesign/map-tool.html`)

### Supporting
- `ProductCard.tsx` (reusable for the grid and other product pages)
- `LandingSectionHeader.tsx` (can keep/adapt)

---

## Key Differences from Current Structure

| Current App                  | Prototype Direction                     | Recommendation |
|-----------------------------|-----------------------------------------|--------------|
| Hero → DemoSection early    | Hero → Popular Products grid            | Add prominent Products grid after Hero |
| Problem / Solution as text-heavy | Strong visual + buyer imagery         | Increase visual weight significantly |
| How It Works as secondary   | Clear, visual 4-step process            | Make it more prominent with big image |
| Map Demo as one section     | Map Tool as core experience / destination | Treat as first-class (own page + strong homepage presence) |
| Component names tied to old order | Structure follows user journey          | Reorganize components around new journey |

---

## How to Work With This

When Cursor (or you) is implementing:
- Use `redesign/index.html` as the primary visual and structural reference for the homepage.
- Use `redesign/map-tool.html` as the reference for the interactive targeting experience.
- Feel free to create new components or rename/restructure existing ones if it results in cleaner code that better matches the desired experience.
- The goal is not to preserve the old component names — it's to deliver the experience the prototype demonstrates.

---

## Next Suggested Work (in priority)

1. Add / build the **Popular Products** grid (this is a big missing piece from the current site).
2. Continue visual upgrades to Hero, Problem, Solution, How It Works (already in progress).
3. Revisit the Map Demo section to feel more like the prototype's map tool.
4. Align Social Proof + Final CTA.
5. Consider dedicated pages for key products (EDDM, Targeted, etc.) modeled after the prototype pages.

This structure gives us freedom to make the marketing site feel like the prototype while still allowing the technical backend (tRPC, auth, etc.) to remain unchanged.