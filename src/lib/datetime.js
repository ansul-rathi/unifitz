// Local-timezone date/time formatting for a global audience (India / USA /
// Germany). All timestamps are stored UTC in the DB; these render in the
// VIEWER's timezone via Intl, and append the tz label so there's never any
// ambiguity about which clock a session time is on.
//
// Usage: fmtDateTime(session.scheduled_at) -> "Sat, 4 Jul · 7:30 PM GMT+5:30"

const toDate = v => (v instanceof Date ? v : v ? new Date(v) : null);

// "Sat, 4 Jul · 7:30 PM IST" — weekday + date + time + tz. The workhorse for
// session cards and the player.
export function fmtDateTime(value, { withYear = false } = {}) {
  const d = toDate(value);
  if (!d || isNaN(d)) return '';
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time} ${tzLabel(d)}`;
}

// "4 Jul" — compact date only (list secondary lines).
export function fmtDate(value, { withYear = false } = {}) {
  const d = toDate(value);
  if (!d || isNaN(d)) return '';
  return d.toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}),
  });
}

// "7:30 PM IST" — time only with tz.
export function fmtTime(value) {
  const d = toDate(value);
  if (!d || isNaN(d)) return '';
  return `${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} ${tzLabel(d)}`;
}

// Short timezone label for the viewer, e.g. "IST", "GMT+2", "PDT".
// Falls back to a numeric offset when a name isn't available.
export function tzLabel(value = new Date()) {
  const d = toDate(value) ?? new Date();
  try {
    const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(d);
    const tz = parts.find(p => p.type === 'timeZoneName')?.value;
    if (tz) return tz;
  } catch { /* ignore */ }
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const h = Math.floor(Math.abs(off) / 60);
  const m = Math.abs(off) % 60;
  return `GMT${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

// Milliseconds from now until `value` (negative if past).
export function msUntil(value) {
  const d = toDate(value);
  return d && !isNaN(d) ? d.getTime() - Date.now() : NaN;
}

// "in 2h 14m", "in 3d", "in 45s", or "now" once it's within `liveWindowMs` of
// start (default 0 → exactly at/after start). Returns '' when far past.
export function fmtCountdown(value, { liveWindowMs = 0 } = {}) {
  const ms = msUntil(value);
  if (isNaN(ms)) return '';
  if (ms <= liveWindowMs) return ms <= -liveWindowMs && liveWindowMs === 0 ? '' : 'now';
  const s = Math.round(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  if (m > 0) return `in ${m}m`;
  return `in ${s}s`;
}
