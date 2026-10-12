import { reducedMotion } from '../lib/motion.js';

/** Masthead: border on scroll, and the menu drawer on narrow screens. */
export function mountMasthead() {
  const head = document.querySelector('.masthead');
  if (!head) return;
  const onScroll = () => head.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const btn = head.querySelector('.mh-menu');
  const nav = document.getElementById('site-nav');
  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    head.classList.remove('is-open');
    document.documentElement.classList.remove('nav-open');
  };
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    head.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    if (open) nav.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && head.classList.contains('is-open')) {
      close();
      btn.focus();
    }
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });
  // keyboard focus moving past the drawer into the hidden page closes it
  head.addEventListener('focusout', (e) => {
    if (head.classList.contains('is-open') && e.relatedTarget && !head.contains(e.relatedTarget)) close();
  });
}

/** Homepage only: a quiet rail of the five chapters, marking the one in view. */
export function mountChapterRail() {
  const rail = document.querySelector('.chapter-rail');
  if (!rail) return;
  const links = new Map([...rail.querySelectorAll('a')].map((a) => [a.dataset.chapter, a]));
  const visible = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) visible.set(e.target.dataset.chapter, e.intersectionRatio);
      let best = null;
      let max = 0;
      for (const [k, v] of visible) if (v > max) [best, max] = [k, v];
      if (!best) return;
      for (const [k, a] of links) {
        if (k === best) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    },
    { threshold: [0, 0.1, 0.25, 0.5], rootMargin: '-15% 0px -45% 0px' },
  );
  for (const sec of document.querySelectorAll('section.ch[data-chapter]')) io.observe(sec);
}

/** Fade-in for headings and text blocks as they enter (never photographs; skipped under reduced motion). */
export function mountReveals() {
  if (reducedMotion()) return;
  const els = document.querySelectorAll('.ch-head, .page-head, .principles li, .reveal-me');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target;
          el.classList.add('is-in');
          setTimeout(() => el.classList.add('is-done'), 1100);
          io.unobserve(el);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  for (const el of els) {
    el.classList.add('reveal');
    io.observe(el);
  }
}
