import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar,
} from 'recharts';
import {
  Scale, Ruler, Share2, Loader2, TrendingDown, Award, Video, CheckCircle2, XCircle,
  Minus, Plus, ChevronDown, CalendarCheck, Camera, ArrowDown, ArrowUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/compressImage';
import { calcBMI, bmiCategory } from '../../lib/calc';
import { Card, Spinner, StatCard, BadgePill, Confetti, EmptyState } from '../../components/ui';

const ENERGY = [
  { v: 1, face: '😔', label: 'Low' },
  { v: 2, face: '😕', label: 'Meh' },
  { v: 3, face: '🙂', label: 'Okay' },
  { v: 4, face: '😄', label: 'Good' },
  { v: 5, face: '🤩', label: 'Great' },
];
const num = v => (v == null ? '' : String(v));

export default function ClientProgress() {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [badges, setBadges] = useState([]);
  const [celebrate, setCelebrate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [expanded, setExpanded] = useState(false);   // force-open the form when up to date
  const [showMeasure, setShowMeasure] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [form, setForm] = useState({ weight_kg: '', waist_in: '', hips_in: '', chest_in: '', energy_level: 4, workout_days: '', notes: '', photo: null });
  const formRef = useRef(null);

  async function load() {
    const [{ data: w }, { data: b }, { data: e }, { data: att }] = await Promise.all([
      supabase.from('weekly_checkins').select('*').eq('user_id', profile.id).order('week_number'),
      supabase.from('badges').select('*').eq('user_id', profile.id).order('earned_at'),
      supabase.from('enrollments').select('challenge_id').eq('user_id', profile.id).limit(1),
      supabase.from('attendance').select('*, sessions(title, day_number, scheduled_at)').eq('user_id', profile.id),
    ]);
    setRows(w ?? []);
    setBadges(b ?? []);
    setEnrollment(e?.[0] ?? null);
    setAttendance((att ?? []).sort((a, c) => (a.sessions?.day_number ?? 0) - (c.sessions?.day_number ?? 0)));
    setLoading(false);
    return b ?? [];
  }

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [profile.id]);

  const attendedCount = attendance.filter(a => a.attended).length;
  const avgPct = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + (a.attendance_pct ?? (a.attended ? 100 : 0)), 0) / attendance.length)
    : null;

  const latest = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  const lastWeight = latest?.weight_kg ?? null;

  // Pre-fill body measurements from the last check-in so re-entry is a tweak,
  // not a re-type. Only fills blanks — never clobbers what the user is typing.
  useEffect(() => {
    if (!latest) return;
    setForm(f => ({
      ...f,
      waist_in: f.waist_in || num(latest.waist_in),
      hips_in: f.hips_in || num(latest.hips_in),
      chest_in: f.chest_in || num(latest.chest_in),
    }));
  }, [latest]);

  const chartData = useMemo(() => rows.map(r => ({
    week: `W${r.week_number}`,
    weight: r.weight_kg,
    bmi: calcBMI(r.weight_kg, profile.height_cm),
    inches: r.waist_in != null && r.hips_in != null && r.chest_in != null ? +(r.waist_in + r.hips_in + r.chest_in).toFixed(1) : null,
  })), [rows, profile.height_cm]);

  const start = profile.starting_weight_kg ?? rows[0]?.weight_kg;
  const lost = latest && start ? +(start - latest.weight_kg).toFixed(1) : 0;
  const firstInches = rows.find(r => r.waist_in != null);
  const inchesLost = latest && firstInches && latest.waist_in != null
    ? +((firstInches.waist_in + firstInches.hips_in + firstInches.chest_in) - (latest.waist_in + latest.hips_in + latest.chest_in)).toFixed(1)
    : 0;
  const bmi = latest ? calcBMI(latest.weight_kg, profile.height_cm) : calcBMI(start, profile.height_cm);

  // Weekly cadence: how long since the last check-in?
  const lastDate = latest?.created_at ? new Date(latest.created_at) : null;
  const daysSince = lastDate ? Math.floor((Date.now() - lastDate) / 86400000) : null;
  const upToDate = daysSince != null && daysSince < 7;
  const nextWeek = (latest?.week_number ?? 0) + 1;
  const showForm = !upToDate || expanded;

  // Live weight delta vs last week, as the user types.
  const enteredW = parseFloat(form.weight_kg);
  const wDelta = (lastWeight != null && !isNaN(enteredW)) ? +(enteredW - lastWeight).toFixed(1) : null;

  const stepWeight = (d) => setForm(f => {
    const base = parseFloat(f.weight_kg);
    const s = isNaN(base) ? (lastWeight ?? 60) : base;
    return { ...f, weight_kg: String(Math.min(250, Math.max(30, +(s + d).toFixed(1)))) };
  });

  async function submit(e) {
    e.preventDefault();
    if (form.weight_kg === '') return toast('Enter your weight to save', 'error');
    setBusy(true);
    try {
      let photo_url = null;
      if (form.photo) {
        const file = await compressImage(form.photo);
        const path = `${profile.id}/${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage.from('progress-photos').upload(path, file);
        if (upErr) throw upErr;
        photo_url = path;
      }
      const week = nextWeek;
      const { error } = await supabase.from('weekly_checkins').insert({
        user_id: profile.id,
        challenge_id: enrollment?.challenge_id ?? null,
        week_number: week,
        weight_kg: form.weight_kg === '' ? null : +form.weight_kg,
        waist_in: form.waist_in === '' ? null : +form.waist_in,
        hips_in: form.hips_in === '' ? null : +form.hips_in,
        chest_in: form.chest_in === '' ? null : +form.chest_in,
        energy_level: +form.energy_level,
        workout_days: form.workout_days === '' ? null : +form.workout_days,
        notes: form.notes || null,
        photo_url,
      });
      if (error) throw error;

      const before = new Set(badges.map(b => b.badge_type));
      const after = await load();
      if (after.some(b => !before.has(b.badge_type))) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 3200);
        toast('New badge earned! 🎉');
      } else {
        toast(`Week ${week} check-in saved 🎉`);
      }
      setForm({ weight_kg: '', waist_in: '', hips_in: '', chest_in: '', energy_level: 4, workout_days: '', notes: '', photo: null });
      setExpanded(false); setShowMeasure(false); setShowExtra(false);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function shareReport() {
    const text = [
      `My Unifitz progress 💪`,
      start && latest ? `Weight: ${start} kg → ${latest.weight_kg} kg (${lost > 0 ? '−' : '+'}${Math.abs(lost)} kg)` : null,
      inchesLost ? `Inches lost: ${inchesLost}"` : null,
      bmi ? `BMI: ${bmi} (${bmiCategory(bmi)})` : null,
      `${rows.length} weekly check-ins and counting!`,
    ].filter(Boolean).join('\n');
    if (navigator.share) {
      await navigator.share({ title: 'My Unifitz Progress', text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      toast('Report copied — paste it anywhere');
    }
  }

  const openForm = () => { setExpanded(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      {celebrate && <Confetti />}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-bold">Progress</h1>
        {rows.length > 0 && (
          <button onClick={shareReport} className="btn-secondary !py-2 text-sm">
            <Share2 className="w-4 h-4" /> Share my report
          </button>
        )}
      </div>

      {/* ── Weekly check-in — the main action, front and centre ── */}
      <div ref={formRef}>
      <Card className="overflow-hidden">
        {/* status header */}
        <div className="flex items-center justify-between gap-3 px-5 md:px-6 pt-5">
          <div>
            <h2 className="font-bold text-lg">Week {nextWeek} check-in</h2>
            <p className="text-sm text-slate-500">
              {daysSince == null ? 'Your very first one — takes 15 seconds.'
                : upToDate ? `Done this week · next one in ${7 - daysSince} ${7 - daysSince === 1 ? 'day' : 'days'}`
                : `Last checked in ${daysSince} days ago`}
            </p>
          </div>
          {upToDate
            ? <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200"><CheckCircle2 className="w-4 h-4" /> Up to date</span>
            : daysSince != null && <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200"><CalendarCheck className="w-4 h-4" /> Due now</span>}
        </div>

        {!showForm ? (
          <div className="px-5 md:px-6 pb-5 pt-4">
            <button onClick={openForm} className="btn-secondary w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Log another check-in
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-5 md:px-6 pb-6 pt-4 space-y-5">
            {/* Weight — the hero input */}
            <div>
              <label className="label" htmlFor="weight_kg">This week's weight</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => stepWeight(-0.1)} aria-label="Decrease" className="w-11 h-11 shrink-0 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition">
                  <Minus className="w-5 h-5" />
                </button>
                <div className="relative flex-1">
                  <input id="weight_kg" type="number" step="0.1" min="30" max="250" required inputMode="decimal"
                    value={form.weight_kg} onChange={e => setForm(x => ({ ...x, weight_kg: e.target.value }))}
                    placeholder={lastWeight != null ? String(lastWeight) : '—'}
                    className="input text-center text-2xl font-bold !py-3" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 pointer-events-none">kg</span>
                </div>
                <button type="button" onClick={() => stepWeight(0.1)} aria-label="Increase" className="w-11 h-11 shrink-0 grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600 active:scale-95 transition">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap min-h-[1.5rem]">
                {lastWeight != null && (
                  <button type="button" onClick={() => setForm(x => ({ ...x, weight_kg: String(lastWeight) }))}
                    className="text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full">
                    Same as last ({lastWeight} kg)
                  </button>
                )}
                {wDelta != null && wDelta !== 0 && (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${wDelta < 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                    {wDelta < 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                    {Math.abs(wDelta)} kg vs last week
                  </span>
                )}
              </div>
            </div>

            {/* Energy — tap a face */}
            <div>
              <span className="label">How's your energy?</span>
              <div className="grid grid-cols-5 gap-2">
                {ENERGY.map(en => {
                  const on = +form.energy_level === en.v;
                  return (
                    <button key={en.v} type="button" aria-pressed={on} onClick={() => setForm(x => ({ ...x, energy_level: en.v }))}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition active:scale-95 ${on ? 'border-brand-400 bg-orange-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span className="text-2xl leading-none">{en.face}</span>
                      <span className={`text-[11px] font-semibold ${on ? 'text-brand-600' : 'text-slate-500'}`}>{en.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workout days — tap a number */}
            <div>
              <span className="label">Workout days this week</span>
              <div className="grid grid-cols-8 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(n => {
                  const on = String(form.workout_days) === String(n);
                  return (
                    <button key={n} type="button" aria-pressed={on} onClick={() => setForm(x => ({ ...x, workout_days: n }))}
                      className={`h-11 rounded-xl border text-sm font-bold transition active:scale-95 ${on ? 'border-brand-500 bg-brand-500 text-white shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional: body measurements (pre-filled from last week) */}
            <Collapsible open={showMeasure} onToggle={() => setShowMeasure(v => !v)}
              icon={Ruler} title="Body measurements" hint="pre-filled from last week — just tweak">
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[['waist_in', 'Waist'], ['hips_in', 'Hips'], ['chest_in', 'Chest']].map(([k, l]) => (
                  <div key={k}>
                    <label className="label" htmlFor={k}>{l} (in)</label>
                    <input id={k} type="number" step="0.5" min="15" max="80" inputMode="decimal" value={form[k]}
                      onChange={e => setForm(x => ({ ...x, [k]: e.target.value }))} className="input" />
                  </div>
                ))}
              </div>
            </Collapsible>

            {/* Optional: note + photo */}
            <Collapsible open={showExtra} onToggle={() => setShowExtra(v => !v)}
              icon={Camera} title="Add a note or photo" hint="optional">
              <div className="space-y-3 pt-1">
                <textarea rows="2" value={form.notes} onChange={e => setForm(x => ({ ...x, notes: e.target.value }))}
                  className="input" placeholder="How did this week feel?" />
                <input type="file" accept="image/*" onChange={e => setForm(x => ({ ...x, photo: e.target.files?.[0] ?? null }))}
                  className="block text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:text-xs file:border-0 file:bg-slate-100 file:text-slate-700 file:rounded-lg file:font-semibold file:cursor-pointer" />
                {form.photo && <p className="text-xs text-emerald-600 font-semibold">Photo ready · compressed on save</p>}
              </div>
            </Collapsible>

            <button type="submit" disabled={busy} className="btn-primary w-full text-base">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Save Week {nextWeek} check-in
            </button>
          </form>
        )}
      </Card>
      </div>

      {/* Report card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Scale} label="Current weight" value={latest?.weight_kg ? `${latest.weight_kg} kg` : '—'} sub={start ? `started at ${start} kg` : ''} />
        <StatCard icon={TrendingDown} label="Lost so far" value={lost ? `${lost} kg` : '—'} sub={inchesLost ? `and ${inchesLost}" total inches` : (prev ? `${prev.weight_kg} kg last week` : '')} accent="text-emerald-500" />
        <StatCard icon={Ruler} label="BMI" value={bmi ?? '—'} sub={bmiCategory(bmi)} />
        <StatCard icon={Award} label="Badges" value={badges.length} sub="keep going!" accent="text-amber-500" />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map(b => <BadgePill key={b.id} type={b.badge_type} />)}
        </div>
      )}

      {/* Charts */}
      {rows.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-bold mb-3">Weight trend (kg)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={12} width={40} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#F97316" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold mb-3">BMI over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} fontSize={12} width={40} />
                <Tooltip />
                <Line type="monotone" dataKey="bmi" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          {chartData.some(d => d.inches != null) && (
            <Card className="p-5 lg:col-span-2">
              <h3 className="font-bold mb-3">Total inches (waist + hips + chest)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.filter(d => d.inches != null)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} fontSize={12} width={40} />
                  <Tooltip />
                  <Bar dataKey="inches" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      ) : (
        <Card><EmptyState icon={Scale} title="No check-ins yet" hint="Save your first weekly check-in above to start your report card." /></Card>
      )}

      {/* Class attendance — from Zoom-tracked attendance table */}
      {attendance.length > 0 && (
        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-lg">Class attendance</h3>
            <span className="text-sm font-semibold text-slate-500">
              {attendedCount}/{attendance.length} attended{avgPct != null && <> · avg {avgPct}% presence</>}
            </span>
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {attendance.map(a => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <Video className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{a.sessions?.title ?? 'Session'}</p>
                  {a.attendance_pct != null && (
                    <p className="text-xs text-slate-500">{a.attended_minutes ?? 0} / {a.session_minutes ?? 0} min · {a.attendance_pct}%</p>
                  )}
                </div>
                {a.attended
                  ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Present</span>
                  : <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400"><XCircle className="w-4 h-4" /> Missed</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Collapsible({ open, onToggle, icon: Icon, title, hint, children }) {
  return (
    <div className="rounded-xl border border-slate-200">
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left">
        <Icon className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        {hint && <span className="text-xs text-slate-400 hidden sm:inline">· {hint}</span>}
        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
