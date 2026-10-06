# Nachit Cuisine — Roadmap

Static catering site for North African and Mediterranean food. Plain HTML, CSS, and JS. Images live in `assets/`. Published to GitHub Pages with GitHub Actions.

Brand: **Nachit** (logo). Menu copy keeps Dar Al Kadi where written. English is the page language; Arabic sits beside names.

Local dev (same pattern as Star Rise):

```bash
python3 dev/serve.py
# → http://127.0.0.1:8765/
python3 dev/stop.py
```

## Sequence

[x] design
[x] page skeleton
[x] hero
[x] navigation
[x] menu overview
[x] dish sections
[x] floating menu
[x] catering close
[x] assets
[x] menu.md
[x] responsive and motion
[x] local python serve
[x] github pages workflow
[x] cursor rules — exclude noise paths; keep roadmap updated for meaningful work
[x] overview pattern border — SVG tiles as CSS border on the 5-column table
[x] hero logo — use `assets/logo_v1.png` (no PNG rewrite); CSS circle crop on black
[x] scroll bob — lantern control (`assets/lantern_traced.png`); prev/next + bob float; disable ends
[x] hero rebrand art — `logo_only_1.jpeg` centered; `islamic_corner.svg` on all four corners (oriented)
[x] palette — page bg `#021c2d` (from logo) + warm gold `#c9a15b`
[x] refactor — CSS tokens/utilities, CSS corner ornaments, JS SECTIONS source of truth + rAF scroll
[x] `data/menu.json` — priced catering menu (Appetizers / Mains / Desserts / Beverages)
[x] menu pages driven by `menu.json` — overview + chapters + float nav; section art images
[x] hero logo click plays YouTube film, returns to logo when ended
[x] patterns — `islamic-tile.svg` for overview border + scroll-bob center square
[x] menu page look — olive parchment bg + black text; corner ornaments; islamic pattern section seps
[x] start speed — embedded menu first paint; deferred chapters; lazy art; leaner fonts; lighter assets; cheap parchment grain
[x] GitHub Pages — compressed JPEG art; lean deploy artifact; push `dar-elkadi` main

## design

[x] Sectional page: hero → 5-column overview → chapters → contact
[x] Midnight navy background for the whole site
[x] Nav: `HOME ---------------------------- Menu  Contact`
[x] Floating menu appears after overview, collapsible and movable
[x] Image slots reserved in each chapter
[x] Midnight navy background + warm gold accents, drawn from Dar Elkadi logo
[x] Overview frame uses `assets/patterns/islamic-tile.svg`
[x] Hero uses `assets/logo_only_1.jpeg` (Dar Elkadi) centered on black
[x] Hero corners: `assets/patterns/islamic_corner.svg` — TL native, TR flip-X, BL flip-Y, BR flip-XY
[x] Scroll bobber: solid navy triangles + one `islamic-tile.svg` in the center square

## page skeleton

[x] `index.html` — one page, stable section ids
[x] `css/styles.css`
[x] `js/main.js` — SECTIONS config drives float nav + scroll spy/bobber; rAF-throttled scroll; reusable drag helper
[x] `assets/` for logos and later dish photos
[x] `menu.md` — full menu source of truth

Section ids: `#home` `#menu` `#appetizers` `#main-menu` `#desserts` `#beverages` `#contact`

## hero

[x] Full-viewport first section
[x] Logo centered from `assets/logo_only_1.jpeg` on black
[x] Islamic corner ornaments framing the hero
[x] No menu copy in this section

## navigation

[x] Fixed bar: HOME · rule · Menu · Contact
[x] HOME → `#home`
[x] Menu → `#menu` (overview)
[x] Contact → `#contact` (phone + lead times)
[x] Transparent over hero, solid after scroll

## menu overview

[x] Four columns from `menu.json`:
  1. Appetizers (المقبلات)
  2. Main Menu (الأطباق الرئيسية)
  3. Desserts (الحلويات)
  4. Beverages (المشروبات)
[x] Number, English title, Arabic, short subtitle
[x] Each column links to its chapter

## dish sections

[x] Pages built from `data/menu.json` (Appetizers / Main Menu / Desserts / Beverages)
[x] Olive parchment chapter pages with black menu text
[x] Section art: Appetizers `olive_2.png`, Main `olive.png`, Desserts `olive_3.png`, Beverages `jog.png`
[x] No separators between dish items
[x] Section separators use `assets/patterns/islamic_pattern_2_1.png`

## floating menu

[x] Hidden until overview leaves the viewport
[x] Fixed panel with its own scroll
[x] Collapse / expand
[x] Drag by the title bar to move
[x] Highlights the chapter in view

## catering close

[x] Phone: [514.216.2704](tel:+15142162704)
[x] Call 3 days for medium orders, 7 days for large orders

## assets

[x] `assets/logo_only_1.jpeg` + `assets/patterns/islamic_corner.svg`
[x] Menu art: `olive.png` / `olive_2.png` / `olive_3.png` / `lantern.png` / `jog.png`
[x] `assets/patterns/islamic_pattern_2_1.png` (converted from jpeg) for chapter separators
[ ] Optional: dish photos later

## local python serve

[x] `dev/serve.py` — no-cache static server on :8765
[x] `dev/stop.py`

## github pages

[x] `.github/workflows/pages.yml` deploys static site on push
[ ] In GitHub repo Settings → Pages → Source: **GitHub Actions** (one-time)

## Cursor / process

[x] `.cursor/rules/project.mdc` — ignore list + roadmap discipline (always apply)
[x] `.cursorignore` — `.dev/`, `_site/`, git internals, junk

## Later

[ ] Dish photography in chapter image slots
[ ] Favicon / Open Graph polish
[ ] Confirm Arabic typography on real devices