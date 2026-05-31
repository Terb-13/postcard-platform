# Cursor Full Design Directive – Postcard Platform Marketing Site

**IMPORTANT: Treat this entire document as the highest-priority instruction set for all marketing site work.**

You are helping build the public marketing site (homepage and marketing pages) for Postcard Platform.

## 1. Core Rule (Non-Negotiable)

The design and user experience defined in the `redesign/` folder is the single source of truth.

- `redesign/index.html` is the primary reference for the homepage structure, visual hierarchy, section order, image usage, tone, typography, spacing, and overall experience.
- `redesign/map-tool.html` is the primary reference for the interactive targeting/map experience.
- All other files in `redesign/` (direct-mail-marketing.html, every-door-direct-mail.html, templates.html, design-services.html, etc.) define the approved design language and patterns for secondary pages.

**Do not compromise the design direction shown in these files** to fit the existing component structure. The design leads. The code must follow and adapt.

## 2. Second Rule – Architecture

**Do not default to preserving the old component architecture.**

The current components in `apps/web/components/landing/` (LandingHero, LandingProblem, LandingSolution, LandingHowItWorks, LandingDemoSection, etc.) were created for an earlier, weaker version of the site.

When you feel the urge (or the model suggests) to say things like:
- “We should respect the existing Landing* components”
- “To avoid too many changes, let’s adapt the design into the current structure”
- “We need to keep backward compatibility with the old component names”

**Stop.** Re-read this directive.

The old component names and their current order are **not sacred** for the marketing site. You have explicit permission and instruction to:
- Create new components
- Reorganize section order
- Introduce new folders (e.g. `components/marketing/`)
- Deprecate or heavily refactor old landing components
- Wrap existing technical pieces inside new marketing components

The goal is to deliver the experience shown in the `redesign/` prototypes as faithfully as possible on the marketing site.

## 3. Design Principles (from the approved prototype)

- **Buyer as the Hero**: The local business owner must feel like the central, empowered figure in visuals and messaging. Technology exists to serve them.
- **Technology-first but human**: Clean, premium, modern SaaS aesthetic (think Linear, Vercel, or Stripe level of polish) while remaining approachable for local business owners.
- **Visual weight over text-heavy**: Prioritize strong, high-quality imagery, generous spacing, clear visual hierarchy, and breathing room. Reduce pure text walls.
- **Prominent “Explore Popular Products” grid**: This section (right after the hero) is very important in the prototype and is currently weak or missing in the live site.
- **Map Tool as a first-class experience**: The interactive targeting experience should feel prominent and beautiful, not buried.
- Use the latest approved images in `apps/web/public/images/` (especially the buyer-as-hero versions and the new cartoon-style product images: eddm-product.jpg, targeted-product.jpg, saturation-product.jpg, newmover-product.jpg).

## 4. How to Handle the Existing Tech Stack

The technical foundation is strong and should be preserved:
- tRPC + API routes
- Existing `components/targeting/` folder (TargetingMap, StatsSidebar, TargetingFilters, MapDrawControl, etc.)
- Campaign wizard logic
- Clerk auth
- Mapbox + Turf.js integration
- Inngest jobs, UploadThing, Stripe, etc.

**Strategy**: Wrap and adapt these powerful pieces inside new marketing-focused components that match the prototype. Do not rewrite the core logic just to fit the design. Instead, create marketing-specific wrappers (example: `MarketingTargetingDemo`) that use the real targeting components but are styled and structured like the prototype in `redesign/map-tool.html`.

## 5. Reference Files You Must Consult

Before making structural or visual decisions on the marketing site, always read:

1. `redesign/index.html` – Primary homepage spec
2. `redesign/map-tool.html` – Primary interactive map tool spec
3. `redesign/DESIGN_FIRST_ARCHITECTURE.md`
4. `redesign/MARKETING_SITE_COMPONENT_ARCHITECTURE.md`
5. `redesign/CURSOR_DESIGN_DIRECTIVE.md` (this file and its shorter version)
6. The images in `redesign/images/` (and their counterparts in `apps/web/public/images/`)

## 6. Proposed Component Structure (Design-Led)

The marketing site should follow the section order and visual treatment from the prototype, not the current app’s component split.

### Recommended Marketing Components

- `MarketingNav`
- `MarketingHero` (big visual, buyer as hero, strong CTAs)
- `ProductCard` (reusable)
- `MarketingProductsGrid` (the prominent “Explore Popular Products” section – currently missing)
- `MarketingValueProps`
- `MarketingHowItWorks`
- `MarketingSocialProof`
- `MarketingFinalCta`
- `MarketingFooter`
- `MarketingTargetingDemo` (marketing version of the map tool, styled after the prototype)

These can live in a new folder: `apps/web/components/marketing/`

The existing powerful technical components in `components/targeting/` and the campaign wizard should be reused inside the above marketing components.

## 7. When Cursor Pushes Back

If Cursor (or the model) suggests keeping the old structure for “consistency” or “to avoid too many changes,” respond with:

> “Refer to the CURSOR_FULL_DESIGN_DIRECTIVE.md file. The prototype in the redesign/ folder is the design source of truth. We are intentionally evolving the marketing site structure and components to match it. The old Landing* component names and order are not constraints for the marketing experience. We are allowed to create new components and reorganize to deliver the approved design.”

## 8. Summary of Your Role

- Make the marketing site look and feel like the prototype in the `redesign/` folder.
- Adapt the tech stack to support that experience (wrap existing components when needed).
- Do not let the old component structure limit or dilute the design.
- Create new components and structure when it produces a better match to the prototype.
- Always consult the reference files listed above before making decisions.

---

**End of Directive**

Copy and paste the entire content above (or the file `redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md`) into Cursor when starting or continuing marketing site work. Re-paste it whenever Cursor starts defaulting to the old architecture.