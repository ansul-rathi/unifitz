import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { Trophy, ArrowRight, CheckCircle2, CreditCard, Wallet, X, Loader2, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { payWithRazorpay, payWithCash } from '../../lib/razorpay';
import { Card, Spinner, ProgressBar, EmptyState, Avatar } from '../../components/ui';


export default function ClientChallenges() {
  const { profile, session } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [enrolled, setEnrolled] = useState(new Set());
  const [pending, setPending] = useState(new Set());      // challenge ids awaiting cash verification
  const [sessionCounts, setSessionCounts] = useState({}); // challenge_id → { total, done }
  const [payFor, setPayFor] = useState(null);             // series being paid for
  const [collectors, setCollectors] = useState([]);
  const [mode, setMode] = useState(null);                 // 'cash'
  const [collector, setCollector] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [{ data: ch }, { data: enr }, { data: pays }, { data: ses }] = await Promise.all([
      supabase.from('challenges').select('*').order('start_date'),
      supabase.from('enrollments').select('challenge_id').eq('user_id', profile.id),
      supabase.from('payments').select('challenge_id, status').eq('user_id', profile.id).eq('status', 'pending_verification'),
      supabase.from('sessions').select('challenge_id, completed'),
    ]);
    setChallenges(ch ?? []);
    setEnrolled(new Set((enr ?? []).map(e => e.challenge_id)));
    setPending(new Set((pays ?? []).map(p => p.challenge_id)));
    const counts = {};
    for (const s of ses ?? []) { (counts[s.challenge_id] ??= { total: 0, done: 0 }); counts[s.challenge_id].total++; if (s.completed) counts[s.challenge_id].done++; }
    setSessionCounts(counts);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [profile.id]);

  async function joinFree(id) {
    const { error } = await supabase.from('enrollments').insert({ user_id: profile.id, challenge_id: id });
    if (error) return toast(error.message, 'error');
    setEnrolled(s => new Set([...s, id]));
    toast("You're in! See your sessions on Home.");
  }

  async function openPay(c) {
    setPayFor(c); setMode(null); setCollector('');
    // Collector list (teachers of this series + admins) via SECURITY DEFINER rpc,
    // since RLS otherwise hides other people's profiles from clients.
    const { data } = await supabase.rpc('series_collectors', { p_challenge: c.id });
    setCollectors((data ?? []).map(p => ({ id: p.id, name: p.full_name, avatar: p.avatar_url, role: p.role === 'admin' ? 'Admin' : 'Teacher' })));
  }

  async function payOnline() {
    setBusy(true);
    try {
      await payWithRazorpay({ challengeId: payFor.id, profile, email: session?.user?.email });
      toast("Payment successful — you're enrolled!");
      setPayFor(null);
      load();
    } catch (err) {
      toast(err.message || 'Payment failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function submitCash() {
    if (!collector) return toast('Pick who you paid', 'error');
    setBusy(true);
    try {
      await payWithCash({ challengeId: payFor.id, userId: profile.id, amount: payFor.price, currency: payFor.currency, collectorId: collector });
      toast('Recorded — admin will verify your cash payment');
      setPayFor(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Series</h1>

      {challenges.length === 0 && (
        <Card><EmptyState icon={Trophy} title="No series yet" hint="New series will appear here." /></Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {challenges.map(c => {
          const sc = sessionCounts[c.id] ?? { total: 0, done: 0 };
          const pct = sc.total ? Math.round((sc.done / sc.total) * 100) : 0;
          const isIn = enrolled.has(c.id);
          const isPending = pending.has(c.id);
          return (
            <Card key={c.id} className="overflow-hidden flex flex-col">
              {c.poster_url && <img src={c.poster_url} alt={c.name} className="w-full aspect-[16/7] object-cover" />}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    c.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                    : c.status === 'upcoming' ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status === 'active' ? (sc.total ? `Active · ${sc.done}/${sc.total} done` : 'Active') : c.status}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.is_free ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'}`}>
                    {c.is_free ? 'FREE' : `₹${c.price}`}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-bold">{c.name}</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{c.description}</p>
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {c.batch_name && <>Batch: {c.batch_name} · </>}{c.duration_days} days
                </p>
                {sc.total > 0 && (
                  <div className="mt-3">
                    <ProgressBar value={sc.done} max={sc.total} />
                    <p className="mt-1 text-xs text-slate-500">{sc.done} / {sc.total} sessions done ({pct}%)</p>
                  </div>
                )}
                <div className="mt-5">
                  {isIn ? (
                    <Link to={`/app/challenges/${c.id}`} className="btn-secondary w-full text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Enrolled — View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : isPending ? (
                    <span className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-3">
                      <Clock className="w-4 h-4" /> Cash payment — awaiting verification
                    </span>
                  ) : c.is_free ? (
                    <button onClick={() => joinFree(c.id)} className="btn-primary w-full text-sm">
                      Join Series <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => openPay(c)} className="btn-primary w-full text-sm">
                      Enroll · ₹{c.price} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payment modal */}
      <Dialog open={!!payFor} onClose={() => !busy && setPayFor(null)} className="relative z-[80]">
        <DialogBackdrop transition className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0" />
        <div className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-6">
          <DialogPanel transition className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-5 md:p-6 max-h-[92vh] overflow-y-auto shadow-2xl transition duration-200 data-[closed]:translate-y-8 data-[closed]:opacity-0">
            {payFor && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Enroll in {payFor.name}</h3>
                  <button onClick={() => !busy && setPayFor(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>
                <p className="mt-1 text-2xl font-display font-bold text-slate-900">₹{payFor.price}</p>

                {!mode ? (
                  <div className="mt-5 space-y-3">
                    <button onClick={payOnline} disabled={busy} className="w-full flex items-center gap-3 rounded-xl border border-slate-200 hover:border-brand-400 px-4 py-4 text-left transition-colors duration-200">
                      {busy ? <Loader2 className="w-5 h-5 animate-spin text-brand-500" /> : <CreditCard className="w-5 h-5 text-brand-500" />}
                      <span><span className="block font-bold text-sm">Pay online</span><span className="block text-xs text-slate-500">UPI, card, netbanking — instant enrollment</span></span>
                    </button>
                    <button onClick={() => setMode('cash')} className="w-full flex items-center gap-3 rounded-xl border border-slate-200 hover:border-brand-400 px-4 py-4 text-left transition-colors duration-200">
                      <Wallet className="w-5 h-5 text-emerald-500" />
                      <span><span className="block font-bold text-sm">Pay by cash</span><span className="block text-xs text-slate-500">Tell us who you paid — admin verifies</span></span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Who did you pay the cash to?</p>
                    <ul className="space-y-1.5 max-h-60 overflow-y-auto">
                      {collectors.map(p => (
                        <li key={p.id}>
                          <label className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors duration-150 ${collector === p.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200'}`}>
                            <input type="radio" name="collector" checked={collector === p.id} onChange={() => setCollector(p.id)} className="w-4 h-4 accent-brand-500" />
                            <Avatar name={p.name} url={p.avatar} size="w-8 h-8" />
                            <span className="text-sm font-semibold flex-1">{p.name}</span>
                            <span className="text-[11px] font-bold text-slate-400">{p.role}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => setMode(null)} className="btn-secondary text-sm">Back</button>
                      <button onClick={submitCash} disabled={busy} className="btn-primary flex-1 text-sm">
                        {busy && <Loader2 className="w-4 h-4 animate-spin" />} I've paid cash
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
