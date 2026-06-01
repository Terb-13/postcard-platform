# Marketing Site Buildout Guide

**Keep this file.** It is the working checklist for turning the HTML prototypes in `redesign/` into the live Next.js marketing site. Update the **Current phase** section as work progresses.

---

## Source of truth

| Use this | Not this |
|----------|----------|
| `redesign/*.html` (repo root) | `marketing/` or `marketing/redesign/` (duplicates) |
| `redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md` | Old `components/landing/*` structure as a constraint |
| `apps/web/public/images/` | Prototype-only paths in HTML (`images/hero.jpg` → `/images/hero.jpg`) |

---

## HTML prototypes → Next.js routes

| Prototype | Next route | App entry |
|-----------|------------|-----------|
| `redesign/index.html` | `/` | `apps/web/app/page.tsx` → `MarketingHomepage` |
| `redesign/map-tool.html` | `/map-tool` | `apps/web/app/map-tool/page.tsx` |
| `redesign/direct-mail-marketing.html` | `/direct-mail-marketing` | `apps/web/app/direct-mail-marketing/page.tsx` |
| `redesign/every-door-direct-mail.html` | `/every-door-direct-mail` | `apps/web/app/every-door-direct-mail/page.tsx` |
| `redesign/targeted-direct-mail.html` | `/targeted-direct-mail` | `apps/web/app/targeted-direct-mail/page.tsx` |
| `redesign/templates.html` | `/templates` | `apps/web/app/templates/page.tsx` |
| `redesign/design-services.html` | `/design-services` | `apps/web/app/design-services/page.tsx` |

**Component home:** `apps/web/components/marketing/`  
**Technical reuse (wrap, don’t rewrite):** `apps/web/components/targeting/`, campaign wizard, tRPC, Clerk.

---

## Branch & local dev

```bash
git checkout marketing-redesign-fresh
npm run dev -- --filter=web
```

Use the port printed in the terminal (often **3001** if 3000 is another app).

Verify routes: `/`, `/direct-mail-marketing`, `/map-tool`, `/every-door-direct-mail`.

---

## Buildout phases (recommended order)

### Phase 1 — Homepage top (hero + products) ✓

- [x] Reference guide (this file)
- [x] `MarketingProductCard` shared component
- [x] `MarketingHero` copy aligned to `redesign/index.html`
- [x] `MarketingProductsGrid` uses product card + prototype copy/links
- [x] Review on http://localhost:3000 (use dev server URL from terminal)

**Spec sections:** hero + `#products` in `redesign/index.html`.

### Phase 2 — Homepage middle ✓

- [x] `MarketingValueProps`, `MarketingHowItWorks`, `MarketingSocialProof`, `MarketingFinalCta`
- [x] Review on http://localhost:3000

### Phase 3 — Map tool ✓

- [x] `MarketingTargetingWorkspace` — homepage + standalone variants
- [x] Homepage `#map-tool` + `/map-tool`

### Phase 4 — Secondary pages ✓

- [x] Shared page components + all secondary routes

### Phase 5 — Production ← **in progress**

- [ ] Merge `marketing-redesign-fresh` → `main` and push
- [x] `vercel.json` build uses `turbo run build --filter=web --force`
- [x] `turbo.json` lists PostCSS/Tailwind configs as global dependencies
- [ ] Vercel: clear build cache on first production deploy after merge
- [ ] Confirm CSS contains `tailwindcss v3`, not raw `@tailwind base`
- [ ] Confirm env: `NEXT_PUBLIC_MAPBOX_TOKEN`, `CENSUS_API_KEY`

### Phase 6 — Cleanup (later)

- [ ] Deprecate unused `components/landing/*` when nothing imports them

---

## Per-section workflow (repeat for each HTML file)

1. Open the matching `redesign/*.html` section.
2. Change or add a component under `components/marketing/`.
3. Reuse `marketing-design-system.ts` tokens; extend tokens if the prototype introduces a new pattern.
4. Wire real behavior via wrappers (`TargetingMap`, `AuthButtons`, links to `/campaigns/new`).
5. Compare prototype (open HTML in browser) vs local Next route.

---

## Cursor session prompt (paste when resuming)

> Treat `redesign/index.html` (or the listed HTML file) as the design spec. Do not constrain work to old `Landing*` components. Build in `components/marketing/`. Wrap `components/targeting/` and existing APIs. Read `redesign/MARKETING_BUILDOUT_GUIDE.md` for phase and route mapping.

---

## Local dev troubleshooting (unstyled / broken layout)

If the page looks like raw HTML (blue links, smashed nav text, huge “Open menu” button):

1. **Wrong port** — Another stale `next dev` may still be on 3001. Check the terminal for `Local: http://localhost:XXXX` and use that URL only.
2. **Stale dev server** — Terminal shows `GET /_next/static/css/... 404` or `GET /_next/static/chunks/... 404`. Fix:
   ```bash
   # Stop all dev servers (Ctrl+C in each terminal), then:
   for p in 3000 3001 3002; do lsof -ti:$p | xargs kill -9 2>/dev/null; done
   cd /Users/brettlloyd/postcard-platform
   rm -rf apps/web/.next
   npm run dev -- --filter=web
   ```
3. Hard refresh (Cmd+Shift+R) or incognito after restart.
4. If still unstyled on the correct port: DevTools → **Network** → check `layout.css` is **200** (not 404). Enable **Disable cache** while DevTools is open.
5. `Cannot find module './8079.js'` → corrupted `.next`; run from repo root: `npm run dev:web:clean` (faster than turbo when debugging CSS).

---

## Production troubleshooting (if design looks “reverted”)

- **Local branch:** stay on `marketing-redesign-fresh` until merge.
- **Live site on `main`:** may be stale Turbo/Vercel cache or merge not pushed.
- **Unstyled layout:** Tailwind not processed — check built CSS for `tailwindcss v3`, not `@tailwind base`.

---

## Related docs

- `redesign/CURSOR_FULL_DESIGN_DIRECTIVE.md`
- `redesign/MARKETING_SITE_REBUILD_PLAYBOOK.md`
- `redesign/MARKETING_SITE_COMPONENT_ARCHITECTURE.md`
- `.cursorrules` (repo root)

---

*Last updated: Phase 4 (secondary marketing pages + shared components).*
