# Immersive & Interactive 3D Property Experiences: Does 3D Earn Its Place on The Fold's Website?

Research scope: real examples of immersive or 3D architectural and property web experiences; evidence on whether 3D tours, virtual tours and interactive plans affect engagement or enquiries; costs and risks; lighter alternatives; and a verdict for "The Fold" (a fictional development by "Form & Field", North Bengaluru). Stack: HTML, Tailwind, vanilla JS, SVG, Canvas, WebGL.
Research date: October 2026. 15 search/fetch calls. Many sources are agency or vendor self-reports and are flagged as such.

---

## 1. Which 3D/immersive interactions actually help buyers understand a property, and which are spectacle?

### Takeaway
The interactions that help most answer a specific buyer question: where is my unit in the building, what does it face, how much sun does it get, what is nearby, and how is it laid out. These are the selector/stacking plan, the sun study, the contextual map and the floor plan. Cinematic flythroughs, cursor-reactive hero models and post-processing effects win awards but carry little decision information. The best-documented award winner in this category (ERA) puts its 3D effort into a map and a unit selector, not just a hero spectacle.

### Cited Findings

#### Example catalogue (live or documented)
Status key: **[V]** = page fetched or primary listing seen; **[S]** = seen only in search snippets or secondary reports; **[U]** = unverified.

1. **ERA residential complex, Vide Infra for developer Tekta.** Case study at https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl, project page at https://videinfra.com/work/era. **[V]**
   - What it does: a custom WebGL 3D district map with animated points of interest, a flowing river and particle "cars" on the road network; a "parametric selector" that filters apartments with animated floor selection on interactive building models; a cursor-reactive splash silhouette split into five depth layers; a "Road to home" flyover; a zoomable high-resolution render; and static 3D material models — [Vide Infra case study](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
   - Technology: Three.js with custom GLSL shaders, and post-processing (fisheye, chromatic aberration, anti-aliasing). The team used a simplified low-poly model with custom files holding only vertex coordinates to save weight. A solid traced model "was too heavy" and missed the glow they wanted, so they switched to **line-based rendering** — [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
   - Outcomes: Site of the Day at FWA, CSSDA and Awwwards. **No leads, sales or traffic figures are reported.** The case study notes that balancing WebGL's resource demands against a "lightweight, fast" site was "challenging", but gives no file sizes, mobile handling or fallback details — [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
   - Tone note: the team moved from a "glamorous Art Deco" look to a calmer, homelier one to suit a middle-class audience — [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
2. **Silver Pinewood Residences, Vide Infra.** Listed as Awwwards Site of the Day on 9 Oct 2025 with a Developer Award — [Awwwards residential nominees](https://www.awwwards.com/inspiration_search/residential/). **[S]** Interaction details were not verified.
3. **Horizonte Village, The First The Last.** Listed as Awwwards Site of the Day on 16 Mar 2025 with a Developer Award — [Awwwards residential nominees](https://www.awwwards.com/inspiration_search/residential/). **[S]** Interaction details were not verified.
4. **25 Residences (Mumbai), Unseen Studio.** https://25residences.com/ **[V]** (Awwwards listing)
   - Awwwards Site of the Day, 13 Jan 2025, overall 7.31/10. Usability scored lowest at 7.06; the Developer Award scored 7.46, with Animations 7.80, Accessibility 7.40 and WPO (performance) 7.20 — [Awwwards](https://www.awwwards.com/sites/25-residences)
   - Tagged "Architecture, Luxury, Animation, 3D". The listing does not name WebGL or three.js and does not describe the specific interactions — [Awwwards](https://www.awwwards.com/sites/25-residences)
   - Relevance: this is the closest Indian luxury-residential, award-level peer.
5. **Hubtown, Unseen Studio.** Reported as an Awwwards Site of the Day in June 2026 for an Indian real-estate brand, described as "a 3D monolith over a reflective landscape" — search summary only. **[U]** I could not verify the technology or whether it includes a building explorer.
6. **Tiny Villa 3D Website.** Awwwards Honorable Mention, 30 Apr 2025 — [Awwwards](https://www.awwwards.com/sites/tiny-villa-3d-website). Also listed as a "no-code" 3D WebGL real-estate experience — [Awwwards inspiration](https://www.awwwards.com/inspiration/3d-website-webgl-real-estate-experience-tinyvilla-no-code-3d-website). **[S]**
7. **Real Estate Threejs Demo, Anderson Mancini.** A Three.js landing-page demo with an Awwwards Honorable Mention, 4 Mar 2022 — [Awwwards](https://www.awwwards.com/sites/real-estate-threejs-demo). **[S]** It is a concept, not a live sales site.
8. **Real Estate 3D Interactive Map** (Honorable Mention) — [Awwwards](https://www.awwwards.com/sites/real-estate-3d-interactive-map). **VILLA – 3D Immersive Property** (Nominee) — [Awwwards](https://www.awwwards.com/sites/villa-3d-immersive-property). **[S]** Details were not verified.
9. **Zillow SkyTour (Gaussian splatting).** Drone-captured exterior and neighbourhood scenes rendered as Gaussian splats on eligible Zillow Showcase listings, in the mobile apps and on the web — [LiDAR News](https://lidarnews.com/zillow-3d-tours-with-gaussian-splatting/); [Inman, Nov 2025](https://www.inman.com/2025/11/25/zillows-skytour-uses-complex-3d-tech-to-simplify-home-search/). **[S]**
   - Reported to have launched in July 2025 with more views, saves and shares. These are Zillow's own figures and come via a secondary source — [Utsubo guide](https://www.utsubo.com/blog/gaussian-splatting-guide). **[S]**
   - Realtor.com reportedly added a similar feature in October 2025. **[U]** This rests on a single secondary mention.
10. **Matterport-style point-to-point tours.** The industry-standard capture-based tour of built spaces — [Matterport](https://matterport.com/learn/real-estate-marketing/virtual-open-house). Gaussian-splat vendors claim splats give smoother navigation than Matterport's "point-to-point jumps" — [Utsubo, CRE splatting](https://www.utsubo.com/blog/gaussian-splatting-commercial-real-estate). This is vendor opinion.
11. **Shadowmap Studio (sun and shadow study).** https://studio.shadowmap.org/ **[S]**
    - A web-based interactive 3D app that shows a property's sunlight at any time of day or year. Agents can share it as a link or embed it in their own sites. Developers can upload custom 3D models into its global 3D map — [Shadowmap Studio](https://studio.shadowmap.org/); [Shadowmap real estate](https://shadowmap.org/real-estate)
    - Its argument: "nearby buildings, terrain or trees may keep the property from receiving any sun" — [Shadowmap blog](https://shadowmap.org/blog/shed-light-on-your-real-estate-offerings)
    - It uses open 3D databases. There is no independent accuracy review and no pricing was found.
12. **PropVR digital twins for DAMAC Properties (Unreal Engine).** An Epic spotlight claims DAMAC "boost[ed] conversions from $24 million to $400 million" — [Unreal Engine spotlight](https://www.unrealengine.com/en-US/spotlights/propvrs-digital-twins-help-real-estate-developer-boost-revenue-by-10x)
    - The platform runs on VR, AR, web and touchscreen. **[S]** The page returned HTTP 403, so the time frame and attribution method could not be checked. Treat the figure as vendor marketing; see section 2.
13. **Away Digital Home (Unreal Engine, Pixel Streaming).** Buyers walk through a photoreal model of a future home and choose elevations, floor plans and materials — [Unreal Engine spotlight](https://www.unrealengine.com/spotlights/shaping-the-future-of-home-building-and-real-estate-sales-with-unreal-engine). **[S]** No conversion data.
14. **Radical Galaxy, AWS-hosted Pixel Streaming sessions.** Used for a mixed-use masterplan: remote stakeholders "walked through the master plan, viewing different apartment layouts" live — [Radical Galaxy](https://radicalgalaxy.com/real-time-visualization-with-unreal-engine-and-pixel-streaming/). **[S]** No sales figures.
15. **Raghava Halo, UE 5.6 Pixel Streaming.** Presented on the Unreal forum as an "interactive real estate sales experience" — [Unreal forums](https://forums.unrealengine.com/t/raghava-halo-interactive-real-estate-sales-experience-unreal-engine-5-6-pixel-streaming/2735885). **[S/U]** Only the title was seen. It is probably an Indian (Hyderabad-area) developer, but that is unverified.
16. **Other touchscreen and sales-suite vendors.**
    - Comunica3d's UE4 app for Raffaela Tower (Brazil, 22 units) on a large touchscreen: explode floors to see units, then walk through in first person. **[S]**
    - 3D Estate (Poland) claims it has built interactive 3D for "over 30% of all new build homes in Poland". This is a reach claim, not conversion.
    - Visengine's interactive masterplan/stacking app runs standalone on PCs, touch screens and kiosks. Its FAQ says web streaming of Unreal "is possible, but extra hosting and streaming requirements must be considered" — [Visengine](https://visengine.com/interactive-masterplan-application/); [Arcware real estate](https://www.arcware.com/industry/real-estate)
    - "Spacio", named in the brief, could not be found in search. **[U]**

#### Useful vs. spectacle (evidence-anchored)
- **Buyers rate floor plans well above virtual tours.** A secondary summary of NAR Generational Trends 2025 gives "very useful" ratings of photos 83%, detailed property information 79%, floor plans 57%, agent contact 47% and virtual tours 41% — [nowbam summary](https://nowbam.com/88-of-home-buyers-still-rely-on-agents-nar-2025-report-finds/); [Coradvisors](https://www.coradvisors.net/2026/02/virtual-home-tours-popularity-in-real-estate-2026.html)
  - Another source gives virtual tours as 38%, and the 2022 edition had floor plans at 55% and virtual tours at 43% — [F8RE newsletter](https://www.f8re.com/post/f8-focus-newsletter-june-2022)
  - The secondary sources disagree slightly. The ordering (photos > info > floor plans > virtual tours) is consistent.
- **Zillow's 2021 Consumer Housing Trends survey.**
  - 79% of buyers are more likely to view a home if the listing has a floor plan they like.
  - 74% agree a dynamic floor plan helps them decide whether a home is right for them.
  - 74% say 3D tours give a better feel for space than photos, though another write-up says 68%.
  - The survey was fielded March–August 2021 — [homediary / Zillow summaries](https://homediary.com/pro/?p=54938); [Inman 2022](https://inman.com/2022/06/15/zillow-set-to-debut-ai-generated-floor-plans-in-bid-to-boost-browsing)
- **Sun and light are decision variables.** Shadowmap's commercial pitch rests on surrounding obstructions determining actual sun exposure — [Shadowmap blog](https://shadowmap.org/blog/shed-light-on-your-real-estate-offerings)
- **Spectacle elements in the ERA build:** fisheye, chromatic aberration, a cursor-reactive hero and a starry parallax "Road to home" flyover — [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl). None is tied to a buyer question.

### Inferences
- **Information-bearing interactions** (worth building for The Fold):
  - unit-in-building locator or stacking plan;
  - orientation and view cone per unit;
  - sun-path / light study by season and time;
  - neighbourhood map with travel times;
  - interactive floor plan with dimensions;
  - amenity locator.
  Each maps to a question buyers ask before enquiring.
- **Spectacle interactions** (low decision value):
  - free-orbit hero models;
  - cursor parallax on silhouettes;
  - camera flythroughs;
  - lens and post-processing effects;
  - first-person walkthroughs of rendered interiors.
  They aid brand memorability, not understanding.
- **What to learn from each example:**
  - ERA: put the 3D budget into a map plus a selector, and use line rendering to save weight while looking crafted.
  - Shadowmap: light as a time-scrubbable variable.
  - 25 Residences: Indian luxury tone can win Site of the Day.
  - Zillow: splats for real built context.
- **What not to copy:**
  - ERA's fisheye and chromatic aberration (it dates fast and fights a "calm premium" tone).
  - Pixel-streamed Unreal walkthroughs (server cost per concurrent user; heavy for a fictional brand).
  - Gaussian-splat or Matterport tours (they need a real, built, captured space, which The Fold does not have).
  - Shadowmap-style geo-accurate sun simulation (it implies real-world accuracy about a building that does not exist).

### Gaps
- No live URLs were confirmed for ERA, Silver Pinewood or Horizonte Village; only the agency and Awwwards listings were seen.
- The specific interactions of 25 Residences and Hubtown were not verified.
- Spacio, and the agencies named in the brief (Active Theory, Immersive Garden, Lusion, Dogstudio, Resn, 14islands, Luxigon), returned no property-specific 3D web examples within the search budget. Their involvement in residential 3D sites is **unverified**, and none should be cited without checking.

---

## 2. What evidence exists on 3D tours, virtual tours or interactive floor plans affecting engagement or enquiries?

### Takeaway
The evidence is thin and almost all self-reported by platforms or vendors. It is correlational, mostly from 2020–2021, and concerns resale listings with tours of real homes, not off-plan developer websites. No independent A/B or conversion study of an interactive 3D developer website was found, and no NN/g study on 3D property tours was found. The most robust signal, from buyer surveys, is that floor plans and photos matter more to buyers than virtual tours.

### Cited Findings
- **Zillow 3D Home listings (Zillow's own data):**
  - sold about 10% faster (as of May 2020);
  - were saved 32% more and got 29% more views;
  - a later Zillow figure says they were 22% more likely to sell within 30 days.
  These are self-reported, correlational and possibly confounded by price or quality — [Zillow stats via We Get Around](https://forum.we-get-around.com/topic/14259/zillow-stats-buyers-saved-listings-with-3d-home-tours-32-more-often-/); [Domino](https://www.domino.com/content/3d-home-tour-listing-zillow/)
- **Zillow Showcase listings** are "20% more likely to secure an accepted offer within 14 days" (2024). Showcase is a bundled premium format, not a 3D-only treatment — [Zillow PR via Seeking Alpha](https://seekingalpha.com/pr/19688842-showcase-listings-on-zillow-are-more-than-just-cutting-edge-featured-homes-sell-faster-and)
- **Matterport** claims homes sell about 20% faster. This is a vendor claim — [search summary; Matterport](https://matterport.com/learn/real-estate-marketing/virtual-open-house)
- **PropVR / DAMAC:** "boost conversions from $24 million to $400 million", described as "10x revenue". The time frame, attribution and baseline could not be verified because the page returned 403. This is a vendor and Epic marketing claim and should not be cited as causal — [Unreal Engine spotlight](https://www.unrealengine.com/en-US/spotlights/propvrs-digital-twins-help-real-estate-developer-boost-revenue-by-10x)
- **Plaza by Bizzlogic** claims its immersive experiences "accelerate approvals by 6 months and dramatically increase buyer engagement". This is unverified vendor marketing — [search summary]. No URL was retained, so treat it as **unverified**.
- **3D product-viewer engagement from e-commerce vendors:**
  - "90% of users that activate a 3D viewer spend at least 10 seconds" interacting;
  - "82% of visitors opt to view a product in 3D" (Cappasity).
  Both come from vendors selling 3D — [Emersya](https://emersya.com/en/articles/great-product-imagery-is-key-for-online-shoppers); [3DSource](https://3dsource.com/blog/360-product-views-for-ecommerce)
- **NAR buyer usefulness ratings:** floor plans 57% vs virtual tours 41% "very useful" (2025 Generational Trends, per a secondary summary) — [nowbam](https://nowbam.com/88-of-home-buyers-still-rely-on-agents-nar-2025-report-finds/)
- **Floor plans are under-supplied.** Fewer than 20% of listings in Austin, Seattle and Raleigh had a visible floor plan on Zillow (July 2025 data) — [Zillow floor-plan search summary; homediary](https://homediary.com/pro/?p=41065)
- **Award-winning 3D developer sites report awards, not business outcomes.** ERA's case study gives no lead or sales metrics — [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
- **Unreal and pixel-streaming case studies** (Away, Radical Galaxy) report no conversion data — [Unreal spotlight](https://www.unrealengine.com/spotlights/shaping-the-future-of-home-building-and-real-estate-sales-with-unreal-engine); [Radical Galaxy](https://radicalgalaxy.com/real-time-visualization-with-unreal-engine-and-pixel-streaming/)
- **Parallax and scroll motion research** (closest proxy for scroll-driven 3D):
  - A Purdue thesis found parallax "did not significantly improve overall user experience" but enhanced some aspects — [Purdue](https://docs.lib.purdue.edu/cgttheses/27/)
  - A Journal of Usability Studies paper found the parallax site felt more fun, but two participants "suffered motion sickness and experienced significant usability issues" — [UXPA Journal](https://uxpajournal.org/?p=2505)
  - An OsloMet thesis found no significant difference in task time, errors or opinion, though users slightly preferred parallax — [OsloMet](https://oda.oslomet.no/oda-xmlui/handle/11250/2832354)

### Inferences
- The defensible claim is: "buyers value floor plans, photos and spatial understanding; 3D tours correlate with more saves and views on listing portals." The claim "interactive 3D increases enquiries on a developer site" is **not supported** by independent evidence found.
- Off-plan 3D (a model of an unbuilt building) is a different treatment from a capture-based tour of a real home. Zillow and Matterport numbers do not transfer directly.
- Vendor "10x" claims (DAMAC) mix in sales-gallery process, market cycle and marketing spend. They should not be used to justify budget.

### Gaps
- No NN/g or Baymard article specifically on 3D property tours, interactive floor plans, or WebGL hero experiences was found within the search budget. NN/g's general guidance on scrolljacking or animation was not retrieved directly.
- No India-specific data (e.g. ANAROCK, Knight Frank India, 99acres or MagicBricks) on virtual tours' effect on enquiries was found.
- The NAR 2025 Profile primary PDF was not retrieved, so the figures rely on secondary summaries that disagree slightly (41% vs 38%).

---

## 3. What are the costs and risks, and what is the specific risk for a fictional development?

### Takeaway
Real-time 3D adds weight, GPU and battery load, and accessibility obligations. It also adds ongoing maintenance, and in a pixel-streamed setup, per-session server cost. For a fictional project the biggest risk is credibility, not performance: an invented 3D model implies facts that do not exist, such as exact views, sun hours, floor heights and unit positions. A low-fidelity model reads as fake, and a high-fidelity one reads as a promise.

### Cited Findings
- **Weight vs. performance is the central tension.**
  - Vide Infra called balancing WebGL resource demands with a fast site "challenging".
  - The team reduced vertices and dropped a heavy solid model in favour of line rendering.
  - No mobile fallback was documented.
  — [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
- **Award-level sites still score lower on usability and performance than on visuals.** 25 Residences scored Usability 7.06 and WPO 7.20, against Animations 7.80 — [Awwwards](https://www.awwwards.com/sites/25-residences)
- **Pixel streaming needs extra hosting and streaming infrastructure.** Visengine: web streaming of Unreal "is possible, but extra hosting and streaming requirements must be considered" — [Visengine](https://visengine.com/interactive-masterplan-application/). AV1 support reduces bitrate — [search summary of Arcware/Unreal docs](https://www.arcware.com/industry/real-estate)
- **Cost benchmarks (vendor figures, unverified):** professional Gaussian-splat capture costs $500–$5,000+, and custom web viewers $5,000–$50,000+ — [Utsubo](https://www.utsubo.com/blog/gaussian-splatting-guide)
- **Motion sickness and accessibility.**
  - WCAG 2.3.3 (AAA) covers motion triggered by interaction, including scrolling. Sufficient techniques are `prefers-reduced-motion` in CSS (C39) and in JS (SCR40), or a user toggle.
  - Disabling parallax must not hide content.
  - Motion is "essential" only if removing it changes information that cannot be conveyed another way.
  — [W3C Understanding 2.3.3](https://w3c.github.io/wcag/understanding/animation-from-interactions.html); [Deque](https://dequeuniversity.com/resources/wcag2.1/2.3.3-animations-from-interactions)
- **Documented motion sickness in parallax testing:** two participants in the JUS study were affected — [UXPA Journal](https://uxpajournal.org/?p=2505)
- **Scrolljacking** is called "a classic anti-pattern that penalizes power users who skim, scan, and navigate at speed" (practitioner opinion) — [WebdesignerDepot](https://webdesignerdepot.com/how-scrolljacking-breaks-ux-fundamentals/)
- **Capture-based techniques need a real built space.** Zillow SkyTour uses drone capture of real exteriors — [LiDAR News](https://lidarnews.com/zillow-3d-tours-with-gaussian-splatting/). Matterport scans real interiors — [Matterport](https://matterport.com/learn/real-estate-marketing/virtual-open-house)
- **Sun studies depend on real surrounding geometry.** Shadowmap uses open 3D city data and stresses that neighbouring buildings and trees determine sun — [Shadowmap blog](https://shadowmap.org/blog/shed-light-on-your-real-estate-offerings)

### Inferences
- **Fictional-project risks, specific to The Fold:**
  - **No BIM/CAD exists.** Any 3D model must be authored from scratch, which costs modelling time and reads as a generic or "uncanny" massing unless stylised deliberately.
  - **Implied claims.** A geo-placed, photoreal model with a sun simulator and "view from unit 12B" suggests real-world facts. For a portfolio piece this misleads less than it would commercially, but it still invites scrutiny ("where exactly is this?"). Stylised, diagrammatic 3D signals "concept" honestly.
  - **No capture possible.** Gaussian splats, Matterport and drone photogrammetry are ruled out because nothing is built.
  - **Maintenance.** A real developer would need the model to track inventory and design changes. For a portfolio concept this is moot, but it is worth noting as a real-world cost.
- **Mobile.** Indian buyers browse heavily on mid-range Android phones (an inference; I found no source in this budget). A WebGL scene that is fine on a desktop GPU can drain battery and drop frames there. Plan a static or SVG fallback as the default, not the exception.
- **Accessibility.** Any 3D that carries information, such as the unit locator or orientation, needs an equivalent non-3D path: a list or table, SVG and text. Decorative camera motion must respect `prefers-reduced-motion` and a visible toggle.

### Gaps
- No quantified data was found on WebGL battery drain, mobile GPU frame rates, or Core Web Vitals impact for real-estate 3D sites.
- No source was found on Indian advertising and RERA rules for depicting unbuilt projects in 3D or with "artist's impression" disclaimers. This should be checked separately if realism is pursued.
- No research was found on the "uncanny" low-fidelity architectural model effect.

---

## 4. What lighter-weight alternatives deliver most of the value?

### Takeaway
Most buyer value (unit position, orientation, light, layout, neighbourhood) can be delivered with SVG, Canvas 2D and pre-rendered imagery. These are cheaper, accessible by default, and work on low-end phones. ERA itself moved toward line-based, lightweight rendering, which supports a stylised, diagrammatic aesthetic as both an aesthetic and a performance choice.

### Cited Findings
- **Line rendering was chosen for weight and look.** ERA's team found a solid model "too heavy" and switched to lines, and used vertex-only custom files and a simplified low-poly model — [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
- **Mid-weight unit selectors already exist.** Sales-suite apps show the "explode floors to see units" interaction (Raffaela Tower), and parametric filter-plus-floor-highlight selectors are the core of ERA — [Unreal/related search results](https://www.unrealengine.com/spotlights/shaping-the-future-of-home-building-and-real-estate-sales-with-unreal-engine); [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
- **Floor plans beat tours on usefulness.** Floor plans are rated "very useful" more often than virtual tours (57% vs 41%) — [nowbam](https://nowbam.com/88-of-home-buyers-still-rely-on-agents-nar-2025-report-finds/). 74% say a dynamic floor plan helps them decide — [homediary](https://homediary.com/pro/?p=54938)
- **Time-of-day light is the core of the sun-study proposition** — [Shadowmap Studio](https://studio.shadowmap.org/)
- **Low-end alternatives are acceptable within WCAG.** WCAG allows motion to be turned off and requires content to remain reachable — [W3C](https://w3c.github.io/wcag/understanding/animation-from-interactions.html)

### Inferences
Alternatives ranked by value per unit of cost for The Fold:
1. **SVG isometric stacking plan / unit locator.** Hover or tap a floor, then a unit; it highlights position, orientation arrow and status. It is accessible (focusable SVG with a text table twin), very light, and crisp at any DPI. It captures most of ERA's selector value.
2. **Interactive SVG floor plan.** Room dimensions on tap, furniture toggle, and a compass rose. This has the highest evidence of buyer value.
3. **Canvas 2D or SVG sun-path / light study.** A plan-view diagram showing sun arc and shadow wedges by season and time slider, over the unit plan or site plan. It should be diagrammatic, not a geo-accurate simulation, to avoid false precision. North Bengaluru's latitude (about 13°N) means a high sun and a strong east/west exposure story; verify the solar geometry if used.
4. **Scroll-scrubbed image sequence.** A pre-rendered 60–120 frame sequence of the building "folding" or a slow orbit, drawn to canvas. It gives a cinematic feel without real-time 3D, needs a reduced-motion poster frame, and keeps weight manageable with AVIF/WebP and lazy loading.
5. **2.5D layered imagery.** Depth-separated render layers with subtle parallax, as in ERA's five-part silhouette. It is cheap, but decorative only, so keep it subtle and turn it off under reduced motion.
6. **Stylised low-poly or line-drawing WebGL massing.** One optional, restrained scene, discussed in section 5.
7. **SVG/Canvas neighbourhood map.** A stylised map with travel-time rings to the airport, Manyata Tech Park, schools and so on. It does not need a 3D city.

### Gaps
- No case studies were found that A/B-test SVG stacking plans against WebGL selectors, or image sequences against real-time 3D.
- No Codrops or three.js forum examples were retrieved within budget. Technique references (line rendering, image-sequence scrubbing, isometric SVG) are inferences from practice, not cited sources.

---

## 5. Verdict: should The Fold have an interactive 3D experience, and in what restrained form?

### Takeaway
**Yes, but only one small, purposeful 3D moment, and never as a gate to content.** The core of the site should be lightweight SVG and Canvas tools that answer buyer questions: unit locator, floor plan, light study and neighbourhood. An optional, stylised line-drawn WebGL massing model can earn its place only if it does a job (orienting the building and locating a unit) rather than serving as a hero spectacle. Photoreal walkthroughs, splats, pixel streaming and geo-accurate sun simulation should be avoided because The Fold is fictional.

### Cited Findings
- The strongest award-winning precedent (ERA) spent its 3D effort on a map and a unit selector, and chose line rendering for performance — [Vide Infra](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
- Buyers rate floor plans above virtual tours — [nowbam / NAR summary](https://nowbam.com/88-of-home-buyers-still-rely-on-agents-nar-2025-report-finds/); [homediary / Zillow](https://homediary.com/pro/?p=54938)
- The only quantified 3D benefits are self-reported and correlational, from resale portals — [Zillow via We Get Around](https://forum.we-get-around.com/topic/14259/zillow-stats-buyers-saved-listings-with-3d-home-tours-32-more-often-/)
- Motion must be controllable (WCAG 2.3.3 techniques) — [W3C](https://w3c.github.io/wcag/understanding/animation-from-interactions.html). Parallax caused motion sickness in some test users — [UXPA Journal](https://uxpajournal.org/?p=2505)
- Capture-based 3D needs a built building — [LiDAR News](https://lidarnews.com/zillow-3d-tours-with-gaussian-splatting/)
- An Indian luxury-residential peer (25 Residences, Mumbai) won Site of the Day with animation and 3D, but scored lowest on usability — [Awwwards](https://www.awwwards.com/sites/25-residences)

### Inferences (recommended direction)
- **Do:**
  - **One "Fold" model.** A stylised, monochrome **line-drawing or flat-shaded low-poly massing** in WebGL (three.js or raw WebGL).
    - It loads after first paint and only on capable devices or on explicit tap ("Explore the building").
    - It has an **SVG isometric fallback** as the default on mobile and under reduced motion.
    - It does one thing: rotate gently to show orientation (compass, sun arc), and highlight a selected floor or unit fed from the same data as the SVG stacking plan.
    - The camera is constrained (no free fly, a limited orbit arc), with no post-processing lens effects.
  - **SVG stacking plan + floor plans** as the primary, accessible tool, with a text/table equivalent.
  - **Diagrammatic light study** (Canvas or SVG, time slider) on the unit plan. Label it as illustrative, not a simulation.
  - **Optional scroll-scrubbed image sequence** for the brand narrative of "the fold". It is short, skippable, and has a poster frame under reduced motion. Do not scrolljack.
  - **Stylised neighbourhood map** (SVG) with travel times.
  - **Budget guardrails:**
    - nothing 3D on the critical rendering path;
    - the hero should be readable and the CTA usable with JS/WebGL disabled;
    - honour `prefers-reduced-motion` plus a visible motion toggle;
    - every 3D insight is duplicated in text.
- **Don't:**
  - photoreal interior walkthroughs (uncanny, and implies built finishes);
  - Gaussian splats or Matterport (nothing to capture);
  - Unreal pixel streaming (server cost, overkill);
  - geo-accurate Shadowmap-style sun simulation or "real view from unit" claims (false precision for a fictional site);
  - fisheye, chromatic aberration or starfield flythroughs (ERA's spectacle layer);
  - 3D-gated navigation or long preloaders.
- **Why this works for a premium brand:** restraint and clarity read as confidence. A diagrammatic, architect's-drawing aesthetic is honest about being a concept, fits "Form & Field", and avoids the low-fidelity-render problem. It also showcases craft (SVG/Canvas/WebGL skill) without the evidence-free bet that heavy 3D drives enquiries.

### Gaps
- No direct evidence compares enquiry rates for restrained vs. heavy 3D on developer sites. The verdict rests on buyer-preference surveys, accessibility standards and practitioner case studies, not on conversion experiments.
- Indian buyer device mix and network conditions for premium Bengaluru residential were not researched here and should inform the performance budget.
