import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import {
  Dumbbell, Brain, Sparkles, Eye, HeartHandshake, Clock, CheckCircle2, Loader2, ArrowRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Public, no-auth signup page for the free 5:00–5:30 AM IST mindfulness session.
// One screen on mobile: short pitch, then name + phone + occupation. On success a
// thank-you dialog confirms the number, then hands the visitor to the landing page.

const OCCUPATIONS = ['Student', 'Working professional', 'Housewife', 'Business', 'Other'];

const PILLARS = [
  { icon: Brain, label: 'Meditation' },
  { icon: Sparkles, label: 'Affirmation' },
  { icon: Eye, label: 'Visualization' },
  { icon: HeartHandshake, label: 'Gratitude' },
];

export default function MorningSession() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', phone: '', occupation: '', occupationOther: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null); // { name, phone } once submitted

  useEffect(() => {
    document.title = 'Free Morning Session · 5:00 AM IST — Unifitz';
  }, []);

  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    // Same rule as the landing page lead form, so both sources stay consistent.
    const digits = f.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) return setErr('Enter a valid phone number');
    if (f.occupation === 'Other' && !f.occupationOther.trim()) return setErr('Please tell us what you do');

    setBusy(true);
    const name = f.name.trim();
    const phone = f.phone.trim();
    const { error } = await supabase.from('leads').insert({
      name,
      whatsapp: phone,
      occupation: f.occupation,
      occupation_other: f.occupation === 'Other' ? f.occupationOther.trim() : null,
      goal: 'Free morning session',
      consent: true,
      source: 'morning-session',
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setDone({ name, phone });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Warm sunrise wash behind the fold */}
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-amber-50 via-orange-50 to-slate-50" aria-hidden="true" />

      <main className="relative mx-auto w-full max-w-lg px-5 py-8 sm:py-12">
        <div className="flex items-center gap-2 font-display font-extrabold text-lg text-slate-900">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-brand-600 text-white">
            <Dumbbell className="w-4.5 h-4.5" />
          </span>
          Unifitz
        </div>

        <span className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white">
          <Clock className="w-3.5 h-3.5" /> Free · Daily · 5:00 – 5:30 AM IST
        </span>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold uppercase leading-[1.1]">
          Start your day <span className="text-brand-500">calm</span>, clear and grateful
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Thirty guided minutes, every morning, open to everyone. Train your mind to stay calm and
          happier — and watch your focus sharpen, one morning at a time.
        </p>

        <ul className="mt-5 grid grid-cols-2 gap-2.5">
          {PILLARS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
              <Icon className="w-4 h-4 shrink-0 text-brand-500" /> {label}
            </li>
          ))}
        </ul>

        <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
          <p className="text-center font-bold text-slate-900">Reserve your free seat</p>

          <div>
            <label htmlFor="ms-name" className="label">Your name</label>
            <input
              id="ms-name" required placeholder="e.g. Ananya" className="input" autoComplete="name"
              value={f.name} onChange={e => set('name', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="ms-phone" className="label">Phone number</label>
            <input
              id="ms-phone" required type="tel" inputMode="numeric" placeholder="98765 43210"
              className="input" autoComplete="tel"
              value={f.phone} onChange={e => set('phone', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="ms-occupation" className="label">I am a…</label>
            <select
              id="ms-occupation" required className="input"
              value={f.occupation} onChange={e => set('occupation', e.target.value)}
            >
              <option value="" disabled>Select one</option>
              {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {f.occupation === 'Other' && (
            <div>
              <label htmlFor="ms-occupation-other" className="label">What do you do?</label>
              <input
                id="ms-occupation-other" required placeholder="Tell us in a few words" className="input"
                value={f.occupationOther} onChange={e => set('occupationOther', e.target.value)}
              />
            </div>
          )}

          {err && <p className="text-sm text-red-600" role="alert">{err}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3.5">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Reserve my free seat
          </button>
          <p className="text-center text-xs leading-relaxed text-slate-400">
            By reserving, you agree to receive session details on this number. No card required.
          </p>
        </form>
      </main>

      <ThankYouDialog signup={done} onClose={() => navigate('/landing')} />
    </div>
  );
}

function ThankYouDialog({ signup, onClose }) {
  // Deliberately not dismissible by backdrop or Esc — the button is the redirect.
  return (
    <Dialog open={!!signup} onClose={() => {}} className="relative z-[80]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0" />
      <div className="fixed inset-0 flex items-end justify-center p-0 md:items-center md:p-6">
        <DialogPanel transition className="w-full max-w-md rounded-t-2xl bg-white p-6 text-center shadow-2xl transition duration-200 md:rounded-2xl data-[closed]:translate-y-8 data-[closed]:opacity-0">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="mt-3 font-display text-xl font-extrabold">
            Thank you{signup?.name ? `, ${signup.name.split(' ')[0]}` : ''}! 🎉
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            You’re in for the 5:00 AM session. Our team will reach you shortly on{' '}
            <span className="font-bold text-slate-900">{signup?.phone}</span> with the joining link.
          </p>
          <button onClick={onClose} className="btn-primary mt-5 w-full py-3.5">
            Okay <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-2 text-xs text-slate-400">Next: explore everything else Unifitz offers.</p>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
