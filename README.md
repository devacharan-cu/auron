# Auron / Rainfold

**A fictional portfolio concept.** Auron is an invented property developer, and Rainfold is its invented flagship: a scheme of 48 homes on the slopes of a shallow valley in North Bengaluru. Nothing on this site is an offer, a price, an availability claim or a K-RERA registration. Every drawing, residence, area, orientation and sun-hour figure is illustrative.

The creative direction: *the drawings carry the facts, the land carries the emotion.* A live architectural section shows where the sun reaches each home at any hour of three days of the year. A two-view locator (site plan and section) and the floor plans share one selection and one clock across the whole site.

## Stack

A static multi-page site: Vite 7, Tailwind CSS 4, vanilla ES modules and inline SVG. There is no framework and no WebGL, and nothing is sent to any server.

```sh
npm install
npm run dev       # http://localhost:5173/
npm run build     # writes dist/ (15 pages, including 404.html)
npm run preview   # serves dist/ with the production security headers from vercel.json
npm run images    # regrades assets/images-src/*.jpg into public/images/ and writes public/og.jpg
```

Set `SITE_URL=https://your-domain` when building to write canonical URLs and absolute `og:image` tags. On Vercel the production domain is used automatically.

## Where things are

- `reports/`: the creative direction (both rounds, written when the working names were Form & Field and The Fold) and `Site handoff.md`, which covers structure, performance rules and what remains untested.
- `research_notes/`: the research behind the direction.
- `partials/`: the masthead and footer, written into every page at build time (`vite.config.js`).
- `src/`: shared shell, one module per page, the light model, residence data and drawing components.
- `dev/viewports.html`: a dev-only harness that shows pages in fixed-width iframes. It is not part of the build.

## Image credits

The landscape photographs show the region as context. None of them is the site, which does not exist. All come from Wikimedia Commons, shown cropped and lightly colour-graded. Adapted CC BY-SA images are shared under the same licence.

| Plate | Photograph | Author | Licence |
|---|---|---|---|
| 01 | [Monsoon clouds over the Nandi Hills](https://commons.wikimedia.org/wiki/File:Monsoon_clouds_over_the_Nandi_Hills_India.jpg) (also used for the share image) | Harsha K R | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| 02 | [Jakkur Lake, Bangalore](https://commons.wikimedia.org/wiki/File:Jakkur_lake_Bangalore_.jpg) | Shankar Raman | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| 03 | [Clear sky Mountain](https://commons.wikimedia.org/wiki/File:Clear_sky_Mountain.jpg) | Lijith.l7 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| 04 | [Albizia saman, Raintree at Mysuru](https://commons.wikimedia.org/wiki/File:Albizia_saman_-_Raintree_at_Mysuru.jpg) | Vinayaraj | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| 05 | [Jakkur lake](https://commons.wikimedia.org/wiki/File:Jakkur_lake.JPG) | Manu.mohan | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| 06 | [N.W. view of Nandydroog](https://commons.wikimedia.org/wiki/File:N.W._view_of_Nandydroog_(North_West_view_of_Nandy_Droog)_(cropped).jpg), 1805 | J. W. Edy after R. H. Colebrooke | Public domain |
| 07 | [Hebbal Lake 2008](https://commons.wikimedia.org/wiki/File:Hebbal_Lake_2008.jpg) | Nagesh Kamath | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |

The site credits each image beside the photograph and again on `/record/#credits`. The source data is in `src/model/plates.json` and `public/images/credits.json`.

## Before any real use

A real project would need a registered developer and architect, a surveyed site, approvals and a K-RERA registration, along with areas measured to the RERA Act carpet-area definition, a commissioned daylight study and photography of the actual site. A proper trademark search would also be needed for both names. `reports/Site handoff.md` lists everything in full.
