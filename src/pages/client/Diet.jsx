import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, HeartPulse, Flame, Target, Drumstick, Wheat, Droplet, Salad, Leaf, Beef,
  Download, MessageCircle, Dumbbell, ListChecks, ChevronRight, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { profileComplete } from '../../lib/diet';
import { dietTargets, buildDay, SLOT_LABELS } from '../../lib/dietEngine';
import { downloadDietPdf } from '../../lib/dietPdf';
import { bmiCategory } from '../../lib/calc';
import { waSendLink } from '../../config';
import { Card, Spinner } from '../../components/ui';

export default function ClientDiet() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const complete = profileComplete(profile);
  const targets = useMemo(() => (complete ? dietTargets(profile) : null), [profile, complete]);

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState([]);
  const [rules, setRules] = useState([]);
  const [workout, setWorkout] = useState([]);
  const [track, setTrack] = useState(profile.diet_type === 'non-veg' ? 'non-veg' : 'veg');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: r }, { data: w }] = await Promise.all([
        supabase.from('diet_plan_template').select('*').order('slot_order').order('option_no'),
        supabase.from('diet_rules').select('*').order('sort_order'),
        supabase.from('workout_plan').select('*').order('sort_order'),
      ]);
      setTemplate(t ?? []); setRules(r ?? []); setWorkout(w ?? []);
      setLoading(false);
    })();
  }, []);

  const day = useMemo(() => (targets ? buildDay(template, track, targets) : null), [template, track, targets]);

  async function chooseTrack(v) {
    setTrack(v);
    if (profile.diet_type !== v) {
      await supabase.from('profiles').update({ diet_type: v }).eq('id', profile.id);
      refreshProfile?.();
    }
  }

  function downloadPdf() {
    setBusy(true);
    try {
      downloadDietPdf({ profile, track, targets, day, rules, workout });
    } catch (e) {
      toast(e.message || 'Could not generate PDF', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;

  // ── Gate ──
  if (!complete) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl md:text-3xl font-bold">Diet Plan</h1>
        <Card className="p-8 text-center">
          <span className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto"><Lock className="w-7 h-7" /></span>
          <h2 className="mt-4 text-xl font-bold">Complete your profile to unlock your free diet plan</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">We need your age, height, weight, activity level and goal to personalize your quantities.</p>
          <Link to="/app/profile" className="btn-primary mt-6 inline-flex">Complete profile</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6 md:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Free for everyone</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-extrabold uppercase">Free diet plan for everyone</h1>
        <p className="mt-2 text-sm text-emerald-50 max-w-xl">A dietician-designed plan with quantities scaled to your body and goal. No AI — just proven nutrition.</p>
      </div>

      {/* Veg / Non-Veg */}
      <Card className="p-5">
        <span className="label">Choose your track</span>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {[['veg', 'Vegetarian', Leaf], ['non-veg', 'Non-Vegetarian', Beef]].map(([v, l, Icon]) => (
            <button key={v} onClick={() => chooseTrack(v)}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 font-bold text-sm transition-colors duration-200 ${
                track === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}>
              <Icon className="w-5 h-5" /> {l}
            </button>
          ))}
        </div>
      </Card>

      {/* Your Daily Targets */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <NumberCard icon={Target} label="Calories" value={targets.total_calories} sub="kcal/day" accent="text-emerald-500" />
        <NumberCard icon={Drumstick} label="Protein" value={`${targets.protein_g}g`} accent="text-brand-500" />
        <NumberCard icon={Droplet} label="Fat" value={`${targets.fat_g}g`} accent="text-amber-500" />
        <NumberCard icon={Wheat} label="Carbs" value={`${targets.carbs_g}g`} accent="text-sky-500" />
        <NumberCard icon={HeartPulse} label="BMI" value={targets.bmi ?? '—'} sub={bmiCategory(targets.bmi)} accent="text-violet-500" />
      </div>
      <p className="text-xs text-slate-500 -mt-2">Fibre target: {targets.fiber_min}–{targets.fiber_max} g/day.</p>

      {/* Download */}
      <button onClick={downloadPdf} disabled={busy} className="btn-primary w-full sm:w-auto">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download my diet chart (PDF)
      </button>

      {/* Day plan */}
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><Salad className="w-5 h-5 text-emerald-500" /> Your day</h3>
        <div className="mt-4 space-y-4">
          {day.meals.map(m => (
            <div key={m.slot}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{SLOT_LABELS[m.slot] ?? m.slot}</p>
              <div className="mt-1.5 space-y-2">
                {m.options.map((o, i) => (
                  <Link key={o.id} to={o.recipe_code ? `/recipes/${o.recipe_code}` : '#'}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors duration-200">
                    <div className="flex-1 min-w-0">
                      {m.options.length > 1 && <span className="text-[11px] font-bold text-emerald-600">Option {i + 1}</span>}
                      <p className="text-sm font-semibold text-slate-800">{o.description}</p>
                      <p className="text-xs text-slate-500">{o.calories} kcal · {o.protein} g protein{o.prep_remarks ? ` · ${o.prep_remarks}` : ''}</p>
                    </div>
                    {o.recipe_code && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold">
          <span>Estimated day total</span>
          <span className="text-emerald-600">{day.totalCal} kcal · {day.totalProtein} g protein</span>
        </div>
        {day.totalProtein < targets.protein_g && (
          <p className="mt-2 text-xs text-amber-600">Tip: to hit {targets.protein_g} g protein, add +1 egg or +20 g paneer/chicken/fish to your largest meal.</p>
        )}
      </Card>

      {/* Custom plan → WhatsApp */}
      <Card className="p-5 md:p-6 bg-gradient-to-r from-slate-900 to-slate-800 !border-0 text-white flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[220px]">
          <h3 className="font-bold text-white">Want a customized diet plan for your specific goal?</h3>
          <p className="text-sm text-slate-300 mt-0.5">A dietician builds one just for you — tailored to your goal, food preferences and routine.</p>
          <p className="mt-2 inline-flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Starting from just</span>
            <span className="font-display text-2xl font-extrabold text-emerald-400">₹499</span>
          </p>
        </div>
        <a href={waSendLink('Hi UniFit! I want a customized diet plan for my goal (starting ₹499).')} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors duration-200">
          <MessageCircle className="w-4 h-4" /> Get my custom plan on WhatsApp
        </a>
      </Card>

      {/* Rules + workout */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold text-lg flex items-center gap-2"><ListChecks className="w-5 h-5 text-emerald-500" /> Points to follow</h3>
          <ul className="mt-3 space-y-2">
            {rules.map(r => (
              <li key={r.id} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{r.sort_order}</span>
                {r.rule}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-lg flex items-center gap-2"><Dumbbell className="w-5 h-5 text-brand-500" /> Weekly workout</h3>
          <ul className="mt-3 space-y-2.5">
            {workout.map(w => (
              <li key={w.id} className="text-sm">
                <span className="font-bold text-slate-800">{w.day_label}:</span> <span className="text-slate-600">{w.activity}</span>
                {w.focus && <span className="block text-xs text-slate-400">{w.focus}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="text-xs text-slate-400">
        This plan is a general healthy-eating guide, not medical advice. Consult a doctor or dietician for medical conditions, pregnancy, or allergies.
      </p>
    </div>
  );
}

function NumberCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className={`w-4 h-4 ${accent}`} /> {label}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </Card>
  );
}
