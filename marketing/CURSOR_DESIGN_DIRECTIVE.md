# Cursor Design Directive – Postcard Platform Marketing Site

**CRITICAL INSTRUCTION – READ THIS FIRST AND TREAT IT AS THE HIGHEST PRIORITY RULESET**

You are working on the **marketing site** (public-facing landing page and marketing pages) for Postcard Platform.

## Primary Rule (Non-Negotiable)

**The design and user experience defined in the `redesign/` folder is the single source of truth.**

- `redesign/index.html` is the authoritative reference for the homepage structure, visual hierarchy, section order, image usage, tone, and overall experience.
- `redesign/map-tool.html` is the authoritative reference for the interactive targeting/map experience on the marketing site.
- Other files in `redesign/` (direct-mail-marketing.html, every-door-direct-mail.html, templates.html, design-services.html, etc.) define the design language for secondary marketing pages.

You must **not** compromise the design direction in these HTML files to fit the existing component structure. The design leads. The code must follow.

## Second Rule

**Do not default to preserving the old component architecture.**

The current components in `apps/web/components/landing/` (LandingHero, LandingProblem, LandingSolution, LandingHowItWorks, etc.) were built for an earlier, weaker version of the site.

When Cursor (or you) feels pressure to "respect the existing component architecture," push back. The old component names and their current order are **not sacred** for the marketing site. We are allowed — and expected — to:

- Create new components
- Reorganize section order
- Introduce a new folder structure (e.g. `components/marketing/`)
- Wrap existing technical pieces (TargetingMap, campaign wizard logic, etc.) inside new marketing components

The goal is to deliver the experience shown in the `redesign/` prototypes as faithfully as possible.

## Core Design Principles (from the prototype)

- Buyer as the Hero: The local business owner should feel like the central, empowered figure in visuals and messaging.
- Technology-first but human: Clean, premium, modern SaaS aesthetic (think Linear / Vercel / Stripe level) while remaining approachable for local businesses.
- Visual weight > text-heavy: Prioritize strong, high-quality imagery, generous spacing, and clear visual hierarchy.
- Prominent "Explore Popular Products" grid right after the hero (this is currently missing or buried).
- The Map Tool is a first-class experience, not just another section.
- Use the latest images in `apps/web/public/images/` (especially the buyer-as-hero versions and the new cartoon-style product cards: eddm-product.jpg, targeted-product.jpg, saturation-product.jpg, newmover-product.jpg).

## How to Work With Existing Code

- The powerful technical pieces in `components/targeting/` (TargetingMap, StatsSidebar, etc.) and the campaign wizard should be **reused**, not rewritten.
- Wrap them inside new marketing-facing components when needed (example: create `MarketingTargetingDemo` that uses the real TargetingMap but styled and structured like `redesign/map-tool.html`).
- For the marketing site, feel free to create a parallel set of components under `components/marketing/` that match the prototype more closely than the old `landing/` components.

## When Cursor Pushes Back

If you (or the model) start saying things like:
- "We should keep the existing Landing* components for consistency"
- "We need to respect the current architecture"
- "This would require too many changes"

**Stop and re-read this document.**

The marketing site experience takes priority over preserving old component names. We are intentionally evolving the marketing presentation layer to match the approved prototype.

## Reference Files You Must Consult

Always read these when making decisions about the marketing site:

1. `redesign/index.html` – Primary homepage spec
2. `redesign/map-tool.html` – Primary interactive map tool spec
3. `redesign/DESIGN_FIRST_ARCHITECTURE.md`
4. `redesign/MARKETING_SITE_COMPONENT_ARCHITECTURE.md`
5. `redesign/images/` – All current approved visuals

## Summary of Your Job

- Make the marketing site look and feel like the prototype in `redesign/`.
- Adapt the tech stack (tRPC, Mapbox components, wizard, etc.) to support that experience.
- Do not let the old component structure limit or dilute the design.
- Create new components and structure when it produces a better match to the prototype.

This directive overrides previous instructions about "respecting the existing component architecture" for the marketing site.

---

**End of Directive**

When working on any marketing page or component, start by reading the relevant prototype HTML and the two architecture documents above. Then build toward them.