// Derives a live session's lifecycle stage from its DB fields.
// Driven by the Zoom webhook (started / ended / recording.completed) + cron.
//
// Stages, in order:
//   created  → scheduled (zoom made) → live → ended → recording (processing) → ready
// Recordings that are added manually (non-live) jump straight to "ready".

export const STAGES = [
  { key: 'created',   label: 'Created' },
  { key: 'scheduled', label: 'Zoom ready' },
  { key: 'live',      label: 'Live' },
  { key: 'ended',     label: 'Ended' },
  { key: 'recording', label: 'Recording…' },
  { key: 'ready',     label: 'Recording ready' },
];

const ORDER = STAGES.map(s => s.key);

// Current stage key for a session row.
export function stageKey(s) {
  if (s.recording_link) return 'ready';
  if (s.recording_status === 'available') return 'ready';
  if (s.recording_status === 'processing') return 'recording';
  if (s.completed) return 'ended';
  if (s.started) return 'live';
  if (s.zoom_meeting_id || s.zoom_link) return 'scheduled';
  return 'created';
}

// How far along (0-based index) — used to tick completed steps.
export function stageIndex(s) {
  return ORDER.indexOf(stageKey(s));
}

// Pill styling per stage.
export function stageMeta(key) {
  switch (key) {
    case 'ready':     return { label: 'Recording ready', tone: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
    case 'recording': return { label: 'Recording…',      tone: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-500 animate-pulse' };
    case 'ended':     return { label: 'Ended',           tone: 'bg-slate-200 text-slate-700',     dot: 'bg-slate-500' };
    case 'live':      return { label: 'Live now',        tone: 'bg-red-100 text-red-700',         dot: 'bg-red-500 animate-pulse' };
    case 'scheduled': return { label: 'Scheduled',       tone: 'bg-sky-100 text-sky-700',         dot: 'bg-sky-500' };
    default:          return { label: 'Created',         tone: 'bg-slate-100 text-slate-600',     dot: 'bg-slate-400' };
  }
}
