import { boot, store, narrow, idle } from '../shell.js';
import { lightAt } from '../model/light.js';
import { terraceById, DEPTH, FLOOR } from '../model/site.js';
import { mountLiving, livingMarkup } from '../components/living.js';
import { createSection } from '../components/section.js';
import { mountSwatches } from '../components/brand.js';

boot();
const root = document.getElementById('living');
root.innerHTML = livingMarkup();
const living = mountLiving(root, { store, narrow });
store.subscribe((state, prev) => {
  if (!prev || prev.minutes !== state.minutes || prev.season !== state.season) living.update(state, lightAt(state.season, state.minutes));
});

// keyed detail: the east terrace's valley edge, numbers matching the keynotes beside it
idle(() => {
  const E1 = terraceById.E1;
  const X = (u) => E1.back + E1.s * u;
  const sec = createSection(document.getElementById('keyed-detail'), {
    variant: 'detail',
    crop: { x0: 14, x1: 37, y0: -1.5, y1: 14.5 },
    ariaLabel: 'Keyed detail of the east terrace valley edge at 4 pm on 21 March, with five numbered notes.',
    labels: [
      { text: '1', at: [X(9), E1.roof + 0.5], pos: [29, 13.4], anchor: 'middle' },
      { text: '2', at: [X(DEPTH + 0.5), E1.base + FLOOR * 2 - 0.15], pos: [16.2, 9.6], anchor: 'middle' },
      { text: '3', at: [X(DEPTH - 0.06), E1.base + FLOOR + 1.6], pos: [16.2, 5.4], anchor: 'middle' },
      { text: '4', at: [X(DEPTH - 1.7), E1.base + 0.4], pos: [20.8, -0.6], anchor: 'middle', halo: true },
      { text: '5', at: [X(0.2), E1.base + FLOOR * 2 + 1.4], pos: [35.6, 12.6], anchor: 'middle' },
    ],
  });
  sec.svg.classList.add('sec--keyed');
  // ring each key number, matching the numbered notes beside the drawing
  requestAnimationFrame(() => {
    for (const tx of sec.svg.querySelectorAll('.annotations .anno text')) {
      const b = tx.getBBox();
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', b.x + b.width / 2);
      ring.setAttribute('cy', b.y + b.height / 2);
      ring.setAttribute('class', 'key-ring');
      tx.before(ring);
    }
  });
  sec.update({ sun: lightAt('mar', 16 * 60).sun, season: 'mar' });
  mountSwatches(document.getElementById('swatches'));
});
