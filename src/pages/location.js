import { boot } from '../shell.js';
import '@fontsource/noto-sans-kannada/400.css';
import { s } from '../lib/geometry.js';

boot();

// Schematic regional map: approximate positions (equirectangular, km from 12.95° N, 77.50° E).
// Deliberately coarse; the concept area is a hatched zone, not a site.
const P = (lat, lon) => [(lon - 77.5) * 108.4, (lat - 12.95) * 111.2];
const places = [
  { n: 'Bengaluru centre', p: P(12.975, 77.607), k: 'city' },
  { n: 'Hebbal', p: P(13.044, 77.588), k: 'lake' },
  { n: 'Jakkur', p: P(13.083, 77.607), k: 'lake' },
  { n: 'Yelahanka', p: P(13.101, 77.596), k: 'town' },
  { n: 'Airport', p: P(13.199, 77.706), k: 'air' },
  { n: 'Devanahalli', p: P(13.248, 77.712), k: 'town' },
  { n: 'Nandi Hills', p: P(13.37, 77.683), k: 'hill' },
];
const road = [P(12.975, 77.607), P(13.044, 77.588), P(13.101, 77.596), P(13.16, 77.64), P(13.199, 77.69), P(13.248, 77.712)];
const metro = [P(13.044, 77.6), P(13.09, 77.63), P(13.14, 77.66), P(13.199, 77.703)];
const strr = [P(13.29, 77.54), P(13.27, 77.62), P(13.25, 77.712), P(13.2, 77.79)];
const d = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${(-y).toFixed(1)}`).join('L');

const svg = s('svg', { class: 'map', viewBox: '-1 -50 31 54', role: 'img', 'aria-label': 'Schematic map of North Bengaluru: the city centre in the south, Hebbal, Jakkur and Yelahanka to the north, the airport and Devanahalli further north-east, and the Nandi Hills on the northern edge. The concept area is a hatched zone between Yelahanka and the airport.' });
svg.append(s('defs', {}, [s('pattern', { id: 'map-hatch', width: 1.2, height: 1.2, patternUnits: 'userSpaceOnUse' }, [s('path', { d: 'M0 1.2L1.2 0', class: 'map-hatch' })])]));
svg.append(s('rect', { x: -1, y: -50, width: 31, height: 54, class: 'map-bg' }));
const [cx, cy] = P(13.15, 77.645);
svg.append(s('ellipse', { cx: cx.toFixed(1), cy: (-cy).toFixed(1), rx: 3.4, ry: 2.6, class: 'map-zone', fill: 'url(#map-hatch)' }));
svg.append(s('path', { d: d(road), class: 'map-road' }));
svg.append(s('path', { d: d(metro), class: 'map-metro' }));
svg.append(s('path', { d: d(strr), class: 'map-strr' }));
for (const pl of places) {
  const [x, y] = pl.p;
  if (pl.k === 'lake') svg.append(s('ellipse', { cx: x + 0.9, cy: -y, rx: 1.1, ry: 0.7, class: 'map-lake' }));
  if (pl.k === 'hill') svg.append(s('path', { d: `M${x - 2} ${-y + 0.8}Q${x} ${-y - 2.2} ${x + 2} ${-y + 0.8}`, class: 'map-hill' }));
  svg.append(s('circle', { cx: x, cy: -y, r: pl.k === 'city' ? 0.6 : 0.42, class: `map-dot map-dot--${pl.k}` }));
  svg.append(s('text', { x: x + 1.2, y: -y + 0.45, class: 'map-label' }, pl.n));
}
svg.append(s('text', { x: cx + 1.2, y: -cy + 4.4, 'text-anchor': 'middle', class: 'map-label map-label--zone' }, 'Rainfold, concept area'));
svg.append(s('text', { x: 20.6, y: -23.6, class: 'map-key map-key--metro' }, 'Blue Line (reported)'));
svg.append(s('text', { x: strr[0][0], y: -strr[0][1] - 1.1, class: 'map-key' }, 'STRR (reported)'));
// north + scale
svg.append(s('path', { d: 'M27 -45l0.9 2.4l-0.9 -0.6l-0.9 0.6Z', class: 'map-north' }));
svg.append(s('text', { x: 27, y: -45.8, 'text-anchor': 'middle', class: 'map-key' }, 'N'));
svg.append(s('path', { d: 'M1 2.4h10M1 1.9v1M11 1.9v1', class: 'map-scale' }));
svg.append(s('text', { x: 12, y: 2.9, class: 'map-key' }, 'about 10 km'));
document.getElementById('region-map').append(svg);
const measure = () => svg.style.setProperty('--ppu', ((svg.getBoundingClientRect().width || 1) / 31).toFixed(3));
new ResizeObserver(measure).observe(svg);
