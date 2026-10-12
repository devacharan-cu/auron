// Loaded by every page: type, styles, reduced-motion switch, masthead, plates, footer mark.
import '@fontsource-variable/newsreader/opsz.css';
import './styles/fonts.css'; // static 400 italic for the variable family (the variable italic is ~5x larger)
import '@fontsource-variable/instrument-sans/wdth.css';
import './styles/main.css';
import './lib/motion.js';

import { mountPlates, creditsList } from './model/images.js';
import { mountFooterMark } from './components/brand.js';
import { mountMasthead, mountReveals } from './components/nav.js';

export { store, toggleCompare } from './lib/state.js';

export function boot() {
  mountMasthead();
  mountPlates();
  const mark = document.querySelector('.fold-mark-lg');
  if (mark) mountFooterMark(mark);
  const credits = document.getElementById('credits');
  if (credits) credits.innerHTML = creditsList();
  mountReveals();
}

export const narrow = window.matchMedia('(max-width: 760px)');
export const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
