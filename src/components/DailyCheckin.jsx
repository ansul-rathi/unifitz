import { useEffect, useRef, useState } from 'react';
import {
  Loader2, CheckCircle2, Moon, Salad, Cookie, Droplets, Dumbbell, Minus, Plus, Pencil,
  ChevronLeft, ChevronRight, CalendarDays, History,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const WATER_GOAL = 16;          // 16 glasses = 4 litres
const WATER_DEFAULT = 8;        // where the counter starts
const WATER_MAX = 24;           // matches the daily_water_glasses_range check
const GLASSES_PER_LITRE = 4;
const BACKFILL_DAYS = 30;   // how far back a member may still log a day
// Glasses land on quarter-litres, so 2 decimals is always exact: 6 → "1.5", 5 → "1.25".
const litres = (g) => {
  const l = g / GLASSES_PER_LITRE;
  return Number.isInteger(l) ? String(l) : l.toFixed(2).replace(/0$/, '');
};

// Local calendar date — never toISOString(), which silently shifts the day
// for anyone whose clock is behind/ahead of UTC.
const localDay = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const parseDay = (s) => new Date(`${s}T00:00:00`);
const shiftDay = (s, days) => {
  const d = parseDay(s);
  d.setDate(d.getDate() + days);
  return localDay(d);
};

// "Today" / "Yesterday" / "Wed, 4 Aug" — always says which day is being logged.
function dayLabel(dateStr) {
  const today = localDay();
  if (dateStr === today) return 'Today';
  if (dateStr === shiftDay(today, -1)) return 'Yesterday';
  return parseDay(dateStr).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
const weekdayOf = (dateStr) => parseDay(dateStr).toLocaleDateString(undefined, { weekday: 'long' });

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

function Row({ icon: Icon, label, hint, id, children }) {
  return (
    <div>
      <span id={id} className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Icon className="w-4 h-4 text-brand-500 shrink-0" /> {label}
      </span>
      {hint && <span className="block text-xs text-slate-400 mt-0.5 ml-6">{hint}</span>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

const initial = (c) => ({
  slept_on_time: c?.slept_on_time ?? null,
  sleep_quality: c?.sleep_quality ?? null,
  diet_consistent: c?.diet_consistent ?? null,
  ate_junk: c?.ate_junk ?? null,
  junk_detail: c?.junk_detail ?? '',
  water_glasses: c?.water_glasses ?? WATER_DEFAULT,
  did_workout: c?.did_workout ?? null,
  workout_rating: c?.workout_rating ?? 3,
});

const isDone = (c) => !!(c && (c.slept_on_time != null || c.sleep_quality != null || c.did_workout != null || c.diet_consistent != null));

// Day switcher — one place that says exactly which date is being logged.
// Future days are unreachable: arrow disabled, native max, and a save guard.
function DayBar({ date, setDate, today, min, busy }) {
  const isToday = date === today;
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label="Previous day" disabled={busy || date <= min}
        onClick={() => setDate(shiftDay(date, -1))}
        className="w-10 h-10 shrink-0 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition disabled:opacity-40 disabled:hover:border-slate-200">
        <ChevronLeft className="w-4 h-4" />
      </button>

      <label className="relative flex-1">
        <span className="sr-only">Check-in date</span>
        <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input type="date" value={date} min={min} max={today} disabled={busy}
          onChange={e => e.target.value && setDate(e.target.value)}
          className="input !pl-9 !h-10 text-center font-semibold" />
      </label>

      <button type="button" aria-label="Next day" disabled={busy || isToday}
        onClick={() => setDate(shiftDay(date, 1))}
        className="w-10 h-10 shrink-0 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition disabled:opacity-40 disabled:hover:border-slate-200">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function DailyCheckin({ profile, checkin, onSaved }) {
  const toast = useToast();
  const today = localDay();
  const minDate = shiftDay(today, -BACKFILL_DAYS);

  const [date, setDate] = useState(today);
  const [f, setF] = useState(() => initial(checkin));
  const [done, setDone] = useState(() => isDone(checkin));
  const [editing, setEditing] = useState(() => !isDone(checkin));
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const skipFirst = useRef(true);   // today's row already arrived via props

  const set = (patch) => setF(x => ({ ...x, ...patch }));

  // Switching days pulls that day's row so the form always mirrors the date shown.
  useEffect(() => {
    if (skipFirst.current) { skipFirst.current = false; return; }
    let cancelled = false;
    setFetching(true);
    (async () => {
      const { data } = await supabase.from('daily_checkins').select('*')
        .eq('user_id', profile.id).eq('checkin_date', date).maybeSingle();
      if (cancelled) return;
      setF(initial(data));
      setDone(isDone(data));
      setEditing(!isDone(data));
      setFetching(false);
    })();
    return () => { cancelled = true; };
  }, [date, profile.id]);

  async function save() {
    if (date > today) return toast("Can't check in for a future day", 'error');
    setBusy(true);
    const payload = {
      user_id: profile.id,
      checkin_date: date,
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
    // Only today's row is the one the parent screen is holding.
    if (date === today) onSaved?.({ ...(checkin ?? {}), ...payload });
    setDone(true);
    setEditing(false);
    toast(date === today ? 'Check-in saved 🎉' : `Check-in saved for ${dayLabel(date)}`);
  }

  const label = dayLabel(date);
  const backdated = date !== today;
  const relative = label === 'Today' || label === 'Yesterday';   // reads well with "'s"
  const onDay = relative ? label.toLowerCase() : label;
  const nightHint = `The night that ended on ${relative ? label.toLowerCase() : weekdayOf(date)}`;

  const header = (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg">Daily check-in</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Logging <span className="font-semibold text-slate-700">{label}</span>
            {backdated && <span className="text-slate-400"> · {parseDay(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>}
          </p>
        </div>
        {backdated && (
          <button type="button" onClick={() => setDate(today)}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 whitespace-nowrap">
            Back to today
          </button>
        )}
      </div>
      <DayBar date={date} setDate={setDate} today={today} min={minDate} busy={busy || fetching} />
      {backdated && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
          <History className="w-3.5 h-3.5 shrink-0" />
          Filling a past day — answer for {onDay}, not today.
        </p>
      )}
    </div>
  );

  // ── Compact "done" summary ──
  if (done && !editing) {
    const chips = [
      f.slept_on_time != null && { t: f.slept_on_time ? 'Slept on time' : 'Late night', ok: f.slept_on_time },
      f.sleep_quality != null && { t: `Sleep ${SLEEP[f.sleep_quality - 1].label}`, ok: f.sleep_quality >= 3 },
      f.diet_consistent != null && { t: f.diet_consistent ? 'Diet on track' : 'Diet off', ok: f.diet_consistent },
      f.ate_junk != null && { t: f.ate_junk ? 'Had junk' : 'No junk', ok: !f.ate_junk },
      { t: `${f.water_glasses} glasses · ${litres(f.water_glasses)} L water`, ok: f.water_glasses >= WATER_GOAL },
      f.did_workout != null && { t: f.did_workout ? `Workout ${f.workout_rating}/5` : 'Rest day', ok: f.did_workout },
    ].filter(Boolean);
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-4 md:p-5">
        {header}
        <div className="mt-4 flex items-center justify-between gap-3">
          <h4 className="font-bold text-sm inline-flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {relative ? `${label}'s check-in done` : `Check-in done for ${label}`}
          </h4>
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
      {header}

      <div className={`mt-5 space-y-5 transition-opacity ${fetching ? 'opacity-40 pointer-events-none' : ''}`}>
        <Row icon={Moon} label="Did you sleep on time?" hint={nightHint} id="r-sot">
          <YesNo id="r-sot" value={f.slept_on_time} onChange={v => set({ slept_on_time: v })} />
        </Row>

        <Row icon={Moon} label="How was your sleep quality?" hint={nightHint} id="r-sq">
          <FacePicker options={SLEEP} value={f.sleep_quality} onChange={v => set({ sleep_quality: v })} name="Sleep quality" />
        </Row>

        <Row icon={Salad} label="Stayed consistent on your diet?" hint={`Meals on ${onDay}`} id="r-diet">
          <YesNo id="r-diet" value={f.diet_consistent} onChange={v => set({ diet_consistent: v })} />
        </Row>

        <Row icon={Cookie} label="Ate any junk food?" hint={`On ${onDay}`} id="r-junk">
          <YesNo id="r-junk" value={f.ate_junk} onChange={v => set({ ate_junk: v })} />
          {f.ate_junk && (
            <input type="text" value={f.junk_detail} onChange={e => set({ junk_detail: e.target.value })}
              className="input mt-2" placeholder="What did you have? (e.g. fries, ice cream)" />
          )}
        </Row>

        <Row icon={Droplets} label="Water" hint={`Glasses on ${onDay} · 1 litre = ${GLASSES_PER_LITRE} glasses`} id="r-water">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Less" onClick={() => set({ water_glasses: Math.max(0, f.water_glasses - 1) })}
              className="w-11 h-11 shrink-0 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition"><Minus className="w-5 h-5" /></button>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold tabular-nums">{f.water_glasses} <span className="text-sm font-semibold text-slate-400">/ {WATER_GOAL} glasses</span></p>
              <p className="text-xs font-semibold text-sky-600 tabular-nums">{litres(f.water_glasses)} L of {litres(WATER_GOAL)} L</p>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (f.water_glasses / WATER_GOAL) * 100)}%` }} />
              </div>
            </div>
            <button type="button" aria-label="More" onClick={() => set({ water_glasses: Math.min(WATER_MAX, f.water_glasses + 1) })}
              className="w-11 h-11 shrink-0 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition"><Plus className="w-5 h-5" /></button>
          </div>
        </Row>

        <Row icon={Dumbbell} label="Did you work out?" hint={`On ${onDay}`} id="r-wo">
          <YesNo id="r-wo" value={f.did_workout} onChange={v => set({ did_workout: v })} />
          {f.did_workout && (
            <div className="mt-3 animate-fade-up">
              <p className="text-sm font-semibold text-slate-600 mb-2">How did that workout feel?</p>
              <FacePicker options={WORKOUT} value={f.workout_rating} onChange={v => set({ workout_rating: v })} name="Workout rating" />
            </div>
          )}
        </Row>
      </div>

      <button onClick={save} disabled={busy || fetching} className="btn-primary w-full mt-6 text-base">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        {relative ? `Save ${label.toLowerCase()}'s check-in` : `Save check-in for ${label}`}
      </button>
    </div>
  );
}
