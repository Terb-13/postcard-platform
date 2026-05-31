COPY EVERYTHING BELOW AND PASTE IT INTO CURSOR AT THE START OF A SESSION OR WHEN CONTINUING THE REDESIGN WORK:

---

You are working on the public marketing site for Postcard Platform (the homepage and marketing pages).

**HIGHEST PRIORITY RULE - READ THIS FIRST:**

Read and strictly follow the file at this exact path:  
`/Users/brettlloyd/postcard-platform/redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md`

This document is the current standing directive for all marketing site work. It overrides any previous instructions about respecting the old component architecture.

### Key Points from the Directive (Internalize These)

- The design and user experience in the `redesign/` folder is the single source of truth.
  - `redesign/index.html` is the primary reference for the homepage structure, visual hierarchy, section order, image usage, and overall experience.
  - `redesign/map-tool.html` is the primary reference for the interactive targeting/map experience on the marketing site.
- You may restructure freely on the marketing site. Create new components under `components/marketing/`, introduce new section order, and deprecate or replace old `Landing*` components if it better matches the prototype. Do not let the old component names constrain the design.
- The tech stack (tRPC, existing TargetingMap components, campaign wizard, Clerk, etc.) should be wrapped and adapted to serve the prototype design. Do not rewrite core logic just for layout’s sake.
- When in doubt, read the actual prototype HTML files and the directive before making structural or visual decisions.

### Current Situation and Top Task

The homepage is still in a hybrid state. Earlier work was incrementally upgrading the old `LandingHero`, `LandingProblem`, `LandingSolution`, etc. components. That approach is no longer the rule.

The prototype homepage order from `redesign/index.html` is:

1. Nav
2. Hero
3. Explore Popular Products
4. Value proposition (4 teal-numbered pillars)
5. How it works
6. Social proof (navy band with business names)
7. Final CTA
8. Map tool (sidebar + map + live results) — treated as first-class at the bottom
9. Footer

There is no dedicated “Problem” section in the prototype.

Current state of the live site:
- Hero and Products Grid are partly aligned.
- Map demo is still too early in the flow (it should be last as a major experience).
- Problem section still exists in the flow (should be dropped or relocated).
- Value props, How it Works, Social Proof, and Final CTA still live under old component names and don’t fully match the prototype visually.
- The map tool interior does not yet follow the 3-column marketing layout and styling from `redesign/map-tool.html`.

**Highest-priority task right now:**

Recompose the marketing homepage to match `redesign/index.html` end-to-end using a clean `components/marketing/` layer.

Concretely this means:
- Fix section order and presence to match the prototype (Hero → Products → Value props → How it works → Social proof → Final CTA → Map tool at the bottom).
- Drop or relocate `LandingProblem` from the main homepage flow.
- Build or rename marketing components (MarketingHero, MarketingValueProps, MarketingHowItWorks, MarketingSocialProof, MarketingFinalCta, MarketingTargetingDemo, etc.) and wire the page to them.
- Make the map tool first-class at the bottom, styled like `redesign/map-tool.html`, while wrapping the existing targeting components.
- Finish visual alignment on the lagging sections (use results.jpg, workflow.jpg, etc. where appropriate, apply teal accents on marketing elements, match typography scale and spacing from the prototype).

### Rules for This Work

- Always read `redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md`, `redesign/index.html`, and `redesign/map-tool.html` before making structural or visual decisions.
- Prioritize fidelity to the prototype over preserving the old component names or order.
- When Cursor feels pressure to “respect the existing architecture,” push back. The old Landing* components are not constraints for the marketing site.
- Keep the underlying tech stack (TargetingMap, filters, Clerk, tRPC, campaign wizard logic, etc.) — wrap it in marketing wrappers instead of rewriting it.
- Use the latest approved images in `apps/web/public/images/` (especially the buyer-as-hero versions).

Start by confirming you have read and understand the full directive file, then give me a clear plan for the next implementation pass based on the priorities above.

---