# Grok Build — demo order postcard artwork

Generate **six PNG files** (front + back for three demo campaigns). Save them exactly as listed below into:

`apps/web/public/demo-artwork/`

Then run:

```bash
npm run db:seed:demo:artwork
```

---

## Brand & style (all images)

Use the same visual system as the Postcard Platform marketing site:

- **Palette:** deep navy `#0A2540`, warm off-white `#FAF8F5`, accent coral `#E85D4C`, soft sage `#7BAE7F` sparingly.
- **Typography feel:** bold sans-serif headlines, clean subheads (no tiny illegible text).
- **Photography:** bright, optimistic, suburban/small-business America — not stock-generic corporate.
- **Print-safe:** high contrast, no bleed-critical text within 0.125" of trim; keep logos and phone numbers large.
- **Format:** PNG, sRGB, no transparency on the card face (solid background to edges).
- **No watermarks**, no “Grok” or AI artifacts, no misspelled words.

---

## File 1–2: Spring EDDM — Draft (`camp_draft_lupy`, 6×11)

**Save as:** `camp_draft_lupy-front.png`, `camp_draft_lupy-back.png`  
**Pixel size:** **3300 × 1800** each (landscape, 11:6 ratio, ~300 DPI for 11″×6″)

### Front prompt

> Landscape direct-mail postcard front, 11:6 aspect ratio, for a local landscaping company “GreenPath Lawn & Garden” spring promotion. Hero photo: lush green lawn with spring flowers, sunny morning. Headline: “Spring curb appeal starts here.” Subhead: “20% off aeration + overseed — April only.” Phone (555) 214-8890 and greenpathlawn.example.com. Brand colors navy #0A2540 and coral #E85D4C accents on cream #FAF8F5 band. Professional print-ready postcard design, no watermark.

### Back prompt

> Landscape postcard **back** (USPS EDDM layout), 11:6 ratio, cream background #FAF8F5. Left: mailing indicia area and address block placeholder (gray boxes, no real addresses). Right: bullet benefits — “Licensed & insured”, “Free estimates”, “Serving Oak Park & Riverside”. Small map pin icon. Company name GreenPath Lawn & Garden, return address placeholder. Clean, legible, print-ready.

---

## File 3–4: Neighborhood Saturation Mail (`camp_prod_lupy`, 6×11)

**Save as:** `camp_prod_lupy-front.png`, `camp_prod_lupy-back.png`  
**Pixel size:** **3300 × 1800** each

### Front prompt

> Landscape 6×11 EDDM postcard front for a neighborhood dental practice “Riverside Family Dental.” Friendly diverse family smiling, modern clinic vibe. Headline: “New patient special — exam & X-rays $79.” Subhead: “Most insurance accepted.” Call (555) 902-4410, riversidedental.example.com. Navy #0A2540, coral #E85D4C CTA button shape, cream background sections. High-end healthcare marketing, print-ready, no watermark.

### Back prompt

> Postcard back, 11:6 landscape, Riverside Family Dental. Standard EDDM back layout with indicia/address placeholders on left, hours Mon–Fri 8–6 Sat 9–1, “Ask about whitening $199” on right. Navy footer bar, cream field, readable 14pt-equivalent type scale.

---

## File 5–6: Targeted Movers Campaign (`camp_ship_lupy`, 4×6)

**Save as:** `camp_ship_lupy-front.png`, `camp_ship_lupy-back.png`  
**Pixel size:** **1800 × 1200** each (landscape, 3:2 ratio for 6″×4″)

### Front prompt

> Landscape 4×6 targeted direct-mail postcard for “Summit Moving Co.” Photo: professional movers carrying labeled boxes into a sunny suburban home. Headline: “Just moved in? We’ll unpack your stress.” Offer code MOVERS15 for 15% off local moves. Phone (555) 771-3300, summitmoving.example.com. Navy and coral brand, cream background, bold readable type, print-ready.

### Back prompt

> 4×6 postcard back, 3:2 landscape. Summit Moving Co. checklist: “Licensed · Insured · Free quote in 24h.” QR code placeholder (decorative square pattern, not scannable). Mailing area placeholders left third. Clean minimal design, navy accents on cream.

---

## After export

1. Place all six PNGs in `apps/web/public/demo-artwork/`.
2. Run `npm run db:seed:demo` (if you have not already) then `npm run db:seed:demo:artwork`.
3. Confirm in the app: **My campaigns** and **Your orders** show front/back previews.

Images are stored in Supabase Storage bucket `campaign-artwork` under `demo/` and linked via `Artwork` + `ArtworkThumbnail` rows.
