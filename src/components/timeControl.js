import { reducedMotion } from '../lib/motion.js';
// Time-of-day control: native range input (keyboard + screen reader friendly), season choice, play.

import { SEASONS, dayTimes, formatClock, compassWord } from '../lib/solar.js';

export const MIN_T = 5 * 60 + 30;
export const MAX_T = 19 * 60 + 30;


export function describeLight(light, seasonKey, minutes) {
  const { sun, rooms, valley } = light;
  const alt = sun.altitude;
  const avg = (ids) => ids.reduce((a, id) => a + rooms[id], 0) / ids.length;
  const west = avg(['W1-0', 'W1-1', 'W1-2', 'W2-0', 'W2-1', 'W2-2']);
  const east = avg(['E1-0', 'E1-1', 'E1-2', 'E2-0', 'E2-1', 'E2-2']);
  const morning = sun.E > 0;

  if (alt < -3) {
    return 'After dark. The terraces glow from within; the valley floor is unlit.';
  }
  if (alt < 2) {
    return morning
      ? 'First light. The sun is still below the eastern rim of the fold; the valley fills with even, shadowless light.'
      : 'Last light. The sun has dropped behind the western rim; both terraces sit in soft, even light.';
  }
  const parts = [];
  if (west > 0.3 && east < 0.15) {
    parts.push('Low morning sun reaches deep into the west-terrace homes, which face east. The east terrace is still in its own shade.');
  } else if (east > 0.25 && west < 0.15) {
    parts.push('Afternoon sun now strikes the east terrace, which faces west. The timber louvres break it up before it reaches the living rooms.');
  } else if (west < 0.12 && east < 0.12 && alt > 35) {
    parts.push('The sun is high. Deep eaves keep the living rooms on both terraces in shade, so the light falls on roofs, courtyards and the valley floor.');
  } else if (west >= 0.15 && east >= 0.15) {
    parts.push('Sun reaches living rooms on both terraces.');
  } else if (morning) {
    parts.push('Morning sun is climbing. It is leaving the west-terrace living rooms as the eaves begin to shade them.');
  } else {
    parts.push('Afternoon sun is sinking toward the western rim and starting to reach under the eaves of the east terrace.');
  }
  if (valley > 0.55) parts.push('The valley floor is in sun.');
  else if (valley < 0.25) parts.push('The valley floor is mostly shaded by the rain trees and the slope.');

  const noon = dayTimes(SEASONS[seasonKey].day).noon;
  if (Math.abs(minutes - noon) < 75) {
    if (seasonKey === 'jun') parts.push('In June the midday sun stands slightly north of overhead, so on the plan the shadows point south.');
    if (seasonKey === 'dec') parts.push(`In December the midday sun sits about ${Math.round(alt)}° up in the south, so shadows on the plan point north.`);
  }
  return parts.join(' ');
}

export function createTimeControl(host, { store, compact = false, idPrefix = 'tc' }) {
  const root = document.createElement('div');
  root.className = `timebar${compact ? ' timebar--compact' : ''}`;
  const seasonButtons = Object.entries(SEASONS)
    .map(
      ([k, v]) =>
        `<label class="seg"><input type="radio" name="${idPrefix}-season" value="${k}"><span>${v.label}</span></label>`,
    )
    .join('');
  root.innerHTML = `
    <div class="timebar-row">
      <button type="button" class="play" aria-pressed="false" aria-label="Play the day">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path class="i-play" d="M4 2.5v11l9-5.5z"/><path class="i-pause" d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>
      </button>
      <div class="clock" aria-hidden="true">
        <span class="clock-time">--</span>
        <span class="clock-meta">--</span>
      </div>
      <div class="range-wrap">
        <label class="sr-only" for="${idPrefix}-range">Time of day (IST)</label>
        <input id="${idPrefix}-range" class="range" type="range" min="${MIN_T}" max="${MAX_T}" step="5">
        <div class="ticks" aria-hidden="true">
          <span class="tick tick--rise"></span><span class="tick tick--noon"></span><span class="tick tick--set"></span>
        </div>
        <div class="range-ends" aria-hidden="true"><span>5:30 am</span><span>7:30 pm</span></div>
      </div>
      <fieldset class="seasons">
        <legend class="sr-only">Day of the year</legend>
        ${seasonButtons}
      </fieldset>
    </div>`;
  host.append(root);

  const range = root.querySelector('.range');
  const play = root.querySelector('.play');
  const time = root.querySelector('.clock-time');
  const meta = root.querySelector('.clock-meta');
  const ticks = {
    rise: root.querySelector('.tick--rise'),
    noon: root.querySelector('.tick--noon'),
    set: root.querySelector('.tick--set'),
  };
  const pct = (m) => `${((m - MIN_T) / (MAX_T - MIN_T)) * 100}%`;

  range.addEventListener('input', () => {
    stop();
    store.set({ minutes: Number(range.value) });
  });
  for (const r of root.querySelectorAll('input[type=radio]')) {
    r.addEventListener('change', () => store.set({ season: r.value }));
  }

  let raf = 0;
  let last = 0;
  let stepTimer = 0;
  function stop() {
    cancelAnimationFrame(raf);
    clearInterval(stepTimer);
    raf = 0;
    stepTimer = 0;
    play.setAttribute('aria-pressed', 'false');
    play.setAttribute('aria-label', 'Play the day');
  }
  function start() {
    play.setAttribute('aria-pressed', 'true');
    play.setAttribute('aria-label', 'Pause');
    let m = store.get().minutes;
    if (m >= MAX_T - 5) store.set({ minutes: MIN_T });
    if (reducedMotion()) {
      stepTimer = setInterval(() => {
        m = store.get().minutes + 30;
        if (m > MAX_T) return stop();
        store.set({ minutes: m });
      }, 700);
      return;
    }
    last = performance.now();
    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      m = store.get().minutes + dt * 0.065; // ≈ 14 s for the day
      if (m >= MAX_T) {
        store.set({ minutes: MAX_T });
        return stop();
      }
      store.set({ minutes: m });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  play.addEventListener('click', () => (raf || stepTimer ? stop() : start()));

  function render(state, light) {
    const { minutes, season } = state;
    if (Number(range.value) !== Math.round(minutes / 5) * 5) range.value = String(Math.round(minutes / 5) * 5);
    const clock = formatClock(minutes);
    const alt = light.sun.altitude;
    const where = alt > 0 ? `sun ${Math.round(alt)}° up, ${compassWord(light.sun.azimuth)}` : alt > -6 ? 'twilight' : 'night';
    time.textContent = clock;
    meta.textContent = `${SEASONS[season].label} · ${where}`;
    range.setAttribute('aria-valuetext', `${clock}, ${SEASONS[season].name}, ${where}`);
    for (const r of root.querySelectorAll('input[type=radio]')) r.checked = r.value === season;
    const { sunrise, sunset, noon } = dayTimes(SEASONS[season].day);
    ticks.rise.style.left = pct(sunrise);
    ticks.noon.style.left = pct(noon);
    ticks.set.style.left = pct(sunset);
    ticks.rise.title = `Sunrise ${formatClock(sunrise)}`;
    ticks.set.title = `Sunset ${formatClock(sunset)}`;
    root.style.setProperty('--day-start', pct(sunrise));
    root.style.setProperty('--day-end', pct(sunset));
  }

  return { render, stop };
}
