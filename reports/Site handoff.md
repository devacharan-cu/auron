# Auron / Rainfold — site handoff (12 Oct 2026)

Fictional portfolio concept. Static multi-page site: Vite 7, Tailwind CSS 4, vanilla ES modules, SVG drawings. No WebGL.

## Run and build
- `npm run dev`: http://localhost:5173/ (unknown routes return 404, as on a static host)
- `npm run build`: writes `dist/` (15 pages). Serve it from any static host; configure `404.html` as the not-found page.
- `npm run images`: regrades `assets/images-src/*.jpg` into `public/images/` (AVIF, WebP and JPEG at 800 and 1600 px)
- `dev/viewports.html` is a dev-only harness (fixed-width iframes) and is not part of the build.

## Structure
- `partials/header.html`, `partials/footer.html`: written into every page at build time by the plugin in `vite.config.js`. The same plugin writes the photo plates (`<figure data-plate>`) into the HTML from `src/model/plates.json`.
- `src/shell.js`: shared boot code (fonts, styles, masthead, plates, reveals). `src/pages/*.js`: one entry module per page.
- `src/lib/state.js`: the shared state (clock, selected home, units, comparison list). It is saved to localStorage under `auron-state-v1` and synced across tabs.
- `src/model/`: site geometry, the light model, residences and plates. `src/components/`: section, site plan, floor plan, living section, homes, compare, record and brand modules.

## Pages
`/` · `/rainfold/` · `/architecture/` · `/landscape/` · `/residences/` · `/residences/find/` · `/location/` · `/record/` · `/journal/` (plus 3 articles) · `/visit/` · `/privacy/` · `/404.html`

## Rules for new work (performance)
Do not use rotated SVG patterns, `<marker>` elements, dot or texture patterns, CSS filters on large images, or sticky containers holding heavy SVG. Size masks and washes to the view. Detail drawings must crop their geometry (see `createSection` with `variant: 'detail'`). Each of these caused paint stalls during the build.

## Needs real client information before any public use
Developer identity and architect; a site and its survey; approvals; K-RERA registration (number, top-right placement and the K-RERA website on every advertisement, per the circular listed on rera.karnataka.gov.in); real areas measured to the RERA Act carpet-area definition; prices quoted all-inclusive; amenity and maintenance terms; a commissioned daylight study; dated, sourced infrastructure claims; photography of the actual site; a privacy policy if any form ever collects data; trademark clearance for "Form & Field" and "The Fold".

## Not tested
Real phones and tablets (only fixed-width iframes in desktop Chrome were checked), touch gestures, screen readers, Firefox and Safari, the operating-system reduced-motion setting (the `?motion=reduce` flag uses the same code path), slow networks, and low-end GPUs.

## Readiness audit (12 Oct 2026)
**Fixed:**
- **Locator selection error.** On the homepage and `/residences/find/`, the West and East side buttons also picked up the Level handler, so they selected a home that doesn't exist (`W1-NaNA`). That threw an error and broke the selection for the rest of the visit. Selection is now guarded as well.
- **Taps on row-A homes.** The section-cut line A–A sat over the middle of every row-A home in the site plan and caught taps meant for them. The plan annotations are now non-interactive.
- **Clipped plan labels on phones.** On cropped phone views, the scale bar and the "not a real parcel" note were cut off. They now stay inside the crop.
- **Contrast.** The muted ink `--color-ink-3` went from #7a756b (3.99:1) to #69645a (5.13:1 on paper, 4.69:1 on paper-2), which meets WCAG AA.
- **Screen readers:**
  - The brand link's accessible name now matches its visible text.
  - The home card and residence-type panel are no longer live regions, because they were re-announced on every step of the time control. A change of home is now announced once.
  - Heading order is fixed on Landscape, Location and Find.
  - Scrollable tables can now be reached with the keyboard.
  - The phone menu closes when Tab leaves it.
- **Layout shift on mobile.** On the homepage, the kicker wrapped differently once the web font loaded, so it is now laid out the same either way. Drawing hosts that scripts fill reserve their space while empty (`site.css`). Lighthouse mobile CLS went from 0.155 to 0.001 (home), 0.353 to 0.001 (residences), 0.364 to 0.002 (location) and 0.129 to 0.001 (find).
- **Sharing metadata.** Every page now has Open Graph and Twitter tags, plus a share card at `public/og.jpg` that carries its photo credit. Canonical URLs and `og:url` are written when `SITE_URL` is set, or from Vercel's production domain. The 404 page is marked `noindex`.
- **Deployment.** `vercel.json` sets the build and output, a CSP and other security headers, and asset caching. `npm run preview` sends the same headers.
- **Photography.** Plate 07, Hebbal Lake (CC BY-SA 2.0, Nagesh Kamath), replaces the third use of Jakkur Lake in the "Water held" article. Credits now note that adapted CC BY-SA images are shared under the same licence.
- **Housekeeping.** Fixed a mis-encoded dash in `package.json`, added a README and added `.vercel` and `.env*` to `.gitignore`.

**How it was tested.** I used headless Chrome 141 through puppeteer-core, with axe-core 4 and Lighthouse 12 installed in a temporary folder, not in the project.
- **Device sweep:** all 15 pages at four emulated devices (phone 390 and 360 px with touch, tablet 820 px, desktop 1440 px), plus `prefers-reduced-motion: reduce` emulation at phone and desktop.
- **Interaction tests:** 36 end-to-end checks covering selection in every view, the shared clock, season and units across pages and tabs, filters, compare, keyboard tabs and range, the visit flow, the phone menu and touch taps.
- **Performance:** Lighthouse mobile and desktop.

The devices were emulated in desktop Chrome. Real phones, Safari, Firefox and screen readers are still untested, as listed above.

## Rebrand to Auron (12 Oct 2026)
The developer is now **Auron** and the flagship is now **Rainfold**. They replace the working names Form & Field and The Fold, which the first research round flagged: "The Fold" is a published Dubai townhouse project. "Rainfold" names the concept itself, a fold in the plateau that holds the monsoon rain. Neither name has been trademark-cleared. A web search found no developer called Auron in India and no development called Rainfold.
- **Identity:**
  - Auron's mark is the sun's arc resting on a datum line, taken from the sun path in the living section. It sits beside a spaced capital AURON in Instrument Sans.
  - The mark is drawn in ink. Ochre stays reserved for calculated sunlight, which is now also the identity's own rule.
  - Rainfold keeps the single dipping section line (hero overlay and footer mark).
  - Typefaces and palette are unchanged.
- **Changed:**
  - wordmark, favicon, nav, footer, all titles and descriptions, sharing metadata and `public/og.jpg`
  - the route `/the-fold/` is now `/rainfold/`
  - the storage key is now `auron-state-v1`
  - package name, README and this handoff
  - the overview page has a "The name" line saying the name isn't a cleared trademark
- **Left unchanged on purpose:** the two creative-direction reports and `research_notes/` are the historical record and still use the old names. Internal code identifiers (`fold-*` classes, `ff-partials`) are not user-facing.
