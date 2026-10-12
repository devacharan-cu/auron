# Technical Approach: High-Performance Interactive Architectural Web Experiences (HTML, Tailwind, vanilla JS, SVG, Canvas, WebGL)

Research date: 11 October 2026. Browser-support figures come from caniuse pages fetched on that date; caniuse usage data is labelled "StatCounter, September 2026". Links marked **[prior knowledge, not re-fetched]** are well-known canonical URLs that I did not re-open during this session. Check them before citing them in a deliverable.

---

## 1. Techniques and their trade-offs (scroll animation, View Transitions, image sequences, SVG, canvas, WebGL/WebGPU, 3D compression, Gaussian splats, shaders, smooth scroll)

### Takeaway
In October 2026, CSS scroll-driven animations work in Chromium, Safari 26+ and Samsung Internet. Firefox stable still lacks them; caniuse shows support only in Firefox 160, which is not yet released. Use them as progressive enhancement, and use GSAP ScrollTrigger (now free, including all plugins) for choreography that has to work everywhere. For 3D, three.js on WebGL2 is the safe default. WebGPU is now in all major desktop browsers, but its Android coverage is patchy. Gaussian splats have become a practical web medium through Spark (three.js) and three.js's own new splat renderer.

### Cited Findings

**CSS scroll-driven animations (`animation-timeline`, `scroll()`, `view()`)**
- caniuse puts `animation-timeline` at **87.84% global usage**. Supported versions: Chrome 115+, Edge 115+, Opera 101+, Safari 26.0+ (desktop and iOS), Samsung Internet 23+, and Chrome for Android 154. Firefox shows support **only in version 160**; versions 2–159 lack it, and Firefox for Android 157 lacks it. — [caniuse: animation-timeline](https://caniuse.com/mdn-css_properties_animation-timeline)
  - Note: the caniuse grid lists Firefox for Android at 157, so Firefox 160 appears to be a pre-release (Nightly) build. Treat Firefox stable as **not supported** in October 2026.
- Scroll-driven animations (`animation-timeline`, `scroll-timeline`, `view-timeline`) are a **new Interop 2026 focus area**, so all engines are working on interoperability this year. — [web.dev: Interop 2026](https://web.dev/blog/interop-2026); [WebKit: Announcing Interop 2026](https://webkit.org/?p=17818)
- Reference guides: [MDN: CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) and [Chrome for Developers: scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations) **[prior knowledge, not re-fetched]**; Bramus's demo collection at [scroll-driven-animations.style](https://scroll-driven-animations.style/) **[prior knowledge, not re-fetched]**.

**View Transitions API**
- Cross-document (MPA) view transitions: Chrome/Edge 126+ and Safari 18.2+. Firefox 144–160 has **partial** support, and Samsung Internet (up to 30) has **none**. Global usage is 88.81% (86.77% full plus 2.04% partial). — [caniuse: cross-document view transitions](https://caniuse.com/cross-document-view-transitions)
- Interop 2025 made same-document view transitions **Baseline Newly available**. Interop 2026 continues work on same-document transitions, `blocking="render"`, `<link rel="expect">`, `:active-view-transition-type()` and cross-document transitions. — [web.dev: Interop 2026](https://web.dev/blog/interop-2026)
- Samsung Internet has a large Android share in India, and it lacks cross-document transitions. Page-to-page transitions (for example, a residence card morphing into its detail page) must work as normal navigations without them. **(Inference from caniuse data; I found no Samsung Internet share figure for India.)**

**GSAP / ScrollTrigger licensing**
- Webflow announced that GSAP is **100% free for everyone**, including the formerly paid Club plugins (SplitText, MorphSVG, DrawSVG, ScrollSmoother and others), and that the standard licence now covers commercial use. — [Webflow blog: GSAP becomes free](https://webflow.com/blog/gsap-becomes-free); [Webflow updates](https://webflow.com/updates/gsap-becomes-free)
- The "Standard No Charge" licence allows use on any website or app. It **forbids** use in no-code visual animation-builder tools that compete with Webflow, reverse engineering to build competing products, and removing notices. Webflow can end the licence if you breach it. GSAP is **not open source (not MIT)**. — [GSAP Standard License](https://gsap.com/community/standard-license/) (the text was confirmed via mirrors such as [tostracker](https://tostracker.app/document/gsap); check the canonical page before giving the client legal sign-off)
- For a developer marketing site like this one, the restriction does not apply. **(Inference)**
- DrawSVGPlugin (stroke drawing) and MorphSVG are directly useful for architectural line drawings. All plugins are free now. — [Webflow blog](https://webflow.com/blog/gsap-becomes-free)

**IntersectionObserver**
- IntersectionObserver is the lightest way to trigger reveal, lazy-init and pause/resume behaviour, and it is supported everywhere. — [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) **[prior knowledge, not re-fetched]**. Use it to start and stop WebGL render loops and to mount 3D only when its section approaches the viewport. **(Inference)**

**Lenis smooth scroll**
- Lenis is MIT licensed, "a few KB" with no dependencies, and at version 1.3.26. It keeps native scroll, so `position: sticky` and anchors still work. It does **not** support CSS scroll-snap (use the separate Snap package). — [GitHub: darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)
- Documented limitations: it is capped at 60fps on Safari and 30fps in Low Power Mode; smoothing stops over iframes; fixed elements can lag in Safari on pre-M1 Macs; `syncTouch` is unstable on iOS below 16; and nested scroll areas need `allowNestedScroll` (which costs performance) or `data-lenis-prevent`. — [Lenis README](https://github.com/darkroomengineering/lenis)
- `respectReducedMotion` defaults to **true**. Under reduced motion, lerp is set to 1 (no smoothing) and programmatic scrolls jump instantly. — [Lenis README](https://github.com/darkroomengineering/lenis)
- GSAP integration: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);` — [Lenis README](https://github.com/darkroomengineering/lenis)

**Image-sequence scrubbing on canvas**
- I found no current Codrops tutorial dedicated to frame-sequence scrubbing. The closest is Codrops' "How to Build Cinematic 3D Scroll Experiences with GSAP" (19 November 2025). It puts a fixed canvas behind scrolling content, uses an OGL scene, and builds a canvas-generated image atlas on a rotating cylinder driven by ScrollSmoother. — [Codrops (Nov 2025)](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/); [companion repo](https://github.com/JosephASG/codrops-cinematic-scroll-animations)
- GSAP keeps CodePen demos of scroll-scrubbed sequences, for example [GreenSock CodePen](https://codepen.io/GreenSock/pen/EaVbXeM) (found in search; I did not open it to confirm what it shows).

**SVG floor plans, building stacks and line drawings**
- I found no single authoritative 2026 tutorial on interactive SVG floor plans. The pattern below rests on general SVG and ARIA guidance. See Gaps.

**WebGL libraries: three.js vs OGL vs raw WebGL; WebGPU status**
- WebGPU timeline: Chrome 113 on desktop; Chrome Android 121+ on Android 12+ devices with Qualcomm or ARM GPUs; Firefox 141 (Windows first); Safari 26 (macOS Tahoe, iOS/iPadOS 26). web.dev (November 2025) announced that WebGPU is supported in all major browsers. — [web.dev: WebGPU supported in major browsers](https://web.dev/blog/webgpu-supported-major-browsers)
- Khronos reports that Chromium added a WebGPU **Compatibility Mode** for older Android devices (GLES 3.1) in February 2026. — [Khronos SIGGRAPH 2026 WebGL/WebGPU](https://www.khronos.org/developers/linkto/webgl-and-webgpu-sigg26) (search snippet only)
- Firefox for Android had not shipped WebGPU as of mid-2026, according to lower-quality secondary sources ([abratabia](https://abratabia.com/mobile-browser-performance/webgpu-on-mobile.php)). **Partly unverified.**
- three.js r186 is reported to ship a native `GaussianSplat` renderer written in TSL. That means one implementation runs on both WebGLRenderer and WebGPURenderer. — [RadianceFields (secondary)](https://radiancefields.com/three.js-ships-its-native-gaussian-splat-renderer-and-splat-raycasting-in-r186). **Check against the three.js release notes.**
- OGL is a minimal WebGL library and Codrops uses it for image and gallery effects. — [Codrops OGL gallery tutorial](https://tympanus.net/codrops/?p=82391); [Codrops OGL infinite gallery (2021)](https://tympanus.net/codrops/2021/01/05/creating-an-infinite-auto-scrolling-gallery-using-webgl-with-ogl-and-glsl-shaders/); repo [github.com/oframe/ogl](https://github.com/oframe/ogl) **[prior knowledge, not re-fetched; licence (Unlicense) and size not verified]**

**glTF compression (Draco / Meshopt / KTX2)**
- The glTF-Transform CLI offers `optimize` (for example `gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`). It also has separate `draco`, `meshopt`, `etc1s`/`uastc` (KTX2/Basis), `webp`, `avif`, `resize`, `simplify`, `instance`, `join` and `quantize` commands. The docs warn that the `optimize` defaults may not suit every scene, and suggest running `inspect` first to find the bottlenecks. — [gltf-transform.dev/cli](https://gltf-transform.dev/cli)
- three.js needs loader add-ons to decode these formats: DRACOLoader (WASM decoder), MeshoptDecoder, and KTX2Loader (Basis transcoder). — [three.js docs: GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) **[prior knowledge, not re-fetched]**

**Gaussian splatting on the web**
- **Spark** (World Labs, MIT licence) is a three.js Gaussian splat renderer. Spark 2.0 (14 April 2026) added streamable LOD. It reads PLY, SPZ, SPLAT, KSPLAT and SOG files, targets WebGL2, and needs three.js r180+. The latest tag found was v2.1.0. — [GitHub: sparkjsdev/spark](https://github.com/sparkjsdev/spark); [Spark 2.1.0 README on unpkg](https://unpkg.com/@sparkjsdev/spark@2.1.0/README.md); [RadianceFields: Spark](https://radiancefields.com/platforms/spark)
- **SuperSplat 3.0** (PlayCanvas's browser-based splat editor, reported 8 September 2026) is a rewrite that renders on **WebGPU only**; the WebGL2 path was removed. PlayCanvas reports idle peak JS heap falling from 1,557 MB to 105 MB, and it added "Stochastic Alpha" sort-free transparency. — [RadianceFields (secondary)](https://radiancefields.com/playcanvas-releases-supersplat-3.0). I found no primary PlayCanvas announcement. SuperSplat is the **authoring/cleanup tool**; Spark or three.js is the delivery runtime. **(Inference)**
- SOG (a compressed splat format) was added to SuperSplat in v2.7. — [RadianceFields](https://radiancefields.com/supersplat-releases-v2-7-with-sogs-support)

**Shader-based image transitions**
- Codrops has an OGL/GLSL tradition of displacement and image-transition shaders. — [Codrops OGL tutorials](https://tympanus.net/codrops/?p=82391). Index of Codrops WebGL tutorials: [tympanus.net/codrops/tag/webgl](https://tympanus.net/codrops/tag/webgl/) **[prior knowledge, not re-fetched]**

### Inferences
- **Recommended scroll stack for The Fold:** native scroll, with Lenis optional on desktop only. Use GSAP ScrollTrigger for pinned and choreographed sequences such as the building "fold" reveal and the scrubbed construction sequence. Use CSS `animation-timeline: view()` for small decorative reveals, wrapped in `@supports (animation-timeline: view())`, so that Firefox and older Samsung Internet just show static content.
- **Consider leaving Lenis off on touch devices.** Its defaults already leave touch scrolling native. Smooth scrolling adds input latency and battery cost on mid-range Android while adding little value there.
- **Image sequence vs video vs 3D:** for a "camera fly-around the tower" scrub, a pre-rendered image sequence (about 60–120 AVIF/WebP frames at mobile resolution, drawn to `<canvas>`) gives the most consistent results on low-end devices. Real-time 3D is the better choice for interactive tools (unit picker, sun study) on GPU tier 2+ devices.
- **Library choice:** three.js (MIT, largest ecosystem: GLTFLoader, KTX2, splats) for the hero 3D and the unit explorer; OGL for light 2D image-shader effects where three.js would be too heavy.
- **Do not depend on WebGPU.** Use WebGLRenderer, or WebGPURenderer with its WebGL2 fallback. Note that SuperSplat 3.0 being WebGPU-only does not affect delivery, because Spark and three.js render splats on WebGL2.
- **Gaussian splats** suit a captured site or show-apartment walkthrough. They should be **intent-loaded** (tap to explore) with a poster frame, never auto-loaded on mobile.

### Gaps
- I could not verify the current gzipped sizes of three.js (core), OGL, GSAP core plus ScrollTrigger, or Lenis. Check them on bundlephobia or pkg-size before setting a JS budget.
- I found no authoritative 2026 tutorial on interactive SVG floor plans or building stacks.
- I did not re-verify three.js r186 splat support or the SuperSplat 3.0 details against primary release notes; both come from RadianceFields.
- I found no hard numbers comparing Draco and Meshopt decode times on mid-range Android.
- I did not fetch canvas sun-path/shadow-study references. SunCalc (a small JS library for sun position) is the usual base **[prior knowledge, unverified: github.com/mourner/suncalc]**.

---

## 2. Performance budgets, Core Web Vitals, media formats, capability detection, and low-end Android / Indian networks

### Takeaway
Pass Core Web Vitals at the 75th percentile **on mobile**: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. Do this by keeping the first view light: an HTML/CSS hero, an AVIF image or poster, and no WebGL at load. Load 3D, splats and image sequences only on intent or proximity, gated by GPU tier detection (pmndrs `detect-gpu`, whose benchmark data stopped updating in December 2025).

### Cited Findings
- Core Web Vitals "good" thresholds: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1**, measured at the **75th percentile** of page loads and segmented by mobile and desktop. INP became a stable Core Web Vital in 2024, replacing FID. — [web.dev: Web Vitals](https://web.dev/articles/vitals)
- AVIF has **96.35% global support**: Chrome 85+, Edge 121+, Firefox 93+, Safari 16.4+ (16.1–16.3 partial) and Samsung Internet 14+. — [caniuse: AVIF](https://caniuse.com/avif)
- **detect-gpu** (now `@pmndrs/detect-gpu`, MIT, ESM-only) sorts GPUs into tiers from gfxbench scores:
  - Tier 0: no WebGL, blocklisted, or below 15fps.
  - Tier 1: at least 15fps.
  - Tier 2: at least 30fps.
  - Tier 3: at least 60fps.
  - Benchmark data loads from unpkg by default and can be **self-hosted** via `benchmarksURL`.
  - **The benchmark source stopped updating in December 2025** (issue #132), so GPUs released after that may be misclassified.
  - [GitHub: pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu)
- On three.js pixel ratio: a ratio of 2 renders 4× the pixels of a ratio of 1. Forum consensus is that no single maximum pixel ratio guarantees good performance. Suggested approaches: cap it (fractional values like 1.5 are valid), adapt it until frames reach about 55fps, and don't re-render static scenes every frame. — [three.js forum: Low fps on iOS with devicePixelRatio](https://discourse.threejs.org/t/low-fps-on-ios-mobile-with-pixel-ration-set-as-window-devicepixelratio/4963); [three.js forum: Low performance on mobile](https://discourse.threejs.org/t/animate-low-performance-on-mobile-with-window-devicepixelratio-resize/23628); [three.js forum: Why Android device is not good for WebGL](https://discourse.threejs.org/t/why-android-device-is-not-good-for-webgl/20878)
- Draw-call budgets like "about 50 draw calls on mobile" circulate online, but I found **no authoritative source** for them; profiling is the recommended first step. — [Defold forum discussion](https://forum.defold.com/t/engine-performance-on-older-mobile-devices-based-on-total-number-of-material-tags/78782/4)
- Indian mobile network speeds (latest data found; **no 2025–2026 Ookla figures were retrieved**):
  - Ookla's median mobile download for India was **96.38 Mbps in August 2024** (global median 55.80 Mbps). — [TelecomTalk](https://telecomtalk.info/india-falls-4-ranks-in-ooklas-speedtest-global-index-for-mobile-speeds)
  - In Q4 2023, median **5G** download was above 300 Mbps and median **4G** was about **18.93 Mbps**. — [Statista citing Ookla](https://statista.com/statistics/1496635/india-median-5g-and-4g-performance)
  - In August 2023, 5G was 316.24 Mbps and 4G was 14.97 Mbps. — [CXOToday citing Ookla](https://cxotoday.com/media-coverage/with-5g-india-takes-a-big-leap-in-mobile-speeds-ookla/)
- glTF-Transform supports WebP/AVIF/KTX2 textures and `resize`, `simplify` and `join` for meshes and draw calls. These are the levers for keeping a GLB light. — [gltf-transform.dev/cli](https://gltf-transform.dev/cli)
- Lenis drops to 30fps in Low Power Mode on Safari. — [Lenis README](https://github.com/darkroomengineering/lenis)

### Inferences
- **Design for the 4G median, not the national median.** The headline median includes 5G users. A buyer on congested 4G in North Bengaluru (Hebbal/Devanahalli corridor) could see about 15–20 Mbps with high latency. In-building and peri-urban coverage can be far worse.
- **Proposed budgets for the initial mobile load** (my starting point, not an industry standard):
  - About 150–200 KB of JS (gzipped) before interaction.
  - LCP hero image of 100 KB or less (AVIF, `fetchpriority="high"`, explicit width and height).
  - No WebGL or 3D in the critical path.
  - Fonts subset and `font-display: swap`, at most 2 families.
  - 3D GLB targets: 1.5–3 MB or less on mobile tier 1–2, with KTX2 textures and Meshopt geometry.
  - Splat targets: SOG/SPZ compressed, with LOD streaming via Spark 2.x.
- **Capability gating ladder:**
  1. Check `prefers-reduced-motion`, `navigator.connection.saveData` / `effectiveType` (Chromium only), and `navigator.deviceMemory` (Chromium only).
  2. Run detect-gpu (self-hosted benchmarks, which also avoids a third-party CDN dependency).
  3. Tier 0–1 or save-data: show static AVIF renders, a short H.264/AV1 video loop with a poster, and SVG plans.
  4. Tier 2: show the image sequence and a lightweight 3D model at DPR 1–1.5.
  5. Tier 3 desktop: full WebGL hero, splat walkthrough, shader transitions at DPR ≤ 2.
- **Video:** ship AV1 (or VP9) in WebM plus an H.264 MP4 fallback via `<source type>` ordering, always with a `poster` and `preload="none"` or `"metadata"` below the fold. Muted, `playsinline` autoplay only for short hero loops, and pause the video when it is offscreen with IntersectionObserver. **(AV1 hardware-decode share on Indian Android devices was not verified; see Gaps.)**
- **Responsive images:** use `<picture>` with AVIF → WebP → JPEG, `srcset`/`sizes`, and `loading="lazy"` everywhere except the LCP image. Architectural renders compress well in AVIF at moderate quality; tune per image.
- **CLS:** reserve aspect-ratio boxes for every canvas, video and image. Pinned ScrollTrigger sections should use `pinSpacing` so layout is computed ahead of time and doesn't shift late.
- **INP:** keep heavy work (GLB parsing, KTX2 transcoding, splat sorting) off the main thread. The three.js decoders and Spark already use workers/WASM. Avoid long tasks in scroll handlers.

### Gaps
- No 2025–2026 Ookla or Opensignal figures for India were retrieved, and no figure for latency or 4G/5G user split.
- No India-specific data on Android device mix, RAM distribution, or Samsung Internet vs Chrome share. Check StatCounter India and CrUX for the `IN` country.
- AV1 and H.265 hardware-decode support on mid-range Android was not verified; check the caniuse pages for `av1` and `hevc`.
- The web.dev text did not state numeric "needs improvement" and "poor" bands. From prior knowledge they are LCP > 4s, INP > 500ms and CLS > 0.25, but **this is unverified this session**.

---

## 3. Accessibility: reduced motion, keyboard/screen-reader access for floor plans, maps and 3D, focus, WCAG 2.2, scroll-jacking

### Takeaway
WCAG 2.2 adds three AA criteria that bear directly on interactive architecture UIs:
- **2.5.7 Dragging Movements**: every orbit, drag or pan needs a single-pointer alternative.
- **2.5.8 Target Size (Minimum)**: targets of at least 24×24 CSS px, which matters for small floor-plan rooms and unit hotspots.
- **2.4.11 Focus Not Obscured**: sticky headers and pinned scroll sections must not hide focused elements.

Every canvas or 3D experience needs a DOM or SVG equivalent that keyboard and screen-reader users can operate. Respect `prefers-reduced-motion`.

### Cited Findings
- WCAG 2.2 adds 9 success criteria: 2.4.11 Focus Not Obscured (Minimum, AA), 2.4.12 (Enhanced, AAA), 2.4.13 Focus Appearance (AAA), **2.5.7 Dragging Movements (AA)**, **2.5.8 Target Size Minimum (AA, 24×24 CSS px or sufficient spacing)**, 3.2.6 Consistent Help (A), 3.3.7 Redundant Entry (A), 3.3.8 Accessible Authentication Minimum (AA) and 3.3.9 (Enhanced, AAA). 4.1.1 Parsing is obsolete and removed. — [W3C WAI: What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- For Dragging Movements, the WAI example of a valid single-pointer alternative is up/down buttons. — [W3C WAI](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- Lenis honours reduced motion by default: it turns off smoothing and makes programmatic scrolls instant, but keeps its loop running so WebGL/DOM sync still works. The docs advise against opting out. — [Lenis README](https://github.com/darkroomengineering/lenis)
- Lenis keeps native scroll, so "browser accessibility behaviour keeps working". This is a key difference from transform-based scroll hijacking. — [Lenis README](https://github.com/darkroomengineering/lenis)
- Related WCAG criteria (2.1/2.2, unchanged): 2.3.3 Animation from Interactions (AAA), 2.2.2 Pause, Stop, Hide (A) for auto-playing motion longer than 5s, and 1.1.1 Non-text Content. — [WCAG 2.2 Understanding docs](https://www.w3.org/WAI/WCAG22/Understanding/) **[prior knowledge, not re-fetched]**
- `prefers-reduced-motion` media query reference: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) **[prior knowledge, not re-fetched]**

### Inferences
- **Floor plans (SVG):**
  - Make each room or unit a focusable element: a `<a>` or `<button>` inside the SVG, or an HTML button overlaid on the SVG.
  - Give each one an accessible name ("Bedroom 2, 3.4 by 3.9 metres") and the plan a `role="img"` group with `<title>`/`<desc>`.
  - **Also provide a plain HTML table or list of rooms and areas.** This serves screen-reader users and also sales-oriented buyers who want numbers (carpet area, RERA-format figures).
  - Hit areas need to be at least 24×24 CSS px at mobile zoom (2.5.8). Small rooms such as utility and powder rooms may need enlarged invisible hit areas or a list fallback.
- **Building stack / unit picker:** a grid of floors × units is semantically a table or a listbox. Add arrow-key navigation (roving tabindex), and announce availability and price changes in an `aria-live="polite"` region. Colour alone must not signal availability; add a text or icon state.
- **3D canvas / splat viewer:**
  - Give the canvas `role="img"` and an `aria-label`, or make it decorative.
  - Pair it with real buttons: "Rotate left/right", "Zoom", "Next view", and preset camera views ("Clubhouse", "Tower B, north face"). These satisfy 2.5.7.
  - Don't trap focus in the canvas, and keep `Esc` and Tab working.
  - Never make 3D the only route to information.
- **Sun-path/shadow study:** provide a range input (`<input type="range">`) for time of day and date. It is natively keyboard- and screen-reader-operable and satisfies 2.5.7 versus a drag-only dial. Also give a text summary ("Living room receives direct sun 7:30–10:45 am in December").
- **Scroll-jacking harm:**
  - Avoid scroll hijacking that changes the meaning of scroll distance, and avoid snap-locking.
  - Keep pinned sections short (≤ 2–3 viewport heights).
  - Make sure content exists in the DOM in reading order, not only inside canvas frames.
  - Provide skip links past long pinned sequences.
  - Under `prefers-reduced-motion: reduce`, replace scrubbed sequences with a static image plus a play button, disable parallax, and use simple fades or instant view transitions.
- **Focus Not Obscured (2.4.11):** sticky headers and fixed WebGL overlays should use `scroll-padding-top` so focused elements aren't covered.
- **Reduced motion and view transitions:** wrap `::view-transition-*` animations in `@media (prefers-reduced-motion: no-preference)`.

### Gaps
- I found no published accessibility case study of an interactive real-estate floor plan or building stack. These patterns come from general ARIA and WCAG guidance, not a vetted reference implementation.
- I did not fetch the WAI-ARIA Authoring Practices pages (grid, listbox, slider patterns): [APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) **[prior knowledge, not re-fetched]**.

---

## 4. Tailwind CSS v4 specifics and structuring a vanilla JS project (ES modules, Vite)

### Takeaway
Tailwind v4 (current docs show **v4.3**) is CSS-first: design tokens live as CSS custom properties defined in `@theme`. It requires modern browsers (Chrome 111, Safari 16.4, Firefox 128). That is acceptable for this audience, but it means very old Android WebViews and stock browsers get degraded styling. Vite plus native ES modules, with dynamic `import()` per interactive feature, is the natural structure without a framework.

### Cited Findings
- Tailwind v4 minimum browsers: **Chrome 111 (Mar 2023), Safari 16.4 (Mar 2023), Firefox 128 (Jul 2024)**. It depends on native CSS features (cascade layers, `color-mix()`, nesting, custom properties) rather than a preprocessor. — [Tailwind docs: Compatibility](https://tailwindcss.com/docs/compatibility)
- Theme values are exposed as CSS variables (for example `--text-base`, `--color-gray-700`, `--radius-lg`). Isolated CSS files reference the main stylesheet with `@reference "../app.css";` to use `@apply`. The docs version selector shows **v4.3**. — [Tailwind docs: Compatibility](https://tailwindcss.com/docs/compatibility)
- Newer utilities such as `field-sizing`, `@starting-style` and `text-wrap: balance` have limited support. The docs say to check caniuse and skip them if your targets lack support. — [Tailwind docs: Compatibility](https://tailwindcss.com/docs/compatibility)
- `@theme` syntax, built-in container queries (`@container`, `@sm:` variants) and the first-party Vite plugin (`@tailwindcss/vite`) are documented at [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme), [tailwindcss.com/docs/responsive-design#container-queries](https://tailwindcss.com/docs/responsive-design#container-queries) and [tailwindcss.com/docs/installation/using-vite](https://tailwindcss.com/docs/installation/using-vite) **[prior knowledge, not re-fetched]**

### Inferences
- **Design tokens:** define the Form & Field palette (for example laterite red, granite grey, Bengaluru-green), the type scale and spacing in `@theme`. They then exist both as Tailwind utilities and as plain CSS variables that JS can read (`getComputedStyle`), so SVG fills, canvas drawing and shader uniforms share one source of truth.
- **Container queries** fit components that sit in both a full-width section and a side panel, such as residence cards and floor-plan panels.
- **Suggested structure** (vanilla, multi-page, Vite as dev server and bundler):
  - `index.html`, `residences.html` and `the-fold.html` as Vite multi-page inputs. MPA navigation pairs well with cross-document view transitions.
  - `src/styles/app.css` (`@import "tailwindcss"; @theme {…}`).
  - `src/main.js`, which runs on every page: nav, IntersectionObserver-based lazy feature mounting, reduced-motion and capability flags.
  - `src/features/{hero-sequence,floorplan,stack,sunstudy,viewer3d,splat}.js`, each lazy-loaded with `import()` only when the matching `[data-feature]` element nears the viewport or the user taps "Explore in 3D". This keeps three.js and Spark out of the initial bundle.
  - `public/` holding self-hosted detect-gpu benchmarks, Draco/Basis decoders, GLBs, splats and image sequences, served with long cache headers.
- **The browser floor matches the Tailwind v4 floor.** Old Android 8–9 devices on outdated WebView/Chrome (below 111) will get degraded styling. If analytics show meaningful traffic from them, consider Tailwind v3.4 or a minimal fallback stylesheet.

### Gaps
- I did not re-fetch the Tailwind `@theme` and container-query pages this session.
- I found no data on Chrome/WebView versions below 111 among Indian Android users.

---

## 5. Best tutorials and learning resources

### Takeaway
Codrops (OGL/three.js/GSAP scroll and shader tutorials), the GSAP docs, the three.js docs and forum, glTF-Transform, MDN, web.dev and the Chrome for Developers blog are the core references. Bruno Simon's Three.js Journey is the standard paid course. Spark and RadianceFields cover splats.

### Cited Findings (verified this session)
- Codrops, "How to Build Cinematic 3D Scroll Experiences with GSAP" (Nov 2025): fixed canvas, ScrollSmoother, OGL atlas cylinder. — [tympanus.net](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/)
- Codrops, WebGL rotating image gallery with OGL and GLSL — [tympanus.net/codrops/?p=82391](https://tympanus.net/codrops/?p=82391)
- Codrops, infinite auto-scrolling WebGL gallery with OGL (2021) — [tympanus.net](https://tympanus.net/codrops/2021/01/05/creating-an-infinite-auto-scrolling-gallery-using-webgl-with-ogl-and-glsl-shaders/)
- GSAP licence, and Webflow's free-GSAP announcement — [gsap.com standard license](https://gsap.com/community/standard-license/); [webflow.com/blog/gsap-becomes-free](https://webflow.com/blog/gsap-becomes-free)
- Lenis — [github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)
- detect-gpu — [github.com/pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu)
- glTF-Transform CLI — [gltf-transform.dev/cli](https://gltf-transform.dev/cli)
- Spark (Gaussian splats for three.js) — [github.com/sparkjsdev/spark](https://github.com/sparkjsdev/spark)
- RadianceFields news on splat tooling — [radiancefields.com/platforms/three-js](https://radiancefields.com/platforms/three-js)
- web.dev: Web Vitals; WebGPU in major browsers; Interop 2026 — [vitals](https://web.dev/articles/vitals), [webgpu](https://web.dev/blog/webgpu-supported-major-browsers), [interop-2026](https://web.dev/blog/interop-2026)
- W3C WAI: What's new in WCAG 2.2 — [w3.org](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- Tailwind v4 compatibility — [tailwindcss.com/docs/compatibility](https://tailwindcss.com/docs/compatibility)
- three.js forum performance threads — [discourse.threejs.org](https://discourse.threejs.org/t/low-fps-on-ios-mobile-with-pixel-ration-set-as-window-devicepixelratio/4963)

### Cited Findings (canonical links from prior knowledge, NOT re-fetched this session)
- Three.js Journey (Bruno Simon's course) — https://threejs-journey.com/ ; Bruno Simon's portfolio — https://bruno-simon.com/
- Yuri Artiukh (Akella), live-coding WebGL/shader streams — https://www.youtube.com/@akella_ (handle not verified)
- three.js docs and examples — https://threejs.org/docs/ , https://threejs.org/examples/
- three.js manual, "Optimize lots of objects" / "Rendering on demand" — https://threejs.org/manual/
- GSAP ScrollTrigger docs — https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- MDN: View Transition API — https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- Chrome for Developers: View transitions — https://developer.chrome.com/docs/web-platform/view-transitions
- Scroll-driven animations demos (Bramus) — https://scroll-driven-animations.style/
- web.dev: Optimize LCP / responsive images — https://web.dev/articles/optimize-lcp
- Khronos glTF sample viewer and the KTX tooling — https://github.khronos.org/glTF-Sample-Viewer-Release/
- OGL — https://github.com/oframe/ogl
- SunCalc (sun position) — https://github.com/mourner/suncalc
- Awwwards real-estate category, for inspiration — https://www.awwwards.com/websites/real-estate/

### Inferences
- **Learning path for the build team:**
  1. MDN and web.dev fundamentals (CWV, images, view transitions).
  2. The GSAP ScrollTrigger docs and CodePens.
  3. The Codrops OGL/three.js scroll tutorials.
  4. Three.js Journey for 3D depth.
  5. glTF-Transform plus the KTX2/Meshopt pipeline.
  6. Spark docs for splats.

### Gaps
- I did not find a dedicated, current tutorial on scroll-scrubbed image sequences on canvas, or on accessible interactive SVG floor plans. A short in-house prototype may be needed to settle frame count and size budgets for Indian mid-range devices.
- The Akella channel handle and some of the canonical URLs above were not re-verified this session.
