// Brand marks drawn from the project's own ground line: the terrain of Section A–A
// is the logo, the hero overlay and the footer mark.

import { model } from '../model/light.js';
import { TERRACES } from '../model/site.js';
import { s, linePath } from '../lib/geometry.js';

const profile = () => model.surface.filter((_, i) => i % 2 === 0);

/** The ground line drawn across the hero photograph, with terrace and garden ticks. */
export function mountFoldLine(host) {
  const svg = s('svg', { viewBox: '-72 -16 144 30', preserveAspectRatio: 'none', class: 'fl-svg' });
  const ln = s('path', { d: linePath(profile()), class: 'fl-line', 'vector-effect': 'non-scaling-stroke' });
  svg.append(ln);
  host.append(svg);

  // labels are HTML, positioned in % so they stay crisp and don't stretch
  const ticks = [
    ...TERRACES.map((t) => ({ x: (t.xMin + t.xMax) / 2, y: t.base, text: t.id })),
    { x: 0, y: -1, text: 'Rain garden' },
  ];
  for (const t of ticks) {
    const el = document.createElement('span');
    el.className = 'fl-tick';
    el.textContent = t.text;
    el.style.left = `${((t.x + 72) / 144) * 100}%`;
    el.style.top = `${((-t.y + 16) / 30) * 100}%`;
    host.append(el);
  }
  const ends = document.createElement('div');
  ends.className = 'fl-ends';
  ends.innerHTML = '<span>West</span><span>Section A–A · the ground of Rainfold, drawn over the plateau</span><span>East</span>';
  host.append(ends);
}

export function mountFooterMark(host) {
  const svg = s('svg', { viewBox: '-72 -14 144 18', class: 'fm-svg', 'aria-hidden': 'true' });
  svg.append(s('path', { d: linePath(profile()), class: 'fm-line', 'vector-effect': 'non-scaling-stroke' }));
  host.append(svg);
}

/** Material key: each material as it is drawn (a drawing convention), not a fake photograph. */
export function mountSwatches(host) {
  const items = [
    { code: 'M-01', name: 'Lime plaster', note: 'Walls. Breathable, pale, warm-white; re-limed, not painted.', svg: limeSvg() },
    { code: 'M-02', name: 'Grey granite', note: 'Plinths, steps and retaining walls, in coursed blocks.', svg: graniteSvg() },
    { code: 'M-03', name: 'Timber louvres', note: 'Only on the west-facing verandahs, where the sun is hardest.', svg: louvreSvg() },
    { code: 'M-04', name: 'Red earth', note: 'Paths and the valley floor, left unsealed so rain soaks in.', svg: earthSvg() },
  ];
  host.innerHTML = items
    .map(
      (it) => `<li class="swatch">
        <img class="sw-svg" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(it.svg)}" width="480" height="300" alt="" loading="lazy" decoding="async">
        <p class="sw-code">${it.code}</p><p class="sw-name">${it.name}</p><p class="sw-note">${it.note}</p>
      </li>`,
    )
    .join('');
}

// deterministic pseudo-random, so the studies never change between loads
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
const frame = (bg, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" width="480" height="300"><rect width="160" height="100" fill="${bg}"/>${body}<rect x="0.5" y="0.5" width="159" height="99" fill="none" stroke="#1f1e1b" stroke-width="1"/></svg>`;

function limeSvg() {
  const r = rng(11);
  let d = '';
  for (let i = 0; i < 230; i++) d += `<circle cx="${(r() * 160).toFixed(1)}" cy="${(r() * 100).toFixed(1)}" r="${(0.35 + r() * 0.5).toFixed(2)}"/>`;
  return frame('#efe9de', `<g fill="#9b9384">${d}</g>`);
}
function graniteSvg() {
  const r = rng(7);
  let d = '';
  const course = 16.6;
  for (let y = 0, row = 0; y < 100; y += course, row++) {
    let x = row % 2 ? -14 : -4;
    while (x < 160) {
      const w = 28 + r() * 26;
      d += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${course}"/>`;
      for (let k = 0; k < 7; k++) d += `<circle cx="${(x + 3 + r() * (w - 6)).toFixed(1)}" cy="${(y + 3 + r() * (course - 6)).toFixed(1)}" r="0.7" class="g"/>`;
      x += w;
    }
  }
  return frame('#c9c4ba', `<g fill="none" stroke="#5f5a52" stroke-width="1">${d}</g><style>.g{fill:#6d675e;stroke:none}</style>`);
}
function louvreSvg() {
  let d = '';
  for (let x = 6; x < 160; x += 11) {
    d += `<rect x="${x}" y="0" width="5" height="100" fill="#a07c55" stroke="#4a3826" stroke-width="0.8"/>`;
    d += `<path d="M${x + 1.6} 0V100M${x + 3.4} 0V100" stroke="#6d5236" stroke-width="0.35" opacity="0.7"/>`;
  }
  return frame('#ded8cc', d + '<path d="M0 22H160" stroke="#1f1e1b" stroke-width="2"/>');
}
function earthSvg() {
  let d = '';
  for (let i = -100; i < 160; i += 7) d += `<path d="M${i} 100L${i + 100} 0"/>`;
  const r = rng(3);
  let p = '';
  for (let i = 0; i < 70; i++) p += `<circle cx="${(r() * 160).toFixed(1)}" cy="${(r() * 100).toFixed(1)}" r="${(0.6 + r() * 1.1).toFixed(2)}"/>`;
  return frame('#b4664a', `<g stroke="#7d3b26" stroke-width="0.9">${d}</g><g fill="#e2b49e" opacity="0.7">${p}</g>`);
}
