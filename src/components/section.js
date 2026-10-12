import { reducedMotion } from '../lib/motion.js';
// Section A–A: the master drawing. One renderer, two variants:
//  - 'full'    the annotated hero drawing with the living-light layer
//  - 'compact' the locator's companion view (fewer labels, selectable rooms)

import { model, sectionDir } from '../model/light.js';
import { TERRACES, terraceById, naturalGround, FLOOR, DEPTH } from '../model/site.js';
import { s, polyPath, linePath, sweepPath, mixHex, clamp, bbox } from '../lib/geometry.js';

let uid = 0;

const C = {
  paper: '#F3EFE7',
  dawn: '#EFDDC6',
  dusk: '#D7BFA9',
  night: '#2A3344',
  sun: '#C8902F',
  sunWash: '#F6DFA8',
  shade: '#4A5363',
  glow: '#F4D493',
};

function skyColour(alt) {
  if (alt >= 22) return C.paper;
  if (alt >= 6) return mixHex(C.dawn, C.paper, (alt - 6) / 16);
  if (alt >= -1) return mixHex(C.dusk, C.dawn, (alt + 1) / 7);
  if (alt >= -7) return mixHex(C.night, C.dusk, (alt + 7) / 6);
  return C.night;
}

function personPath(x, y, h = 1.7, stride = 0) {
  const hy = y + h - 0.14;
  return [
    `M${x} ${-(y + h * 0.56)}L${x - 0.16 - stride} ${-y}`,
    `M${x} ${-(y + h * 0.56)}L${x + 0.16 + stride} ${-y}`,
    `M${x} ${-(y + h * 0.56)}L${x} ${-(y + h * 0.84)}`,
    `M${x} ${-(y + h * 0.78)}L${x - 0.28} ${-(y + h * 0.55)}`,
    `M${x} ${-(y + h * 0.78)}L${x + 0.26} ${-(y + h * 0.58)}`,
    `M${x + 0.13} ${-hy}a0.13 0.13 0 1 0 -0.26 0a0.13 0.13 0 1 0 0.26 0`,
  ].join('');
}

const X = (t, u) => t.back + t.s * u;

// Scene extents (independent of the current view, so views can pan and crop)
const SCENE = { x: -80, y: -46, w: 160, h: 62 };

/**
 * variant: 'full' (hero drawing), 'compact' (locator), 'detail' (a cropped, larger-scale detail)
 * crop: { x0, x1, y0, y1 } in section metres, for 'detail'
 * labels: [{ text, at, pos, anchor, halo }] for 'detail'
 */
export function createSection(host, { variant = 'full', onSelect, crop, labels = [], ariaLabel } = {}) {
  const id = `sec${++uid}`;
  const full = variant === 'full';
  const detail = variant === 'detail';
  const top = full ? 34.2 : 25.6;
  const bottom = full ? 7.2 : 4.5;
  const vb = detail
    ? { x: crop.x0, y: -crop.y1, w: crop.x1 - crop.x0, h: crop.y1 - crop.y0 }
    : { x: -72, y: -top, w: 144, h: top + bottom };
  const home = { ...vb };
  // paint extents: the whole scene for pannable views, just the crop (plus a margin) for details,
  // so masks and washes never rasterise far beyond what is visible
  const EXT = detail ? { x: vb.x - 1, y: vb.y - 1, w: vb.w + 2, h: vb.h + 2 } : SCENE;
  const arc = full ? { rx: 63, y0: 14, ry: 16.5 } : { rx: 63, y0: 13.5, ry: 9.5 };

  const svg = s('svg', {
    class: `sec sec--${variant}`,
    viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`,
    role: 'group',
    'aria-label': ariaLabel || (full
      ? 'Section A–A through Rainfold, looking north: two terraces of homes step down the west and east slopes of a shallow valley, with rain trees and a rain garden on the valley floor.'
      : 'Section A–A, compact: select a terrace and level.'),
    preserveAspectRatio: 'xMidYMid meet',
  });

  // Details only need geometry near their crop: clipping it keeps masks and clips cheap to paint.
  const M = 30;
  const near = (pts) => {
    const b = bbox(pts);
    return b.x1 > vb.x - M && b.x0 < vb.x + vb.w + M;
  };
  const surface = detail ? model.surface.filter(([x]) => x >= vb.x - M && x <= vb.x + vb.w + M) : model.surface;
  const terrain = detail ? [...surface, [surface.at(-1)[0], -7], [surface[0][0], -7]] : model.terrainPoly;
  const hardPolys = detail ? [terrain, ...model.hard.slice(1).filter(near)] : model.hard;
  const softPolys = detail ? model.soft.filter(near) : model.soft;
  const rooms = detail ? model.rooms.filter((r) => near(r.rect.pts)) : model.rooms;

  // Light is shown only where it lands: inside the homes and on a strip along the ground.
  const BAND = 0.75;
  const bandPoly = [...surface, ...surface.map(([x, y]) => [x, y + BAND]).reverse()];
  const roofStrips = TERRACES.map((t) => {
    const y0 = t.roof + (t.planted ? 0.4 : 0);
    return { x: t.xMin + 0.35, y: y0, w: t.xMax - t.xMin - 0.6, h: 0.6 };
  });
  const defs = s('defs', {}, [
    // 45° earth hatch as an unrotated tile (rotated patterns with screen-space strokes are very slow to paint)
    s('pattern', { id: `${id}-hatch`, width: 1.6, height: 1.6, patternUnits: 'userSpaceOnUse' }, [
      s('path', { d: 'M0 1.6L1.6 0M-0.4 0.4L0.4 -0.4M1.2 2L2 1.2', class: 'hatch-line' }),
    ]),
    s('pattern', { id: `${id}-soil`, width: 0.8, height: 0.8, patternUnits: 'userSpaceOnUse' }, [
      s('circle', { cx: 0.4, cy: 0.4, r: 0.09, class: 'soil-dot' }),
    ]),
    s('clipPath', { id: `${id}-lit` }, [
      s('path', { d: polyPath(bandPoly) }),
      ...rooms.map((r) => s('rect', { x: r.rect.x, y: -(r.rect.y + r.rect.h), width: r.rect.w, height: r.rect.h })),
      ...roofStrips.map((r) => s('rect', { x: r.x, y: -(r.y + r.h), width: r.w, height: r.h })),
    ]),
  ]);
  svg.append(defs);

  const layer = (cls, attrs = {}) => {
    const g = s('g', { class: cls, ...attrs });
    svg.append(g);
    return g;
  };

  // 1 — sky and far plateau
  const sky = s('rect', { x: EXT.x, y: EXT.y, width: EXT.w, height: EXT.h, class: 'sky' });
  svg.append(sky);
  const far = layer('far');
  far.append(
    s('path', {
      class: 'far-ridge',
      d: linePath(Array.from({ length: 73 }, (_, i) => {
        const x = -72 + i * 2;
        return [x, 13.6 + 0.9 * Math.sin(x / 9) + 0.5 * Math.sin(x / 3.7) + (x < 0 ? 0.6 : 0)];
      })),
    }),
  );

  // 2 — sun path, rays, sun
  const sunLayer = layer('sunlayer');
  const pathPts = [];
  for (let i = 0; i <= 60; i++) {
    const th = (i / 60) * Math.PI;
    pathPts.push([arc.rx * Math.cos(th), arc.y0 + arc.ry * Math.sin(th)]);
  }
  sunLayer.append(s('path', { class: 'sun-path', d: linePath(pathPts) }));
  const rays = s('g', { class: 'rays' });
  sunLayer.append(rays);
  const sunDisc = s('circle', { r: full ? 1.25 : 1.1, class: 'sun-disc' });
  const sunHalo = s('circle', { r: full ? 2.6 : 2.2, class: 'sun-halo' });
  sunLayer.append(sunHalo, sunDisc);

  // 3 — room interiors (the air inside), elevation-beyond lines
  const interiors = layer('interiors');
  for (const r of model.rooms) {
    interiors.append(s('rect', { x: r.rect.x, y: -(r.rect.y + r.rect.h), width: r.rect.w, height: r.rect.h, class: 'room' }));
  }
  const beyond = layer('beyond');
  for (const p of model.terraces) for (const ln of p.beyond) beyond.append(s('path', { d: linePath(ln), class: 'beyond-line' }));

  // 4 — sunlight wash + shadows, clipped to air
  // sunlight = a warm wash masked by the shadow volumes; shade shows the cool base beneath
  const hardShadow = s('path', { fill: '#000', 'fill-rule': 'nonzero' });
  const softShadow = s('path', { fill: '#000', 'fill-rule': 'nonzero', 'fill-opacity': 0.5 });
  defs.append(
    s('mask', { id: `${id}-sunmask`, maskUnits: 'userSpaceOnUse', x: EXT.x, y: EXT.y, width: EXT.w, height: EXT.h }, [
      s('rect', { x: EXT.x, y: EXT.y, width: EXT.w, height: EXT.h, fill: '#fff' }),
      softShadow,
      hardShadow,
    ]),
  );
  const groundBand = s('path', { d: polyPath(bandPoly), class: 'ground-band' });
  interiors.append(groundBand);
  for (const r of roofStrips) interiors.append(s('rect', { x: r.x, y: -(r.y + r.h), width: r.w, height: r.h, class: 'ground-band' }));
  const lightG = layer('light', { 'clip-path': `url(#${id}-lit)` });
  const wash = s('rect', { x: EXT.x, y: EXT.y, width: EXT.w, height: EXT.h, class: 'wash', mask: `url(#${id}-sunmask)` });
  const glow = s('g', { class: 'glow' });
  for (const r of model.rooms) glow.append(s('rect', { x: r.rect.x, y: -(r.rect.y + r.rect.h), width: r.rect.w, height: r.rect.h }));
  lightG.append(wash, glow);

  // 5 — monsoon water in the rain garden
  const waterLevel = -0.5;
  const waterPts = model.surface.filter(([x, y]) => Math.abs(x) < 6 && y < waterLevel);
  const water = s('path', {
    class: 'water',
    d: waterPts.length ? polyPath([[waterPts[0][0], waterLevel], ...waterPts, [waterPts.at(-1)[0], waterLevel]]) : '',
  });
  svg.append(water);

  // 6 — earth (cut), hatched poché and a heavy cut line
  const earth = layer('earth');
  earth.append(s('path', { d: polyPath(model.terrainPoly), class: 'earth-fill' }));
  earth.append(s('path', { d: polyPath(model.terrainPoly), fill: `url(#${id}-hatch)`, class: 'earth-hatch' }));
  const cutLine = s('path', { d: linePath(model.surface), class: 'cut-line' });
  earth.append(cutLine);
  if (full && !reducedMotion()) {
    // the section is drawn west to east on first view
    const revealRect = s('rect', { x: vb.x, y: vb.y, width: 0, height: vb.h });
    defs.append(s('clipPath', { id: `${id}-reveal` }, [revealRect]));
    cutLine.setAttribute('clip-path', `url(#${id}-reveal)`);
    const t0ref = { t: 0 };
    const dur = 1900;
    const step = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0ref.t) / dur));
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      revealRect.setAttribute('width', vb.w * e);
      if (k < 1) requestAnimationFrame(step);
      else cutLine.removeAttribute('clip-path');
    };
    svg.classList.add('will-reveal');
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        svg.classList.add('is-revealing');
        // never leave the drawing hidden if animations are throttled or paused
        setTimeout(() => svg.classList.add('is-revealed'), 3200);
        t0ref.t = performance.now() + 120;
        requestAnimationFrame(step);
      }
    }, { threshold: 0.25 });
    io.observe(svg);
  }

  // 7 — terraces: cut slabs and walls, soil, louvres, glazing, rails
  const build = layer('build');
  for (const p of model.terraces) {
    const g = s('g', { class: `terrace terrace--${p.t.id}`, 'data-terrace': p.t.id });
    for (const r of p.soil) {
      g.append(s('path', { d: polyPath(r.pts), class: 'soil' }));
      g.append(s('path', { d: polyPath(r.pts), fill: `url(#${id}-soil)`, class: 'soil-texture' }));
    }
    for (const r of p.poche) g.append(s('path', { d: polyPath(r.pts), class: 'poche' }));
    for (const r of p.louvres) {
      const n = Math.max(3, Math.round(r.h / 0.32));
      let d = '';
      for (let i = 0; i <= n; i++) {
        const y = r.y + (r.h * i) / n;
        d += `M${r.x} ${-y}L${r.x + r.w} ${-y}`;
      }
      d += `M${r.x} ${-r.y}L${r.x} ${-(r.y + r.h)}M${r.x + r.w} ${-r.y}L${r.x + r.w} ${-(r.y + r.h)}`;
      g.append(s('path', { d, class: 'louvre' }));
    }
    for (const [x, y0, y1] of p.glass) g.append(s('path', { d: `M${x} ${-y0}L${x} ${-y1}`, class: 'glass' }));
    for (const [x, y0, y1] of p.rails) g.append(s('path', { d: `M${x} ${-y0}L${x} ${-y1}`, class: 'rail' }));
    if (p.t.planted) {
      // low planting on the roof build-up
      let d = '';
      for (let u = 1.2; u < DEPTH - 1; u += 1.35) {
        const x = X(p.t, u);
        const y = p.t.roof + 0.4;
        const r = 0.45 + 0.25 * Math.sin(u * 3.1);
        d += `M${x - r} ${-y}Q${x - r * 0.4} ${-(y + r * 1.5)} ${x} ${-(y + r * 0.9)}Q${x + r * 0.5} ${-(y + r * 1.6)} ${x + r} ${-y}`;
      }
      g.append(s('path', { d, class: 'shrub' }));
    }
    build.append(g);
  }

  // 8 — trees
  const treeLayer = layer('trees');
  for (const tr of model.trees) {
    const g = s('g', { class: `tree${tr.big ? ' tree--big' : ''}` });
    const trunkTop = tr.cy - tr.ry * 0.35;
    let trunk = `M${tr.x} ${-tr.base}L${tr.x} ${-trunkTop}`;
    if (tr.big) {
      trunk += `M${tr.x} ${-(tr.base + (trunkTop - tr.base) * 0.55)}L${tr.x - tr.rx * 0.45} ${-(trunkTop + 0.3)}`;
      trunk += `M${tr.x} ${-(tr.base + (trunkTop - tr.base) * 0.62)}L${tr.x + tr.rx * 0.5} ${-(trunkTop + 0.5)}`;
      trunk += `M${tr.x} ${-(trunkTop - 0.2)}L${tr.x + tr.rx * 0.12} ${-(trunkTop + 0.9)}`;
    }
    g.append(s('path', { d: polyPath(tr.pts), class: 'canopy' }));
    g.append(s('path', { d: trunk, class: 'trunk' }));
    treeLayer.append(g);
  }
  // garden planting on the valley floor
  let reeds = '';
  for (let x = -5.5; x <= 5.5; x += 0.55) {
    const y = naturalGround(x);
    const h = 0.5 + 0.35 * Math.abs(Math.sin(x * 2.3));
    reeds += `M${x} ${-y}L${x - 0.15} ${-(y + h)}M${x} ${-y}L${x + 0.18} ${-(y + h * 0.8)}`;
  }
  treeLayer.append(s('path', { d: reeds, class: 'reeds' }));

  // 9 — people for scale
  const people = layer('people');
  const w1 = terraceById.W1;
  const e2 = terraceById.E2;
  people.append(s('path', { d: personPath(-3.6, naturalGround(-3.6) + 0.02, 1.7, 0.1), class: 'person' }));
  people.append(s('path', { d: personPath(-2.9, naturalGround(-2.9) + 0.02, 1.1), class: 'person' }));
  people.append(s('path', { d: personPath(X(w1, 14.6), w1.base + FLOOR, 1.7), class: 'person' }));
  people.append(s('path', { d: personPath(X(e2, 11), e2.roof, 1.7, 0.08), class: 'person' }));

  // 10 — selection, hit targets
  const selLayer = layer('selection');
  const selRect = s('rect', { class: 'sel-rect', visibility: 'hidden' });
  const selTag = s('g', { class: 'sel-tag', visibility: 'hidden' });
  const selTagLine = s('path', { class: 'sel-leader' });
  const selTagText = s('text', { class: 'sel-text', 'text-anchor': 'middle' });
  selTag.append(selTagLine, selTagText);
  selLayer.append(selRect, selTag);

  const hits = layer('hits');
  if (onSelect) {
    for (const r of model.rooms) {
      const t = terraceById[r.terrace];
      const name = `${t.name}, ${['garden', 'middle', 'roof-terrace'][r.level]} level`;
      const hit = s('rect', {
        x: r.rect.x, y: -(r.rect.y + r.rect.h), width: r.rect.w, height: r.rect.h,
        class: 'hit', tabindex: 0, role: 'button', 'aria-label': `Select ${name}`,
        'data-terrace': r.terrace, 'data-level': r.level,
      });
      hit.addEventListener('click', () => onSelect(r.terrace, r.level));
      hit.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(r.terrace, r.level);
        }
      });
      hits.append(hit);
    }
  }

  // 11 — annotations
  const anno = layer('annotations');
  const label = (text, at, pos, { anchor = 'start', minor = false, cls = '' } = {}) => {
    const g = s('g', { class: `anno${minor ? ' anno--minor' : ''} ${cls}` });
    if (at) {
      g.append(s('path', { d: `M${at[0]} ${-at[1]}L${pos[0]} ${-pos[1]}`, class: 'leader' }));
      g.append(s('circle', { cx: at[0], cy: -at[1], r: 0.22, class: 'leader-dot' }));
    }
    const lines = [].concat(text);
    const tx = s('text', { x: pos[0], y: -pos[1], 'text-anchor': anchor });
    lines.forEach((ln, i) => {
      const span = s('tspan', { x: pos[0], dy: i === 0 ? 0 : '1.25em', class: i === 0 ? 'anno-title' : 'anno-sub' }, ln);
      tx.append(span);
    });
    g.append(tx);
    anno.append(g);
    return g;
  };

  if (!detail) {
    for (const t of TERRACES) {
      const cx = (t.xMin + t.xMax) / 2;
      label(t.id, null, [cx, t.roof + (t.planted ? 2.2 : 1.8)], { anchor: 'middle', cls: 'anno--terrace' });
    }
    label('WEST', null, [-70.5, full ? 31 : 22.5], { cls: 'anno--edge' });
    label('EAST', null, [70.5, full ? 31 : 22.5], { anchor: 'end', cls: 'anno--edge' });
  } else {
    sunLayer.style.display = 'none';
    far.style.display = 'none';
    for (const l of labels) label(l.text, l.at, l.pos, { anchor: l.anchor || 'start', cls: l.halo ? 'anno--halo' : '' });
  }

  let waterNote = null;
  if (full) {
    const wl = terraceById.W1;
    label(['West terrace', 'faces east · morning light'], null, [-70.5, 28.2], { anchor: 'start', cls: 'anno--corner' });
    label(['East terrace', 'faces west · louvred verandahs'], null, [70.5, 28.2], { anchor: 'end', cls: 'anno--corner' });
    label(['Rain trees', 'shade for the shared valley'], [-12.5, 11.8], [-17, 21.5], { anchor: 'end' });
    waterNote = label(['Rain garden', 'dry bed — fills in the monsoon'], [0, -0.75], [3.2, -3.9], { cls: 'anno--halo' });
    label('Courtyard', [-38, naturalGround(-38) + 0.3], [-38, 4.6], { anchor: 'middle', minor: true, cls: 'anno--halo' });
    label('Courtyard', [38, naturalGround(38) + 0.3], [38, 4.2], { anchor: 'middle', minor: true, cls: 'anno--halo' });
    label('Planted roof', [X(wl, 10), wl.roof + 0.45], [-24, 15.8], { anchor: 'start', minor: true });
    label('Retained earth', [X(wl, 0.2) - 0.8, 2.4], [-46, 0.6], { anchor: 'end', minor: true, cls: 'anno--halo' });
    label(['Deep eaves', 'east light in, high sun out'], [X(wl, DEPTH + 0.9), wl.base + FLOOR * 2 - 0.15], [-13.6, 4.7], { anchor: 'start', minor: true });

    // datum and scale bar
    const scale = s('g', { class: 'scale' });
    const sx = -69, sy = -5.4;
    scale.append(s('path', { d: `M${sx} ${-sy}L${sx + 20} ${-sy}M${sx} ${-(sy - 0.5)}L${sx} ${-(sy + 0.5)}M${sx + 5} ${-(sy - 0.35)}L${sx + 5} ${-(sy + 0.35)}M${sx + 10} ${-(sy - 0.5)}L${sx + 10} ${-(sy + 0.5)}M${sx + 20} ${-(sy - 0.5)}L${sx + 20} ${-(sy + 0.5)}`, class: 'scale-line' }));
    scale.append(s('rect', { x: sx, y: -sy - 0.18, width: 5, height: 0.36, class: 'scale-fill' }));
    scale.append(s('rect', { x: sx + 10, y: -sy - 0.18, width: 10, height: 0.36, class: 'scale-fill' }));
    for (const [v, x] of [['0', sx], ['10', sx + 10], ['20 m', sx + 20]]) {
      scale.append(s('text', { x, y: -sy + 1.6, 'text-anchor': 'middle', class: 'scale-text' }, v));
    }
    anno.append(scale);
    label('±0.0', [6.2, 0.02], [8.2, 1.4], { minor: true, cls: 'anno--datum' });
  }

  host.append(svg);

  // Text sized in screen pixels regardless of drawing scale
  const measure = () => {
    const w = svg.getBoundingClientRect().width || 1;
    const ppu = w / vb.w;
    svg.style.setProperty('--ppu', ppu.toFixed(3));
    svg.classList.toggle('is-tight', ppu < 6.4);
    const cropped = !detail && vb.w < home.w - 1;
    svg.classList.toggle('is-cropped', cropped);
    // in a cropped view, hide any label that would be cut by the frame
    for (const g of anno.querySelectorAll(':scope > .anno')) {
      g.classList.remove('is-off');
      if (!cropped) continue;
      const tx = g.querySelector('text');
      if (!tx || getComputedStyle(g).display === 'none') continue;
      const b = tx.getBBox();
      if (b.x < vb.x + 0.5 || b.x + b.width > vb.x + vb.w - 0.5) g.classList.add('is-off');
    }
  };
  const ro = new ResizeObserver(measure);
  ro.observe(svg);

  const applyVB = () => svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  let viewAnim = 0;
  /** Pan / crop horizontally (keeps the vertical extent). */
  function setView(x0, x1, animate = true, yTop = top) {
    cancelAnimationFrame(viewAnim);
    vb.y = -yTop;
    vb.h = yTop + bottom;
    const from = { x: vb.x, w: vb.w };
    const to = { x: x0, w: x1 - x0 };
    const reduce = reducedMotion();
    if (!animate || reduce) {
      vb.x = to.x;
      vb.w = to.w;
      applyVB();
      measure();
      if (lastArgs) update(lastArgs);
      return;
    }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 520);
      const e = 1 - (1 - k) ** 3;
      vb.x = from.x + (to.x - from.x) * e;
      vb.w = from.w + (to.w - from.w) * e;
      applyVB();
      measure();
      if (k < 1) viewAnim = requestAnimationFrame(step);
      else if (lastArgs) update(lastArgs);
    };
    viewAnim = requestAnimationFrame(step);
  }
  let lastArgs = null;

  function update(args) {
    lastArgs = args;
    const { sun, phaseLabel, season } = args;
    const alt = sun.altitude;
    sky.setAttribute('fill', skyColour(alt));
    const phase = alt < -3 ? 'night' : alt < 4 ? 'low' : 'day';
    svg.dataset.phase = phase;

    // sun on its (projected) path
    const dir = sectionDir(sun);
    if (alt > -1.5) {
      const th = Math.atan2(Math.max(sun.U, 0), sun.E);
      const cx = arc.rx * Math.cos(th);
      const cy = arc.y0 + arc.ry * Math.sin(th);
      sunDisc.setAttribute('cx', cx);
      sunDisc.setAttribute('cy', -cy);
      sunHalo.setAttribute('cx', cx);
      sunHalo.setAttribute('cy', -cy);
      sunLayer.style.opacity = String(clamp((alt + 1.5) / 4));
      // parallel rays in the true section direction
      rays.replaceChildren();
      if (dir && full && !svg.classList.contains('is-cropped')) {
        const [dx, dy] = dir;
        const px = -dy, py = dx;
        for (let i = -2; i <= 2; i++) {
          const ox = cx + px * i * 2.4;
          const oy = cy + py * i * 2.4;
          rays.append(s('path', { d: `M${ox - dx * 2.6} ${-(oy - dy * 2.6)}L${ox - dx * 13} ${-(oy - dy * 13)}`, class: 'ray' }));
        }
      }
    } else {
      sunLayer.style.opacity = '0';
    }

    if (detail || svg.classList.contains('is-cropped')) {
      rays.replaceChildren();
      sunLayer.style.display = '';
      if (detail) {
        sunDisc.style.display = 'none';
        sunHalo.style.display = 'none';
      }
      sunLayer.style.opacity = dir ? '1' : '0';
      if (dir) {
        // a few parallel rays entering the detail from the sun's side
        const [dx, dy] = dir;
        const cx = vb.x + vb.w / 2;
        const cy = -vb.y;
        const px = -dy, py = dx;
        for (let i = -3; i <= 3; i++) {
          const ox = cx + px * i * (vb.w / 9) + dx * vb.w * 0.55;
          const oy = cy + py * i * (vb.w / 9) + dy * vb.w * 0.55;
          rays.append(s('path', { d: `M${ox} ${-oy}L${ox - dx * vb.w * 0.32} ${-(oy - dy * vb.w * 0.32)}`, class: 'ray' }));
        }
      }
    }

    // light & shadow
    if (dir) {
      const [dx, dy] = dir;
      // extrusion only as long as the view needs (huge polygons are slow to rasterise in masks)
      const L = detail ? Math.hypot(vb.w, vb.h) * 1.2 : 190;
      hardShadow.setAttribute('d', hardPolys.map((p) => sweepPath(p, -dx, -dy, L)).join(''));
      softShadow.setAttribute('d', softPolys.map((p) => sweepPath(p, -dx, -dy, Math.min(L, 80))).join(''));
      wash.style.opacity = String(clamp((alt + 1) / 6) * (0.75 + 0.25 * (1 - clamp(alt / 60))));
    } else {
      hardShadow.setAttribute('d', '');
      softShadow.setAttribute('d', '');
      wash.style.opacity = '0';
    }
    glow.style.opacity = String(clamp((2 - alt) / 7));

    const wet = season === 'jun';
    water.style.opacity = wet ? '1' : '0';
    if (waterNote) {
      const sub = waterNote.querySelector('.anno-sub');
      if (sub) sub.textContent = wet ? 'holding monsoon rain — June' : 'dry bed — fills in the monsoon';
    }
    svg.dataset.label = phaseLabel || '';
  }

  function select(terrace, level, tag) {
    const room = model.rooms.find((r) => r.terrace === terrace && r.level === level);
    for (const h of hits.querySelectorAll('.hit')) {
      const on = h.dataset.terrace === terrace && Number(h.dataset.level) === level;
      h.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (!room) {
      selRect.setAttribute('visibility', 'hidden');
      selTag.setAttribute('visibility', 'hidden');
      return;
    }
    const { x, y, w, h } = room.rect;
    selRect.setAttribute('x', x);
    selRect.setAttribute('y', -(y + h));
    selRect.setAttribute('width', w);
    selRect.setAttribute('height', h);
    selRect.setAttribute('visibility', 'visible');
    const t = terraceById[terrace];
    const cx = x + w / 2;
    const tagY = t.roof + 4.4;
    selTagLine.setAttribute('d', `M${cx} ${-(y + h)}L${cx} ${-(tagY - 0.9)}`);
    selTagText.setAttribute('x', cx);
    selTagText.setAttribute('y', -tagY);
    selTagText.textContent = tag || `${terrace}·${level}`;
    selTag.setAttribute('visibility', 'visible');
    svg.dataset.selected = terrace;
  }

  return { svg, update, select, setView, home };
}
