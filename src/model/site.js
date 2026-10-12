// Rainfold — shared, illustrative site model.
// All dimensions are in metres. Section A–A runs west (−x) to east (+x), looking north.
// Elevations (y) are relative to the rain-garden rim (±0.0). Everything here is a concept, not survey data.

export const FLOOR = 3.4; // floor-to-floor
export const SLAB = 0.3;
export const DEPTH = 16; // back wall to verandah edge
export const VERANDAH = 3.4;
export const X_MIN = -72;
export const X_MAX = 72;

const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Natural ground: a shallow fold in the plateau, slightly higher to the west, with a rain-garden dip. */
export function naturalGround(x) {
  const a = Math.abs(x);
  const plateau = x < 0 ? 12 : 11;
  let y = plateau * smooth((a - 13) / 45);
  if (a < 6) y -= 1.0 * Math.cos(((a / 6) * Math.PI) / 2) ** 2;
  return y;
}

/** Inverse of the flank profile (for plan contours): distance from the valley axis at elevation z. */
export function flankOffsetAt(z, flank) {
  const plateau = flank === 'west' ? 12 : 11;
  const target = z / plateau;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (smooth(mid) < target) lo = mid;
    else hi = mid;
  }
  return 13 + 45 * ((lo + hi) / 2);
}

const TERRACE_DEFS = [
  { id: 'W2', flank: 'west', back: -57, name: 'West terrace, upper' },
  { id: 'W1', flank: 'west', back: -35, name: 'West terrace, lower' },
  { id: 'E1', flank: 'east', back: 35, name: 'East terrace, lower' },
  { id: 'E2', flank: 'east', back: 57, name: 'East terrace, upper' },
];

export const TERRACES = TERRACE_DEFS.map((d) => {
  const s = d.flank === 'west' ? 1 : -1; // direction from back wall toward the valley
  const valleyX = d.back + s * DEPTH;
  const base = Math.ceil((naturalGround(valleyX) + 0.15) * 10) / 10;
  const levels = 3;
  return {
    ...d,
    s,
    valleyX,
    base,
    levels,
    roof: base + levels * FLOOR,
    backGround: naturalGround(d.back),
    faces: d.flank === 'west' ? 'east' : 'west',
    planted: d.id.endsWith('1'),
    xMin: Math.min(d.back, valleyX),
    xMax: Math.max(d.back, valleyX),
  };
});

export const terraceById = Object.fromEntries(TERRACES.map((t) => [t.id, t]));

const X = (t, u) => t.back + t.s * u;

/** Rectangle in a terrace's local u (metres from back wall toward valley) and absolute y. */
function rectU(t, u0, u1, y0, y1) {
  const xa = X(t, u0);
  const xb = X(t, u1);
  const x0 = Math.min(xa, xb);
  const x1 = Math.max(xa, xb);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, pts: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] };
}

function ellipsePts(cx, cy, rx, ry, n = 28) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

/** Canopy outline with a slightly irregular, hand-drawn edge (deterministic). */
function canopyPts(cx, cy, rx, ry, seed = 1, n = 40) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wobble = 1 + 0.06 * Math.sin(a * 5 + seed) + 0.04 * Math.sin(a * 9 + seed * 2.3);
    // flatter underside, fuller crown — the umbrella form of a rain tree
    const under = Math.sin(a) < 0 ? 0.55 : 1;
    pts.push([cx + rx * Math.cos(a) * wobble, cy + ry * Math.sin(a) * wobble * under]);
  }
  return pts;
}

function buildSurface() {
  const pts = [];
  const feet = [...TERRACES].sort((a, b) => a.xMin - b.xMin);
  let x = X_MIN;
  for (const t of feet) {
    for (; x < t.xMin; x += 0.25) pts.push([x, naturalGround(x)]);
    pts.push([t.xMin, naturalGround(t.xMin)]);
    pts.push([t.xMin, t.base - SLAB]);
    pts.push([t.xMax, t.base - SLAB]);
    pts.push([t.xMax, naturalGround(t.xMax)]);
    x = t.xMax + 0.25;
  }
  for (; x <= X_MAX; x += 0.25) pts.push([x, naturalGround(x)]);
  pts.push([X_MAX, naturalGround(X_MAX)]);
  return pts;
}

export const surfaceAt = (x) => {
  for (const t of TERRACES) if (x >= t.xMin && x <= t.xMax) return t.base - SLAB;
  return naturalGround(x);
};

function buildTerraceParts(t) {
  const poche = []; // cut solids
  const soil = []; // planted roof build-up (cut)
  const louvres = []; // soft occluders
  const glass = []; // [x, y0, y1]
  const rails = []; // [x, y0, y1]
  const beyond = []; // thin elevation-beyond lines [[x0,y0],[x1,y1]]
  const rooms = [];
  const top = t.roof;

  for (let k = 0; k <= t.levels; k++) {
    const y = t.base + k * FLOOR;
    let ext = DEPTH;
    if (k === t.levels) ext = DEPTH + 0.25;
    else if (k > 0) ext = DEPTH + (t.faces === 'east' ? 0.9 : 0.6); // eaves
    poche.push(rectU(t, 0, ext, y - SLAB, y));
  }

  for (let k = 0; k < t.levels; k++) {
    const yf = t.base + k * FLOOR;
    const yc = yf + FLOOR - SLAB;
    // back wall: retaining where earth is behind it, openings to the courtyard above
    const solidTop = Math.max(yf + 0.9, t.backGround + 0.5);
    const lintel = yc - 0.35;
    if (lintel - solidTop < 0.6) {
      poche.push(rectU(t, 0, 0.4, yf, yc));
    } else {
      poche.push(rectU(t, 0, 0.4, yf, solidTop));
      poche.push(rectU(t, 0, 0.4, lintel, yc));
      glass.push([X(t, 0.2), solidTop, lintel]);
    }
    // valley façade
    glass.push([X(t, DEPTH - VERANDAH), yf, yc]);
    if (t.faces === 'west') {
      louvres.push(rectU(t, DEPTH - 0.12, DEPTH, yf + 1.0, yc - 0.05));
    }
    rails.push([X(t, DEPTH - 0.05), yf, yf + 1.05]);
    // partition beyond (with door head)
    beyond.push([[X(t, 7), yf + 2.2], [X(t, 7), yc]]);
    beyond.push([[X(t, 6.2), yf], [X(t, 6.2), yf + 2.2]]);
    beyond.push([[X(t, 6.2), yf + 2.2], [X(t, 7), yf + 2.2]]);

    const samples = [];
    for (let u = 7.4; u <= DEPTH - 0.3; u += 0.5) samples.push([X(t, u), yf + 0.08]);
    rooms.push({
      terrace: t.id,
      level: k,
      rect: rectU(t, 0.4, DEPTH, yf, yc),
      samples,
      label: [X(t, 4), yf + 1.4],
    });
  }

  // roof: parapets, upstand, railing, planted build-up
  poche.push(rectU(t, 0, 0.35, top, top + 1.0));
  poche.push(rectU(t, DEPTH - 0.1, DEPTH + 0.25, top, top + 0.55));
  rails.push([X(t, DEPTH + 0.05), top + 0.55, top + 1.1]);
  if (t.planted) soil.push(rectU(t, 0.35, DEPTH - 0.1, top, top + 0.4));

  return { poche, soil, louvres, glass, rails, beyond, rooms };
}

export function buildSectionModel() {
  const surface = buildSurface();
  const terrainPoly = [...surface, [X_MAX, -7], [X_MIN, -7]];

  const terraces = TERRACES.map((t) => ({ t, ...buildTerraceParts(t) }));

  const trees = [
    // shared valley: two rain trees
    { x: -8.5, base: naturalGround(-8.5), cy: 10.6, rx: 8.6, ry: 3.3, seed: 1.3, big: true },
    { x: 9.5, base: naturalGround(9.5), cy: 9.8, rx: 7.2, ry: 2.9, seed: 2.7, big: true },
    // courtyards
    { x: -38, base: naturalGround(-38), cy: naturalGround(-38) + 5.6, rx: 2.5, ry: 2.2, seed: 4.1 },
    { x: 38, base: naturalGround(38), cy: naturalGround(38) + 5.3, rx: 2.4, ry: 2.1, seed: 5.2 },
    // plateau edges
    { x: -65, base: naturalGround(-65), cy: naturalGround(-65) + 6.2, rx: 3.6, ry: 2.6, seed: 6.4 },
    { x: 64, base: naturalGround(64), cy: naturalGround(64) + 5.8, rx: 3.3, ry: 2.4, seed: 7.9 },
  ].map((tr) => ({ ...tr, pts: canopyPts(tr.x, tr.cy, tr.rx, tr.ry, tr.seed) }));

  const hard = [
    terrainPoly,
    ...terraces.flatMap((p) => [...p.poche, ...p.soil].map((r) => r.pts)),
  ];
  const soft = [
    ...trees.map((tr) => tr.pts),
    ...terraces.flatMap((p) => p.louvres.map((r) => r.pts)),
  ];
  const rooms = terraces.flatMap((p) => p.rooms);
  const valleySamples = [];
  for (let x = -12; x <= 12; x += 0.75) valleySamples.push([x, naturalGround(x) + 0.05]);

  return { surface, terrainPoly, terraces, trees, hard, soft, rooms, valleySamples, ellipsePts };
}

// Plan (north up). The valley axis meanders gently; terraces are straight bars cut into the slope.
export const PLAN_Y = 41;
export const meander = (y) => 1.6 * Math.sin(y / 17) + 0.8 * Math.sin(y / 7 + 2);

// Each terrace: a north and a south pavilion, two homes per level in each.
export const UNITS = [
  { unit: 'A', pavilion: 'North', y0: 20, y1: 32, end: 'north' },
  { unit: 'B', pavilion: 'North', y0: 8, y1: 20, end: null },
  { unit: 'C', pavilion: 'South', y0: -20, y1: -8, end: null },
  { unit: 'D', pavilion: 'South', y0: -32, y1: -20, end: 'south' },
];
export const SECTION_CUT_Y = 26;
