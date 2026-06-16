import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Dumbbell, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', referral: params.get('ref') ?? '' });
  const [referrerName, setReferrerName] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Live referral-code validation (debounced).
  useEffect(() => {
    setReferrerName(null);
    const code = form.referral.trim();
    if (code.length < 4) return;
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc('validate_referral_code', { p_code: code });
      setReferrerName(data || null);
    }, 400);
    return () => clearTimeout(t);
  }, [form.referral]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.name.trim(),
              phone: form.phone.trim(),
              referral_code: form.referral.trim().toUpperCase(),
            },
          },
        });
        if (error) throw error;
        toast('Account created! Setting up your profile…');
      }
      // AuthContext redirects by role via App routes.
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900 mb-8">
        <Dumbbell className="w-7 h-7 text-brand-500" />
        Uni<span className="text-brand-500">Fit</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        {/* Tabs */}
        <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mb-6">
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2.5 rounded-lg text-sm font-bold transition-colors duration-200 ${
                mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" name="name" required value={form.name} onChange={set} className="input" placeholder="Priya Sharma" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={set} className="input" placeholder="you@example.com" />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" required value={form.phone} onChange={set} className="input" placeholder="+91 98xxx xxxxx" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={set} className="input" placeholder="••••••••" />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="label" htmlFor="referral">Referral code <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="referral" name="referral" value={form.referral} onChange={set} className="input uppercase" placeholder="PRIYA0001" />
              {referrerName && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Referred by {referrerName}
                </p>
              )}
            </div>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full text-base">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Login' : 'Create Free Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          One login for members, trainers and admins — you'll land on the right dashboard automatically.
        </p>
      </div>
    </div>
  );
}
