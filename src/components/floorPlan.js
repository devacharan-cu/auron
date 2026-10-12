// Illustrative floor plan for a selected home, north up, oriented as on the site plan.
// The sun patch comes from the same section geometry as the living section, so the
// plan, the section and the clock all agree. Layouts are schematic placeholders.

import { s } from '../lib/geometry.js';
import { DEPTH, VERANDAH } from '../model/site.js';
import { SQFT_PER_M2 } from '../model/residences.js';

const W = 12; // frontage, north–south
const BACK = 0.4;
const FRONT = DEPTH - VERANDAH; // glazing line, u = 12.6

function rooms(r) {
  const four = r.bedrooms === 4;
  const list = [
    { name: 'Bedroom 2', u: [BACK, 6.4], y: [0, 3.9] },
    { name: 'Baths', u: [BACK, 6.4], y: [3.9, 5.6], small: true },
    { name: 'Entry', u: [BACK, 6.4], y: [5.6, 7.4], small: true },
    four
      ? { name: 'Kitchen', u: [BACK, 6.4], y: [7.4, 9.7] }
      : { name: 'Kitchen + utility', u: [BACK, 6.4], y: [7.4, 12] },
    { name: 'Bedroom 1', u: [6.6, FRONT], y: [0, 4.2] },
    { name: 'Living + dining', u: [6.6, FRONT], y: [4.2, 9] },
    { name: 'Bedroom 3', u: [6.6, FRONT], y: [9, 12] },
    { name: 'Verandah', u: [FRONT, DEPTH], y: [0, W], open: true },
  ];
  if (four) list.splice(4, 0, { name: 'Bedroom 4', u: [BACK, 6.4], y: [9.7, 12], small: true });
  return list;
}

const fmtArea = (m2, units) => (units === 'm2' ? `${Math.round(m2)} m²` : `${Math.round((m2 * SQFT_PER_M2) / 5) * 5} sq ft`);

const observers = new WeakMap();

export function renderFloorPlan(host, r, { runs = [], units = 'sqft', compact = false } = {}) {
  const west = r.flank === 'west'; // west terrace: back wall to the west, valley to the east
  const X = (u) => (west ? u : DEPTH - u);
  const Y = (y) => W - y; // svg y down, north up
  const garden = r.level === 0;
  const x0 = west ? -2.6 : -2.6 - (garden ? 3.2 : 0);
  const x1 = west ? DEPTH + 2.6 + (garden ? 3.2 : 0) : DEPTH + 2.6;
  const vb = { x: x0, y: -3.2, w: x1 - x0, h: W + 6.6 };

  const svg = s('svg', {
    class: 'fp',
    viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`,
    role: 'img',
    'aria-label': `Illustrative floor plan of ${r.label}: ${r.bedrooms} bedrooms, verandah on the ${west ? 'east' : 'west'} side facing the valley, entrance from the courtyard.`,
  });
  const rect = (u0, u1, y0, y1, attrs) => {
    const xa = X(u0), xb = X(u1);
    return s('rect', { x: Math.min(xa, xb), y: Y(y1), width: Math.abs(xb - xa), height: y1 - y0, ...attrs });
  };

  // private garden (garden level) beyond the verandah
  if (garden) {
    svg.append(rect(DEPTH, DEPTH + 3.2, 0, W, { class: 'fp-garden' }));
    const gx = X(DEPTH + 1.6);
    svg.append(s('text', { x: gx, y: Y(W / 2), class: 'fp-label fp-label--soft', 'text-anchor': 'middle', transform: `rotate(-90 ${gx} ${Y(W / 2)})` }, 'Private garden'));
  }

  // floor + sun patch (clipped to the floor)
  svg.append(rect(BACK, DEPTH, 0, W, { class: 'fp-floor' }));
  const sun = s('g', { class: 'fp-sun' });
  for (const run of runs) {
    const u0 = Math.max(BACK, run.u0);
    const u1 = Math.min(DEPTH, run.u1);
    if (u1 <= u0) continue;
    sun.append(rect(u0, u1, 0.15, W - 0.15, { style: `opacity:${(0.35 + 0.6 * run.k).toFixed(2)}` }));
  }
  svg.append(sun);

  // rooms: thin partitions + labels
  const list = rooms(r);
  for (const rm of list) {
    if (!rm.open) svg.append(rect(rm.u[0], rm.u[1], rm.y[0], rm.y[1], { class: 'fp-room' }));
    const cx = X((rm.u[0] + rm.u[1]) / 2);
    const cy = Y((rm.y[0] + rm.y[1]) / 2);
    const area = (rm.u[1] - rm.u[0]) * (rm.y[1] - rm.y[0]);
    if (rm.open) {
      svg.append(s('text', { x: cx, y: cy - 0.3, class: 'fp-label', 'text-anchor': 'middle', transform: `rotate(-90 ${cx} ${cy})` }, rm.name));
      svg.append(s('text', { x: cx, y: cy + 1.25, class: 'fp-area', 'text-anchor': 'middle', transform: `rotate(-90 ${cx} ${cy})` }, fmtArea(area, units)));
      continue;
    }
    svg.append(s('text', { x: cx, y: cy - (rm.small ? -0.35 : 0.15), class: `fp-label${rm.small ? ' fp-label--small' : ''}`, 'text-anchor': 'middle' }, rm.name));
    if (!rm.small) svg.append(s('text', { x: cx, y: cy + 1.25, class: 'fp-area', 'text-anchor': 'middle' }, fmtArea(area, units)));
  }

  // structure: back (courtyard) wall with entrance, party / end walls, glazing, verandah edge
  const wall = (u0, u1, y0, y1) => svg.append(rect(u0, u1, y0, y1, { class: 'fp-wall' }));
  wall(0, BACK, 0, 5.85);
  wall(0, BACK, 7.15, W);
  for (const side of [0, W]) {
    const y0 = side === 0 ? -0.25 : W;
    const y1 = side === 0 ? 0 : W + 0.25;
    const windowed = (side === W && r.aspect.includes('North')) || (side === 0 && r.aspect.includes('South'));
    if (windowed) {
      wall(0, 1.2, y0, y1);
      wall(5.2, 7.6, y0, y1);
      wall(11.4, FRONT, y0, y1);
      for (const [a, b] of [[1.2, 5.2], [7.6, 11.4]]) svg.append(rect(a, b, y0, y1, { class: 'fp-window' }));
    } else wall(0, FRONT, y0, y1);
  }
  // glazing to the verandah
  const gx = X(FRONT);
  svg.append(s('path', { d: `M${gx - 0.07} ${Y(0)}V${Y(W)}M${gx + 0.07} ${Y(0)}V${Y(W)}`, class: 'fp-glass' }));
  // verandah edge + eave line
  const ex = X(DEPTH);
  svg.append(s('path', { d: `M${ex} ${Y(0)}V${Y(W)}`, class: 'fp-edge' }));
  const eave = X(DEPTH + (r.faces === 'East' ? 0.9 : 0.6));
  svg.append(s('path', { d: `M${eave} ${Y(-0.25)}V${Y(W + 0.25)}`, class: 'fp-eave' }));
  if (r.faces === 'West') svg.append(rect(DEPTH - 0.12, DEPTH, 0, W, { class: 'fp-louvre' }));
  // entrance arrow from the courtyard
  const ax = X(-1.6);
  const ay = Y(6.5);
  // entrance arrow drawn as plain paths (SVG markers with screen-space strokes paint very slowly)
  const tip = X(-0.25);
  const dir = west ? 1 : -1;
  svg.append(s('path', { d: `M${ax} ${ay}L${tip - dir * 0.3} ${ay}`, class: 'fp-entry' }));
  svg.append(s('path', { d: `M${tip} ${ay}L${tip - dir * 0.5} ${ay - 0.28}L${tip - dir * 0.5} ${ay + 0.28}Z`, class: 'fp-arrowhead' }));
  if (r.level === 2) svg.append(s('text', { x: X(3.4), y: Y(6.5) + 1.4, class: 'fp-label fp-label--small', 'text-anchor': 'middle' }, '↑ roof terrace'));

  // orientation cues
  svg.append(s('text', { x: X(DEPTH), y: Y(W) - 1.1, class: 'fp-cue', 'text-anchor': west ? 'end' : 'start' }, west ? 'Valley →' : '← Valley'));
  svg.append(s('text', { x: X(0), y: Y(W) - 1.1, class: 'fp-cue', 'text-anchor': west ? 'start' : 'end' }, 'Courtyard'));
  // north arrow (small, top corner on the courtyard side)
  const nx = west ? x0 + 1.1 : x1 - 1.1;
  svg.append(s('path', { d: `M${nx} ${-2.35}l0.32 0.95l-0.32 -0.22l-0.32 0.22Z`, class: 'fp-north' }));
  svg.append(s('text', { x: nx, y: -2.55, class: 'fp-cue', 'text-anchor': 'middle' }, 'N'));

  // dimension strings
  const dy = W + 1.5;
  const dim = (a, b, txt) => {
    const xa = X(a), xb = X(b);
    const l = Math.min(xa, xb), rr = Math.max(xa, xb);
    svg.append(s('path', { d: `M${l} ${dy}H${rr}M${l} ${dy - 0.35}V${dy + 0.35}M${rr} ${dy - 0.35}V${dy + 0.35}`, class: 'fp-dim' }));
    svg.append(s('text', { x: (l + rr) / 2, y: dy - 0.45, class: 'fp-dimtext', 'text-anchor': 'middle' }, txt));
  };
  dim(0, 6.5, '6.5');
  dim(6.5, FRONT, '6.1');
  dim(FRONT, DEPTH, '3.4 m');
  const sx = west ? -1.5 : DEPTH + 1.5;
  svg.append(s('path', { d: `M${sx} ${Y(0)}V${Y(W)}M${sx - 0.35} ${Y(0)}H${sx + 0.35}M${sx - 0.35} ${Y(W)}H${sx + 0.35}`, class: 'fp-dim' }));
  svg.append(s('text', { x: sx - 0.45, y: Y(W / 2), class: 'fp-dimtext', 'text-anchor': 'middle', transform: `rotate(-90 ${sx - 0.45} ${Y(W / 2)})` }, '12.0 m'));

  host.replaceChildren(svg);
  const measure = () => svg.style.setProperty('--ppu', ((svg.getBoundingClientRect().width || 1) / vb.w).toFixed(3));
  observers.get(host)?.disconnect();
  const ro = new ResizeObserver(measure);
  ro.observe(svg);
  observers.set(host, ro);
  svg.classList.toggle('fp--compact', compact);
  measure();
  return svg;
}
