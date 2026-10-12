import { boot, idle } from '../shell.js';
import { lightAt } from '../model/light.js';
import { createSection } from '../components/section.js';

boot();
const SLOTS = {
  morning: { minutes: 7 * 60 + 30, crop: { x0: -42, x1: -12, y0: -1.5, y1: 15 }, cap: 'West terrace, Saturday 7:30 am' },
  noon: { minutes: 12 * 60 + 30, crop: { x0: -42, x1: -12, y0: -1.5, y1: 15 }, cap: 'West terrace, Saturday 12:30 pm' },
  afternoon: { minutes: 16 * 60 + 30, crop: { x0: 12, x1: 42, y0: -1.5, y1: 15 }, cap: 'East terrace, Saturday 4:30 pm' },
};
const VIA = { walk: 'a site walk', call: 'a call through the drawings', whatsapp: 'questions on WhatsApp' };
const form = document.getElementById('visit-flow');
const host = document.getElementById('visit-draw');
const cap = document.getElementById('preview-cap');
const summary = document.getElementById('visit-summary');
const result = document.getElementById('visit-result');

function preview() {
  const slot = form.slot.value;
  const cfg = SLOTS[slot];
  host.replaceChildren();
  const sec = createSection(host, { variant: 'detail', crop: cfg.crop, ariaLabel: `Preview: ${cfg.cap}, March light.` });
  sec.update({ sun: lightAt('mar', cfg.minutes).sun, season: 'mar' });
  cap.textContent = `${cfg.cap} · March light`;
}
function describe() {
  const label = form.querySelector('input[name=slot]:checked').closest('label').querySelector('strong').textContent;
  summary.textContent = `You've chosen ${VIA[form.via.value]}, ${form.via.value === 'walk' ? `on ${label}` : `about the ${label.split(', ')[1]} light`}.`;
  result.textContent = '';
}
form.addEventListener('change', (e) => {
  if (e.target.name === 'slot') preview();
  describe();
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  result.textContent = 'Noted, in this browser only. This is a prototype: nothing has been sent and no visit exists.';
});
idle(preview);
describe();
