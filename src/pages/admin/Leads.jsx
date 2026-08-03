import { useEffect, useState } from 'react';
import { Download, Check, X, Loader2, Plus, Trash2, GripVertical, Star, Mailbox, MessageSquare, Images } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { downloadCSV } from '../../lib/csv';
import { Card, Spinner } from '../../components/ui';

export default function AdminLeads() {
  const toast = useToast();
  const [tab, setTab] = useState('leads');
  const [source, setSource] = useState('all');
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  async function load() {
    const [{ data: l }, { data: r }, { data: t }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('testimonials').select('*').order('sort_order'),
    ]);
    setLeads(l ?? []); setReviews(r ?? []); setTestimonials(t ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setReviewStatus(id, status) {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
    if (error) return toast(error.message, 'error');
    toast(status === 'approved' ? 'Review approved' : 'Review rejected');
    load();
  }

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const shownLeads = source === 'all' ? leads : leads.filter(l => l.source === source);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Leads &amp; Reviews</h1>

      <div className="inline-flex bg-slate-100 rounded-xl p-1 flex-wrap">
        {[['leads', `Leads (${leads.length})`, Mailbox], ['reviews', `Reviews${pendingCount ? ` · ${pendingCount} new` : ''}`, MessageSquare], ['testimonials', 'Testimonials', Images]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 ${tab === k ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
            <Icon className="w-4 h-4" /> {l}
          </button>
        ))}
      </div>

      {/* LEADS */}
      {tab === 'leads' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h2 className="font-bold">Inquiries</h2>
            <button onClick={() => shownLeads.length ? downloadCSV(shownLeads, `unifit-leads-${new Date().toISOString().slice(0, 10)}.csv`) : toast('No leads yet', 'error')} className="btn-secondary !py-2 text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Source filter — client-side over the already-loaded rows. */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[['all', 'All'], ['landing', 'Landing'], ['morning-session', 'Morning session']].map(([k, l]) => {
              const n = k === 'all' ? leads.length : leads.filter(x => x.source === k).length;
              return (
                <button key={k} onClick={() => setSource(k)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 ${source === k ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {l} ({n})
                </button>
              );
            })}
          </div>

          {shownLeads.length === 0 ? <p className="text-sm text-slate-500 py-6 text-center">No leads yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
                  <tr><th className="py-2 pr-4 font-bold">Name</th><th className="py-2 pr-4 font-bold">WhatsApp</th><th className="py-2 pr-4 font-bold">Occupation</th><th className="py-2 pr-4 font-bold">Goal</th><th className="py-2 pr-4 font-bold">Source</th><th className="py-2 pr-4 font-bold">Consent</th><th className="py-2 font-bold">When</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shownLeads.map(l => (
                    <tr key={l.id}>
                      <td className="py-2.5 pr-4 font-semibold">{l.name}</td>
                      <td className="py-2.5 pr-4"><a href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold">{l.whatsapp}</a></td>
                      <td className="py-2.5 pr-4 text-slate-600">{l.occupation === 'Other' ? (l.occupation_other || 'Other') : (l.occupation || '—')}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{l.goal}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${l.source === 'morning-session' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>{l.source}</span>
                      </td>
                      <td className="py-2.5 pr-4">{l.consent ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-slate-300" />}</td>
                      <td className="py-2.5 text-slate-400 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* REVIEWS moderation */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 && <Card className="p-6 text-center text-sm text-slate-500">No reviews yet.</Card>}
          {reviews.map(r => (
            <Card key={r.id} className="p-4 flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{r.name}</span>
                  <span className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                </div>
                {r.text && <p className="mt-1 text-sm text-slate-600 italic">“{r.text}”</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                {r.status !== 'approved' && (
                  <button onClick={() => setReviewStatus(r.id, 'approved')} title="Approve" className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Check className="w-4 h-4" /></button>
                )}
                {r.status !== 'pending' && (
                  <button onClick={() => setReviewStatus(r.id, 'pending')} title="Unpublish" className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><X className="w-4 h-4" /></button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TESTIMONIALS manager */}
      {tab === 'testimonials' && <TestimonialsManager rows={testimonials} reload={load} />}
    </div>
  );
}

function TestimonialsManager({ rows, reload }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [add, setAdd] = useState({ name: '', location: '', result: '', quote: '' });

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    const sort = (rows.at(-1)?.sort_order ?? 0) + 1;
    const { error } = await supabase.from('testimonials').insert({ ...add, sort_order: sort, is_active: true });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    setAdd({ name: '', location: '', result: '', quote: '' });
    reload();
  }
  async function toggle(t) {
    await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
    reload();
  }
  async function remove(id) {
    await supabase.from('testimonials').delete().eq('id', id);
    reload();
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="font-bold mb-3">Add testimonial</h2>
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <input required placeholder="Name" className="input" value={add.name} onChange={e => setAdd(x => ({ ...x, name: e.target.value }))} />
          <input placeholder="Location (e.g. Jaipur)" className="input" value={add.location} onChange={e => setAdd(x => ({ ...x, location: e.target.value }))} />
          <input placeholder="Result (e.g. Lost 4 kg in 30 days)" className="input sm:col-span-2" value={add.result} onChange={e => setAdd(x => ({ ...x, result: e.target.value }))} />
          <textarea placeholder="Quote" rows="2" className="input sm:col-span-2" value={add.quote} onChange={e => setAdd(x => ({ ...x, quote: e.target.value }))} />
          <button type="submit" disabled={busy} className="btn-primary sm:col-span-2 text-sm">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add</button>
        </form>
      </Card>
      <div className="space-y-2.5">
        {rows.map(t => (
          <Card key={t.id} className={`p-4 flex items-start gap-3 ${t.is_active ? '' : 'opacity-60'}`}>
            <GripVertical className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm">{t.name} <span className="text-slate-400 font-normal">· {t.location}</span></p>
              <p className="text-xs font-semibold text-emerald-600">{t.result}</p>
              {t.quote && <p className="mt-1 text-sm text-slate-600 italic">“{t.quote}”</p>}
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => toggle(t)} className="btn-secondary !py-1.5 !px-2.5 text-xs">{t.is_active ? 'Hide' : 'Show'}</button>
              <button onClick={() => remove(t.id)} title="Delete" className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
