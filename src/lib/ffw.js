// Helpers for the FFW waitlist page (/20minutes-fitness): config placeholders,
// ad attribution, slot times in the viewer's timezone, phone validation.
import { FFW, START_MS, T } from '../content/twentyMinutes';

const IST_OFFSET_MS = 330 * 60_000;
const DAY_MS = 86_400_000;

// A config value still written as <<placeholder>> (or empty) counts as unset.
export const isSet = v => v != null && v !== '' && !/<<[^>]*>>/.test(String(v));

// FAQ entries whose answer is filled in — shared by the page and its JSON-LD.
export const FAQ_ITEMS = T.faq.items.filter(f => isSet(f.a));

export const isIST = tz => tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta';

export function viewerTz() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'; } catch { return 'Asia/Kolkata'; }
}

export function uuid() {
  try { if (crypto?.randomUUID) return crypto.randomUUID(); } catch { /* old browser / insecure context */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ── Attribution ── utm_* + click ids + src/ref from the URL, merged into what
// this session already saw, plus the first landing URL and referrer.
const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'src', 'ref'];
const ATTR_STORE = 'ffw_attr';

export function captureAttribution() {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  const fromUrl = {};
  for (const k of ATTR_KEYS) { const v = p.get(k); if (v) fromUrl[k] = v.slice(0, 200); }
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem(ATTR_STORE) || '{}') || {}; } catch { stored = {}; }
  const merged = {
    ...stored, ...fromUrl,
    landing_url: stored.landing_url || window.location.href.slice(0, 500),
    referrer: stored.referrer ?? (document.referrer ? document.referrer.slice(0, 500) : null),
  };
  try { sessionStorage.setItem(ATTR_STORE, JSON.stringify(merged)); } catch { /* private mode */ }
  return merged;
}

// ── Slots ── "AM-06:30" / "PM-07:00" — stable ids stored with the lead.
export const slotId = ([h, m]) => `${h < 12 ? 'AM' : 'PM'}-${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

// "AM-06:30" → "6:30 AM"
export const slotLabel = id => { const [ap, t] = id.split('-'); const [h, m] = t.split(':'); return `${+h}:${m} ${ap}`; };

// The full signup as a WhatsApp message to the business number — used when
// the lead can't be saved online, so nothing is lost. *x* = WhatsApp bold.
export function waitlistMessage({ name, phone, goal, slots = [], tz, attribution: a = {} }) {
  const country = COUNTRIES.find(c => phone.startsWith(`+${c.code}`));
  const pretty = country ? `+${country.code} ${formatPhone(country.code, phone.slice(country.code.length + 1))}` : phone;
  const src = [a.utm_source, a.utm_campaign].filter(Boolean).join(' / ');
  return [
    'Hi Unifitz! 👋 I’d like to join the *FFW – Fast Fitness Workout* waitlist.',
    '',
    `*Name:* ${name}`,
    `*WhatsApp:* ${pretty}${country ? ` (${country.name})` : ''}`,
    `*Goal:* ${goal}`,
    `*Preferred times (IST):* ${slots.length ? slots.map(slotLabel).join(', ') : 'Any'}`,
    tz && !isIST(tz) ? `*My timezone:* ${tz}` : null,
    src ? `*Source:* ${src}` : null,
    a.ref ? `*Referred by:* ${a.ref}` : null,
    '',
    'Please add me to the founding batch. Thank you!',
  ].filter(l => l !== null).join('\n');
}

// IST slot on launch day → { time: '8:00 PM', shift: -1 } in the viewer's tz.
// Uses the real launch date, so DST and the day boundary come out right.
const [LY, LM, LD] = FFW.launchDate.split('-').map(Number);
export function localSlot([h, m], tz) {
  const at = Date.UTC(LY, LM - 1, LD, h, m) - IST_OFFSET_MS;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(at).map(p => [p.type, p.value]));
  const shift = Math.round((Date.UTC(+parts.year, +parts.month - 1, +parts.day) - Date.UTC(LY, LM - 1, LD)) / DAY_MS);
  return { time: `${parts.hour}:${parts.minute} ${parts.dayPeriod}`, shift };
}

export function tzAbbr(tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(START_MS).find(p => p.type === 'timeZoneName')?.value || tz;
  } catch { return tz; }
}

// ── Countdown to the first class ──
export function countdown(now = Date.now()) {
  const ms = START_MS - now;
  if (ms <= 0) return null;
  const min = Math.floor(ms / 60_000);
  return { d: Math.floor(min / 1440), h: Math.floor((min % 1440) / 60), m: min % 60 };
}

// ── Phone ── India first, then the NRI markets.
// `groups` = digit grouping for as-you-type formatting; their sum is the exact
// national length (`len`). US/CA is formatted as (555) 123-4567.
export const COUNTRIES = [
  { code: '91', flag: '🇮🇳', name: 'India', ph: '98765 43210', groups: [5, 5] },
  { code: '1', flag: '🇺🇸', name: 'US / Canada', ph: '(555) 123-4567', groups: [3, 3, 4] },
  { code: '44', flag: '🇬🇧', name: 'United Kingdom', ph: '7700 900123', groups: [4, 6] },
  { code: '971', flag: '🇦🇪', name: 'UAE', ph: '50 123 4567', groups: [2, 3, 4] },
  { code: '61', flag: '🇦🇺', name: 'Australia', ph: '412 345 678', groups: [3, 3, 3] },
  { code: '65', flag: '🇸🇬', name: 'Singapore', ph: '8123 4567', groups: [4, 4] },
].map(c => ({ ...c, len: c.groups.reduce((a, b) => a + b, 0) }));

const countryOf = cc => COUNTRIES.find(c => c.code === cc);

// Raw input → national digits only: drops a pasted +cc / cc prefix and trunk 0s,
// then caps at the country's length (so a 10-digit number can't become 11).
export function phoneDigits(cc, raw) {
  const c = countryOf(cc);
  let d = String(raw ?? '').replace(/\D/g, '');
  if (c && d.length > c.len && d.startsWith(cc)) d = d.slice(cc.length);
  d = d.replace(/^0+/, '');
  return c ? d.slice(0, c.len) : d;
}

// As-you-type display: "98765 43210", "(555) 123-4567", "50 123 4567"…
export function formatPhone(cc, raw) {
  const c = countryOf(cc);
  const d = phoneDigits(cc, raw);
  if (!c || !d) return d;
  if (cc === '1') {
    if (d.length <= 3) return d;   // no "(555)" yet — it would trap Backspace
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}${d.length > 6 ? '-' + d.slice(6) : ''}`;
  }
  const parts = [];
  let i = 0;
  for (const g of c.groups) { if (i >= d.length) break; parts.push(d.slice(i, i + g)); i += g; }
  return parts.join(' ');
}

// Longest formatted string for the country — the input's maxLength.
export const phoneMaxLength = cc => formatPhone(cc, '9'.repeat(countryOf(cc)?.len ?? 12)).length;

export function ccForTz(tz = '') {
  if (isIST(tz)) return '91';
  if (tz.startsWith('America/')) return '1';
  if (tz === 'Europe/London') return '44';
  if (tz === 'Asia/Dubai') return '971';
  if (tz.startsWith('Australia/')) return '61';
  if (tz === 'Asia/Singapore') return '65';
  return '91';
}

// National number → E.164, or null. Exactly the country's length; India must start 6–9.
export function toPhone(cc, raw) {
  const c = countryOf(cc);
  if (!c || /[^\d\s\-().+]/.test(String(raw ?? ''))) return null;
  const d = phoneDigits(cc, raw);
  const ok = d.length === c.len && (cc !== '91' || /^[6-9]/.test(d));
  return ok ? `+${cc}${d}` : null;
}

export const phoneError = cc => (cc === '91'
  ? 'Enter a 10-digit mobile number starting with 6–9.'
  : `Enter a ${countryOf(cc)?.len ?? 10}-digit number.`);
