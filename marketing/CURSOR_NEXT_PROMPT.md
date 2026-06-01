COPY AND PASTE THE FOLLOWING INTO CURSOR:

---

You are continuing the marketing site redesign for Postcard Platform.

**Highest priority instruction:**

Read and strictly follow this file first:  
`/Users/brettlloyd/postcard-platform/redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md`

That document is the current standing directive. It overrides any previous instructions about respecting the old component architecture.

### Current Situation (from my analysis)

The homepage (`apps/web/app/page.tsx`) is currently a hybrid that still follows the old structure too much:

- It has `LandingHero` + the new `MarketingProductsGrid` (good progress).
- But the map (`LandingDemoSection`) is still very early in the flow.
- There is still a dedicated `LandingProblem` section (the prototype has no equivalent in that position).
- The rest of the sections are still under the old `Landing*` names and in the old order.
- The map tool is not yet treated as a first-class, prominent experience at the bottom of the homepage like it is in `redesign/index.html`.

### Target Structure (from the prototype)

The homepage must be recomposed to closely match the section order and visual treatment in `redesign/index.html`:

1. Nav
2. Hero
3. Explore Popular Products (already started with MarketingProductsGrid)
4. Value proposition (4 teal-numbered pillars)
5. How it works (with the workflow image)
6. Social proof (navy band with business names)
7. Final CTA
8. Map tool (as a major section at the bottom — sidebar + map + live results, styled like `redesign/map-tool.html`)
9. Footer

There should **not** be a dedicated "Problem" section in the same place as the current `LandingProblem`.

### Your Task Right Now

Recompose the marketing homepage to match the prototype using a design-led `components/marketing/` layer.

Concretely, do the following:

1. Create a clean homepage shell (you can update `app/page.tsx` or create a new marketing homepage composition) that follows the exact section order above.
2. Build or rename components under `components/marketing/` to match the prototype sections (examples: `MarketingHero`, `MarketingValueProps`, `MarketingHowItWorks`, `MarketingSocialProof`, `MarketingFinalCta`, `MarketingTargetingDemo`, etc.).
3. Move the map tool experience to the end of the homepage as a first-class section (create `MarketingTargetingDemo` styled after `redesign/map-tool.html`, wrapping the existing targeting components).
4. Remove or relocate `LandingProblem` from the main homepage flow unless we explicitly decide to keep a version of it.
5. Finish the remaining visual alignment:
   - Use `results.jpg` in Social Proof and/or Final CTA.
   - Align CTAs and nav language with the prototype where appropriate ("Start an Order" on the marketing site).
   - Apply the teal accent strategy on marketing pages as defined in the directive.

You have full permission to create new components and change the composition on the marketing site. Do **not** force the new design into the old `Landing*` component structure if it produces a worse result. The prototype in `redesign/index.html` (and `redesign/map-tool.html`) is the design authority.

Always read the directive file + the relevant prototype HTML before making structural decisions.

Start by giving me a clear plan for the new homepage composition and the marketing components you will create or refactor first. Then begin implementation.

---