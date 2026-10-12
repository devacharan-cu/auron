// Compare up to three homes side by side. Same data, same clock, same floor-plan renderer.

import { residenceById, areaText } from '../model/residences.js';
import { daySummary, formatDuration, floorProfile, sectionDir } from '../model/light.js';
import { SEASONS, formatClock } from '../lib/solar.js';
import { renderFloorPlan } from './floorPlan.js';

const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const narrow = window.matchMedia('(max-width: 760px)');

export function mountCompare(host, { store, onRemove }) {
  let last = null;
  narrow.addEventListener('change', () => last && render(...last));
  host.addEventListener('click', (e) => {
    const rm = e.target.closest('button[data-remove]');
    if (rm) onRemove(rm.dataset.remove);
    const pick = e.target.closest('button[data-pick]');
    if (pick) store.set({ selected: pick.dataset.pick });
  });

  function render(state, light) {
    last = [state, light];
    const ids = state.compare;
    if (!ids.length) {
      host.innerHTML = `<div class="cmp-empty"><p class="lede">Nothing to compare yet. Add up to three homes, either from the card above or with the boxes in the schedule.</p></div>`;
      return;
    }
    const sum = daySummary(state.season);
    const rows = ids.map((id) => residenceById[id]);
    if (narrow.matches) return renderCards(state, light, rows, sum);
    const cell = (fn) => rows.map((r) => `<td>${fn(r)}</td>`).join('');
    host.innerHTML = `
      <div class="table-wrap cmp-wrap" tabindex="0" role="region" aria-label="Comparison of selected homes (illustrative)">
        <table class="cmp">
          <caption class="sr-only">Comparison of up to three illustrative homes</caption>
          <thead><tr><th scope="col"><span class="sr-only">Attribute</span></th>${rows
            .map(
              (r) => `<th scope="col"><span class="cmp-id">${esc(r.label)}</span>
                <span class="cmp-actions"><button type="button" class="link" data-pick="${esc(r.id)}">Show in drawings</button>
                <button type="button" class="link" data-remove="${esc(r.id)}">Remove</button></span></th>`,
            )
            .join('')}</tr></thead>
          <tbody>
            <tr class="cmp-plan"><th scope="row">Plan at ${esc(formatClock(state.minutes))}, ${esc(SEASONS[state.season].label)}</th>${rows.map((r) => `<td><div class="cmp-fp" data-fp="${esc(r.id)}"></div></td>`).join('')}</tr>
            <tr><th scope="row">Type</th>${cell((r) => `${r.bedrooms} BHK`)}</tr>
            <tr><th scope="row">Carpet area</th>${cell((r) => esc(areaText(r.carpetSqft, state.units)))}</tr>
            <tr><th scope="row">Open space</th>${cell((r) => `${esc(r.openSpace)}<br>${esc(areaText(r.openSqft, state.units))}`)}</tr>
            <tr><th scope="row">Terrace · level</th>${cell((r) => `${esc(r.terraceName)}<br>${esc(r.levelName)}, +${r.floorLevel.toFixed(1)} m`)}</tr>
            <tr><th scope="row">Faces</th>${cell((r) => esc(r.aspect))}</tr>
            <tr><th scope="row">Direct sun on the living floor, ${esc(SEASONS[state.season].label)}</th>${cell((r) => {
              const s = sum[`${r.terrace}-${r.level}`];
              return `<strong>${esc(formatDuration(s.minutes))}</strong>${s.minutes ? `<br><span class="muted">${esc(formatClock(s.first))}–${esc(formatClock(s.last + 10))}</span>` : ''}`;
            })}</tr>
          </tbody>
        </table>
      </div>
      <p class="note">All figures illustrative: concept placeholders from a fictional project, not a price, availability or performance statement.</p>`;
    for (const r of rows) {
      const runs = floorProfile(r.terrace, r.level, sectionDir(light.sun));
      renderFloorPlan(host.querySelector(`[data-fp="${r.id}"]`), r, { runs, units: state.units, compact: true });
    }
  }
  // phones: one card per home, plan full width, facts stacked (a table can't hold three columns here)
  function renderCards(state, light, rows, sum) {
    host.innerHTML = `<ol class="cmp-cards">${rows
      .map((r) => {
        const s = sum[`${r.terrace}-${r.level}`];
        return `<li class="cmp-card">
          <div class="cmp-card-head"><span class="cmp-id">${esc(r.label)}</span>
            <span class="cmp-actions"><button type="button" class="link" data-pick="${esc(r.id)}">Show in drawings</button><button type="button" class="link" data-remove="${esc(r.id)}">Remove</button></span></div>
          <div class="cmp-fp-card" data-fp="${esc(r.id)}"></div>
          <dl class="facts">
            <div><dt>Type</dt><dd>${r.bedrooms} BHK · ${esc(areaText(r.carpetSqft, state.units))} carpet</dd></div>
            <div><dt>Open space</dt><dd>${esc(r.openSpace)} · ${esc(areaText(r.openSqft, state.units))}</dd></div>
            <div><dt>Terrace · level</dt><dd>${esc(r.terraceName)} · ${esc(r.levelName)}</dd></div>
            <div><dt>Faces</dt><dd>${esc(r.aspect)}</dd></div>
            <div class="fact-sun"><dt>Direct sun on the living floor · ${esc(SEASONS[state.season].label)}</dt><dd><strong>${esc(formatDuration(s.minutes))}</strong></dd></div>
          </dl></li>`;
      })
      .join('')}</ol>
      <p class="note">Plans at ${esc(formatClock(state.minutes))}, ${esc(SEASONS[state.season].label)}. All figures illustrative: concept placeholders from a fictional project, not a price, availability or performance statement.</p>`;
    for (const r of rows) {
      const runs = floorProfile(r.terrace, r.level, sectionDir(light.sun));
      renderFloorPlan(host.querySelector(`[data-fp="${r.id}"]`), r, { runs, units: state.units });
    }
  }

  return { render };
}
