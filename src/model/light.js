// Light analysis on the illustrative section. 2D assumption: terraces run north–south and are long,
// so only the sun's east–west/up components cast shadows across the section. Brightness uses true altitude.

import { buildSectionModel } from './site.js';
import { prepare, blocked } from '../lib/geometry.js';
import { sunAt, dayTimes, SEASONS } from '../lib/solar.js';

export const model = buildSectionModel();
const hard = prepare(model.hard);
const soft = prepare(model.soft);

/** Section-plane light direction (toward the sun), or null when the sun is down in the section. */
export function sectionDir(sun) {
  if (sun.U <= 0.002) return null;
  const len = Math.hypot(sun.E, sun.U);
  return [sun.E / len, sun.U / len];
}

function pointLight(p, dir) {
  if (!dir) return 0;
  if (blocked(p, dir, hard)) return 0;
  return blocked(p, dir, soft) ? 0.45 : 1;
}

/** Fraction (0–1) of a room's living/verandah floor in direct sun. */
export function roomLight(room, dir) {
  if (!dir) return 0;
  let sum = 0;
  for (const p of room.samples) sum += pointLight(p, dir);
  return sum / room.samples.length;
}

export function valleyLight(dir) {
  if (!dir) return 0;
  let sum = 0;
  for (const p of model.valleySamples) sum += pointLight(p, dir);
  return sum / model.valleySamples.length;
}

export function lightAt(seasonKey, minutes) {
  const sun = sunAt(SEASONS[seasonKey].day, minutes);
  const dir = sectionDir(sun);
  const rooms = {};
  for (const r of model.rooms) rooms[`${r.terrace}-${r.level}`] = roomLight(r, dir);
  return { sun, dir, rooms, valley: valleyLight(dir) };
}

/**
 * Direct sun along a home's floor, from the back wall (u = 0) to the verandah edge (u = 16),
 * for drawing the sun patch on the floor plan. Returns [{u0, u1, k}] lit runs (k = intensity).
 */
export function floorProfile(terraceId, level, dir) {
  const room = model.rooms.find((r) => r.terrace === terraceId && r.level === level);
  if (!room || !dir) return [];
  const t = model.terraces.find((p) => p.t.id === terraceId).t;
  const y = room.rect.y + 0.08;
  const step = 0.25;
  const runs = [];
  let cur = null;
  for (let u = 0.5; u <= 15.9; u += step) {
    const k = pointLight([t.back + t.s * u, y], dir);
    if (k > 0) {
      if (cur && cur.k === k && Math.abs(cur.u1 - u) < step * 1.5) cur.u1 = u + step;
      else {
        cur = { u0: u, u1: u + step, k };
        runs.push(cur);
      }
    } else cur = null;
  }
  return runs;
}

const cache = new Map();
const THRESHOLD = 0.25;

/** Daily direct-sun summary per terrace level for a season (cached). */
export function daySummary(seasonKey) {
  if (cache.has(seasonKey)) return cache.get(seasonKey);
  const n = SEASONS[seasonKey].day;
  const { sunrise, sunset } = dayTimes(n);
  const step = 10;
  const out = {};
  for (const r of model.rooms) {
    let minutes = 0;
    let first = null;
    let last = null;
    for (let t = Math.ceil(sunrise / step) * step; t <= sunset; t += step) {
      const sun = sunAt(n, t);
      if (sun.altitude < 2) continue;
      if (roomLight(r, sectionDir(sun)) >= THRESHOLD) {
        minutes += step;
        if (first === null) first = t;
        last = t;
      }
    }
    out[`${r.terrace}-${r.level}`] = { minutes, first, last };
  }
  cache.set(seasonKey, out);
  return out;
}

export function formatDuration(min) {
  if (!min) return 'none';
  const q = Math.round(min / 15) * 15;
  const h = Math.floor(q / 60);
  const m = q % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}
