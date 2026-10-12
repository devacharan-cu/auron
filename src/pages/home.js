import { boot, store, narrow, idle, toggleCompare } from '../shell.js';
import '@fontsource/noto-sans-kannada/400.css';
import { lightAt } from '../model/light.js';
import { createSitePlan } from '../components/sitePlan.js';
import { mountLiving, livingMarkup } from '../components/living.js';
import { mountHomes } from '../components/homes.js';
import { mountFeatured } from '../components/record.js';
import { mountFoldLine } from '../components/brand.js';
import { mountChapterRail } from '../components/nav.js';

boot();
mountChapterRail();

// 01 · Rainfold
mountFoldLine(document.getElementById('fold-line'));

// 02 · Ground — the drainage drawing (static morning light; crops to the valley on phones)
const groundPlan = createSitePlan(document.getElementById('ground-plan'), { variant: 'landscape' });
groundPlan.update({ sun: lightAt('mar', 8 * 60 + 40).sun, season: 'jun' });
const fitGround = () => (narrow.matches ? groundPlan.setView(-44, 44) : groundPlan.setView(-74, 74));
narrow.addEventListener('change', fitGround);
fitGround();

// 03 · Section
const livingRoot = document.getElementById('living');
livingRoot.innerHTML = livingMarkup();
const living = mountLiving(livingRoot, { store, narrow });

// 04 · Homes (schedule and comparison live on /residences/find/)
const homes = mountHomes({ store, list: false, onCompare: toggleCompare });

// 05 · Record — one featured decision, built when idle
idle(() => mountFeatured(document.getElementById('featured-decision'), document.getElementById('register-mini'), 0));

store.subscribe((state, prev) => {
  const light = lightAt(state.season, state.minutes);
  if (!prev || prev.minutes !== state.minutes || prev.season !== state.season) living.update(state, light);
  homes.update(state, prev, light);
});
