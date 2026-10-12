import { reducedMotion } from '../lib/motion.js';
// Record: each design decision shown as a detail of Section A–A, at the hour it matters.

import { createSection } from './section.js';
import { lightAt } from '../model/light.js';
import { terraceById, naturalGround, DEPTH, FLOOR } from '../model/site.js';
import { SEASONS, formatClock } from '../lib/solar.js';

const W1 = terraceById.W1;
const W2 = terraceById.W2;
const E1 = terraceById.E1;
const xw = (t, u) => t.back + t.s * u;

export const DECISIONS = [
  {
    title: 'Follow the contour',
    text: 'The terraces step with the slope. Earth cut from behind each one is held by its back wall, so the valley keeps its shape. There is no podium and no levelled platform.',
    crop: { x0: -62, x1: -13, y0: -4, y1: 23 },
    season: 'mar', minutes: 9 * 60,
    where: 'West terraces',
    labels: [
      { text: 'Retained earth', at: [xw(W1, 0.2) - 1, 2.6], pos: [-50, -1.6], anchor: 'middle', halo: true },
      { text: 'Courtyard', at: [-38, naturalGround(-38) + 0.3], pos: [-38, 2.3], anchor: 'middle', halo: true },
      { text: ['Each terrace', 'looks over the next'], at: [xw(W2, 15.5), W2.roof + 0.3], pos: [-30, 19.6], anchor: 'start' },
    ],
  },
  {
    title: 'A courtyard behind every home',
    text: 'Every home opens to the valley at the front and to a courtyard at the back, so air can cross it. Bedrooms take the quieter courtyard side, where late light comes in over the slope.',
    crop: { x0: -46, x1: -24, y0: -1, y1: 17 },
    season: 'mar', minutes: 16 * 60 + 40,
    where: 'West terrace, courtyard side',
    labels: [
      { text: ['Back windows', 'above the retained earth'], at: [xw(W1, 0.2), W1.base + FLOOR * 2 + 1.6], pos: [-45, 13.6], anchor: 'start' },
      { text: 'Cross-ventilation', at: [xw(W1, 8), W1.base + FLOOR * 2 + 1.5], pos: [-28, 13.6], anchor: 'middle' },
    ],
  },
  {
    title: 'Louvres where the sun is hardest',
    text: 'The east terrace faces west, into the low afternoon sun. Timber louvres on its verandahs break that light up before it reaches the living rooms. The west terrace faces the gentler morning sun and doesn’t need them.',
    crop: { x0: 13, x1: 37, y0: -1.5, y1: 15 },
    season: 'mar', minutes: 16 * 60,
    where: 'East terrace, valley side',
    labels: [
      { text: ['Timber louvres', 'filter the west sun'], at: [xw(E1, DEPTH - 0.06), E1.base + FLOOR * 2 + 1.6], pos: [27.5, 13.6], anchor: 'middle' },
    ],
  },
  {
    title: 'Eaves for the high sun',
    text: 'At 13° N the midday sun is almost overhead for much of the year. Deep eaves keep it off the glass, while the low morning sun still reaches well inside.',
    crop: { x0: -25, x1: -9, y0: -1, y1: 12.5 },
    season: 'jun', minutes: 12 * 60 + 30,
    where: 'West terrace, verandah edge',
    labels: [
      { text: ['0.9 m eave', 'shades the glass at noon'], at: [xw(W1, DEPTH + 0.85), W1.base + FLOOR * 2 - 0.15], pos: [-15.6, 3.9], anchor: 'start' },
    ],
  },
  {
    title: 'Water held, not drained',
    text: 'Run-off from the roofs and slopes collects in shallow pools on the valley floor rather than in a storm drain. The pools fill in the monsoon and overflow north toward a tank. The rain trees shade the walk beside them.',
    crop: { x0: -11, x1: 11, y0: -3.6, y1: 6.4 },
    season: 'jun', minutes: 10 * 60,
    where: 'Valley floor',
    labels: [
      { text: ['Monsoon water', 'held in the rain garden'], at: [0.6, -0.7], pos: [2.2, -2.7], anchor: 'start', halo: true },
      { text: 'Reeds and stones', at: [-4.2, 0.2], pos: [-6.2, 3.4], anchor: 'middle' },
      { text: 'Rain-tree trunks', at: [9.5, 3.2], pos: [7.2, 5.2], anchor: 'middle' },
      { text: 'Valley walk', at: [-3.6, 0.1], pos: [-9.8, -2.4], anchor: 'start', halo: true },
    ],
  },
];

const pad = (i) => String(i + 1).padStart(2, '0');
const caption = (d, i) => `Detail ${pad(i)} · ${d.where} · ${SEASONS[d.season].label}, ${formatClock(d.minutes)} · illustrative`;

/** Draw one decision's detail (a cropped Section A–A at its own fixed hour) into host. */
export function drawDecision(host, i) {
  const d = DECISIONS[i];
  const sec = createSection(host, {
    variant: 'detail',
    crop: d.crop,
    labels: d.labels,
    ariaLabel: `Detail ${pad(i)} of Section A–A: ${d.title.toLowerCase()}, ${d.where.toLowerCase()}, shown at ${formatClock(d.minutes)} on ${SEASONS[d.season].label}.`,
  });
  sec.update({ sun: lightAt(d.season, d.minutes).sun, season: d.season });
  return sec;
}

/** Homepage: one featured decision and a compact register linking to the Record. */
export function mountFeatured(host, listHost, i = 0) {
  const d = DECISIONS[i];
  host.innerHTML = `
    <article class="decision decision--feature">
      <div class="dc-text">
        <p class="dc-no">Decision ${pad(i)}</p>
        <h3 class="dc-title">${d.title}</h3>
        <p class="dc-body">${d.text}</p>
      </div>
      <figure class="dc-fig"><div class="dc-draw"></div><figcaption class="dc-cap">${caption(d, i)}</figcaption></figure>
    </article>`;
  drawDecision(host.querySelector('.dc-draw'), i);
  listHost.innerHTML = DECISIONS.map((x, k) => `<li><a href="/record/#d-${pad(k)}"><span>D-${pad(k)}</span>${x.title}</a></li>`).join('');
}

/**
 * Record page: a drawing register. One decision is open at a time (tabs), so the page stays short;
 * each detail drawing is only built the first time it is opened.
 */
export function mountRegister(host) {
  host.innerHTML = `
    <div class="reg-layout">
      <div class="reg-tabs" role="tablist" aria-label="Design decisions" aria-orientation="vertical">
        ${DECISIONS.map(
          (d, i) => `<button type="button" role="tab" id="tab-d-${pad(i)}" aria-controls="d-${pad(i)}" aria-selected="false" tabindex="-1">
            <span class="reg-no">D-${pad(i)}</span><span class="reg-title">${d.title}</span><span class="reg-when">${SEASONS[d.season].label}, ${formatClock(d.minutes)}</span></button>`,
        ).join('')}
      </div>
      ${DECISIONS.map(
        (d, i) => `<section class="reg-panel" role="tabpanel" id="d-${pad(i)}" aria-labelledby="tab-d-${pad(i)}" hidden>
          <div class="dc-text">
            <p class="dc-no">Decision ${pad(i)} of ${DECISIONS.length}</p>
            <h3 class="dc-title">${d.title}</h3>
            <p class="dc-body">${d.text}</p>
          </div>
          <figure class="dc-fig"><div class="dc-draw"></div><figcaption class="dc-cap">${caption(d, i)}</figcaption></figure>
        </section>`,
      ).join('')}
    </div>`;
  const tabs = [...host.querySelectorAll('[role=tab]')];
  const panels = [...host.querySelectorAll('[role=tabpanel]')];
  const drawn = new Set();
  const narrow = window.matchMedia('(max-width: 1024px)');
  function open(i, focus = false, user = false) {
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    panels.forEach((p, k) => (p.hidden = k !== i));
    if (!drawn.has(i)) {
      drawDecision(panels[i].querySelector('.dc-draw'), i);
      drawn.add(i);
    }
    if (focus) tabs[i].focus();
    // stacked layout: the panel sits below the list, so bring it into view after a tap
    if (user && !focus && narrow.matches) panels[i].scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#d-${pad(i)}`);
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => open(i, false, true));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (k) {
        e.preventDefault();
        open((i + k + tabs.length) % tabs.length, true);
      } else if (e.key === 'Home') open(0, true);
      else if (e.key === 'End') open(tabs.length - 1, true);
    });
  });
  const fromHash = /^#d-(\d\d)$/.exec(location.hash);
  open(fromHash ? Math.min(DECISIONS.length - 1, Number(fromHash[1]) - 1) : 0);
}
