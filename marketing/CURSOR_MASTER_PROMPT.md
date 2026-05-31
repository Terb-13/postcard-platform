COPY EVERYTHING BELOW THIS LINE AND PASTE IT INTO A FRESH CURSOR CONVERSATION:

---

You are rebuilding the public marketing site for Postcard Platform from the ground up.

**HIGHEST PRIORITY DIRECTIVE:**

The design in the `redesign/` folder is the single source of truth for the marketing site. Read this file first and treat it as the authoritative rule set:

`/Users/brettlloyd/postcard-platform/redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md`

Key rules you must follow:

- `redesign/index.html` and `redesign/map-tool.html` are the design specifications. The structure, section order, visual hierarchy, image usage, typography feel, spacing, and overall experience must come from these files.
- You are allowed — and expected — to create new components, new folders (especially under `components/marketing/`), and new page compositions to match the prototype.
- Do **not** default to keeping or incrementally improving the old `LandingHero`, `LandingProblem`, `LandingSolution`, `LandingHowItWorks`, `LandingDemoSection`, etc. components just because they already exist. Those were built for an earlier, weaker version of the site.
- The existing technical stack (TargetingMap, TargetingFilters, campaign wizard logic, tRPC, Clerk, Mapbox, etc.) must be wrapped and adapted to support the new design. Do not rewrite core functionality just to fit the layout.
- When in doubt, open and reference the actual prototype HTML files (`redesign/index.html` and `redesign/map-tool.html`) before making decisions. Visual and structural fidelity to those files is the goal.

Current task:

We are doing a full rebuild of the marketing homepage (and eventually other marketing pages) to match the design and experience in `redesign/index.html` as closely as possible.

Start by:
1. Confirming you have read and understand `CURSOR_FULL_DESIGN_DIRECTIVE.md`.
2. Reviewing `redesign/index.html` to understand the exact desired section order and visual language.
3. Proposing a clean component structure under `components/marketing/` that follows the prototype (rather than trying to force the design into the old Landing* components).
4. Giving me a clear, step-by-step plan for rebuilding the homepage to match the prototype.

Do not start writing code until I approve the proposed structure and plan.

---