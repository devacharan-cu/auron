// Landscape plates: photographs of the North Bengaluru region and the wider plateau, used as context.
// None of them shows Rainfold, which does not exist. Data: plates.json (Wikimedia Commons; see public/images/credits.json).

import PLATES from './plates.json';
import { plateInner } from './plateMarkup.js';

export { PLATES };

/** Fallback only: plates are normally written into the HTML at build time. */
export function mountPlates(root = document) {
  for (const fig of root.querySelectorAll('figure[data-plate]:not(.plate)')) {
    const p = PLATES[fig.dataset.plate];
    if (!p) continue;
    fig.classList.add('plate');
    fig.innerHTML = plateInner(p, fig.dataset.plate, fig.dataset.no, fig.dataset.sizes, fig.hasAttribute('data-eager'));
  }
}

export function creditsList() {
  return Object.values(PLATES)
    .map(
      (p) =>
        `<li><a href="${p.source}" target="_blank" rel="noopener">${p.caption.replace(/ —.*$/, '')}</a> · ${p.author} · ${
          p.licenseUrl ? `<a href="${p.licenseUrl}" target="_blank" rel="noopener">${p.license}</a>` : p.license
        }. Shown cropped and lightly colour-graded (reduced saturation)${
          p.license.startsWith('CC BY-SA') ? '; the adapted image is shared under the same licence' : ''
        }.</li>`,
    )
    .join('');
}
