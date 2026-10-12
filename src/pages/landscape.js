import { boot, narrow, idle } from '../shell.js';
import { lightAt } from '../model/light.js';
import { createSitePlan } from '../components/sitePlan.js';
import { createSection } from '../components/section.js';
import { linkList } from '../components/keyed.js';

boot();
const plan = createSitePlan(document.getElementById('places-plan'), {
  variant: 'key',
  markers: [
    { n: 1, x: -10, y: -14 },
    { n: 2, x: 3.5, y: 3 },
    { n: 3, x: 9.5, y: 30 },
    { n: 4, x: -38, y: -4 },
    { n: 5, x: -27, y: 26 },
  ],
});
plan.update({ sun: lightAt('mar', 9 * 60).sun, season: 'jun' });
const fit = () => (narrow.matches ? plan.setView(-48, 40) : plan.setView(-74, 74));
narrow.addEventListener('change', fit);
fit();
linkList(document.getElementById('place-list'), 'data-place', plan);

idle(() => {
  const crop = { x0: -11, x1: 11, y0: -3.6, y1: 6.4 };
  const labels = (wet) => [
    { text: wet ? ['Water held', 'in the pools'] : ['Dry bed', 'reeds and stones'], at: [0.6, -0.7], pos: [2.2, -2.7], anchor: 'start', halo: true },
    { text: 'Valley walk', at: [-3.6, 0.1], pos: [-9.8, -2.4], anchor: 'start', halo: true },
  ];
  for (const [id, season, wet] of [['season-dry', 'mar', false], ['season-wet', 'jun', true]]) {
    const sec = createSection(document.getElementById(id), { variant: 'detail', crop, labels: labels(wet), ariaLabel: `Rain garden detail, ${wet ? 'June, holding water' : 'March, dry'}.` });
    sec.update({ sun: lightAt(season, 10 * 60).sun, season });
  }
});
