import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, X, Loader2, LogOut, HeartPulse, Flame, Medal, Check, Gift, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { calcBMI, bmiCategory, calcTDEE, ACTIVITY_LABELS } from '../../lib/calc';
import { Card, Avatar } from '../../components/ui';
import Select from '../../components/Select';
import HeightField from '../../components/HeightField';
import ClientRefer from './Refer';

const GOAL_LABELS = { lose_weight: 'Lose weight', gain_muscle: 'Gain muscle', stay_fit: 'Stay fit' };

export default function ClientProfile() {
  const { profile, refreshProfile, signOut } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [badgeCount, setBadgeCount] = useState(null);
  const [f, setF] = useState(blank(profile));

  useEffect(() => {
    supabase.from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', profile.id)
      .then(({ count }) => setBadgeCount(count ?? 0));
  }, [profile.id]);

  function blank(p) {
    return {
      full_name: p.full_name ?? '', phone: p.phone ?? '',
      age: p.age ?? '', gender: p.gender ?? 'female',
      height_cm: p.height_cm ?? '', starting_weight_kg: p.starting_weight_kg ?? '',
      target_weight_kg: p.target_weight_kg ?? '', activity_level: p.activity_level ?? 'light',
      fitness_goal: p.fitness_goal ?? 'lose_weight',
    };
  }

  const bmi = calcBMI(profile.starting_weight_kg, profile.height_cm);
  const cat = bmiCategory(bmi);
  const tdee = calcTDEE({
    weightKg: profile.starting_weight_kg, heightCm: profile.height_cm,
    age: profile.age, gender: profile.gender, activityLevel: profile.activity_level,
  });

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const num = v => (v === '' ? null : Number(v));
    const { error } = await supabase.from('profiles').update({
      full_name: f.full_name, phone: f.phone,
      age: num(f.age), gender: f.gender,
      height_cm: num(f.height_cm), starting_weight_kg: num(f.starting_weight_kg),
      target_weight_kg: num(f.target_weight_kg),
      activity_level: f.activity_level, fitness_goal: f.fitness_goal,
    }).eq('id', profile.id);
    setBusy(false);
    if (error) return toast(error.message, 'error');
    await refreshProfile();
    setEditing(false);
    toast('Profile updated');
  }

  function startEdit() { setF(blank(profile)); setEditing(true); }

  // ── Shared edit form (all viewports) ──
  if (editing) {
    return (
      <div className="space-y-5 max-w-2xl">
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <Card className="p-5 md:p-6">
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><input className="input" value={f.full_name} onChange={e => setF(x => ({ ...x, full_name: e.target.value }))} /></Field>
            <Field label="Phone"><input className="input" value={f.phone} onChange={e => setF(x => ({ ...x, phone: e.target.value }))} /></Field>
            <Field label="Age"><input type="number" className="input" value={f.age} onChange={e => setF(x => ({ ...x, age: e.target.value }))} /></Field>
            <Field label="Gender">
              <Select value={f.gender} onChange={v => setF(x => ({ ...x, gender: v }))}
                options={[{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }, { value: 'other', label: 'Other' }]} />
            </Field>
            <div><HeightField valueCm={f.height_cm === '' ? '' : Number(f.height_cm)} onChange={v => setF(x => ({ ...x, height_cm: v }))} /></div>
            <Field label="Starting weight (kg)"><input type="number" step="0.1" className="input" value={f.starting_weight_kg} onChange={e => setF(x => ({ ...x, starting_weight_kg: e.target.value }))} /></Field>
            <Field label="Target weight (kg)"><input type="number" step="0.5" className="input" value={f.target_weight_kg} onChange={e => setF(x => ({ ...x, target_weight_kg: e.target.value }))} /></Field>
            <Field label="Activity level">
              <Select value={f.activity_level} onChange={v => setF(x => ({ ...x, activity_level: v }))}
                options={Object.entries(ACTIVITY_LABELS).map(([value, label]) => ({ value, label }))} />
            </Field>
            <Field label="Goal" full>
              <Select value={f.fitness_goal} onChange={v => setF(x => ({ ...x, fitness_goal: v }))}
                options={Object.entries(GOAL_LABELS).map(([value, label]) => ({ value, label }))} />
            </Field>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={busy} className="btn-primary flex-1">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save changes
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* ═══ MOBILE (< sm) — grouped, scannable ═══ */}
      <div className="sm:hidden space-y-4">
        {/* Header */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={profile.full_name} url={profile.avatar_url} size="w-16 h-16" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{profile.full_name}</h1>
              <p className="text-sm text-slate-500">{profile.phone || 'No phone added'}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <Tile icon={Flame} value={profile.points ?? 0} label="Points" accent="text-brand-500" />
            <Tile icon={Medal} value={badgeCount ?? '—'} label="Badges" accent="text-amber-500" />
            <Tile icon={HeartPulse} value={bmi ?? '—'} label="BMI" accent="text-emerald-500" />
          </div>
        </Card>

        {/* Personal */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <SectionLabel>Personal</SectionLabel>
            <button onClick={startEdit} className="text-xs font-bold text-brand-600 inline-flex items-center gap-1">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <Card className="px-4 divide-y divide-slate-100">
            <Row label="Age" value={profile.age} />
            <Row label="Gender" value={profile.gender} capitalize />
          </Card>
        </div>

        {/* Body & goals */}
        <div>
          <SectionLabel className="px-1 mb-1.5 block">Body &amp; goals</SectionLabel>
          <Card className="px-4 divide-y divide-slate-100">
            <Row label="Height" value={profile.height_cm && `${profile.height_cm} cm`} />
            <Row label="Starting weight" value={profile.starting_weight_kg && `${profile.starting_weight_kg} kg`} />
            <Row label="Target weight" value={profile.target_weight_kg && `${profile.target_weight_kg} kg`} />
            <Row label="Activity" value={ACTIVITY_LABELS[profile.activity_level]} />
            <Row label="Goal" value={GOAL_LABELS[profile.fitness_goal]} />
          </Card>
        </div>

        {/* Your numbers (calculated) */}
        <div>
          <SectionLabel className="px-1 mb-1.5 block">Your numbers</SectionLabel>
          <Card className="px-4 divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm text-slate-500">BMI</span>
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{bmi ?? '—'}</span>
                {cat && <CategoryPill cat={cat} />}
              </span>
            </div>
            <Row label="TDEE" value={tdee ? `${tdee.toLocaleString('en-IN')} kcal/day` : null} />
          </Card>
        </div>

        {/* Account actions */}
        <div className="space-y-2.5">
          <Link to="/app/refer" className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
            <Gift className="w-5 h-5 text-brand-500 shrink-0" />
            <span className="flex-1 font-semibold text-sm">Refer &amp; earn</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200 px-4 py-3.5 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors duration-200">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      {/* ═══ TABLET / DESKTOP (sm+) — unchanged ═══ */}
      <div className="hidden sm:block space-y-5 max-w-2xl">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar name={profile.full_name} url={profile.avatar_url} size="w-16 h-16" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold truncate">{profile.full_name}</h1>
              <p className="text-sm text-slate-500">{profile.phone || 'No phone added'}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Tile icon={Flame} value={profile.points ?? 0} label="points" accent="text-brand-500" />
            <Tile icon={Medal} value={badgeCount ?? '—'} label="badges" accent="text-amber-500" />
            <Tile icon={HeartPulse} value={bmi ?? '—'} label={cat || 'BMI'} accent="text-emerald-500" />
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Your details</h2>
            <button onClick={startEdit} className="btn-secondary !py-2 !px-3 text-sm">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>
          <dl className="mt-4 divide-y divide-slate-100">
            <Row label="Name" value={profile.full_name} />
            <Row label="Phone" value={profile.phone} />
            <Row label="Age" value={profile.age} />
            <Row label="Gender" value={profile.gender} capitalize />
            <Row label="Height" value={profile.height_cm && `${profile.height_cm} cm`} />
            <Row label="Starting weight" value={profile.starting_weight_kg && `${profile.starting_weight_kg} kg`} />
            <Row label="Target weight" value={profile.target_weight_kg && `${profile.target_weight_kg} kg`} />
            <Row label="Activity" value={ACTIVITY_LABELS[profile.activity_level]} />
            <Row label="Goal" value={GOAL_LABELS[profile.fitness_goal]} />
            <Row label="BMI" value={bmi ? `${bmi} (${cat})` : null} />
            <Row label="TDEE" value={tdee ? `${tdee} kcal/day` : null} />
            <Row label="Referral code" value={profile.referral_code} />
          </dl>
        </Card>

        <ClientRefer />

        <button onClick={signOut} className="btn-secondary w-full text-red-600 hover:bg-red-50">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </>
  );
}

function Tile({ icon: Icon, value, label, accent }) {
  return (
    <div className="bg-slate-50 rounded-xl py-3 text-center">
      <Icon className={`w-5 h-5 mx-auto ${accent}`} />
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
      <p className="text-[11px] text-slate-500 font-semibold">{label}</p>
    </div>
  );
}

function SectionLabel({ children, className = '' }) {
  return <span className={`text-[11px] font-bold uppercase tracking-wide text-slate-400 ${className}`}>{children}</span>;
}

function Row({ label, value, capitalize }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`text-sm font-semibold text-slate-900 text-right ${capitalize ? 'capitalize' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

function CategoryPill({ cat }) {
  const tone = cat === 'Normal' ? 'bg-emerald-100 text-emerald-700'
    : cat === 'Underweight' ? 'bg-sky-100 text-sky-700'
    : 'bg-amber-100 text-amber-700'; // Overweight / Obese
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tone}`}>{cat}</span>;
}

function Field({ label, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
