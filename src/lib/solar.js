// Simplified solar geometry for an illustrative North Bengaluru setting.
// Standard textbook approximations: Cooper's declination, a short equation-of-time series,
// hour angle from local solar time. No refraction or terrain horizon. Good to a degree or two —
// enough to show direction and season honestly; not a daylight simulation.

export const LATITUDE = 13.1; // °N, illustrative North Bengaluru
export const LONGITUDE = 77.6; // °E
const IST_MERIDIAN = 82.5; // UTC+5:30

export const SEASONS = {
  mar: { day: 80, label: '21 Mar', name: 'March equinox' },
  jun: { day: 172, label: '21 Jun', name: 'June solstice' },
  dec: { day: 355, label: '21 Dec', name: 'December solstice' },
};

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export const declination = (n) => 23.44 * Math.sin(rad((360 * (284 + n)) / 365));

/** Equation of time, minutes. */
export function equationOfTime(n) {
  const b = rad((360 * (n - 81)) / 364);
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

const offsetMinutes = (n) => (LONGITUDE - IST_MERIDIAN) * 4 + equationOfTime(n);

/**
 * Sun direction for day-of-year n at IST clock minutes.
 * Returns a unit vector in local East / North / Up plus altitude & azimuth (degrees, azimuth from north, clockwise).
 */
export function sunAt(n, istMinutes) {
  const solarMinutes = istMinutes + offsetMinutes(n);
  const h = rad((solarMinutes / 60 - 12) * 15);
  const d = rad(declination(n));
  const p = rad(LATITUDE);
  const U = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(h);
  const E = -Math.cos(d) * Math.sin(h);
  const N = Math.cos(p) * Math.sin(d) - Math.sin(p) * Math.cos(d) * Math.cos(h);
  let azimuth = deg(Math.atan2(E, N));
  if (azimuth < 0) azimuth += 360;
  return { E, N, U, altitude: deg(Math.asin(Math.max(-1, Math.min(1, U)))), azimuth, solarMinutes };
}

/** Geometric sunrise / sunset / solar noon in IST minutes. */
export function dayTimes(n) {
  const d = rad(declination(n));
  const p = rad(LATITUDE);
  const h0 = deg(Math.acos(-Math.tan(p) * Math.tan(d)));
  const noon = 12 * 60 - offsetMinutes(n);
  return { sunrise: noon - (h0 / 15) * 60, sunset: noon + (h0 / 15) * 60, noon };
}

export function formatClock(minutes) {
  const m = Math.round(minutes);
  let h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${mm} ${suffix}`;
}

export function compassWord(az) {
  const words = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
  return words[Math.round(az / 45) % 8];
}
