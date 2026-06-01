COPY AND PASTE THIS REPLY TO CURSOR:

---

Thanks for the summary — you're tracking the directive well.

A few clarifications and direction:

1. Your understanding of the directive is correct. The prototype in `redesign/index.html` (and `redesign/map-tool.html`) is now the design authority for the marketing site. We are no longer incrementally polishing inside the old `Landing*` component structure. We are allowed — and expected — to create new components under `components/marketing/` and recompose the page to match the prototype's section order and visual treatment.

2. The "Problem" section: The prototype does not have a dedicated problem block in the same position or style as the current `LandingProblem`. We should drop it from the main homepage flow (or relocate it if we decide later it still adds value). Do not treat it as a required section just because it exists today.

3. Highest priority right now: Structural fidelity over polishing individual old components.
   - Recompose the marketing homepage to closely match the order and emphasis in `redesign/index.html`.
   - Build a clean `components/marketing/` layer (MarketingHero, MarketingProductsGrid, MarketingValueProps, MarketingHowItWorks, MarketingSocialProof, MarketingFinalCta, MarketingTargetingDemo, etc.).
   - Wire `app/page.tsx` (or a marketing-specific page) to this new structure.
   - Make the Map Tool experience first-class at the bottom of the homepage, styled and structured like the version in `redesign/map-tool.html`, while still wrapping the existing targeting components (`TargetingMap`, etc.).

4. Execution approach I want:
   - Start by creating the new homepage composition / shell under the marketing layer that follows the prototype order.
   - Then port sections one by one from the HTML prototype (reusing good work already done where it matches, such as the current `MarketingProductsGrid` and the improved hero visuals).
   - Prioritize getting the overall structure and visual weight right before deep polishing of every detail.

5. When in doubt, read the actual prototype HTML files first, not the old components. The goal is to make the marketing site feel like the prototype, not to make the prototype fit the old component names.

Go ahead and start with the new marketing homepage shell + composition that mirrors the prototype order. Show me the proposed structure and the first components you plan to build or refactor.

Also confirm: You have read and are following `/Users/brettlloyd/postcard-platform/redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md`.

---

You can send the above as your reply. It’s firm, clear, and gives Cursor a direct path forward while reinforcing the new rules. Let me know if you want any adjustments to the tone or content before you paste it.