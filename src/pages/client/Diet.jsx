import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, HeartPulse, Flame, Target, Drumstick, Wheat, Droplet, Loader2, Sparkles,
  Salad, Search, X, UtensilsCrossed, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dietNumbers, profileComplete, generateDietPlan } from '../../lib/diet';
import { evaluateBadges } from '../../lib/badges';
import { bmiCategory } from '../../lib/calc';
import { Card, Spinner, EmptyState } from '../../components/ui';

const DIET_TYPES = ['veg', 'non-veg', 'eggetarian', 'vegan'];
const RECIPE_CATS = ['All', 'High Protein', 'Low-Cal', 'Breakfast', 'Snacks', 'Post-Workout'];

export default function ClientDiet() {
  const { profile } = useAuth();
  const toast = useToast();
  const complete = profileComplete(profile);
  const numbers = useMemo(() => (complete ? dietNumbers(profile) : null), [profile, complete]);

  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({ diet_type: 'veg', allergies_or_dislikes: '', meals_per_day: 3 });
  const [plan, setPlan] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [premium, setPremium] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [fitTarget, setFitTarget] = useState(false);
  const [openRecipe, setOpenRecipe] = useState(null);

  useEffect(() => {
    (async () => {
      const [{ data: pr }, { data: dp }, { data: rc }] = await Promise.all([
        supabase.from('diet_preferences').select('*').eq('user_id', profile.id).maybeSingle(),
        supabase.from('diet_plans').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('recipes').select('*').order('category'),
      ]);
      if (pr) setPrefs({ diet_type: pr.diet_type, allergies_or_dislikes: pr.allergies_or_dislikes ?? '', meals_per_day: pr.meals_per_day });
      setPlan(dp?.[0] ?? null);
      setRecipes(rc ?? []);
      setLoading(false);
    })();
  }, [profile.id]);

  async function savePrefs(next) {
    setPrefs(next);
    await supabase.from('diet_preferences').upsert(
      { user_id: profile.id, ...next }, { onConflict: 'user_id' },
    );
  }

  async function generate() {
    setBusy(true);
    setPremium(false);
    try {
      const res = await generateDietPlan(profile.id);
      if (res?.premium) {
        setPremium(true);
      } else if (res?.plan) {
        setPlan(res.plan);
        setActiveDay(0);
        toast('Your diet plan is ready!');
        const earned = await evaluateBadges(profile.id);
        if (earned.length) toast('New badge unlocked — check Badges!');
      }
    } catch (err) {
      toast(err.message || 'Could not generate plan', 'error');
    } finally {
      setBusy(false);
    }
  }

  const perMealBudget = numbers?.target ? Math.round(numbers.target / (prefs.meals_per_day || 3)) : null;
  const filteredRecipes = recipes.filter(r =>
    (cat === 'All' || r.category === cat) &&
    (search === '' || r.title.toLowerCase().includes(search.toLowerCase())) &&
    (!fitTarget || !perMealBudget || (r.calories ?? 0) <= perMealBudget)
  );

  if (loading) return <Spinner />;

  // ── Locked state ──
  if (!complete) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl md:text-3xl font-bold">Diet Plan</h1>
        <Card className="p-8 text-center">
          <span className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
            <Lock className="w-7 h-7" />
          </span>
          <h2 className="mt-4 text-xl font-bold">Complete your profile to unlock your free personalized diet plan</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            We need your age, height, weight, activity level and goal to calculate your numbers.
          </p>
          <Link to="/app/profile" className="btn-primary mt-6 inline-flex">Complete profile</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Diet Plan</h1>

      {/* Your Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <NumberCard icon={HeartPulse} label="BMI" value={numbers.bmi ?? '—'} sub={bmiCategory(numbers.bmi)} accent="text-brand-500" />
        <NumberCard icon={Flame} label="TDEE" value={numbers.tdee ? `${numbers.tdee}` : '—'} sub="kcal maintenance" accent="text-orange-500" />
        <NumberCard icon={Target} label="Daily target" value={numbers.target ? `${numbers.target}` : '—'} sub="kcal / day" accent="text-emerald-500" />
        <NumberCard icon={Drumstick} label="Macros (P/C/F)" value={`${numbers.protein_g}/${numbers.carbs_g}/${numbers.fat_g}`} sub="grams" accent="text-violet-500" />
      </div>

      {/* Preferences + generate */}
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">Your preferences</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="diet_type">Diet type</label>
            <select id="diet_type" className="input" value={prefs.diet_type} onChange={e => savePrefs({ ...prefs, diet_type: e.target.value })}>
              {DIET_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="meals">Meals per day</label>
            <select id="meals" className="input" value={prefs.meals_per_day} onChange={e => savePrefs({ ...prefs, meals_per_day: +e.target.value })}>
              {[3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="allergies">Allergies / dislikes</label>
            <input id="allergies" className="input" placeholder="e.g. peanuts, mushroom" value={prefs.allergies_or_dislikes}
              onChange={e => setPrefs(p => ({ ...p, allergies_or_dislikes: e.target.value }))}
              onBlur={e => savePrefs({ ...prefs, allergies_or_dislikes: e.target.value })} />
          </div>
        </div>
        <button onClick={generate} disabled={busy} className="btn-primary mt-5">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {plan ? 'Generate new plan' : 'Generate my plan'}
        </button>
        {premium && (
          <div className="mt-4 flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
            <Sparkles className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-violet-900 text-sm">Premium — coming soon</p>
              <p className="text-sm text-violet-700 mt-0.5">Your free plan stays available below. New plans unlock with Premium.</p>
            </div>
          </div>
        )}
      </Card>

      {/* The plan */}
      {plan?.plan?.days?.length > 0 && (
        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-lg">Your 7-day plan</h3>
            <span className="text-xs font-semibold text-slate-500">Target {plan.calorie_target} kcal/day</span>
          </div>
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
            {plan.plan.days.map((d, i) => (
              <button key={i} onClick={() => setActiveDay(i)}
                className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                  activeDay === i ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {(d.day ?? `Day ${i + 1}`).slice(0, 3)}
              </button>
            ))}
          </div>
          <DayMeals day={plan.plan.days[activeDay]} target={plan.calorie_target} />
        </Card>
      )}

      {/* Recipe library */}
      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-lg flex items-center gap-2"><Salad className="w-5 h-5 text-emerald-500" /> Recipe library</h3>
          {perMealBudget && (
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
              <input type="checkbox" checked={fitTarget} onChange={e => setFitTarget(e.target.checked)} className="w-4 h-4 accent-brand-500" />
              Fits my target (≤{perMealBudget} kcal)
            </label>
          )}
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !pl-10" placeholder="Search recipes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {RECIPE_CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                  cat === c ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {filteredRecipes.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="No recipes match" />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map(r => (
              <button key={r.id} onClick={() => setOpenRecipe(r)} className="text-left bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200">
                <div className="aspect-[3/2] bg-gradient-to-br from-emerald-200 to-emerald-400 flex items-center justify-center">
                  {r.image_url
                    ? <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                    : <Salad className="w-8 h-8 text-emerald-700" />}
                </div>
                <div className="p-4">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{r.category}</span>
                  <h4 className="mt-1 font-bold text-sm">{r.title}</h4>
                  <p className="mt-1 text-xs text-slate-500">{r.calories} kcal · {r.protein_g}g protein</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Recipe modal */}
      {openRecipe && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="aspect-[3/2] bg-gradient-to-br from-emerald-200 to-emerald-400 flex items-center justify-center relative">
              {openRecipe.image_url
                ? <img src={openRecipe.image_url} alt={openRecipe.title} className="w-full h-full object-cover" />
                : <Salad className="w-10 h-10 text-emerald-700" />}
              <button onClick={() => setOpenRecipe(null)} aria-label="Close" className="absolute top-3 right-3 p-2 rounded-lg bg-slate-900/60 text-white hover:bg-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 md:p-6">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{openRecipe.category}</span>
              <h3 className="mt-1 text-xl font-bold">{openRecipe.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <Macro icon={Flame} label={`${openRecipe.calories} kcal`} />
                <Macro icon={Drumstick} label={`${openRecipe.protein_g}g P`} />
                <Macro icon={Wheat} label={`${openRecipe.carbs_g}g C`} />
                <Macro icon={Droplet} label={`${openRecipe.fat_g}g F`} />
              </div>
              <h4 className="mt-5 font-bold text-sm">Ingredients</h4>
              <ul className="mt-2 space-y-1.5">
                {(openRecipe.ingredients ?? []).map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {it}
                  </li>
                ))}
              </ul>
              <h4 className="mt-5 font-bold text-sm">Steps</h4>
              <ol className="mt-2 space-y-2">
                {(openRecipe.steps ?? []).map((st, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    {st}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
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

function Macro({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

function DayMeals({ day, target }) {
  if (!day?.meals?.length) return null;
  const total = day.meals.reduce((s, m) => s + (m.approx_calories ?? 0), 0);
  return (
    <div className="mt-4 space-y-3">
      {day.meals.map((m, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">{m.name}</h4>
            <span className="text-xs font-semibold text-slate-500">{m.approx_calories} kcal</span>
          </div>
          <ul className="mt-2 space-y-1">
            {(m.items ?? []).map((it, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                <ChevronRight className="w-3.5 h-3.5 text-brand-400 mt-1 shrink-0" /> {it}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-400">P {m.protein_g}g · C {m.carbs_g}g · F {m.fat_g}g</p>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold">
        <span>Daily total</span>
        <span className={total > target * 1.05 ? 'text-red-600' : 'text-emerald-600'}>{total} / {target} kcal</span>
      </div>
    </div>
  );
}
