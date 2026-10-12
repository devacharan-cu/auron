// Homes: site plan (where along the valley) + section (terrace & level) + floor plan (rooms & sun)
// + schedule (the accessible list of everything). One selection, one clock.

import { RESIDENCES, residenceById, areaText } from '../model/residences.js';
import { TERRACES, SECTION_CUT_Y, UNITS } from '../model/site.js';
import { daySummary, formatDuration, floorProfile, sectionDir } from '../model/light.js';
import { SEASONS, formatClock } from '../lib/solar.js';
import { createSitePlan } from './sitePlan.js';
import { createSection } from './section.js';
import { createTimeControl } from './timeControl.js';
import { renderFloorPlan } from './floorPlan.js';

const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const narrow = window.matchMedia('(max-width: 760px)');

function facingCompass(r) {
  const ang = r.faces === 'East' ? 90 : 270;
  const side = r.aspect.includes('North') ? 0 : r.aspect.includes('South') ? 180 : null;
  const arrow = (a, cls) => {
    const rad = (a * Math.PI) / 180;
    const x = Math.sin(rad) * 15;
    const y = -Math.cos(rad) * 15;
    return `<path class="${cls}" d="M0 0L${x.toFixed(1)} ${y.toFixed(1)}"/><circle class="${cls}-tip" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2"/>`;
  };
  return `<svg class="facing" viewBox="-24 -26 48 50" aria-hidden="true">
    <circle class="facing-ring" r="19"/><text class="facing-n" x="0" y="-21" text-anchor="middle">N</text>
    ${side !== null ? arrow(side, 'facing-side') : ''}${arrow(ang, 'facing-main')}
    <rect class="facing-home" x="-4" y="-6" width="8" height="12"/></svg>`;
}

export function mountHomes({ store, list = true, compare = false, onCompare } = {}) {
  const select = (patch) => {
    const cur = residenceById[store.get().selected];
    const terrace = patch.terrace ?? cur.terrace;
    const level = patch.level ?? cur.level;
    const unit = patch.unit ?? cur.unit;
    const id = `${terrace}-${level}${unit}`;
    if (residenceById[id]) store.set({ selected: id });
  };

  // WHERE — plan + level + section
  const plan = createSitePlan(document.getElementById('plan-host'), { onSelect: (terrace, unit) => select({ terrace, unit }) });
  const levelBtns = [...document.querySelectorAll('.level-pick button[data-level]')];
  for (const b of levelBtns) b.addEventListener('click', () => select({ level: Number(b.dataset.level) }));
  const section = createSection(document.getElementById('loc-section-host'), {
    variant: 'compact',
    onSelect: (terrace, level) => select({ terrace, level }),
  });
  const cutNote = document.getElementById('cut-note');
  // phones: the plan shows one side of the valley at a time
  const sideBtns = [...document.querySelectorAll('.side-pick button')];
  let side = null;
  function showSide(s2) {
    side = s2;
    for (const b of sideBtns) b.setAttribute('aria-pressed', String(b.dataset.side === s2));
    if (narrow.matches) plan.setView(...(s2 === 'west' ? [-74, 9] : [-9, 74]));
    else plan.setView(-74, 74);
  }
  for (const b of sideBtns) b.addEventListener('click', () => showSide(b.dataset.side));
  narrow.addEventListener('change', () => showSide(side || 'west'));

  // WHAT — the home card (built once; parts update)
  const card = document.getElementById('detail-host');
  card.innerHTML = `
    <article class="home-card" aria-labelledby="hc-id">
      <div class="hc-head">
        <div>
          <p class="eyebrow">Residence · illustrative only</p>
          <h3 class="hc-id" id="hc-id"></h3>
          <p class="hc-type"></p>
        </div>
        <div class="hc-face"></div>
      </div>
      <div class="hc-tools">
        <div class="units" role="group" aria-label="Area units">
          <button type="button" data-units="sqft">sq ft</button><button type="button" data-units="m2">m²</button>
        </div>
        ${compare ? '<button type="button" class="btn btn--ghost hc-compare" aria-pressed="false">Add to compare</button>' : ''}
        <p class="hc-where"></p>
      </div>
      <figure class="hc-plan">
        <div class="sheet-cap"><span class="sc-no">Drawing H-01</span><span class="hc-plan-title"></span><span>Schematic layout</span></div>
        <div class="fp-host"></div>
        <figcaption class="hc-sun"></figcaption>
      </figure>
      <div class="hc-time"></div>
      <dl class="facts"></dl>
      <p class="sr-only" aria-live="polite" data-hc-live></p>
      <p class="detail-note">Layouts, areas and orientations are concept placeholders. Sun patches and hours come from the simplified section geometry. They aren't a daylight study, and they say nothing about availability or price.</p>
    </article>`;
  const el = (sel) => card.querySelector(sel);
  const timeCtl = createTimeControl(el('.hc-time'), { store, compact: true, idPrefix: 'home' });
  card.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-units]');
    if (b) store.set({ units: b.dataset.units });
    if (e.target.closest('.hc-compare')) onCompare?.(store.get().selected);
  });

  // LIST — schedule (optional: the homepage links to it instead)
  const listHost = list ? document.getElementById('list-host') : document.createElement('div');
  listHost.innerHTML = `
    <div class="list-head">
      <h3 class="mini-head">Schedule · all 48 homes · illustrative, not a price or availability list</h3>
      <p class="list-count" aria-live="polite"></p>
      <div class="filters" role="group" aria-label="Filter residences">
        <label class="filter"><span>Terrace</span><select data-filter="terrace"><option value="">All</option>
          ${TERRACES.map((t) => `<option value="${t.id}">${t.id} · ${t.name.replace(' terrace, ', ' ')}</option>`).join('')}</select></label>
        <label class="filter"><span>Level</span><select data-filter="level"><option value="">All</option><option value="0">Garden</option><option value="1">Middle</option><option value="2">Roof terrace</option></select></label>
        <label class="filter"><span>Faces</span><select data-filter="faces"><option value="">All</option><option value="East">East</option><option value="West">West</option></select></label>
        <label class="filter"><span>Bedrooms</span><select data-filter="bedrooms"><option value="">All</option><option value="3">3</option><option value="4">4</option></select></label>
      </div>
    </div>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Residence schedule (illustrative)">
      <table class="schedule"><caption class="sr-only">Illustrative residence schedule</caption>
        <thead><tr>${compare ? '<th scope="col" class="cmp-col"><span class="sr-only">Compare</span></th>' : ''}<th scope="col">Home</th><th scope="col">Level</th><th scope="col">Faces</th>
          <th scope="col" class="num">Carpet</th><th scope="col" class="num">BHK</th><th scope="col" class="num sun-col">Sun</th></tr></thead>
        <tbody></tbody></table>
    </div>`;
  const tbody = listHost.querySelector('tbody');
  const filters = {};
  for (const sel of listHost.querySelectorAll('select[data-filter]')) {
    sel.addEventListener('change', () => {
      filters[sel.dataset.filter] = sel.value;
      renderList(store.get());
    });
  }
  let refocus = null;
  tbody.addEventListener('change', (e) => {
    const c = e.target.closest('input[data-compare]');
    if (c) {
      refocus = `cmp:${c.dataset.compare}`;
      onCompare?.(c.dataset.compare);
    }
  });
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    refocus = btn.dataset.id;
    store.set({ selected: btn.dataset.id });
  });

  function renderList(state) {
    const sum = daySummary(state.season);
    const rows = RESIDENCES.filter(
      (r) =>
        (!filters.terrace || r.terrace === filters.terrace) &&
        (!filters.level || String(r.level) === filters.level) &&
        (!filters.faces || r.faces === filters.faces) &&
        (!filters.bedrooms || String(r.bedrooms) === filters.bedrooms),
    );
    listHost.querySelector('.list-count').textContent = `${rows.length} of ${RESIDENCES.length} illustrative homes · sun = direct sun on the living floor, ${SEASONS[state.season].label}`;
    listHost.querySelector('.sun-col').textContent = `Sun · ${SEASONS[state.season].label}`;
    tbody.innerHTML = rows
      .map((r) => {
        const on = r.id === state.selected;
        const cmp = state.compare.includes(r.id);
        return `<tr class="${on ? 'is-selected' : ''}">
          ${compare ? `<td class="cmp-col"><input type="checkbox" data-compare="${esc(r.id)}" ${cmp ? 'checked' : ''} aria-label="Compare ${esc(r.label)}" ${!cmp && state.compare.length >= 3 ? 'title="Up to three homes"' : ''}></td>` : ''}
          <th scope="row"><button type="button" data-id="${esc(r.id)}" aria-pressed="${on}">${esc(r.label)}</button></th>
          <td>${esc(r.levelName.replace(' level', ''))}</td><td>${esc(r.aspect)}</td>
          <td class="num">${esc(areaText(r.carpetSqft, state.units))}</td><td class="num">${r.bedrooms}</td>
          <td class="num">${esc(formatDuration(sum[`${r.terrace}-${r.level}`].minutes))}</td></tr>`;
      })
      .join('');
    if (refocus) {
      const sel = refocus.startsWith('cmp:') ? `input[data-compare="${refocus.slice(4)}"]` : `button[data-id="${refocus}"]`;
      tbody.querySelector(sel)?.focus();
      refocus = null;
    }
  }

  // Announce a change of home once, rather than making the whole card a live region
  // (the plan and sun caption re-render on every step of the time control).
  let announced = null;
  function renderCard(state) {
    const r = residenceById[state.selected];
    if (announced && announced !== r.id) el('[data-hc-live]').textContent = `Selected ${r.label}: ${r.bedrooms} BHK, ${areaText(r.carpetSqft, state.units)} carpet, ${r.terraceName}, ${r.levelName}.`;
    announced = r.id;
    const sum = daySummary(state.season)[`${r.terrace}-${r.level}`];
    el('.hc-id').textContent = r.label;
    el('.hc-type').innerHTML = `${r.bedrooms} BHK <span aria-hidden="true">/</span> ${esc(areaText(r.carpetSqft, state.units))} <em>carpet</em>`;
    el('.hc-face').innerHTML = facingCompass(r);
    el('.hc-where').textContent = `${r.terraceName} · ${r.levelName} · home ${r.unit}, ${r.pavilion.toLowerCase()} pavilion`;
    el('.hc-plan-title').textContent = `Plan of ${r.label}`;
    for (const b of card.querySelectorAll('button[data-units]')) b.setAttribute('aria-pressed', String(b.dataset.units === state.units));
    const cb = card.querySelector('.hc-compare');
    if (cb) {
      const inList = state.compare.includes(r.id);
      cb.setAttribute('aria-pressed', String(inList));
      cb.textContent = inList ? 'In comparison ✓' : state.compare.length >= 3 ? 'Compare (replaces oldest)' : 'Add to compare';
    }
    const span = sum.minutes ? ` · ${formatClock(sum.first)}–${formatClock(sum.last + 10)}` : '';
    el('.facts').innerHTML = `
      <div><dt>Faces</dt><dd>${esc(r.aspect)}, toward the valley</dd></div>
      <div><dt>Floor level</dt><dd>+${r.floorLevel.toFixed(1)} m above the rain-garden rim</dd></div>
      <div><dt>Open space</dt><dd>${esc(r.openSpace)} · ${esc(areaText(r.openSqft, state.units))}</dd></div>
      <div><dt>Entrance</dt><dd>${esc(r.entrance)}</dd></div>
      <div class="fact-sun"><dt>Direct sun on the living floor · ${esc(SEASONS[state.season].label)}</dt><dd><strong>${esc(formatDuration(sum.minutes))}</strong>${esc(span)}</dd></div>`;
  }

  function renderPlan(state, light) {
    const r = residenceById[state.selected];
    const runs = floorProfile(r.terrace, r.level, sectionDir(light.sun));
    renderFloorPlan(el('.fp-host'), r, { runs, units: state.units });
    const clock = `${formatClock(state.minutes)}, ${SEASONS[state.season].label}`;
    el('.hc-sun').innerHTML = runs.length
      ? `<span class="sun-key"></span>Direct sun on the floor at ${esc(clock)}`
      : `<span class="sun-key sun-key--none"></span>No direct sun on this floor at ${esc(clock)}${light.sun.altitude <= 0 ? ' (sun down)' : ''}`;
  }

  function focusSection(r) {
    const t = TERRACES.find((x) => x.id === r.terrace);
    if (narrow.matches) {
      const cx = (t.xMin + t.xMax) / 2;
      const half = 34;
      const x0 = Math.max(-72, Math.min(72 - half * 2, cx - half));
      section.setView(x0, x0 + half * 2, true, 22);
    } else section.setView(section.home.x, section.home.x + section.home.w, false);
  }
  narrow.addEventListener('change', () => focusSection(residenceById[store.get().selected]));

  return {
    update(state, prev, light) {
      const timeChanged = !prev || prev.minutes !== state.minutes || prev.season !== state.season;
      const selChanged = !prev || prev.selected !== state.selected;
      if (timeChanged) {
        section.update({ sun: light.sun, season: state.season });
        plan.update({ sun: light.sun, season: state.season });
        timeCtl.render(state, light);
      }
      if (selChanged) {
        const r = residenceById[state.selected];
        section.select(r.terrace, r.level, r.label);
        plan.select(r.terrace, r.unit, r.label);
        for (const b of levelBtns) b.setAttribute('aria-pressed', String(Number(b.dataset.level) === r.level));
        const u = UNITS.find((x) => x.unit === r.unit);
        cutNote.textContent = u.y0 <= SECTION_CUT_Y && u.y1 >= SECTION_CUT_Y
          ? 'Cut A–A passes through this home'
          : `Cut A–A is representative: home ${r.unit} has the same section`;
        focusSection(r);
        const flank = r.terrace.startsWith('W') ? 'west' : 'east';
        if (flank !== side) showSide(flank);
      }
      if (selChanged || timeChanged || prev.units !== state.units || prev.compare !== state.compare) {
        if (selChanged || !prev || prev.season !== state.season || prev.units !== state.units || prev.compare !== state.compare) {
          renderList(state);
          renderCard(state);
        }
        renderPlan(state, light);
      }
    },
  };
}
