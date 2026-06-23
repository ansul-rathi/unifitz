import { useEffect, useMemo, useState } from 'react';
import { Search, Salad, Flame, Drumstick, Utensils, X, Leaf, Beef, SlidersHorizontal, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, Spinner, EmptyState } from '../../components/ui';

const TRACKS = [
  { key: 'all', label: 'All' },
  { key: 'veg', label: 'Veg' },
  { key: 'non-veg', label: 'Non-veg' },
];

const kcal = r => r.base_calories ?? r.calories ?? null;
const protein = r => r.base_protein_g ?? r.protein_g ?? null;

export default function ClientRecipes() {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [q, setQ] = useState('');
  const [track, setTrack] = useState('all');
  const [cats, setCats] = useState(() => new Set()); // selected categories (multi)
  const [filterOpen, setFilterOpen] = useState(false);
  const [open, setOpen] = useState(null); // recipe in detail modal

  const toggleCat = c => setCats(prev => {
    const next = new Set(prev);
    next.has(c) ? next.delete(c) : next.add(c);
    return next;
  });

  useEffect(() => {
    supabase.from('recipes').select('*').order('title').then(({ data }) => {
      setRecipes(data ?? []);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(recipes.map(r => r.category).filter(Boolean))).sort(),
    [recipes],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return recipes.filter(r => {
      if (track !== 'all') {
        const t = r.track || 'both';
        if (t !== 'both' && t !== track) return false;
      }
      if (cats.size && !cats.has(r.category)) return false;
      if (!needle) return true;
      const hay = [r.title, r.category, ...(r.ingredients ?? [])].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [recipes, q, track, cats]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Recipes</h1>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search recipes or ingredients…"
          className="input !pl-10"
          aria-label="Search recipes"
        />
      </div>

      {/* Track + category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {TRACKS.map(t => (
          <button key={t.key} onClick={() => setTrack(t.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-colors duration-150 ${
              track === t.key ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>{t.label}</button>
        ))}

        {/* Category multi-select dropdown */}
        {categories.length > 0 && (
          <div className="relative">
            <button onClick={() => setFilterOpen(o => !o)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold transition-colors duration-150 ${
                cats.size ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              <SlidersHorizontal className="w-4 h-4" />
              Categories{cats.size > 0 && ` · ${cats.size}`}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
                <div className="absolute left-0 mt-2 z-40 w-56 max-h-72 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-lg p-2">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Categories</span>
                    {cats.size > 0 && <button onClick={() => setCats(new Set())} className="text-xs font-semibold text-brand-600">Clear</button>}
                  </div>
                  {categories.map(c => {
                    const on = cats.has(c);
                    return (
                      <button key={c} onClick={() => toggleCat(c)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-left hover:bg-slate-50">
                        <span className={`w-4 h-4 rounded flex items-center justify-center border ${on ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300'}`}>
                          {on && <Check className="w-3 h-3" />}
                        </span>
                        <span className="font-semibold text-slate-700">{c}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Active category chips */}
      {cats.size > 0 && (
        <div className="flex gap-2 flex-wrap -mt-2">
          {[...cats].map(c => (
            <button key={c} onClick={() => toggleCat(c)}
              className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {c} <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Salad} title="No recipes found" hint="Try a different search or filter." /></Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <button key={r.id} onClick={() => setOpen(r)} className="text-left">
              <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
                <div className="aspect-[16/10] bg-gradient-to-br from-emerald-200 to-emerald-400 flex items-center justify-center">
                  {r.image_url ? <img src={r.image_url} alt={r.title} loading="lazy" className="w-full h-full object-cover" /> : <Salad className="w-8 h-8 text-emerald-700" />}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="font-bold text-sm leading-snug line-clamp-2">{r.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    {r.track && <TrackTag track={r.track} />}
                    {r.category && <span className="bg-slate-100 px-2 py-0.5 rounded-full">{r.category}</span>}
                  </div>
                  <div className="mt-auto pt-2 flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                    {kcal(r) != null && <span className="inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" />{kcal(r)}</span>}
                    {protein(r) != null && <span className="inline-flex items-center gap-1"><Drumstick className="w-3.5 h-3.5 text-rose-400" />{protein(r)}g</span>}
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {open && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald-200 to-emerald-400 flex items-center justify-center">
              {open.image_url ? <img src={open.image_url} alt={open.title} className="w-full h-full object-cover" /> : <Salad className="w-12 h-12 text-emerald-700" />}
              <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-3 right-3 p-2 rounded-full bg-white/85 text-slate-700 hover:bg-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                {open.track && <TrackTag track={open.track} />}
                {open.category && <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full"><Utensils className="w-3.5 h-3.5" /> {open.category}</span>}
              </div>
              <h2 className="mt-3 text-xl md:text-2xl font-bold">{open.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                {kcal(open) != null && <Pill icon={Flame}>{kcal(open)} kcal</Pill>}
                {protein(open) != null && <Pill icon={Drumstick}>{protein(open)} g protein</Pill>}
              </div>

              {(open.ingredients ?? []).length > 0 && (
                <>
                  <h3 className="mt-6 font-bold text-sm uppercase tracking-wide text-slate-500">Ingredients</h3>
                  <ul className="mt-2 space-y-1.5">
                    {(open.ingredients ?? []).map((it, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {it}</li>
                    ))}
                  </ul>
                </>
              )}

              {(open.steps ?? []).length > 0 && (
                <>
                  <h3 className="mt-6 font-bold text-sm uppercase tracking-wide text-slate-500">Steps</h3>
                  <ol className="mt-2 space-y-2.5">
                    {(open.steps ?? []).map((st, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700">
                        <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="pt-0.5">{st}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {open.tips && <p className="mt-5 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3"><strong>Tip:</strong> {open.tips}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrackTag({ track }) {
  if (track === 'non-veg') return <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full"><Beef className="w-3 h-3" /> Non-veg</span>;
  if (track === 'veg') return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"><Leaf className="w-3 h-3" /> Veg</span>;
  return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Both</span>;
}

function Pill({ icon: Icon, children }) {
  return <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full"><Icon className="w-3.5 h-3.5" /> {children}</span>;
}
