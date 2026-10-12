// The one shared state for the whole site: the clock (time + day of year), the selected
// residence, area units and the comparison list. Persisted locally so it follows the visitor
// from page to page (and across tabs); nothing ever leaves the browser.

import { createStore } from './store.js';

const KEY = 'auron-state-v1';
const DEFAULTS = { minutes: 8 * 60 + 15, season: 'mar', selected: 'W1-1A', units: 'sqft', compare: [] };
const SEASONS = new Set(['mar', 'jun', 'dec']);
const ID = /^[WE][12]-[012][ABCD]$/;

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const s = { ...DEFAULTS };
    if (Number.isFinite(raw.minutes) && raw.minutes >= 330 && raw.minutes <= 1170) s.minutes = raw.minutes;
    if (SEASONS.has(raw.season)) s.season = raw.season;
    if (ID.test(raw.selected)) s.selected = raw.selected;
    if (raw.units === 'm2' || raw.units === 'sqft') s.units = raw.units;
    if (Array.isArray(raw.compare)) s.compare = raw.compare.filter((x) => ID.test(x)).slice(0, 3);
    return s;
  } catch {
    return { ...DEFAULTS };
  }
}

export const store = createStore(load());

// saved synchronously (a few dozen bytes), so a choice survives an immediate page change
store.subscribe((s, prev) => {
  if (!prev) return;
  try {
    const { minutes, season, selected, units, compare } = s;
    localStorage.setItem(KEY, JSON.stringify({ minutes: Math.round(minutes), season, selected, units, compare }));
  } catch {
    /* storage unavailable: state simply doesn't persist */
  }
});

// another tab changed the state: follow it
window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  const next = load();
  const cur = store.get();
  if (JSON.stringify(next) !== JSON.stringify({ ...cur, minutes: Math.round(cur.minutes) })) store.set(next);
});

export function toggleCompare(id) {
  const cur = store.get().compare;
  if (cur.includes(id)) store.set({ compare: cur.filter((x) => x !== id) });
  else store.set({ compare: [...cur, id].slice(-3) });
}
