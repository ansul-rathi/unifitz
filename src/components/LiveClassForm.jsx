import { useState } from 'react';
import { X, Loader2, Check, Link2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { DEFAULT_SESSION_DURATION_MIN, DEFAULT_CATEGORY, isValidUrl } from '../lib/seriesConstants';
import { WEEKDAYS, WEEKDAY_PRESETS, localTimeZone } from '../lib/liveClass';
import { CLASS_TYPES } from './ui';
import Select from './Select';

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local

// Create / edit a live class (recurring series). Everything is saved through
// the save_live_class RPC, which also (re)builds the class calendar.
// Admins pick the teacher; teachers always own what they create.
export default function LiveClassForm({ initial, isAdmin, teachers = [], onClose, onSaved }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState(() => ({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    category: initial?.recur_category ?? DEFAULT_CATEGORY,
    days: initial?.recur_days ?? [1, 2, 3, 4, 5],
    time: initial?.recur_time?.slice(0, 5) ?? '07:00',
    duration: initial?.recur_duration_min ?? DEFAULT_SESSION_DURATION_MIN,
    start: initial?.start_date ?? today(),
    until: initial?.recur_until ?? '',
    link: initial?.recur_join_link ?? '',
    teacher: initial?.teacher_id ?? '',
  }));
  const tz = initial?.recur_tz ?? localTimeZone();
  const set = patch => setF(x => ({ ...x, ...patch }));
  const toggleDay = d => set({ days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d].sort((a, b) => a - b) });

  async function submit(e) {
    e.preventDefault();
    if (!f.days.length) return toast('Pick at least one day', 'error');
    if (+f.duration < 10 || +f.duration > 240) return toast('Duration must be between 10 and 240 minutes', 'error');
    if (f.link && !isValidUrl(f.link.trim())) return toast('Join link must be a valid http(s) URL', 'error');
    if (f.until && f.until < f.start) return toast('End date must be after the start date', 'error');
    if (isAdmin && !f.teacher) return toast('Choose the teacher for this class', 'error');

    setBusy(true);
    const { data: id, error } = await supabase.rpc('save_live_class', {
      p_id: initial?.id ?? null,
      p_name: f.name,
      p_description: f.description,
      p_category: f.category,
      p_days: f.days,
      p_time: f.time,
      p_tz: tz,
      p_duration: +f.duration,
      p_start: f.start,
      p_until: f.until || null,
      p_join_link: f.link.trim(),
      p_teacher: isAdmin ? f.teacher : null,
    });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast(initial ? 'Class updated' : 'Class created — now add your students');
    onSaved?.(id);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true" onClick={() => !busy && onClose()}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-5 md:p-6 max-h-[90vh] overflow-y-auto animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{initial ? 'Edit live class' : 'New live class'}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <input required placeholder="Class name, e.g. Morning Strength" className="input sm:col-span-2" value={f.name} onChange={e => set({ name: e.target.value })} />
          <textarea rows="2" placeholder="What's this class about? (optional)" className="input sm:col-span-2" value={f.description} onChange={e => set({ description: e.target.value })} />

          <div className="sm:col-span-2">
            <span className="label">Class type</span>
            <Select value={f.category} onChange={v => set({ category: v })} options={CLASS_TYPES.map(c => c.value)} />
          </div>

          {isAdmin && (
            <div className="sm:col-span-2">
              <span className="label">Teacher</span>
              <Select value={f.teacher} onChange={v => set({ teacher: v })} placeholder="Choose a teacher…"
                options={teachers.map(t => ({ value: t.id, label: t.full_name }))} />
            </div>
          )}

          <div className="sm:col-span-2">
            <span className="label">Repeats on</span>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map(d => {
                const on = f.days.includes(d.value);
                return (
                  <button key={d.value} type="button" onClick={() => toggleDay(d.value)} aria-pressed={on}
                    className={`w-12 py-2 rounded-lg text-sm font-bold border transition-colors duration-150 ${on ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {d.short}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {WEEKDAY_PRESETS.map(p => (
                <button key={p.label} type="button" onClick={() => set({ days: p.days })}
                  className="text-xs font-semibold text-brand-600 hover:underline">{p.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="lc-time">Start time</label>
            <input id="lc-time" required type="time" className="input" value={f.time} onChange={e => set({ time: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="lc-duration">Duration (min)</label>
            <input id="lc-duration" required type="number" min="10" max="240" step="5" className="input" value={f.duration} onChange={e => set({ duration: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="lc-start">First class</label>
            <input id="lc-start" required type="date" className="input" value={f.start} onChange={e => set({ start: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="lc-until">Last class <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="lc-until" type="date" min={f.start} className="input" value={f.until} onChange={e => set({ until: e.target.value })} />
          </div>
          <p className="sm:col-span-2 -mt-1 text-xs text-slate-400">Times are in {tz}. Students see them in their own timezone.</p>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="lc-link">Join link <span className="font-normal text-slate-400">(your recurring Zoom / Meet link)</span></label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input id="lc-link" type="url" placeholder="https://zoom.us/j/…" className="input !pl-9" value={f.link} onChange={e => set({ link: e.target.value })} />
            </div>
            <p className="mt-1 text-xs text-slate-400">The same link is used for every class. You can add it later.</p>
          </div>

          <div className="sm:col-span-2 flex gap-2 mt-1">
            <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {initial ? 'Save changes' : 'Create class'}</button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
