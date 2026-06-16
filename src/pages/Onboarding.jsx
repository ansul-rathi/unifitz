import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowRight, ArrowLeft, Loader2, Flame, HeartPulse } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { calcBMI, bmiCategory, calcTDEE, ACTIVITY_LABELS } from '../lib/calc';

const GOALS = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'gain_muscle', label: 'Gain muscle' },
  { value: 'stay_fit', label: 'Stay fit' },
];

export default function Onboarding() {
  const { session, refreshProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    age: '', gender: 'female', height_cm: '', weight_kg: '',
    activity_level: 'light', fitness_goal: 'lose_weight',
    waist_in: '', hips_in: '', chest_in: '', target_weight_kg: '',
  });

  const set = e => setF(x => ({ ...x, [e.target.name]: e.target.value }));
  const num = v => (v === '' ? null : Number(v));

  const bmi = calcBMI(num(f.weight_kg), num(f.height_cm));
  const tdee = calcTDEE({
    weightKg: num(f.weight_kg), heightCm: num(f.height_cm),
    age: num(f.age), gender: f.gender, activityLevel: f.activity_level,
  });

  async function finish() {
    setBusy(true);
    const { error } = await supabase.from('profiles').update({
      age: num(f.age), gender: f.gender, height_cm: num(f.height_cm),
      starting_weight_kg: num(f.weight_kg), target_weight_kg: num(f.target_weight_kg),
      activity_level: f.activity_level, fitness_goal: f.fitness_goal,
      onboarding_complete: true,
    }).eq('id', session.user.id);
    setBusy(false);
    if (error) return toast(error.message, 'error');

    // Save optional measurements as the Week-0 baseline check-in.
    if (f.waist_in || f.hips_in || f.chest_in) {
      await supabase.from('weekly_checkins').insert({
        user_id: session.user.id, week_number: 0, weight_kg: num(f.weight_kg),
        waist_in: num(f.waist_in), hips_in: num(f.hips_in), chest_in: num(f.chest_in),
        notes: 'Starting measurements',
      });
    }
    await refreshProfile();
    navigate('/app', { replace: true });
  }

  const stepValid =
    step === 1 ? f.age && f.height_cm && f.weight_kg
    : true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-slate-50 flex flex-col items-center px-4 py-10">
      <div className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900 mb-2">
        <Dumbbell className="w-7 h-7 text-brand-500" /> Uni<span className="text-brand-500">Fit</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">Let's set your starting point — takes 1 minute</p>

      {/* Step dots */}
      <div className="flex gap-2 mb-8" aria-label={`Step ${step} of 4`}>
        {[1, 2, 3, 4].map(s => (
          <span key={s} className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-brand-500' : 'w-2 bg-slate-300'}`} />
        ))}
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-xl font-bold">About you</h2>
            <div>
              <label className="label" htmlFor="age">Age</label>
              <input id="age" name="age" type="number" min="14" max="90" required value={f.age} onChange={set} className="input" placeholder="34" />
            </div>
            <div>
              <span className="label">Gender</span>
              <div className="grid grid-cols-3 gap-2">
                {['female', 'male', 'other'].map(g => (
                  <button key={g} type="button" onClick={() => setF(x => ({ ...x, gender: g }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors duration-200 capitalize ${
                      f.gender === g ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-300 text-slate-600 hover:border-brand-300'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="height_cm">Height (cm)</label>
                <input id="height_cm" name="height_cm" type="number" min="100" max="230" value={f.height_cm} onChange={set} className="input" placeholder="162" />
              </div>
              <div>
                <label className="label" htmlFor="weight_kg">Weight (kg)</label>
                <input id="weight_kg" name="weight_kg" type="number" min="30" max="250" step="0.1" value={f.weight_kg} onChange={set} className="input" placeholder="68" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-xl font-bold">Your lifestyle & goal</h2>
            <div>
              <label className="label" htmlFor="activity_level">Activity level</label>
              <select id="activity_level" name="activity_level" value={f.activity_level} onChange={set} className="input">
                {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="label">Goal</span>
              <div className="grid gap-2">
                {GOALS.map(g => (
                  <button key={g.value} type="button" onClick={() => setF(x => ({ ...x, fitness_goal: g.value }))}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-colors duration-200 ${
                      f.fitness_goal === g.value ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-300 text-slate-600 hover:border-brand-300'
                    }`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-xl font-bold">Measurements <span className="text-sm font-normal text-slate-400">(optional)</span></h2>
            <div className="grid grid-cols-3 gap-3">
              {[['waist_in', 'Waist (in)'], ['hips_in', 'Hips (in)'], ['chest_in', 'Chest (in)']].map(([name, label]) => (
                <div key={name}>
                  <label className="label" htmlFor={name}>{label}</label>
                  <input id={name} name={name} type="number" step="0.5" min="15" max="80" value={f[name]} onChange={set} className="input" />
                </div>
              ))}
            </div>
            <div>
              <label className="label" htmlFor="target_weight_kg">Target weight (kg)</label>
              <input id="target_weight_kg" name="target_weight_kg" type="number" step="0.5" min="30" max="200" value={f.target_weight_kg} onChange={set} className="input" placeholder="60" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-up text-center">
            <h2 className="text-xl font-bold">Your Starting Point</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <HeartPulse className="w-6 h-6 text-brand-500 mx-auto" />
                <p className="mt-2 font-display text-3xl font-bold text-slate-900">{bmi ?? '—'}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-1">BMI</p>
                <p className="text-sm font-semibold text-brand-600 mt-1">{bmiCategory(bmi)}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <Flame className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="mt-2 font-display text-3xl font-bold text-slate-900">{tdee ?? '—'}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-1">TDEE (kcal/day)</p>
                <p className="text-sm font-semibold text-emerald-600 mt-1">Maintenance calories</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              We'll track these every week — small consistent steps win.
            </p>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-7 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => stepValid && setStep(s => s + 1)} disabled={!stepValid} className="btn-primary flex-1">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finish} disabled={busy} className="btn-primary flex-1">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
