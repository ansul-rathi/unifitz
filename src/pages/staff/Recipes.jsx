import { useEffect, useMemo, useState } from 'react';
import { Search, Salad, Plus, Pencil, Trash2, X, Loader2, Eye, Flame, Drumstick, ImagePlus, Leaf, Beef } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/compressImage';
import { Card, Spinner, EmptyState } from '../../components/ui';
import Select from '../../components/Select';

const kcal = r => r.base_calories ?? r.calories ?? null;
const protein = r => r.base_protein_g ?? r.protein_g ?? null;
const linesToArr = s => s.split('\n').map(x => x.trim()).filter(Boolean);
const arrToLines = a => (a ?? []).join('\n');

const blank = () => ({
  title: '', category: '', track: 'veg', code: '',
  base_calories: '', base_protein_g: '', tips: '',
  ingredients: '', steps: '', is_premium: false, image_url: '', image: null,
});

export default function StaffRecipes() {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);   // form object (add/edit)
  const [view, setView] = useState(null);   // recipe being viewed
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from('recipes').select('*').order('title');
    setRecipes(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return recipes;
    return recipes.filter(r => [r.title, r.category, ...(r.ingredients ?? [])].join(' ').toLowerCase().includes(n));
  }, [recipes, q]);

  function startNew() { setEdit(blank()); }
  function startEdit(r) {
    setEdit({
      id: r.id, title: r.title ?? '', category: r.category ?? '', track: r.track ?? 'veg', code: r.code ?? '',
      base_calories: kcal(r) ?? '', base_protein_g: protein(r) ?? '', tips: r.tips ?? '',
      ingredients: arrToLines(r.ingredients), steps: arrToLines(r.steps),
      is_premium: !!r.is_premium, image_url: r.image_url ?? '', image: null,
    });
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title: edit.title.trim(),
        category: edit.category.trim() || null,
        track: edit.track,
        code: edit.code.trim() || null,
        base_calories: edit.base_calories === '' ? null : Number(edit.base_calories),
        base_protein_g: edit.base_protein_g === '' ? null : Number(edit.base_protein_g),
        tips: edit.tips.trim() || null,
        ingredients: linesToArr(edit.ingredients),
        steps: linesToArr(edit.steps),
        is_premium: edit.is_premium,
      };
      let id = edit.id;
      if (id) {
        const { error } = await supabase.from('recipes').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('recipes').insert({ ...payload, created_by: profile.id }).select('id').single();
        if (error) throw error;
        id = data.id;
      }
      if (edit.image) {
        const small = await compressImage(edit.image);
        const path = `recipe/${id}.jpg`;
        const { error: upErr } = await supabase.storage.from('posters').upload(path, small, { upsert: true });
        if (!upErr) {
          const { data: pub } = supabase.storage.from('posters').getPublicUrl(path);
          await supabase.from('recipes').update({ image_url: `${pub.publicUrl}?t=${Date.now()}` }).eq('id', id);
        }
      }
      toast(edit.id ? 'Recipe updated' : 'Recipe added');
      setEdit(null);
      load();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  async function del(r) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    const { error } = await supabase.from('recipes').delete().eq('id', r.id);
    if (error) return toast(error.message, 'error');
    toast('Recipe deleted');
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Recipes</h1>
        <button onClick={startNew} className="btn-primary !py-2.5 text-sm"><Plus className="w-4 h-4" /> New recipe</button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes or ingredients…" className="input !pl-10" aria-label="Search recipes" />
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Salad} title="No recipes" hint="Add your first recipe." /></Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-slate-100">
            {filtered.map(r => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-emerald-100 flex items-center justify-center shrink-0">
                  {r.image_url ? <img src={r.image_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Salad className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{r.title}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                    {r.track && <TrackTag track={r.track} />}
                    {r.category && <span>{r.category}</span>}
                    {kcal(r) != null && <span className="inline-flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{kcal(r)}</span>}
                    {protein(r) != null && <span className="inline-flex items-center gap-0.5"><Drumstick className="w-3 h-3 text-rose-400" />{protein(r)}g</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setView(r)} title="View" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => startEdit(r)} title="Edit" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => del(r)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* View modal */}
      {view && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" onClick={() => setView(null)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald-200 to-emerald-400 flex items-center justify-center">
              {view.image_url ? <img src={view.image_url} alt={view.title} className="w-full h-full object-cover" /> : <Salad className="w-12 h-12 text-emerald-700" />}
              <button onClick={() => setView(null)} aria-label="Close" className="absolute top-3 right-3 p-2 rounded-full bg-white/85 text-slate-700 hover:bg-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                {view.track && <TrackTag track={view.track} />}
                {view.category && <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{view.category}</span>}
                {view.is_premium && <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Premium</span>}
              </div>
              <h2 className="mt-3 text-xl font-bold">{view.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                {kcal(view) != null && <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><Flame className="w-3.5 h-3.5" /> {kcal(view)} kcal</span>}
                {protein(view) != null && <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><Drumstick className="w-3.5 h-3.5" /> {protein(view)} g</span>}
              </div>
              {(view.ingredients ?? []).length > 0 && <>
                <h3 className="mt-6 font-bold text-sm uppercase tracking-wide text-slate-500">Ingredients</h3>
                <ul className="mt-2 space-y-1.5">{(view.ingredients ?? []).map((it, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {it}</li>)}</ul>
              </>}
              {(view.steps ?? []).length > 0 && <>
                <h3 className="mt-6 font-bold text-sm uppercase tracking-wide text-slate-500">Steps</h3>
                <ol className="mt-2 space-y-2.5">{(view.steps ?? []).map((st, i) => <li key={i} className="flex gap-3 text-sm text-slate-700"><span className="w-6 h-6 shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span><span className="pt-0.5">{st}</span></li>)}</ol>
              </>}
              {view.tips && <p className="mt-5 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3"><strong>Tip:</strong> {view.tips}</p>}
              <button onClick={() => { startEdit(view); setView(null); }} className="btn-primary w-full mt-5"><Pencil className="w-4 h-4" /> Edit recipe</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / edit modal */}
      {edit && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" onClick={() => !busy && setEdit(null)}>
          <form onSubmit={save} className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 md:p-6 max-h-[92vh] overflow-y-auto animate-fade-up space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{edit.id ? 'Edit recipe' : 'New recipe'}</h3>
              <button type="button" onClick={() => setEdit(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            <input required placeholder="Title" className="input" value={edit.title} onChange={e => setEdit(x => ({ ...x, title: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Category (e.g. Breakfast)" className="input" value={edit.category} onChange={e => setEdit(x => ({ ...x, category: e.target.value }))} />
              <Select value={edit.track} onChange={v => setEdit(x => ({ ...x, track: v }))} options={[{ value: 'veg', label: 'Veg' }, { value: 'non-veg', label: 'Non-veg' }, { value: 'both', label: 'Both' }]} />
              <input type="number" min="0" placeholder="Calories (kcal)" className="input" value={edit.base_calories} onChange={e => setEdit(x => ({ ...x, base_calories: e.target.value }))} />
              <input type="number" min="0" step="0.1" placeholder="Protein (g)" className="input" value={edit.base_protein_g} onChange={e => setEdit(x => ({ ...x, base_protein_g: e.target.value }))} />
            </div>
            <input placeholder="Code (optional, for shareable link)" className="input uppercase" value={edit.code} onChange={e => setEdit(x => ({ ...x, code: e.target.value }))} />

            <div>
              <label className="label">Ingredients <span className="font-normal text-slate-400">(one per line)</span></label>
              <textarea rows="4" className="input" value={edit.ingredients} onChange={e => setEdit(x => ({ ...x, ingredients: e.target.value }))} placeholder={'2 eggs\n1 cup oats\n…'} />
            </div>
            <div>
              <label className="label">Steps <span className="font-normal text-slate-400">(one per line)</span></label>
              <textarea rows="4" className="input" value={edit.steps} onChange={e => setEdit(x => ({ ...x, steps: e.target.value }))} placeholder={'Boil the eggs\nMix oats with milk\n…'} />
            </div>
            <textarea rows="2" placeholder="Tip (optional)" className="input" value={edit.tips} onChange={e => setEdit(x => ({ ...x, tips: e.target.value }))} />

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={edit.is_premium} onChange={e => setEdit(x => ({ ...x, is_premium: e.target.checked }))} className="w-5 h-5 accent-brand-500" /> Premium recipe
            </label>

            <div>
              <label className="label">Image</label>
              {edit.image ? (
                <div className="relative w-40">
                  <img src={URL.createObjectURL(edit.image)} alt="Preview" className="w-full aspect-video object-cover rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => setEdit(x => ({ ...x, image: null }))} aria-label="Remove" className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/70 text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : edit.image_url ? (
                <div className="flex items-center gap-3">
                  <img src={edit.image_url} alt="Current" className="w-28 aspect-video object-cover rounded-lg border border-slate-200" />
                  <label className="btn-secondary !py-2 text-xs cursor-pointer">Replace<input type="file" accept="image/*" className="hidden" onChange={e => setEdit(x => ({ ...x, image: e.target.files?.[0] ?? null }))} /></label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-400 px-4 py-6 text-center cursor-pointer transition-colors duration-200">
                  <ImagePlus className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">Upload image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setEdit(x => ({ ...x, image: e.target.files?.[0] ?? null }))} />
                </label>
              )}
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Save recipe</button>
          </form>
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
