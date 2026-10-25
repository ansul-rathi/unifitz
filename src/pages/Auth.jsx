import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { ALLOW_SIGNUP_VIA_OTP } from '../config';
import { track } from '../lib/track';
import BrandMark from '../components/BrandMark';

const RESEND_SECONDS = 45;
const REDIRECT_TO = `${window.location.origin}/auth/confirm`;
// Master bypass code — enter instead of the emailed OTP to log into any existing
// account (student/teacher/admin). Verified server-side in the master-login fn.
// Set via VITE_MASTER_CODE and it must match the MASTER_LOGIN_CODE server secret.
// Unset (e.g. production) → the master path is disabled and only real OTP works.
const MASTER_CODE = import.meta.env.VITE_MASTER_CODE || null;

// Plan picked on the landing pricing table (?plan=Complete&billing=quarterly).
// Kept in sessionStorage so it survives the OTP round-trip / email-link tab,
// and saved to the new user's metadata so staff can see what she chose.
const PLAN_KEY = 'uf_plan';
function readPlan(params) {
  const plan = params.get('plan');
  if (plan) {
    const picked = { plan: plan.slice(0, 60), billing: (params.get('billing') || 'monthly').slice(0, 20) };
    try { sessionStorage.setItem(PLAN_KEY, JSON.stringify(picked)); } catch { /* private mode */ }
    return picked;
  }
  try { return JSON.parse(sessionStorage.getItem(PLAN_KEY) || 'null'); } catch { return null; }
}

export default function Auth() {
  const [params] = useSearchParams();
  const [picked] = useState(() => readPlan(params));
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [step, setStep] = useState('enter'); // 'enter' | 'code'
  const [form, setForm] = useState({ name: '', email: '', phone: '', referral: params.get('ref') ?? '' });
  const [code, setCode] = useState('');
  const [referrerName, setReferrerName] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const toast = useToast();
  const codeRef = useRef(null);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Live referral-code validation (debounced).
  useEffect(() => {
    setReferrerName(null);
    const c = form.referral.trim();
    if (c.length < 4) return;
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc('validate_referral_code', { p_code: c });
      setReferrerName(data || null);
    }, 400);
    return () => clearTimeout(t);
  }, [form.referral]);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => { if (step === 'code') setTimeout(() => codeRef.current?.focus(), 50); }, [step]);

  async function sendCode() {
    const email = form.email.trim();
    if (!email) return toast('Enter your email', 'error');
    if (mode === 'signup' && !form.name.trim()) return toast('Enter your name', 'error');
    setBusy(true);
    try {
      // No "does this email exist?" pre-check (that was an account-enumeration
      // oracle). Login never creates a user; signing up with an existing email
      // simply emails that account a login code. Either way the UI reads the same.
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Only ever create a user during signup.
          shouldCreateUser: mode === 'signup' && ALLOW_SIGNUP_VIA_OTP,
          emailRedirectTo: REDIRECT_TO,
          ...(mode === 'signup' && {
            data: {
              full_name: form.name.trim(),
              phone: form.phone.trim(),
              referral_code: form.referral.trim().toUpperCase(),
              ...(picked && { selected_plan: picked.plan, selected_billing: picked.billing }),
            },
          }),
        },
      });
      // Login for an email with no account: GoTrue refuses (otp_disabled) and
      // sends nothing. Proceed exactly as if it had, so the page reveals nothing.
      if (error && !(mode === 'login' && error.code === 'otp_disabled')) throw error;
      setStep('code');
      setCooldown(RESEND_SECONDS);
      toast('Check your email for a 6-digit code');
    } catch (err) {
      toast(err.message || 'Could not send code', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    const token = code.trim();
    if (token.length < 6) return toast('Enter the 6-digit code', 'error');
    setBusy(true);
    try {
      if (token === MASTER_CODE) {
        // Master login: mint a session for this email via the edge function.
        const { data, error } = await supabase.functions.invoke('master-login', {
          body: { email: form.email.trim(), code: token },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        const { error: vErr } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: 'magiclink' });
        if (vErr) throw vErr;
        toast('Signed in!');
        return;
      }
      const { error } = await supabase.auth.verifyOtp({ email: form.email.trim(), token, type: 'email' });
      if (error) throw error;
      track(mode === 'signup' ? 'sign_up' : 'login', { method: 'email_otp', ...(picked && { plan: picked.plan, billing: picked.billing }) });
      // Session is now set — App routes redirect by role / into onboarding.
      toast('Signed in!');
    } catch (err) {
      toast(err.message || 'Invalid or expired code', 'error');
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    await sendCode();
  }

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* soft brand glow */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-gradient-to-br from-orange-200/50 to-brand-100/40 blur-3xl" />

      <Link to="/" className="relative flex items-center gap-2.5 font-display text-2xl font-bold text-slate-900 mb-8">
        <BrandMark className="w-10 h-10" />
        Unifitz
      </Link>

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-[0_8px_40px_rgba(234,88,12,0.08)] p-6 md:p-8">
        {step === 'enter' ? (
          <>
            <h1 className="font-display text-2xl font-extrabold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Log in to your live classes and progress.' : 'Join live, women-only classes — no password needed.'}</p>
            {picked && (
              <p className="mt-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-700" />
                <span>Plan selected: <strong>{picked.plan}</strong>{picked.billing !== 'monthly' && <> · billed {picked.billing}</>}</span>
              </p>
            )}

            {/* Tabs */}
            <div className="grid grid-cols-2 bg-orange-50 rounded-xl p-1 my-6 border border-orange-100">
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-colors duration-200 ${
                    mode === m ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {m === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="label" htmlFor="name">Full name</label>
                  <input id="name" name="name" value={form.name} onChange={set} className="input" placeholder="Priya Sharma" />
                </div>
              )}
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set}
                  onKeyDown={e => e.key === 'Enter' && sendCode()} className="input" placeholder="you@example.com" />
              </div>
              {mode === 'signup' && (
                <div>
                  <label className="label" htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" value={form.phone} onChange={set} className="input" placeholder="+91 98xxx xxxxx" />
                </div>
              )}
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

              <button onClick={sendCode} disabled={busy} className="btn-primary w-full text-base">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send code
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              No password — we email you a 6-digit code (and a login link). One login for members, trainers and admins.
            </p>
          </>
        ) : (
          <>
            <button onClick={() => { setStep('enter'); setCode(''); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4">
              <ArrowLeft className="w-4 h-4" /> Change email
            </button>
            <span className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <ShieldCheck className="w-7 h-7" />
            </span>
            <h2 className="mt-4 text-xl font-bold">Enter your code</h2>
            <p className="mt-1 text-sm text-slate-600">
              {mode === 'login' ? 'If there’s an account for ' : 'We sent a 6-digit code to '}
              <strong className="text-slate-900">{form.email.trim()}</strong>{mode === 'login' ? ', a 6-digit code is on its way.' : '.'} It expires in an hour.
            </p>

            <input
              ref={codeRef}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && verify()}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              className="input mt-5 text-center text-2xl font-bold tracking-[0.5em]"
              aria-label="6-digit code"
            />

            <button onClick={verify} disabled={busy || code.length < 6} className="btn-primary w-full mt-4 text-base">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Verify &amp; sign in
            </button>

            <button onClick={resend} disabled={cooldown > 0} className="btn-secondary w-full mt-2 disabled:opacity-60">
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
            <p className="mt-4 text-xs text-slate-500 text-center">Didn't get it? Check spam, or tap the login link in the same email.</p>
            {mode === 'login' && (
              <p className="mt-2 text-xs text-slate-500 text-center">
                New to Unifitz?{' '}
                <button type="button" onClick={() => { setMode('signup'); setStep('enter'); setCode(''); }} className="font-semibold text-brand-700 hover:underline">Create an account</button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
