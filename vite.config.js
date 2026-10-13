import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { plateInner } from './src/model/plateMarkup.js';

const root = process.cwd();
const IGNORE = new Set(['node_modules', 'dist', 'dev', 'assets', 'public', 'research_notes', 'reports', 'src', 'scripts', 'partials']);

/** Every page in the site: index.html files in folders (pretty URLs) plus 404.html. */
function pages(dir = root, out = {}) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!IGNORE.has(name)) pages(p, out);
    } else if (name === 'index.html' || (dir === root && name === '404.html')) {
      const key = relative(root, p).replace(/\\/g, '/').replace(/\/?index\.html$/, '').replace(/\.html$/, '') || 'home';
      out[key] = resolve(p);
    }
  }
  return out;
}

/**
 * Sharing metadata, written from each page's own <title> and description.
 * Absolute URLs (canonical, og:url, og:image) need the public origin: set SITE_URL, or on Vercel
 * the production domain is used automatically. Without either, only the relative tags are written.
 */
const host = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
const SITE = host ? host.replace(/\/+$/, '') : '';

function social(html, path) {
  const title = (/<title>([^<]*)<\/title>/.exec(html) || [])[1];
  const desc = (/<meta name="description" content="([^"]*)"/.exec(html) || [])[1];
  if (!title || !desc) return html;
  const notFound = path === '/404.html';
  const url = SITE + path.replace(/index\.html$/, '');
  const tags = [
    notFound && '<meta name="robots" content="noindex" />',
    SITE && !notFound && `<link rel="canonical" href="${url}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Rainfold · Auron (fictional concept)" />',
    '<meta property="og:locale" content="en_IN" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    SITE && !notFound && `<meta property="og:url" content="${url}" />`,
    SITE && `<meta property="og:image" content="${SITE}/og.jpg" />`,
    SITE && '<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />',
    SITE && '<meta property="og:image:alt" content="Rainfold: a section line drawn over the monsoon plateau north of Bengaluru. A fictional portfolio concept." />',
    `<meta name="twitter:card" content="${SITE ? 'summary_large_image' : 'summary'}" />`,
  ].filter(Boolean);
  return html.replace(/(<meta name="theme-color"[^>]*>)/, `$1\n    ${tags.join('\n    ')}`);
}

/**
 * Build-time partials: <!--#header key="architecture"--> and <!--#footer-->.
 * The shared masthead and footer live once, in /partials, and are written into each static page.
 */
function partials() {
  const read = (f) => readFileSync(join(root, 'partials', f), 'utf8');
  return {
    name: 'ff-partials',
    transformIndexHtml(html, ctx) {
      return social(html, ctx.path)
        .replace(/<!--#header key="([a-z-]*)"-->/, (_, key) =>
          read('header.html').replace(`data-key="${key}"`, `data-key="${key}" aria-current="page"`),
        )
        .replace('<!--#footer-->', read('footer.html'))
        // plates rendered into the HTML, so their space is reserved and images load without JS
        .replace(/<figure([^>]*?)\sdata-plate="([a-z0-9-]+)"([^>]*)><\/figure>/g, (m, a, key, b) => {
          const plates = JSON.parse(readFileSync(join(root, 'src/model/plates.json'), 'utf8'));
          const p = plates[key];
          if (!p) return m;
          const all = a + b;
          const get = (n) => (new RegExp(`data-${n}="([^"]*)"`).exec(all) || [])[1];
          const eager = /data-eager/.test(all);
          const cls = /class="([^"]*)"/.exec(all);
          const rest = all.replace(/\sclass="[^"]*"/, '');
          return `<figure${rest} data-plate="${key}" class="${cls ? cls[1] + ' ' : ''}plate">${plateInner(p, key, get('no') || '', get('sizes'), eager)}</figure>`;
        });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), partials()],
  appType: 'mpa', // unknown routes 404, as on a static host
  server: { port: 5180, strictPort: false }, // falls back to the next free port if 5180 is busy
  // `npm run preview` sends the same security headers as production (vercel.json), so the CSP is tested locally
  preview: {
    headers: Object.fromEntries(JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')).headers[0].headers.map((h) => [h.key, h.value])),
  },
  build: { rollupOptions: { input: pages() } },
});
