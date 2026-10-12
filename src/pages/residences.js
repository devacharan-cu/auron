import { boot, store } from '../shell.js';
import { RESIDENCES, residenceById, areaText } from '../model/residences.js';
import { lightAt, daySummary, floorProfile, sectionDir, formatDuration } from '../model/light.js';
import { SEASONS, formatClock } from '../lib/solar.js';
import { renderFloorPlan } from '../components/floorPlan.js';
import { createTimeControl } from '../components/timeControl.js';

boot();

const TYPES = [
  { key: 'garden', name: 'Garden home', sub: 'Garden level · 3 BHK', rep: 'W1-0B', match: (r) => r.level === 0,
    text: 'At the foot of each terrace, a step above the valley walk, with a private garden beyond the verandah. The back of the home is set into the slope, so its rear rooms take light from the courtyard over the retained earth.' },
  { key: 'valley', name: 'Valley home', sub: 'Middle level · 3 BHK', rep: 'W1-1B', match: (r) => r.level === 1,
    text: 'The middle of the terrace: high enough to look over the rain trees, low enough to hear the valley. The verandah is a room outside, the width of the home.' },
  { key: 'roof', name: 'Roof-terrace home', sub: 'Roof level · 3 BHK', rep: 'W2-2B', match: (r) => r.level === 2 && r.bedrooms === 3,
    text: 'On top of the terrace, with a roof of its own above: a private terrace reached by a stair from the entry, open to the sky and the plateau.' },
  { key: 'end', name: 'Roof-terrace end home', sub: 'Roof level · 4 BHK', rep: 'W2-2A', match: (r) => r.level === 2 && r.bedrooms === 4,
    text: 'The end of each pavilion, with windows on three sides, a fourth bedroom, and the roof terrace above.' },
];

const tabs = document.getElementById('type-tabs');
const panel = document.getElementById('type-panel');
tabs.innerHTML = TYPES.map((t, i) => `<button type="button" role="tab" id="tt-${t.key}" aria-controls="type-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="tt-name">${t.name}</span><span class="tt-sub">${t.sub}</span></button>`).join('');
const tabEls = [...tabs.querySelectorAll('[role=tab]')];
let current = 0;

const range = (arr) => {
  const lo = Math.min(...arr), hi = Math.max(...arr);
  return lo === hi ? [lo] : [lo, hi];
};

function renderPanel(state) {
  const t = TYPES[current];
  const homes = RESIDENCES.filter(t.match);
  const rep = residenceById[t.rep];
  const sum = daySummary(state.season);
  const carpet = range(homes.map((h) => h.carpetSqft)).map((v) => areaText(v, state.units)).join(' – ');
  const sun = range(homes.map((h) => sum[`${h.terrace}-${h.level}`].minutes)).map(formatDuration).join(' – ');
  panel.setAttribute('aria-labelledby', `tt-${t.key}`);
  panel.innerHTML = `
    <figure class="type-plan">
      <div class="sheet-cap"><span class="sc-no">Drawing H-0${current + 1}</span><span>Plan of ${rep.label}, a typical ${t.name.toLowerCase()}</span><span>Schematic</span></div>
      <div class="fp-host"></div>
      <figcaption class="hc-sun"><span class="sun-key"></span>Direct sun on the floor at ${formatClock(state.minutes)}, ${SEASONS[state.season].label} · west terrace shown; east-terrace homes are mirrored</figcaption>
    </figure>
    <div class="type-text">
      <p class="eyebrow">Type ${String(current + 1).padStart(2, '0')} of 04 · illustrative</p>
      <h2 class="type-name">${t.name}</h2>
      <p class="type-sub">${t.sub}</p>
      <p class="type-body">${t.text}</p>
      <dl class="facts">
        <div><dt>Homes of this type</dt><dd>${homes.length} of 48</dd></div>
        <div><dt>Carpet area</dt><dd>${carpet}</dd></div>
        <div><dt>Open space</dt><dd>${rep.openSpace} · ${areaText(rep.openSqft, state.units)}</dd></div>
        <div><dt>Faces</dt><dd>East (west terrace) or West (east terrace), toward the valley</dd></div>
        <div class="fact-sun"><dt>Direct sun on the living floor · ${SEASONS[state.season].label}</dt><dd><strong>${sun}</strong> depending on terrace</dd></div>
      </dl>
      <p><a class="link-arrow" href="/residences/find/" data-pick="${t.rep}">Find these homes on the plan →</a></p>
    </div>`;
  const runs = floorProfile(rep.terrace, rep.level, sectionDir(lightAt(state.season, state.minutes).sun));
  renderFloorPlan(panel.querySelector('.fp-host'), rep, { runs, units: state.units });
}

function select(i, focus = false) {
  current = i;
  tabEls.forEach((b, k) => {
    b.setAttribute('aria-selected', String(k === i));
    b.tabIndex = k === i ? 0 : -1;
  });
  if (focus) tabEls[i].focus();
  renderPanel(store.get());
}
tabEls.forEach((b, i) => {
  b.addEventListener('click', () => select(i));
  b.addEventListener('keydown', (e) => {
    const k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (k) {
      e.preventDefault();
      select((i + k + TYPES.length) % TYPES.length, true);
    }
  });
});
panel.addEventListener('click', (e) => {
  const a = e.target.closest('[data-pick]');
  if (a) store.set({ selected: a.dataset.pick });
});

// area schedule by type
function renderAreas(state) {
  const rows = TYPES.map((t) => {
    const homes = RESIDENCES.filter(t.match);
    const carpet = range(homes.map((h) => h.carpetSqft)).map((v) => areaText(v, state.units)).join(' – ');
    return `<tr><th scope="row">${t.name}</th><td>${t.sub.split(' · ')[1]}</td><td class="num">${homes.length}</td><td class="num">${carpet}</td><td>${homes[0].openSpace}</td><td class="num">${areaText(homes[0].openSqft, state.units)}</td></tr>`;
  }).join('');
  document.getElementById('area-table').innerHTML = `<caption class="sr-only">Areas by home type (illustrative)</caption>
    <thead><tr><th scope="col">Type</th><th scope="col">BHK</th><th scope="col" class="num">Homes</th><th scope="col" class="num">Carpet area</th><th scope="col">Open space</th><th scope="col" class="num">Open space area</th></tr></thead>
    <tbody>${rows}</tbody>`;
}

const clock = createTimeControl(document.getElementById('type-clock'), { store, compact: true, idPrefix: 'type' });
store.subscribe((state, prev) => {
  const light = lightAt(state.season, state.minutes);
  clock.render(state, light);
  renderPanel(state);
  if (!prev || prev.units !== state.units) renderAreas(state);
});
