import { useState } from 'react';
import {
  Loader2, CheckCircle2, Moon, Salad, Cookie, Droplets, Dumbbell, Minus, Plus, Pencil,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const todayStr = () => new Date().toISOString().slice(0, 10);
const WATER_GOAL = 8;
const SLEEP = [
  { v: 1, face: '😫', label: 'Poor' },
  { v: 2, face: '😕', label: 'Meh' },
  { v: 3, face: '😐', label: 'Okay' },
  { v: 4, face: '🙂', label: 'Good' },
  { v: 5, face: '😴', label: 'Great' },
];
const WORKOUT = [
  { v: 1, face: '😩', label: 'Rough' },
  { v: 2, face: '😕', label: 'Meh' },
  { v: 3, face: '🙂', label: 'Good' },
  { v: 4, face: '😄', label: 'Great' },
  { v: 5, face: '🤩', label: 'Crushed it' },
];

// Shared tappable emoji rating — smooth scale/lift on select.
function FacePicker({ options, value, onChange, name }) {
  return (
    <div className="grid grid-cols-5 gap-2" role="group" aria-label={name}>
      {options.map(o => {
        const on = value === o.v;
        return (
          <button key={o.v} type="button" aria-pressed={on} onClick={() => onChange(o.v)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all duration-200 ease-out will-change-transform ${
              on ? 'border-brand-400 bg-orange-50 shadow-sm scale-[1.06] -translate-y-0.5' : 'border-slate-200 hover:border-slate-300 hover:-translate-y-0.5'
            }`}>
            <span className={`text-2xl leading-none transition-transform duration-200 ${on ? 'scale-125' : 'scale-100'}`}>{o.face}</span>
            <span className={`text-[11px] font-semibold transition-colors duration-200 ${on ? 'text-brand-600' : 'text-slate-500'}`}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function YesNo({ value, onChange, id }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby={id}>
      {[['Yes', true], ['No', false]].map(([l, v]) => {
        const on = value === v;
        return (
          <button type="button" key={l} aria-pressed={on} onClick={() => onChange(v)}
            className={`h-11 rounded-xl border text-sm font-bold transition active:scale-95 ${on ? 'border-brand-500 bg-brand-500 text-white shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

function Row({ icon: Icon, label, id, children }) {
  return (
    <div>
      <span id={id} className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
        <Icon className="w-4 h-4 text-brand-500" /> {label}
      </span>
      {children}
    </div>
  );
}

const initial = (c) => ({
  slept_on_time: c?.slept_on_time ?? null,
  sleep_quality: c?.sleep_quality ?? null,
  diet_consistent: c?.diet_consistent ?? null,
  ate_junk: c?.ate_junk ?? null,
  junk_detail: c?.junk_detail ?? '',
  water_glasses: c?.water_glasses ?? 4,
  did_workout: c?.did_workout ?? null,
  workout_rating: c?.workout_rating ?? 3,
});

export default function DailyCheckin({ profile, checkin, onSaved }) {
  const toast = useToast();
  const done = !!(checkin && (checkin.slept_on_time != null || checkin.sleep_quality != null || checkin.did_workout != null || checkin.diet_consistent != null));
  const [editing, setEditing] = useState(!done);
  const [f, setF] = useState(() => initial(checkin));
  const [busy, setBusy] = useState(false);
  const set = (patch) => setF(x => ({ ...x, ...patch }));

  async function save() {
    setBusy(true);
    const payload = {
      user_id: profile.id,
      checkin_date: todayStr(),
      slept_on_time: f.slept_on_time,
      sleep_quality: f.sleep_quality,
      diet_consistent: f.diet_consistent,
      ate_junk: f.ate_junk,
      junk_detail: f.ate_junk ? (f.junk_detail.trim() || null) : null,
      water_glasses: f.water_glasses,
      did_workout: f.did_workout,
      workout_rating: f.did_workout ? +f.workout_rating : null,
    };
    const { error } = await supabase.from('daily_checkins').upsert(payload, { onConflict: 'user_id,checkin_date' });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    onSaved?.({ ...(checkin ?? {}), ...payload });
    setEditing(false);
    toast('Daily check-in saved 🎉');
  }

  // ── Compact "done" summary ──
  if (done && !editing) {
    const chips = [
      f.slept_on_time != null && { t: f.slept_on_time ? 'Slept on time' : 'Late night', ok: f.slept_on_time },
      f.sleep_quality != null && { t: `Sleep ${SLEEP[f.sleep_quality - 1].label}`, ok: f.sleep_quality >= 3 },
      f.diet_consistent != null && { t: f.diet_consistent ? 'Diet on track' : 'Diet off', ok: f.diet_consistent },
      f.ate_junk != null && { t: f.ate_junk ? 'Had junk' : 'No junk', ok: !f.ate_junk },
      { t: `${f.water_glasses} glasses water`, ok: f.water_glasses >= WATER_GOAL },
      f.did_workout != null && { t: f.did_workout ? `Workout ${f.workout_rating}/5` : 'Rest day', ok: f.did_workout },
    ].filter(Boolean);
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold inline-flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Today's check-in done</h3>
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600">
            <Pencil className="w-4 h-4" /> Edit
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <span key={i} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>{c.t}</span>
          ))}
        </div>
      </div>
    );
  }

  // ── Full check-in ──
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
      <h3 className="font-bold text-lg">Today's check-in</h3>
      <p className="text-sm text-slate-500 mt-0.5">30 seconds — track the little things that add up.</p>

      <div className="mt-5 space-y-5">
        <Row icon={Moon} label="Did you sleep on time last night?" id="r-sot"><YesNo id="r-sot" value={f.slept_on_time} onChange={v => set({ slept_on_time: v })} /></Row>

        <Row icon={Moon} label="How was your sleep quality?" id="r-sq">
          <FacePicker options={SLEEP} value={f.sleep_quality} onChange={v => set({ sleep_quality: v })} name="Sleep quality" />
        </Row>

        <Row icon={Salad} label="Stayed consistent on your diet?" id="r-diet"><YesNo id="r-diet" value={f.diet_consistent} onChange={v => set({ diet_consistent: v })} /></Row>

        <Row icon={Cookie} label="Ate any junk food?" id="r-junk">
          <YesNo id="r-junk" value={f.ate_junk} onChange={v => set({ ate_junk: v })} />
          {f.ate_junk && (
            <input type="text" value={f.junk_detail} onChange={e => set({ junk_detail: e.target.value })}
              className="input mt-2" placeholder="What did you have? (e.g. samosa, ice cream)" />
          )}
        </Row>

        <Row icon={Droplets} label="Water today" id="r-water">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Less" onClick={() => set({ water_glasses: Math.max(0, f.water_glasses - 1) })}
              className="w-11 h-11 shrink-0 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition"><Minus className="w-5 h-5" /></button>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold tabular-nums">{f.water_glasses} <span className="text-sm font-semibold text-slate-400">/ {WATER_GOAL} glasses</span></p>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (f.water_glasses / WATER_GOAL) * 100)}%` }} />
              </div>
            </div>
            <button type="button" aria-label="More" onClick={() => set({ water_glasses: Math.min(20, f.water_glasses + 1) })}
              className="w-11 h-11 shrink-0 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition"><Plus className="w-5 h-5" /></button>
          </div>
        </Row>

        <Row icon={Dumbbell} label="Did you work out today?" id="r-wo">
          <YesNo id="r-wo" value={f.did_workout} onChange={v => set({ did_workout: v })} />
          {f.did_workout && (
            <div className="mt-3 animate-fade-up">
              <p className="text-sm font-semibold text-slate-600 mb-2">How did today's workout feel?</p>
              <FacePicker options={WORKOUT} value={f.workout_rating} onChange={v => set({ workout_rating: v })} name="Workout rating" />
            </div>
          )}
        </Row>
      </div>

      <button onClick={save} disabled={busy} className="btn-primary w-full mt-6 text-base">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Save today's check-in
      </button>
    </div>
  );
}
