// Small 2D helpers: SVG creation, shadow sweeps and ray casting against polygons.

const NS = 'http://www.w3.org/2000/svg';

export function s(tag, attrs = {}, children = []) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

const f = (n) => Math.round(n * 100) / 100;

/** Polygon path in section space (y up) → SVG path (y down). */
export function polyPath(pts, flipY = true) {
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(flipY ? -y : y)}`).join('L') + 'Z';
}

export function linePath(pts, flipY = true) {
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(flipY ? -y : y)}`).join('L');
}

/**
 * Shadow volume of a polygon swept along direction (dx, dy) by length L.
 * Union of the polygon and one quad per edge; drawn with nonzero fill in an opacity group,
 * overlaps don't double-darken.
 */
function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    a += x0 * y1 - x1 * y0;
  }
  return a / 2;
}

const ccw = (pts) => (signedArea(pts) < 0 ? [...pts].reverse() : pts);

export function sweepPath(pts, dx, dy, L = 320, flipY = true) {
  // every sub-path wound the same way, so nonzero fill gives a true union (no cancelling holes)
  const P = ccw(pts);
  let d = polyPath(P, flipY);
  const ox = dx * L;
  const oy = dy * L;
  for (let i = 0; i < P.length; i++) {
    const a = P[i];
    const b = P[(i + 1) % P.length];
    // only edges facing away from the light can bound the shadow volume (halves the work)
    const nx = b[1] - a[1];
    const ny = -(b[0] - a[0]);
    if (nx * dx + ny * dy <= 0) continue;
    const quad = [a, b, [b[0] + ox, b[1] + oy], [a[0] + ox, a[1] + oy]];
    if (Math.abs(signedArea(quad)) < 1e-6) continue;
    d += polyPath(ccw(quad), flipY);
  }
  return d;
}

export function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1 };
}

export function prepare(polys) {
  return polys.map((pts) => ({ pts, box: bbox(pts) }));
}

function segHit(px, py, qx, qy, ax, ay, bx, by) {
  const rx = qx - px, ry = qy - py, sx = bx - ax, sy = by - ay;
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-12) return false;
  const t = ((ax - px) * sy - (ay - py) * sx) / den;
  const u = ((ax - px) * ry - (ay - py) * rx) / den;
  return t > 1e-6 && t <= 1 && u >= 0 && u <= 1;
}

/** Does the segment p → p + dir·L cross any prepared polygon? */
export function blocked(p, dir, prepared, L = 260) {
  const qx = p[0] + dir[0] * L;
  const qy = p[1] + dir[1] * L;
  const rx0 = Math.min(p[0], qx), rx1 = Math.max(p[0], qx);
  const ry0 = Math.min(p[1], qy), ry1 = Math.max(p[1], qy);
  for (const { pts, box } of prepared) {
    if (box.x1 < rx0 || box.x0 > rx1 || box.y1 < ry0 || box.y0 > ry1) continue;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if (segHit(p[0], p[1], qx, qy, a[0], a[1], b[0], b[1])) return true;
    }
  }
  return false;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p, sh) => (p >> sh) & 255;
  const c = (sh) => Math.round(lerp(ch(pa, sh), ch(pb, sh), clamp(t)));
  return `#${((1 << 24) | (c(16) << 8 * 2) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}
