import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Dumbbell, ArrowLeft, Salad, Flame, Drumstick, Utensils, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Public recipe page — opened from the diet plan + PDF links (no login needed).
export default function RecipeDetail() {
  const { code } = useParams();
  const [recipe, setRecipe] = useState(undefined); // undefined=loading, null=not found

  useEffect(() => {
    supabase.from('recipes').select('*').eq('code', code).maybeSingle()
      .then(({ data }) => setRecipe(data ?? null));
  }, [code]);

  if (recipe === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold uppercase text-slate-900">
            <Dumbbell className="w-6 h-6 text-brand-500" /> Uni<span className="text-brand-500">Fit</span>
          </Link>
          <Link to="/app/diet" className="text-sm font-semibold text-slate-500 hover:text-brand-600 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Diet plan
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {!recipe ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Salad className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="mt-3 font-bold text-slate-700">Recipe not found</p>
            <Link to="/app/diet" className="btn-primary mt-5 inline-flex">Back to diet plan</Link>
          </div>
        ) : (
          <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="aspect-[16/9] bg-gradient-to-br from-emerald-200 to-emerald-400 flex items-center justify-center">
              {recipe.image_url ? <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" /> : <Salad className="w-12 h-12 text-emerald-700" />}
            </div>
            <div className="p-5 md:p-7">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Part of your diet plan
              </span>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold">{recipe.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {recipe.base_calories != null && <Pill icon={Flame}>{recipe.base_calories} kcal*</Pill>}
                {recipe.base_protein_g != null && <Pill icon={Drumstick}>{recipe.base_protein_g} g protein*</Pill>}
                {recipe.category && <Pill icon={Utensils}>{recipe.category}</Pill>}
              </div>
              <p className="mt-2 text-xs text-slate-400">*Base reference values — your plan scales these to your targets.</p>

              <h2 className="mt-6 font-bold text-sm uppercase tracking-wide text-slate-500">Ingredients</h2>
              <ul className="mt-2 space-y-1.5">
                {(recipe.ingredients ?? []).map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {it}</li>
                ))}
              </ul>

              <h2 className="mt-6 font-bold text-sm uppercase tracking-wide text-slate-500">Steps</h2>
              <ol className="mt-2 space-y-2.5">
                {(recipe.steps ?? []).map((st, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="pt-0.5">{st}</span>
                  </li>
                ))}
              </ol>

              {recipe.tips && <p className="mt-5 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3"><strong>Tip:</strong> {recipe.tips}</p>}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

function Pill({ icon: Icon, children }) {
  return <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full"><Icon className="w-3.5 h-3.5" /> {children}</span>;
}
