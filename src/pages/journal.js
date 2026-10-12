import { boot, idle } from '../shell.js';
import { lightAt } from '../model/light.js';
import { terraceById, DEPTH, FLOOR } from '../model/site.js';
import { createSection } from '../components/section.js';

boot();
idle(() => {
  const june = document.getElementById('fig-june');
  if (june) {
    const W1 = terraceById.W1;
    const X = (u) => W1.back + W1.s * u;
    const sec = createSection(june, {
      variant: 'detail',
      crop: { x0: -31, x1: -5, y0: -1.2, y1: 11.8 },
      ariaLabel: 'Detail of the west terrace verandah at noon on 21 June.',
      labels: [{ text: ['Eave shadow', 'almost straight down'], at: [X(DEPTH + 0.6), W1.base + FLOOR - 0.2], pos: [-15.4, 4.4], anchor: 'start' }],
    });
    sec.update({ sun: lightAt('jun', 12 * 60 + 25).sun, season: 'jun' });
  }
  const water = document.getElementById('fig-water');
  if (water) {
    const sec = createSection(water, {
      variant: 'detail',
      crop: { x0: -11, x1: 11, y0: -3.6, y1: 6.4 },
      ariaLabel: 'Detail of the rain garden in June, holding water.',
      labels: [{ text: ['Monsoon water', 'held in the pools'], at: [0.6, -0.7], pos: [2.2, -2.7], anchor: 'start', halo: true }],
    });
    sec.update({ sun: lightAt('jun', 10 * 60).sun, season: 'jun' });
  }
});
