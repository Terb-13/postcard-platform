# Design-First Architecture for the Marketing Site

**Guiding Principle (per your direction):**
The design in the `redesign/` folder is the source of truth.  
The tech stack (Next.js, tRPC, Mapbox components, campaign wizard, etc.) must adapt to serve this design — not the other way around.

We are **not** constrained by the current landing component names or their current order if they fight the prototype experience.

---

## Target Experience Structure (from redesign/index.html)

The homepage flow you approved:

1. **Navbar**
2. **Hero** — Big, high-impact, buyer-as-hero visual + strong CTAs ("Start an Order" + "Launch Map Tool")
3. **Explore Popular Products** — Prominent grid of 4 product cards (EDDM, Targeted, Saturation, New Mover) with images and clear CTAs
4. **Value Proposition** — Short, benefit-focused section
5. **How It Works** — Clear 4-step visual process with the workflow image
6. **Social Proof**
7. **Final CTA** (dark)
8. **Map Tool** — Treated as a major, prominent experience on the page (not buried)

Other pages (direct-mail-marketing.html, every-door-direct-mail.html, map-tool.html as a dedicated page, templates, design services, etc.) also follow the same design language.

---

## Proposed Component Structure (Design-Led)

This structure is derived directly from the prototype's sections rather than the current app's component split.

### Marketing Site Components (New or Refactored)

| Component                        | Mirrors in Prototype                  | Notes / Responsibility |
|----------------------------------|---------------------------------------|------------------------|
| `MarketingNav`                   | Navbar                                | Marketing-only nav (can differ from app nav) |
| `MarketingHero`                  | Hero section                          | Big visual + buyer as hero + CTAs. Uses `hero.jpg` |
| `ProductCard`                    | Individual product cards              | Reusable card used in grid + other marketing pages |
| `MarketingProductsGrid`          | "Explore Popular Products"            | The 4-card grid. This is currently missing in the live site. |
| `MarketingValueProps`            | Value Proposition section             | Short, benefit-focused. Can pull from current pillars but restructured visually. |
| `MarketingHowItWorks`            | How It Works                          | 4-step flow with large `workflow.jpg` image above or integrated |
| `MarketingSocialProof`           | Social Proof                          | Uses `results.jpg` + quotes |
| `MarketingFinalCta`              | Final CTA                             | Dark, strong close |
| `MarketingFooter`                | Footer                                | Can share with app or have marketing variant |

### Interactive / Tool Components

- `MarketingTargetingDemo` — A marketing-optimized wrapper around the existing targeting components (`TargetingMap`, `StatsSidebar`, etc.).
  - Styled and structured to match the beautiful map tool in `redesign/map-tool.html` (sidebar + large map + live results).
  - This becomes a first-class experience rather than just "the demo section".

- Dedicated pages can live in `app/(marketing)/...` routes:
  - `/direct-mail-marketing`
  - `/every-door-direct-mail`
  - `/targeted-direct-mail`
  - `/map-tool` (full version of the interactive tool)
  - `/templates`
  - `/design-services`

### What Happens to Current Components?

- `LandingHero`, `LandingProblem`, `LandingSolution`, etc. can be **deprecated or heavily refactored** for the marketing site.
- The powerful logic inside `components/targeting/` and the campaign wizard stays and is wrapped by the new marketing components.
- We do **not** force the new design into the old component boundaries if it produces a worse result.

---

## Recommended Approach Going Forward

1. **Treat `redesign/index.html` and `redesign/map-tool.html` as the design spec** for the marketing experience.
2. Build new marketing-specific components that match the prototype's section order and visual treatment.
3. Wrap (do not rewrite) the existing technical pieces:
   - Use the real `TargetingMap` + related components inside `MarketingTargetingDemo`.
   - Use the existing wizard logic when the user clicks "Start an Order".
4. The logged-in app (dashboard, full wizard, ops, partner portal) can keep its current component structure and evolve separately.

---

## Immediate Next Steps I Can Execute

- Create the `MarketingProductsGrid` + `ProductCard` components (biggest missing piece right now).
- Refactor `app/page.tsx` (marketing) to match the prototype section order.
- Create `MarketingTargetingDemo` that makes the map feel like the one in the prototype.
- Continue porting visuals for How It Works, Social Proof, Final CTA, etc.

Would you like me to start with the **Products Grid** (since it's completely missing today and is very prominent in your approved design)? Or something else first?

Just say the word and I'll begin building.