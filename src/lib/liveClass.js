// Live classes = recurring series (challenges.is_recurring). Schedule helpers
// shared by the teacher, admin and student screens.
// Weekdays use ISO numbering to match the DB (recur_days): 1 = Mon … 7 = Sun.

export const WEEKDAYS = [
  { value: 1, short: 'Mon' }, { value: 2, short: 'Tue' }, { value: 3, short: 'Wed' },
  { value: 4, short: 'Thu' }, { value: 5, short: 'Fri' }, { value: 6, short: 'Sat' },
  { value: 7, short: 'Sun' },
];

export const WEEKDAY_PRESETS = [
  { label: 'Mon–Fri', days: [1, 2, 3, 4, 5] },
  { label: 'Mon–Sat', days: [1, 2, 3, 4, 5, 6] },
  { label: 'Every day', days: [1, 2, 3, 4, 5, 6, 7] },
];

// Students may open the join link this long before the class starts.
export const JOIN_EARLY_MS = 15 * 60_000;

export const localTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// "Mon–Fri", "Every day", "Mon, Wed, Fri" — consecutive runs of 3+ collapse.
export function fmtDays(days = []) {
  const d = [...new Set(days)].sort((a, b) => a - b);
  if (d.length === 7) return 'Every day';
  const runs = [];
  for (const n of d) {
    const last = runs[runs.length - 1];
    if (last && n === last[1] + 1) last[1] = n; else runs.push([n, n]);
  }
  const name = n => WEEKDAYS[n - 1].short;
  return runs.flatMap(([a, b]) => (b - a >= 2 ? [`${name(a)}–${name(b)}`] : a === b ? [name(a)] : [name(a), name(b)])).join(', ');
}

// "7:00 AM" from a Postgres time ("07:00:00").
export function fmtClockTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// "Mon–Fri · 7:00 AM · 45 min" in the class's own timezone (the teacher's
// clock). Students see real local times on each session instead.
export function fmtSchedule(c, { withTz = false } = {}) {
  if (!c?.is_recurring) return '';
  const parts = [fmtDays(c.recur_days), fmtClockTime(c.recur_time)];
  if (withTz && c.recur_tz) parts[1] += ` (${c.recur_tz})`;
  if (c.recur_duration_min) parts.push(`${c.recur_duration_min} min`);
  return parts.join(' · ');
}

const endOf = s => new Date(s.scheduled_at).getTime() + (s.duration_minutes ?? 60) * 60_000;

// Session timing state for a generated class row.
export function classState(s, now = Date.now()) {
  if (s.is_cancelled) return 'cancelled';
  const start = new Date(s.scheduled_at).getTime();
  if (now < start - JOIN_EARLY_MS) return 'upcoming';
  if (now < start) return 'soon';
  if (now < endOf(s)) return 'live';
  return 'ended';
}

// The next class a student/teacher would join: live now, or the soonest upcoming.
export function nextClass(sessions, now = Date.now()) {
  return sessions
    .filter(s => !s.is_cancelled && endOf(s) > now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0] ?? null;
}
