import { boot, narrow } from '../shell.js';
import { lightAt } from '../model/light.js';
import { createSitePlan } from '../components/sitePlan.js';
import { linkList } from '../components/keyed.js';

boot();
const plan = createSitePlan(document.getElementById('key-plan'), {
  variant: 'key',
  markers: [
    { n: 1, x: -46, y: 0 },
    { n: 2, x: 0, y: 12 },
    { n: 3, x: 27, y: -4 },
    { n: 4, x: 65, y: 4 },
  ],
});
plan.update({ sun: lightAt('mar', 9 * 60).sun, season: 'mar' });
linkList(document.getElementById('key-list'), 'data-area', plan);
void narrow;
