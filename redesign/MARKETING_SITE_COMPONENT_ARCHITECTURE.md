# Marketing Site Component Architecture Proposal

**Goal**: Create a clean, maintainable component structure for the public marketing site that delivers the experience from `redesign/index.html` while respecting the existing technical architecture (tRPC, Mapbox components, Clerk, etc.).

## Core Principles

1. **The prototype in `redesign/` is the source of truth** for visual language, section order, image usage, and user experience on the marketing site.
2. **Technical backend is strong** — We should wrap and enhance existing components (`components/targeting/*`, campaign wizard, etc.) rather than rewrite them.
3. **Marketing site vs App** — We can have different component hierarchies for the public marketing experience vs the logged-in app.
4. **Buyer as Hero** — Every major visual should make the local business owner feel like the central empowered figure.

---

## Proposed Component Structure

### 1. Top-Level Composition (Marketing Site)

**File**: `apps/web/app/(marketing)/page.tsx` (or keep current `app/page.tsx` for now)

```tsx
<LandingNav />
<main>
  <LandingHero />                    // Big visual hero with buyer + map teaser
  <LandingProductsGrid />            // NEW - The "Explore Popular Products" section (missing today)
  <LandingValueProps />              // Benefits (can evolve from current Solution)
  <LandingHowItWorks />              // 4-step visual flow
  <LandingSocialProof />
  <LandingFinalCta />
  <LandingTargetingTeaser />         // Prominent link or embedded preview of the map tool
</main>
<LandingFooter />
```

### 2. New / Refactored Marketing Components

| Component                    | Purpose                                      | Status | Notes |
|-----------------------------|----------------------------------------------|--------|-------|
| `LandingNav.tsx`            | Top navigation                               | Keep   | May need marketing vs app variant |
| `LandingHero.tsx`           | High-impact opening with buyer as hero       | In progress | Already updated with big image |
| `LandingProductsGrid.tsx`   | **NEW** - Grid of product cards (EDDM, Targeted, etc.) | **Missing** | Highest priority addition |
| `ProductCard.tsx`           | Reusable card for products                   | **NEW** | Used in grid + other marketing pages |
| `LandingValueProps.tsx`     | 3-4 benefit columns                          | Refactor | Currently spread across Solution |
| `LandingHowItWorks.tsx`     | 4-step visual process                        | Update | Make it more visual like prototype |
| `LandingSocialProof.tsx`    | Testimonials + logos                         | Update | Use results.jpg |
| `LandingFinalCta.tsx`       | Strong closing CTA                           | Update | Match prototype energy |
| `LandingFooter.tsx`         | Footer                                       | Keep   | Minor updates |
| `LandingTargetingTeaser.tsx`| **NEW** - Teaser for the map tool on homepage | **Missing** | Links to full map tool experience |

### 3. Interactive Targeting Components (Reuse + Enhance)

Keep and enhance the existing powerful components:

- `components/targeting/TargetingMap.tsx`
- `components/targeting/StatsSidebar.tsx`
- `components/targeting/TargetingFilters.tsx`
- `components/targeting/MapDrawControl.tsx`
- `components/landing/LandingTargetingDemo.tsx` (marketing-facing wrapper)

**Recommendation**: Create a marketing-specific wrapper:
- `components/marketing/MarketingTargetingDemo.tsx` — Styled version of the map tool that matches the prototype's beautiful map tool (`redesign/map-tool.html`).

This keeps the real targeting logic in one place while allowing different visual treatments for marketing vs in-app.

### 4. Shared / Utility Components

- Keep `components/ui/*` (shadcn)
- Keep or create marketing-specific atoms: `MarketingButton`, `ProductCard`, etc.
- `components/shared/Visual.tsx` (if useful)

---

## Mapping: Prototype → Real Components

| Prototype Section (`redesign/index.html`) | Proposed Real Component(s)              | Current Equivalent |
|-------------------------------------------|-----------------------------------------|--------------------|
| Hero                                      | `LandingHero`                           | `LandingHero` (partially updated) |
| Explore Popular Products                  | `LandingProductsGrid` + `ProductCard`   | **Missing** |
| Value Proposition                         | `LandingValueProps`                     | `LandingSolution` |
| How It Works                              | `LandingHowItWorks`                     | `LandingHowItWorks` |
| Social Proof                              | `LandingSocialProof`                    | `LandingSocialProof` |
| Final CTA                                 | `LandingFinalCta`                       | `LandingFinalCta` |
| Map Tool (as hero experience)             | `MarketingTargetingDemo` + full page    | `LandingDemoSection` + `LandingTargetingDemo` |

---

## Recommended Implementation Order

1. **Add `LandingProductsGrid` + `ProductCard`** (biggest gap right now)
2. Finish visual upgrades to:
   - `LandingHero` (already started)
   - `LandingProblem`
   - `LandingSolution` → evolve into `LandingValueProps`
   - `LandingHowItWorks`
3. Create `MarketingTargetingDemo` (marketing version of the map tool)
4. Align `LandingSocialProof` + `LandingFinalCta` with prototype visuals
5. Update `app/page.tsx` composition to match prototype flow

---

## Principles for This Work

- The marketing site does **not** have to use exactly the same components or section order as the current app.
- We are allowed to create new components when they better serve the desired experience.
- The powerful targeting logic in `components/targeting/` should be reused, not duplicated.
- Visual design and user flow come from the prototype. Technical implementation adapts to it.

---

**Next Action**: Once you confirm this direction, I can start implementing the highest priority missing piece (`LandingProductsGrid`) or continue refining the components you've already started with Cursor.