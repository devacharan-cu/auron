// The living section: master drawing + time control + quick moments + phone focus views + readout.
// One function so every page that shows it behaves identically and shares the same clock.

import { createSection } from './section.js';
import { createTimeControl, describeLight, MIN_T, MAX_T } from './timeControl.js';
import { dayTimes, SEASONS } from '../lib/solar.js';

const FOCUS = { west: [-63, -11], valley: [-37, 37], east: [11, 63] };

export function mountLiving(root, { store, narrow, idPrefix = 'main' }) {
  const master = createSection(root.querySelector('.master-host'), { variant: 'full' });
  const time = createTimeControl(root.querySelector('.living-controls'), { store, idPrefix });
  const readout = root.querySelector('.readout');

  const focusBtns = [...root.querySelectorAll('.focus button')];
  const setFocus = (key, animate = true) => {
    for (const b of focusBtns) b.setAttribute('aria-pressed', String(b.dataset.focus === key));
    if (narrow.matches) master.setView(...FOCUS[key], animate, 23);
    else master.setView(-72, 72, false);
  };
  for (const b of focusBtns) b.addEventListener('click', () => setFocus(b.dataset.focus));
  narrow.addEventListener('change', () => setFocus('valley', false));
  setFocus('valley', false);

  const moments = [...root.querySelectorAll('.moments button')];
  for (const b of moments) {
    b.addEventListener('click', () => {
      const { sunrise, sunset, noon } = dayTimes(SEASONS[store.get().season].day);
      const t = { dawn: sunrise + 8, morning: sunrise + 110, noon, afternoon: sunset - 140, dusk: sunset - 4, night: MAX_T }[b.dataset.moment];
      store.set({ minutes: Math.max(MIN_T, Math.min(MAX_T, Math.round(t / 5) * 5)) });
    });
  }

  let lastText = '';
  return {
    update(state, light) {
      master.update({ sun: light.sun, season: state.season });
      time.render(state, light);
      const text = describeLight(light, state.season, state.minutes);
      if (readout && text !== lastText) {
        readout.textContent = text;
        lastText = text;
      }
      const { sunrise, sunset, noon } = dayTimes(SEASONS[state.season].day);
      const m = state.minutes;
      const near = (a, tol = 25) => Math.abs(m - a) <= tol;
      const cur = near(sunrise + 8) ? 'dawn' : near(sunrise + 110) ? 'morning' : near(noon) ? 'noon' : near(sunset - 140) ? 'afternoon' : near(sunset - 4) ? 'dusk' : m >= sunset + 40 ? 'night' : '';
      for (const b of moments) b.setAttribute('aria-pressed', String(b.dataset.moment === cur));
    },
  };
}

/** The markup for a living section block (kept in one place, inserted where a page asks for it). */
export const livingMarkup = (caption = 'Section A–A through all four terraces') => `
  <figure class="drawing master">
    <div class="sheet-cap"><span class="sc-no">Drawing S-01</span><span>${caption}</span><span>Illustrative · not to scale for construction</span></div>
    <div class="master-host"></div>
    <div class="focus" role="group" aria-label="Part of the section to show">
      <button type="button" data-focus="west">West terrace</button>
      <button type="button" data-focus="valley" aria-pressed="true">Valley</button>
      <button type="button" data-focus="east">East terrace</button>
    </div>
  </figure>
  <div class="instrument">
    <div class="living-controls"></div>
    <div class="moments" role="group" aria-label="Jump to a time of day">
      <button type="button" data-moment="dawn">Dawn</button><button type="button" data-moment="morning">Morning</button>
      <button type="button" data-moment="noon">Noon</button><button type="button" data-moment="afternoon">Afternoon</button>
      <button type="button" data-moment="dusk">Dusk</button><button type="button" data-moment="night">Night</button>
    </div>
  </div>
  <p class="readout" aria-live="polite"></p>`;
