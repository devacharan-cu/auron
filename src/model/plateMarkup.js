// Plate (photograph) markup, shared by the build (static HTML) and the browser (fallback).
// Pure string functions: no DOM, so vite.config.js can use them at build time.

const set = (key, ext) => `/images/${key}-800.${ext} 800w, /images/${key}-1600.${ext} 1600w`;
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function plateInner(p, key, no = '', sizes = '(max-width: 760px) 100vw, 60vw', eager = false) {
  return `
      <div class="plate-frame">
        <picture>
          <source type="image/avif" srcset="${set(key, 'avif')}" sizes="${sizes}">
          <source type="image/webp" srcset="${set(key, 'webp')}" sizes="${sizes}">
          <img src="/images/${key}-1600.jpg" srcset="${set(key, 'jpg')}" sizes="${sizes}" width="${p.w}" height="${p.h}"
               alt="${attr(p.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        </picture>
      </div>
      <figcaption class="plate-cap">
        <span class="plate-no">Plate ${no}</span>
        <span class="plate-text">${p.caption} <em>Landscape context, not the site.</em></span>
        <span class="plate-credit">${p.kind || 'Photo'}: ${p.author} · <a href="${p.source}" target="_blank" rel="noopener">${p.license}</a></span>
      </figcaption>`;
}
