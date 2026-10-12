// Build-time image pipeline: one light, consistent grade (baked in, so no costly CSS filters)
// and modern formats. Sources: assets/images-src/*.jpg (Wikimedia Commons downloads, see credits.json).
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';

const SRC = 'assets/images-src';
const OUT = 'public/images';
const WIDTHS = [800, 1600];

for (const file of await readdir(SRC)) {
  if (!file.endsWith('.jpg')) continue;
  const { name } = parse(file);
  for (const w of WIDTHS) {
    const base = sharp(join(SRC, file))
      .resize({ width: w, withoutEnlargement: true })
      .modulate({ saturation: 0.82 })
      .linear(0.96, 4); // a touch less contrast, lifted blacks
    await base.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(join(OUT, `${name}-${w}.jpg`));
    await base.clone().webp({ quality: 74 }).toFile(join(OUT, `${name}-${w}.webp`));
    await base.clone().avif({ quality: 52, effort: 4 }).toFile(join(OUT, `${name}-${w}.avif`));
  }
  console.log('graded', name);
}

// Social share card (1200 × 630): the hero plate, the fold line and the fictional-concept label.
const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect x="0" y="0" width="1200" height="168" fill="#f3efe7"/>
  <text x="64" y="112" font-family="Georgia, 'Times New Roman', serif" font-size="84" fill="#1f1e1b">Rainfold</text>
  <text x="1136" y="76" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="22" letter-spacing="7" fill="#4a4741">AURON</text>
  <text x="1136" y="112" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="20" letter-spacing="2" fill="#69645a">FICTIONAL PORTFOLIO CONCEPT · NOT AN OFFER</text>
  <path d="M0 420 H300 C380 420 400 470 450 470 H750 C800 470 820 420 900 420 H1200" fill="none" stroke="#f3efe7" stroke-width="3"/>
  <text x="1184" y="616" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="14" fill="#f3efe7" opacity="0.9">Photo: Harsha K R, Nandi Hills (Wikimedia Commons) · CC BY-SA 2.0 · adapted</text>
</svg>`);
await sharp(join(SRC, 'nandi-monsoon.jpg'))
  .resize(1200, 462, { fit: 'cover', position: 'centre' })
  .modulate({ saturation: 0.82 })
  .linear(0.96, 4)
  .extend({ top: 168, background: '#f3efe7' })
  .composite([{ input: card, top: 0, left: 0 }])
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile('public/og.jpg');
console.log('share card public/og.jpg');
