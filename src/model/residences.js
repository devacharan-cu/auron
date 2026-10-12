// Illustrative residence schedule. Every number here is a concept placeholder:
// no availability, price, approval or construction status is implied.

import { TERRACES, UNITS } from './site.js';

export const SQFT_PER_M2 = 10.7639;

const LEVEL_NAMES = ['Garden level', 'Middle level', 'Roof-terrace level'];
const OPEN_SPACE = ['Verandah + private garden', 'Verandah', 'Verandah + roof terrace'];

function carpet(terrace, level, unit) {
  // end homes gain side windows and a fourth bedroom on the roof level
  const isEnd = unit.end !== null;
  let sqft = isEnd ? 1820 : 1680;
  if (level === 0) sqft -= 90; // part of the back is retained earth
  if (level === 2 && isEnd) sqft = 2240;
  if (terrace.id.endsWith('2')) sqft += 40; // upper terraces are slightly deeper at the court
  return sqft;
}

function bedrooms(level, unit) {
  return level === 2 && unit.end !== null ? 4 : 3;
}

function openArea(level) {
  // verandah 12 m × 3.4 m, plus garden or roof terrace
  const verandah = 41;
  return Math.round((verandah + (level === 0 ? 38 : level === 2 ? 96 : 0)) * SQFT_PER_M2 / 5) * 5;
}

export const RESIDENCES = TERRACES.flatMap((t) =>
  [0, 1, 2].flatMap((level) =>
    UNITS.map((u) => {
      const faces = t.faces === 'east' ? 'East' : 'West';
      const side = u.end ? ` + ${u.end === 'north' ? 'North' : 'South'}` : '';
      return {
        id: `${t.id}-${level}${u.unit}`,
        label: `${t.id}·${level}${u.unit}`,
        terrace: t.id,
        terraceName: t.name,
        flank: t.flank,
        level,
        levelName: LEVEL_NAMES[level],
        unit: u.unit,
        pavilion: u.pavilion,
        faces,
        aspect: faces + side,
        entrance: t.flank === 'west' ? 'From the courtyard, west side' : 'From the courtyard, east side',
        bedrooms: bedrooms(level, u),
        carpetSqft: carpet(t, level, u),
        openSqft: openArea(level),
        openSpace: OPEN_SPACE[level],
        floorLevel: Math.round((t.base + level * 3.4) * 10) / 10,
      };
    }),
  ),
);

export const residenceById = Object.fromEntries(RESIDENCES.map((r) => [r.id, r]));

export function areaText(sqft, units) {
  if (units === 'm2') return `${Math.round(sqft / SQFT_PER_M2)} m²`;
  return `${sqft.toLocaleString('en-IN')} sq ft`;
}
