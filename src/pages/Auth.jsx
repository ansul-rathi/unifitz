import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Dumbbell, Loader2, CheckCircle2, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { ALLOW_SIGNUP_VIA_OTP } from '../config';

const RESEND_SECONDS = 45;
const REDIRECT_TO = `${window.location.origin}/auth/confirm`;

export default function Auth() {
  const [params] = useSearchParams();
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: ALLOW_SIGNUP_VIA_OTP,
          emailRedirectTo: REDIRECT_TO,
          ...(mode === 'signup' && {
            data: {
              full_name: form.name.trim(),
              phone: form.phone.trim(),
              referral_code: form.referral.trim().toUpperCase(),
            },
          }),
        },
      });
      if (error) throw error;
      setStep('code');
      setCooldown(RESEND_SECONDS);
      toast('Code sent — check your email');
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
      const { error } = await supabase.auth.verifyOtp({ email: form.email.trim(), token, type: 'email' });
      if (error) throw error;
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900 mb-8">
        <Dumbbell className="w-7 h-7 text-brand-500" />
        Uni<span className="text-brand-500">Fitz</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        {step === 'enter' ? (
          <>
            {/* Tabs */}
            <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mb-6">
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-colors duration-200 ${
                    mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
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
              We sent a 6-digit code to <strong className="text-slate-900">{form.email.trim()}</strong>. It expires in an hour.
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
            <p className="mt-4 text-xs text-slate-400 text-center">Didn't get it? Check spam, or tap the login link in the same email.</p>
          </>
        )}
      </div>
    </div>
  );
}
