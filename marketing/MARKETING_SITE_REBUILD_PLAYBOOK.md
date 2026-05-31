# Postcard Platform – Marketing Site Rebuild Playbook

**Goal**: Rebuild the public marketing site (homepage + marketing pages) so it matches the design and experience defined in the `redesign/` folder, while using the existing technical stack.

This document is the operational guide for the rebuild.

---

## Core Principles

1. **The design in `redesign/` is the source of truth.**
   - `redesign/index.html` = Homepage spec
   - `redesign/map-tool.html` = Interactive map tool spec
   - Other files in `redesign/` define the design language for secondary pages.

2. **Design leads. Tech adapts.**
   - We are allowed (and expected) to create new components and new structure for the marketing site.
   - Do **not** let the old `LandingHero`, `LandingProblem`, `LandingSolution`, etc. components dictate the new design.
   - The powerful existing technical pieces (`components/targeting/`, campaign wizard, tRPC, etc.) should be **wrapped**, not rewritten.

3. **Do not delete old files yet.**
   - Especially anything in `components/targeting/` and the campaign wizard.
   - We will deprecate old marketing components over time, not delete them during the rebuild.

4. **Work in `components/marketing/` for the new design.**
   - This is now the home for all new marketing-facing components.
   - Keep it separate from the old `components/landing/` folder during the transition.

---

## Recommended Component Strategy

### New Marketing Layer (Design-Led)
Create and evolve components under `components/marketing/` that directly implement the visual language and structure from the prototype:

- `MarketingNav`
- `MarketingHero`
- `MarketingProductsGrid` + `ProductCard`
- `MarketingValueProps`
- `MarketingHowItWorks`
- `MarketingSocialProof`
- `MarketingFinalCta`
- `MarketingTargetingDemo` (marketing presentation layer)
- `MarketingFooter`

### Technical Components (Keep & Wrap)
Continue using and wrapping these existing pieces:
- `components/targeting/` (TargetingMap, StatsSidebar, TargetingFilters, etc.)
- `components/campaign-wizard/`
- Auth logic, tRPC routes, Inngest functions, etc.

Example: `MarketingTargetingDemo` should own the marketing layout and styling, but delegate the actual map rendering and data logic to the existing `TargetingMap` component.

---

## High-Level Rebuild Phases

### Phase 1: Foundation (Current)
- Strengthen `marketing-design-system.ts` to match the prototype’s visual language.
- Ensure `MarketingHomepage` composition follows the exact section order from `redesign/index.html`.
- Create any missing high-priority components (especially `MarketingProductsGrid` if not already solid).

### Phase 2: Major Sections
Rebuild these sections to match the prototype’s visual treatment and content:
- MarketingHero
- MarketingProductsGrid
- MarketingValueProps
- MarketingHowItWorks
- MarketingSocialProof
- MarketingFinalCta

### Phase 3: Map Tool Experience
Rebuild `MarketingTargetingDemo` (and supporting panels) so the marketing map tool feels like the experience in `redesign/map-tool.html`.

### Phase 4: Secondary Marketing Pages
Build the other marketing pages using the same design language:
- `/direct-mail-marketing`
- `/every-door-direct-mail`
- `/targeted-direct-mail`
- `/templates`
- `/design-services`

### Phase 5: Cleanup (Later)
Once the new marketing experience is solid and live, decide what to do with the old `components/landing/` files.

---

## How to Work With Cursor (Important)

1. **Always start important sessions with the directive.**
   - Paste or reference `redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md` at the beginning of the conversation.

2. **Work one section at a time.**
   - Do not try to rebuild the entire homepage in one go.
   - Finish one component/section, review it against the prototype, then move to the next.

3. **Force visual comparison.**
   - When asking Cursor to build or update a component, tell it to open the relevant part of `redesign/index.html` (or `map-tool.html`) and match it as closely as possible.

4. **Push back on old architecture.**
   - If Cursor says “we should keep the existing Landing* components,” remind it of the directive and that the prototype takes priority for the marketing site.

5. **Keep the tech stack intact.**
   - Explicitly tell Cursor to reuse/wrap existing components (`TargetingMap`, wizard steps, etc.) rather than rebuilding functionality.

---

## Recommended Starting Point (Right Now)

1. **Strengthen the design system** (`marketing-design-system.ts`) so it produces the typography, spacing, and visual language of the prototype.
2. **Build / refine the major marketing components** one by one in this rough priority:
   - MarketingHero
   - MarketingProductsGrid + ProductCard
   - MarketingValueProps
   - MarketingHowItWorks
   - MarketingSocialProof + MarketingFinalCta
   - MarketingTargetingDemo (the big one)

3. Update `app/page.tsx` (or `MarketingHomepage`) to use the new components in the prototype order.

---

## Rules of Engagement With Cursor

When giving Cursor instructions, include language like:

> “Treat `redesign/index.html` as the design spec. Do not feel constrained by the old `Landing*` component structure. Create new marketing components as needed. Wrap the existing targeting components instead of rewriting their logic.”

This prompt should be repeated often.

---

**Next Action**

Once you are ready to begin the rebuild, the recommended first real piece of work is:

**Strengthen the marketing design system + build/refine the Hero + Products Grid** so the top of the homepage already feels like the prototype.

Would you like me to prepare the exact first prompt you should give to a fresh Cursor conversation to start this rebuild? Or would you like me to begin creating the next component here?