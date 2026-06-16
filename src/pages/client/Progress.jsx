import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar,
} from 'recharts';
import { Scale, Ruler, Share2, Loader2, TrendingDown, Award, Video, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/compressImage';
import { calcBMI, bmiCategory } from '../../lib/calc';
import { Card, Spinner, StatCard, BadgePill, Confetti, EmptyState } from '../../components/ui';

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
  const [form, setForm] = useState({ weight_kg: '', waist_in: '', hips_in: '', chest_in: '', energy_level: 3, workout_days: '', notes: '', photo: null });

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

  const attendedCount = attendance.filter(a => a.attended).length;
  const avgPct = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + (a.attendance_pct ?? (a.attended ? 100 : 0)), 0) / attendance.length)
    : null;

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [profile.id]);

  const chartData = useMemo(() => rows.map(r => ({
    week: `W${r.week_number}`,
    weight: r.weight_kg,
    bmi: calcBMI(r.weight_kg, profile.height_cm),
    inches: r.waist_in != null && r.hips_in != null && r.chest_in != null ? +(r.waist_in + r.hips_in + r.chest_in).toFixed(1) : null,
  })), [rows, profile.height_cm]);

  const latest = rows[rows.length - 1];
  const start = profile.starting_weight_kg ?? rows[0]?.weight_kg;
  const lost = latest && start ? +(start - latest.weight_kg).toFixed(1) : 0;
  const firstInches = rows.find(r => r.waist_in != null);
  const inchesLost = latest && firstInches && latest.waist_in != null
    ? +((firstInches.waist_in + firstInches.hips_in + firstInches.chest_in) - (latest.waist_in + latest.hips_in + latest.chest_in)).toFixed(1)
    : 0;
  const bmi = latest ? calcBMI(latest.weight_kg, profile.height_cm) : calcBMI(start, profile.height_cm);

  async function submit(e) {
    e.preventDefault();
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
      const week = (rows[rows.length - 1]?.week_number ?? 0) + 1;
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
        toast(`Week ${week} check-in saved`);
      }
      setForm({ weight_kg: '', waist_in: '', hips_in: '', chest_in: '', energy_level: 3, workout_days: '', notes: '', photo: null });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function shareReport() {
    const text = [
      `My UniFit progress 💪`,
      start && latest ? `Weight: ${start} kg → ${latest.weight_kg} kg (${lost > 0 ? '−' : '+'}${Math.abs(lost)} kg)` : null,
      inchesLost ? `Inches lost: ${inchesLost}"` : null,
      bmi ? `BMI: ${bmi} (${bmiCategory(bmi)})` : null,
      `${rows.length} weekly check-ins and counting!`,
    ].filter(Boolean).join('\n');
    if (navigator.share) {
      await navigator.share({ title: 'My UniFit Progress', text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      toast('Report copied — paste it anywhere');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      {celebrate && <Confetti />}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-bold">Progress</h1>
        <button onClick={shareReport} className="btn-secondary !py-2 text-sm">
          <Share2 className="w-4 h-4" /> Share my report
        </button>
      </div>

      {/* Report card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Scale} label="Current weight" value={latest?.weight_kg ? `${latest.weight_kg} kg` : '—'} sub={start ? `started at ${start} kg` : ''} />
        <StatCard icon={TrendingDown} label="Lost so far" value={lost ? `${lost} kg` : '—'} sub={inchesLost ? `and ${inchesLost}" total inches` : ''} accent="text-emerald-500" />
        <StatCard icon={Ruler} label="BMI" value={bmi ?? '—'} sub={bmiCategory(bmi)} />
        <StatCard icon={Award} label="Badges" value={badges.length} sub="keep going!" accent="text-violet-500" />
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
                <Line type="monotone" dataKey="bmi" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} />
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
                  <Bar dataKey="inches" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      ) : (
        <Card><EmptyState icon={Scale} title="No check-ins yet" hint="Fill your first weekly check-in below to start your report card." /></Card>
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

      {/* Weekly check-in form */}
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">Weekly check-in</h3>
        <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="weight_kg">Weight (kg)</label>
            <input id="weight_kg" type="number" step="0.1" min="30" max="250" required value={form.weight_kg}
              onChange={e => setForm(x => ({ ...x, weight_kg: e.target.value }))} className="input" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[['waist_in', 'Waist'], ['hips_in', 'Hips'], ['chest_in', 'Chest']].map(([k, l]) => (
              <div key={k}>
                <label className="label" htmlFor={k}>{l} (in)</label>
                <input id={k} type="number" step="0.5" min="15" max="80" value={form[k]}
                  onChange={e => setForm(x => ({ ...x, [k]: e.target.value }))} className="input" />
              </div>
            ))}
          </div>
          <div>
            <label className="label" htmlFor="energy_level">Energy level: {form.energy_level}/5</label>
            <input id="energy_level" type="range" min="1" max="5" value={form.energy_level}
              onChange={e => setForm(x => ({ ...x, energy_level: e.target.value }))} className="w-full accent-brand-500" />
          </div>
          <div>
            <label className="label" htmlFor="workout_days">Workout days this week</label>
            <input id="workout_days" type="number" min="0" max="7" value={form.workout_days}
              onChange={e => setForm(x => ({ ...x, workout_days: e.target.value }))} className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="notes">Notes</label>
            <textarea id="notes" rows="2" value={form.notes}
              onChange={e => setForm(x => ({ ...x, notes: e.target.value }))} className="input" placeholder="How did this week feel?" />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="photo">Progress photo (optional — compressed before upload)</label>
            <input id="photo" type="file" accept="image/*"
              onChange={e => setForm(x => ({ ...x, photo: e.target.files?.[0] ?? null }))}
              className="block text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:text-xs file:border-0 file:bg-slate-100 file:text-slate-700 file:rounded-lg file:font-semibold file:cursor-pointer" />
          </div>
          <button type="submit" disabled={busy} className="btn-primary md:col-span-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save check-in
          </button>
        </form>
      </Card>
    </div>
  );
}
