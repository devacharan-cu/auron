// Site plan, north up. Shares the terraces, the time of day and the selection with the section.
// Plan shadows use the full sun vector (including its north–south component), so the
// June-solstice sun north of overhead is visible here even though the section can't show it.

import { TERRACES, UNITS, FLOOR, VERANDAH, SECTION_CUT_Y, PLAN_Y, meander, flankOffsetAt } from '../model/site.js';
import { s, clamp } from '../lib/geometry.js';

const VB = { x: -74, y: -PLAN_Y - 3, w: 148, h: (PLAN_Y + 3) * 2 + 6 };

function rectPts(x0, y0, x1, y1) {
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
}

function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const pt of p) {
    while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), pt) <= 0) lower.pop();
    lower.push(pt);
  }
  const upper = [];
  for (const pt of p.reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), pt) <= 0) upper.pop();
    upper.push(pt);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// plan coordinates: x = east, y = north; SVG flips y
const P = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(2)} ${(-y).toFixed(2)}`).join('L') + 'Z';
const L = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(2)} ${(-y).toFixed(2)}`).join('L');

export function createSitePlan(host, { onSelect, variant = 'locator', markers = [], flow = variant === 'landscape' } = {}) {
  const landscape = variant !== 'locator';
  const pid = `plan${Math.random().toString(36).slice(2, 7)}`;
  const svg = s('svg', {
    class: `plan plan--${variant}`,
    viewBox: `${VB.x} ${VB.y} ${VB.w} ${VB.h}`,
    role: 'group',
    'aria-label': 'Site plan, north up: the valley runs north–south with the rain garden along its floor; four terraces of homes line its west and east slopes.',
  });
  const defs = s('defs', {}, [
    s('clipPath', { id: `${pid}-site` }, [s('rect', { x: -70, y: -PLAN_Y, width: 140, height: PLAN_Y * 2 })]),
  ]);
  svg.append(defs);
  svg.append(s('rect', { x: VB.x, y: VB.y, width: VB.w, height: VB.h, class: 'plan-bg' }));

  const ground = s('g', { 'clip-path': `url(#${pid}-site)` });
  svg.append(ground);

  // contours every metre, index contour every 5 m
  for (const flank of ['west', 'east']) {
    const top = flank === 'west' ? 11 : 10;
    for (let z = 1; z <= top; z++) {
      const off = flankOffsetAt(z, flank);
      const pts = [];
      for (let y = -PLAN_Y; y <= PLAN_Y; y += 2) {
        const sign = flank === 'west' ? -1 : 1;
        pts.push([sign * off + meander(y) + sign * 0.6 * Math.sin(y / 11 + z), y]);
      }
      ground.append(s('path', { d: L(pts), class: z % 5 === 0 ? 'contour contour--index' : 'contour' }));
      if (z % 5 === 0) {
        const sign = flank === 'west' ? -1 : 1;
        const y = -37;
        ground.append(s('text', { x: sign * off + meander(y) + sign * 0.6 * Math.sin(y / 11 + z), y: -y, class: 'contour-label', 'text-anchor': 'middle' }, `+${z}`));
      }
    }
  }

  // rain garden: a chain of shallow pools along the valley floor
  const wet = s('g', { class: 'rain-garden' });
  const edgeL = [];
  const edgeR = [];
  for (let y = -38; y <= 38; y += 2) {
    const w = (2.2 + 1.8 * Math.sin(y / 9) ** 2) * Math.sqrt(Math.max(0, 1 - (y / 40) ** 2));
    edgeL.push([meander(y) - w, y]);
    edgeR.push([meander(y) + w, y]);
  }
  const garden = s('path', { d: P([...edgeL, ...edgeR.reverse()]), class: 'garden' });
  wet.append(garden);
  ground.append(wet);
  // valley walk
  const walk = [];
  for (let y = -PLAN_Y; y <= PLAN_Y; y += 2) walk.push([meander(y) - 7.5 + 1.2 * Math.sin(y / 13), y]);
  ground.append(s('path', { d: L(walk), class: 'walk' }));

  // trees
  const trees = [
    [-8.5, 26, 8.6], [9.5, 26, 7.2], [-7, -6, 6.5], [8, -24, 7.4], [-9, -36, 5.4], [8.5, 38, 4.6], [10, 5, 5.5],
    [-38, 26, 2.5], [-38, -14, 2.6], [38, 26, 2.4], [38, -14, 2.5], [-38, 0, 2.2], [38, 2, 2.2],
    [-65, 34, 3.4], [-66, -10, 3.2], [64, 30, 3.3], [64.5, -16, 3.2], [-64, -34, 3],
  ];
  const treeShadows = s('g', { class: 'plan-shadow plan-shadow--soft' });
  const blockShadows = s('g', { class: 'plan-shadow' });
  ground.append(treeShadows, blockShadows);
  const treeG = s('g', { class: 'plan-trees' });
  for (const [x, y, r] of trees) {
    treeG.append(s('circle', { cx: x, cy: -y, r, class: 'plan-tree' }));
    treeG.append(s('circle', { cx: x, cy: -y, r: 0.25, class: 'plan-trunk' }));
  }

  // terraces: two pavilions each, two homes per pavilion per level
  const unitsG = s('g', { class: 'plan-units' });
  const blocks = [];
  for (const t of TERRACES) {
    for (const pav of ['North', 'South']) {
      const us = UNITS.filter((u) => u.pavilion === pav);
      const y0 = Math.min(...us.map((u) => u.y0));
      const y1 = Math.max(...us.map((u) => u.y1));
      blocks.push({ t, pts: rectPts(t.xMin, y0, t.xMax, y1), h: t.levels * FLOOR + 0.9 });
    }
    for (const u of UNITS) {
      const g = landscape
        ? s('g', { class: 'plan-unit plan-unit--static' })
        : s('g', {
            class: 'plan-unit', tabindex: 0, role: 'button',
            'data-terrace': t.id, 'data-unit': u.unit,
            'aria-label': `Select home ${u.unit} in ${t.name} (${u.pavilion.toLowerCase()} pavilion)`,
          });
      g.append(s('path', { d: P(rectPts(t.xMin, u.y0, t.xMax, u.y1)), class: `plan-roof${t.planted ? ' plan-roof--planted' : ''}` }));
      // planted roof: tint + inner dashed edge (a dot pattern here was very slow to paint)
      if (t.planted) g.append(s('path', { d: P(rectPts(t.xMin + 0.9, u.y0 + 0.9, t.xMax - 0.9, u.y1 - 0.9)), class: 'plan-planting' }));
      const vx0 = t.flank === 'west' ? t.xMax - VERANDAH : t.xMin;
      g.append(s('path', { d: P(rectPts(vx0, u.y0, vx0 + VERANDAH, u.y1)), class: 'plan-verandah' }));
      if (!landscape) g.append(s('text', { x: (t.xMin + t.xMax) / 2 + (t.flank === 'west' ? -1.6 : 1.6), y: -(u.y0 + u.y1) / 2 + 1.1, class: 'plan-unit-label', 'text-anchor': 'middle' }, u.unit));
      unitsG.append(g);
      if (landscape) continue;
      const pick = () => onSelect(t.id, u.unit);
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pick();
        }
      });
    }
  }
  svg.append(treeG, unitsG);

  // annotations
  const anno = s('g', { class: 'plan-anno' });
  for (const t of TERRACES) {
    anno.append(s('text', { x: (t.xMin + t.xMax) / 2, y: -(34.4), class: 'plan-terrace', 'text-anchor': 'middle' }, t.id));
  }
  anno.append(s('text', { x: meander(4) + 0.2, y: -4.4, class: 'plan-note plan-note--halo', 'text-anchor': 'middle' }, 'Rain garden'));
  anno.append(s('text', { x: -12.6, y: 22, class: 'plan-note plan-note--halo', 'text-anchor': 'middle' }, 'Valley walk'));
  // section line A–A
  const cy = -SECTION_CUT_Y;
  anno.append(s('path', { d: `M-70 ${cy}L70 ${cy}`, class: 'cut' }));
  for (const x of [-70, 70]) {
    anno.append(s('path', { d: `M${x} ${cy}l0 -3.4l${x < 0 ? 1.6 : -1.6} 1.6`, class: 'cut-arrow' }));
    anno.append(s('text', { x: x + (x < 0 ? 2.6 : -2.6), y: cy - 1.6, class: 'cut-label', 'text-anchor': 'middle' }, 'A'));
  }
  if (flow) {
    // water: run-off down both slopes into the rain garden, overflow north toward a tank
    const flow = s('g', { class: 'flow' });
    const arrows = [];
    for (const y of [0]) {
      arrows.push([[-62, y], [-46, y], [-40, y], [-24, y], [-14, y], [-5, y]]);
      arrows.push([[62, y], [46, y], [40, y], [24, y], [14, y], [5, y]]);
    }
    for (const pts of arrows) {
      const [a, , , , , b] = pts;
      flow.append(s('path', { d: `M${a[0]} ${-a[1]}L${b[0]} ${-b[1]}`, class: 'flow-line', 'marker-end': `url(#${pid}-flow)` }));
    }
    flow.append(s('path', { d: L(Array.from({ length: 21 }, (_, i) => { const y = -36 + i * 4; return [meander(y), y]; })), class: 'flow-axis', 'marker-end': `url(#${pid}-flow)` }));
    defs.append(s('marker', { id: `${pid}-flow`, viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 7, markerHeight: 7, orient: 'auto' }, [s('path', { d: 'M0 0.6L6 3L0 5.4Z', class: 'flow-head' })]));
    anno.append(flow);
    const note = (text, x, y, anchor = 'middle') => anno.append(s('text', { x, y: -y, class: 'plan-note plan-note--halo plan-note--water', 'text-anchor': anchor }, text));
    note('↑ Overflow north toward a tank (kere)', 0, 39.6);
    note('Run-off from both slopes gathers in the rain garden', 0, -40.6);
  }

  // numbered markers (key plans): plain circles + numbers, linked to lists beside the drawing
  const markerEls = new Map();
  for (const m of markers) {
    const g = s('g', { class: 'plan-marker', 'data-n': m.n, transform: `translate(${m.x} ${-m.y})` });
    g.append(s('circle', { r: 3.1, class: 'pm-ring' }));
    g.append(s('text', { y: 1.15, 'text-anchor': 'middle', class: 'pm-no' }, String(m.n)));
    anno.append(g);
    markerEls.set(String(m.n), g);
  }

  // north arrow + sun compass
  const nx = 64, ny = -37.2;
  const compass = s('g', { class: 'compass', transform: `translate(${nx} ${ny})` });
  compass.append(s('circle', { r: 5.2, class: 'compass-ring' }));
  compass.append(s('path', { d: 'M0 -4.4L1.3 1.6L0 0.7L-1.3 1.6Z', class: 'compass-north' }));
  compass.append(s('text', { x: 0, y: -6.3, 'text-anchor': 'middle', class: 'compass-n' }, 'N'));
  const sunMark = s('circle', { r: 1.0, class: 'compass-sun' });
  const sunLine = s('path', { class: 'compass-sunline' });
  compass.append(sunLine, sunMark);
  anno.append(compass);
  // scale bar
  const sb = s('g', { class: 'plan-scale', transform: `translate(-68 ${PLAN_Y + 4.5})` });
  sb.append(s('path', { d: 'M0 0L20 0M0 -0.8L0 0.8M10 -0.6L10 0.6M20 -0.8L20 0.8', class: 'scale-line' }));
  sb.append(s('rect', { x: 0, y: -0.25, width: 10, height: 0.5, class: 'scale-fill' }));
  sb.append(s('text', { x: 23, y: 0.9, class: 'scale-text' }, '20 m'));
  anno.append(sb);
  const foot = s('text', { x: 56, y: PLAN_Y + 5.4, class: 'plan-foot', 'text-anchor': 'end' }, 'Illustrative site · not a real parcel');
  anno.append(foot);
  svg.append(anno);

  // selection marker (column through all levels)
  const selOutline = s('path', { class: 'plan-sel', visibility: 'hidden' });
  const selTag = s('g', { class: 'plan-tag', visibility: 'hidden' });
  const selTagBox = s('rect', { class: 'plan-tag-box', rx: 0.6 });
  const selTagText = s('text', { class: 'plan-tag-text', 'text-anchor': 'middle' });
  const selTagLeader = s('path', { class: 'plan-tag-leader' });
  selTag.append(selTagLeader, selTagBox, selTagText);
  svg.append(selOutline, selTag);

  host.append(svg);

  const ro = new ResizeObserver(() => {
    const w = svg.getBoundingClientRect().width || 1;
    svg.style.setProperty('--ppu', (w / vbNow.w).toFixed(3));
  });
  ro.observe(svg);

  function update({ sun, season }) {
    garden.classList.toggle('is-wet', season === 'jun');
    const alt = sun.altitude;
    // compass sun
    const az = (sun.azimuth * Math.PI) / 180;
    const r = 4.2 * clamp(Math.cos((Math.max(alt, 0) * Math.PI) / 180), 0.15, 1);
    const sx = Math.sin(az) * r;
    const sy = -Math.cos(az) * r;
    sunMark.setAttribute('cx', sx.toFixed(2));
    sunMark.setAttribute('cy', sy.toFixed(2));
    sunLine.setAttribute('d', `M0 0L${sx.toFixed(2)} ${sy.toFixed(2)}`);
    compass.classList.toggle('is-night', alt <= 0);

    if (alt <= 0.5) {
      blockShadows.replaceChildren();
      treeShadows.replaceChildren();
      svg.dataset.phase = alt < -3 ? 'night' : 'low';
      return;
    }
    svg.dataset.phase = alt < 4 ? 'low' : 'day';
    const k = 1 / Math.max(sun.U, 0.07);
    const ox = -sun.E * k;
    const oy = -sun.N * k;
    const cap = (h) => {
      const len = Math.hypot(ox, oy) * h;
      const m = Math.min(1, 70 / Math.max(len, 1e-6));
      return [ox * h * m, oy * h * m];
    };
    blockShadows.replaceChildren(
      ...blocks.map(({ pts, h }) => {
        const [dx, dy] = cap(h);
        return s('path', { d: P(hull([...pts, ...pts.map(([x, y]) => [x + dx, y + dy])])) });
      }),
    );
    treeShadows.replaceChildren(
      ...trees.map(([x, y, rr]) => {
        const h = rr > 5 ? 10 : 5.5;
        const [dx, dy] = cap(h);
        return s('ellipse', { cx: x + dx, cy: -(y + dy), rx: rr * 0.95, ry: rr * 0.95 });
      }),
    );
    const strength = clamp(alt / 12);
    blockShadows.style.opacity = String(0.07 + 0.09 * strength);
    treeShadows.style.opacity = String(0.03 + 0.03 * strength);
  }

  function select(terrace, unit, label) {
    for (const g of unitsG.querySelectorAll('.plan-unit')) {
      const on = g.dataset.terrace === terrace && g.dataset.unit === unit;
      g.classList.toggle('is-selected', on);
      g.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    const t = TERRACES.find((x) => x.id === terrace);
    const u = UNITS.find((x) => x.unit === unit);
    if (!t || !u) return selOutline.setAttribute('visibility', 'hidden');
    selOutline.setAttribute('d', P(rectPts(t.xMin - 0.8, u.y0 - 0.8, t.xMax + 0.8, u.y1 + 0.8)));
    selOutline.setAttribute('visibility', 'visible');
    // tag on the courtyard (outer) side of the terrace, clear of the valley
    // upper terraces: tag outside, on the plateau; lower terraces: tag over the valley
    const upper = t.id.endsWith('2');
    const toLeft = (t.flank === 'west') === upper;
    const outer = toLeft ? t.xMin - 1.2 : t.xMax + 1.2;
    const cy = -(u.y0 + u.y1) / 2;
    const tx = outer + (toLeft ? -5.4 : 5.4);
    selTagText.textContent = label || `${terrace}·${unit}`;
    selTagText.setAttribute('x', tx);
    selTagText.setAttribute('y', cy + 1.05);
    selTagBox.setAttribute('x', tx - 4.9);
    selTagBox.setAttribute('y', cy - 1.9);
    selTagBox.setAttribute('width', 9.8);
    selTagBox.setAttribute('height', 3.8);
    selTagLeader.setAttribute('d', `M${outer} ${cy}L${tx + (toLeft ? 4.9 : -4.9)} ${cy}`);
    selTag.setAttribute('visibility', 'visible');
  }

  /** Crop horizontally (phones show one side of the valley at a time). */
  function setView(x0, x1) {
    vbNow.x = x0;
    vbNow.w = x1 - x0;
    svg.setAttribute('viewBox', `${vbNow.x} ${VB.y} ${vbNow.w} ${VB.h}`);
    // keep the scale bar and the "not a real parcel" note inside a cropped view
    sb.setAttribute('transform', `translate(${x0 + 6} ${PLAN_Y + 4.5})`);
    foot.setAttribute('x', x1 - 18 * (vbNow.w / VB.w));
    svg.style.setProperty('--ppu', ((svg.getBoundingClientRect().width || 1) / vbNow.w).toFixed(3));
  }
  const vbNow = { x: VB.x, w: VB.w };

  function highlight(n) {
    for (const [k, g] of markerEls) g.classList.toggle('is-on', k === String(n));
    svg.dataset.hl = n ?? '';
  }

  return { svg, update, select, setView, highlight };
}
