import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Loader2, MailWarning } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Landing page for email confirmation / magic links.
// Exchanges the link token for a session, then hands off to the role/onboarding
// routing in App. Shows a clean expired-link state on failure.
export default function AuthConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState('working'); // 'working' | 'error'

  useEffect(() => {
    let done = false;
    const finish = () => { if (!done) { done = true; navigate('/', { replace: true }); } };

    (async () => {
      const token_hash = params.get('token_hash');
      const type = params.get('type');

      // Token-hash style link (PKCE / OTP email) — verify explicitly.
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (error) return setState('error');
        return finish();
      }

      // Hash-fragment style link — detectSessionInUrl resolves it asynchronously.
      const { data } = await supabase.auth.getSession();
      if (data.session) return finish();

      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session) finish();
      });
      // Fallback if nothing arrives.
      setTimeout(async () => {
        const { data: again } = await supabase.auth.getSession();
        if (again.session) finish();
        else setState('error');
        sub?.subscription?.unsubscribe?.();
      }, 2500);
    })();
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900 mb-8">
        <Dumbbell className="w-7 h-7 text-brand-500" /> Uni<span className="text-brand-500">Fitz</span>
      </Link>

      {state === 'working' ? (
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
          <p className="mt-3 text-sm font-semibold">Signing you in…</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 text-center">
          <span className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mx-auto">
            <MailWarning className="w-7 h-7" />
          </span>
          <h2 className="mt-4 text-xl font-bold">Link expired or already used</h2>
          <p className="mt-2 text-sm text-slate-600">For your security, login links work once and expire after an hour. Request a fresh code to sign in.</p>
          <Link to="/auth" className="btn-primary w-full mt-6">Get a new code</Link>
        </div>
      )}
    </div>
  );
}
