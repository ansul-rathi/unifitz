import { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { CreditCard, Wallet, X, Loader2, AlertCircle, MessageCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { payWithRazorpay, payWithCash } from '../lib/razorpay';
import { waLink } from '../config';
import { Avatar } from './ui';

// Reusable enroll/payment sheet. Opened from the Series list AND the Series
// detail page so "Enroll" never dead-ends by bouncing to another screen.
// On success calls onEnrolled() so the caller can refresh + show unlocked state.
export default function PaymentSheet({ series, profile, email, onClose, onEnrolled }) {
  const toast = useToast();
  const [mode, setMode] = useState(null);   // null (chooser) | 'cash'
  const [collectors, setCollectors] = useState([]);
  const [collector, setCollector] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false); // online payment failed → offer retry
  const [plans, setPlans] = useState([]);       // recorded series: available plans
  const [planId, setPlanId] = useState(null);

  const recorded = series?.access_type === 'recorded';

  useEffect(() => {
    if (!series) return;
    // Collector list (teachers of this series + admins) via SECURITY DEFINER rpc.
    supabase.rpc('series_collectors', { p_challenge: series.id }).then(({ data }) => {
      setCollectors((data ?? []).map(p => ({
        id: p.id, name: p.full_name, avatar: p.avatar_url,
        role: p.role === 'admin' ? 'Admin' : 'Teacher',
      })));
    });
    if (series.access_type === 'recorded') {
      supabase.from('recorded_plans').select('*').eq('challenge_id', series.id).eq('is_active', true)
        .order('sort_order').order('price')
        .then(({ data }) => {
          setPlans(data ?? []);
          setPlanId((data ?? [])[0]?.id ?? null);   // preselect cheapest/first
        });
    }
  }, [series]);

  const plan = plans.find(p => p.id === planId) || null;
  const amount = recorded ? (plan?.price ?? 0) : series?.price;
  const planDuration = m => (m == null ? 'Lifetime' : m === 1 ? '1 month' : `${m} months`);

  async function payOnline() {
    if (recorded && !planId) return toast('Choose a plan', 'error');
    setBusy(true); setFailed(false);
    try {
      await payWithRazorpay({ challengeId: series.id, profile, email, planId: recorded ? planId : undefined });
      toast("Payment successful — you're enrolled!");
      onEnrolled?.();
    } catch (err) {
      // Cancelled or failed — keep the sheet open and offer a clear retry.
      if (err.message !== 'Payment cancelled') setFailed(true);
      toast(err.message || 'Payment failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function submitCash() {
    if (recorded && !planId) return toast('Choose a plan', 'error');
    if (!collector) return toast('Pick who you paid', 'error');
    setBusy(true);
    try {
      await payWithCash({ challengeId: series.id, userId: profile.id, amount, currency: series.currency, collectorId: collector, accessType: series.access_type, planMonths: plan?.months ?? null, planLabel: plan?.label ?? null });
      toast('Recorded — admin will verify your cash payment');
      onEnrolled?.();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!series} onClose={() => !busy && onClose()} className="relative z-[80]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0" />
      <div className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-6">
        <DialogPanel transition className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-5 md:p-6 max-h-[92vh] overflow-y-auto shadow-2xl transition duration-200 data-[closed]:translate-y-8 data-[closed]:opacity-0">
          {series && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{series.access_type === 'recorded' ? 'Get recorded access to' : 'Enroll in'} {series.name}</h3>
                <button onClick={() => !busy && onClose()} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
              </div>
              <p className="mt-1 text-2xl font-display font-bold text-slate-900">
                ₹{amount}{recorded && plan && <span className="text-sm font-semibold text-slate-400"> · {planDuration(plan.months)}</span>}
              </p>

              {/* Recorded series: pick a plan */}
              {recorded && (
                plans.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No plans available yet — contact us on WhatsApp.</p>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Choose a plan</p>
                    <div className="grid grid-cols-2 gap-2">
                      {plans.map(pl => (
                        <button key={pl.id} type="button" onClick={() => setPlanId(pl.id)}
                          className={`text-left rounded-xl border px-3 py-2.5 transition-colors duration-150 ${planId === pl.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-brand-300'}`}>
                          <span className="block text-sm font-bold text-slate-900">{pl.label}</span>
                          <span className="block text-xs text-slate-500">{planDuration(pl.months)}</span>
                          <span className="block mt-0.5 text-sm font-bold text-brand-600">₹{pl.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              {failed && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-3.5 py-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-red-800">Payment didn't go through</p>
                    <p className="text-red-700">No money was deducted. You can try again below.</p>
                  </div>
                </div>
              )}

              {!mode ? (
                <div className="mt-5 space-y-3">
                  <button onClick={payOnline} disabled={busy} className="w-full flex items-center gap-3 rounded-xl border border-slate-200 hover:border-brand-400 px-4 py-4 text-left transition-colors duration-200 disabled:opacity-60">
                    {busy ? <Loader2 className="w-5 h-5 animate-spin text-brand-500" /> : <CreditCard className="w-5 h-5 text-brand-500" />}
                    <span><span className="block font-bold text-sm">{failed ? 'Retry payment' : 'Pay online'}</span><span className="block text-xs text-slate-500">UPI, card, netbanking — instant enrollment</span></span>
                  </button>
                  <button onClick={() => setMode('cash')} disabled={busy} className="w-full flex items-center gap-3 rounded-xl border border-slate-200 hover:border-brand-400 px-4 py-4 text-left transition-colors duration-200 disabled:opacity-60">
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
                    {collectors.length === 0 && <li className="text-sm text-slate-400 py-2">No collectors listed yet — use online payment or contact us.</li>}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setMode(null)} className="btn-secondary text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
                    <button onClick={submitCash} disabled={busy} className="btn-primary flex-1 text-sm">
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />} I've paid cash
                    </button>
                  </div>
                </div>
              )}

              <a href={waLink(`Hi UniFit! I need help enrolling in "${series.name}".`)} target="_blank" rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-600">
                <MessageCircle className="w-3.5 h-3.5" /> Trouble paying? Message us on WhatsApp
              </a>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
