import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Dumbbell, Loader2, CheckCircle2, MailCheck, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

// Open the right webmail inbox from the user's email domain.
function inboxUrl(email) {
  const d = (email.split('@')[1] || '').toLowerCase();
  if (d.includes('gmail') || d.includes('googlemail')) return 'https://mail.google.com/';
  if (d.includes('outlook') || d.includes('hotmail') || d.includes('live')) return 'https://outlook.live.com/mail/';
  if (d.includes('yahoo')) return 'https://mail.yahoo.com/';
  return `https://${d}`;
}

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', referral: params.get('ref') ?? '' });
  const [referrerName, setReferrerName] = useState(null);
  const [busy, setBusy] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(null); // set when signup needs email confirmation
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
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              full_name: form.name.trim(),
              phone: form.phone.trim(),
              referral_code: form.referral.trim().toUpperCase(),
            },
          },
        });
        if (error) throw error;
        // Email confirmation ON → no session yet; show the verify screen.
        if (!data.session) setVerifyEmail(form.email.trim());
        else toast('Account created!');
      }
      // AuthContext redirects by role via App routes when a session exists.
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    const { error } = await supabase.auth.resend({ type: 'signup', email: verifyEmail });
    toast(error ? error.message : 'Verification email resent', error ? 'error' : 'success');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900 mb-8">
        <Dumbbell className="w-7 h-7 text-brand-500" />
        Uni<span className="text-brand-500">Fitz</span>
      </Link>

      {verifyEmail ? (
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 text-center">
          <span className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 mx-auto">
            <MailCheck className="w-7 h-7" />
          </span>
          <h2 className="mt-4 text-xl font-bold">Verify your email</h2>
          <p className="mt-2 text-sm text-slate-600">
            We sent a confirmation link to <strong className="text-slate-900">{verifyEmail}</strong>.
            Click it to activate your account, then come back and log in.
          </p>
          <a href={inboxUrl(verifyEmail)} target="_blank" rel="noreferrer" className="btn-primary w-full mt-6">
            <MailCheck className="w-4 h-4" /> Open my email
          </a>
          <button onClick={resend} className="btn-secondary w-full mt-2">Resend link</button>
          <button onClick={() => { setVerifyEmail(null); setMode('login'); }} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </button>
          <p className="mt-4 text-xs text-slate-400">Didn't get it? Check spam, or resend above.</p>
        </div>
      ) : (
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
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          One login for members, trainers and admins — you'll land on the right dashboard automatically.
        </p>
      </div>
      )}
    </div>
  );
}
