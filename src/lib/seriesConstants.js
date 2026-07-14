// Shared Series/session form defaults + validation.
// Single source of truth — admin and teacher forms previously diverged
// (45 vs 60 min, 'Strength Training' vs 'Zumba' defaults).
// Category options themselves live in components/ui.jsx (CLASS_TYPES).

export const DEFAULT_SESSION_DURATION_MIN = 60;
export const DEFAULT_CATEGORY = 'Zumba';

export function isValidUrl(v) {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// Returns an error message, or null when the form is valid.
// Live sessions must be scheduled in the future; recordings are backfill by
// nature (posted date may be past) but need a playable URL.
export function sessionFormError({ type, date, time, recording_link, duration_minutes }) {
  const mins = +duration_minutes;
  if (!mins || mins < 10 || mins > 240) return 'Duration must be between 10 and 240 minutes';
  if (type === 'recording') {
    if (recording_link && !isValidUrl(recording_link)) return 'Recording link must be a valid http(s) URL';
    return null;
  }
  if (date && time && new Date(`${date}T${time}`) <= new Date()) {
    return 'Live sessions must be scheduled in the future — pick an upcoming date & time';
  }
  return null;
}
