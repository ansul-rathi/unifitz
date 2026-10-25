import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DIAL_CODES, toE164, waLink } from '../config';
import { track } from '../lib/track';
import WhatsAppIcon from './WhatsAppIcon';

const PHONE_PH = { 1: '(555) 123-4567', 91: '98765 43210', 44: '7700 900123', 971: '50 123 4567', 61: '412 345 678', 65: '8123 4567' };

// Lead capture → public.leads. Shared by the landing masterclass block and the
// 20-minute waitlist page; each passes its own `source`, goals and copy.
//   copy: { cta, consent, consentError, doneTitle, doneBody, dupeBody, waText, footnote }
// Styled with the `.uf` landing tokens, so render it inside `.uf`.
export default function LeadForm({ idPrefix, source, formName, goals, goalLabel = 'What are you working on?', copy, tz, onSuccess, className = '', solid = false }) {
  const [f, setF] = useState({ name: '', cc: '1', phone: '', goal: goals[0], consent: false, company: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);   // null | 'new' | 'dupe'
  const [err, setErr] = useState({ field: null, msg: '' });
  const touchedCc = useRef(false);
  const id = k => `${idPrefix}-${k}`;

  // Default the country code to India for IST visitors (unless they picked one).
  useEffect(() => { if (!touchedCc.current && tz === 'Asia/Kolkata') setF(x => ({ ...x, cc: '91' })); }, [tz]);

  const fail = (field, msg, reason) => { setErr({ field, msg }); track('form_error', { form: formName, field, reason }); };

  async function submit(e) {
    e.preventDefault();
    setErr({ field: null, msg: '' });
    if (f.company) { setDone('new'); return; }   // honeypot: bots fill hidden fields
    const name = f.name.trim();
    if (name.length < 2 || name.length > 80) return fail('name', 'Please enter your name.', 'length');
    const e164 = toE164(f.cc, f.phone);
    if (!e164) return fail('phone', 'Please enter a valid phone number for the country selected.', 'format');
    if (!f.consent) return fail('consent', copy.consentError, 'consent');
    setBusy(true);
    let utm = {};
    try { utm = JSON.parse(sessionStorage.getItem('uf_utm') || '{}'); } catch { utm = {}; }
    const { error } = await supabase.from('leads').insert({
      name, whatsapp: e164, goal: f.goal, consent: true,
      source: `${source}${utm.utm_source ? ':' + utm.utm_source : ''}`,
    });
    setBusy(false);
    if (error) {
      if (error.code === '23505') { setDone('dupe'); return; }      // unique (phone) — already signed up
      if (error.code === '23514') return fail('phone', 'Please check your name and phone number.', 'db_check');
      return fail(null, 'Something went wrong on our side. Please try again, or message us on WhatsApp.', 'db_error');
    }
    onSuccess?.();
    track('generate_lead', { form: formName, goal: f.goal, country_code: f.cc, utm_source: utm.utm_source });
    setDone('new');
  }

  if (done) return (
    <div className={`uf-card p-7 text-center ${className}`} role="status">
      <Check className="w-9 h-9 mx-auto" style={{ color: 'var(--go)' }} />
      <p className="mt-3 uf-serif" style={{ fontSize: '1.25rem' }}>{copy.doneTitle}</p>
      <p className="mt-1 uf-ink-soft text-[0.95rem]">{done === 'dupe' ? copy.dupeBody : copy.doneBody}</p>
      <a href={waLink(copy.waText)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click', { location: `${formName}_done` })} className="uf-btn uf-btn--ghost mt-4"><WhatsAppIcon className="w-5 h-5 text-[#25D366]" /> Message us</a>
    </div>
  );

  const errFor = field => (err.field === field ? { 'aria-invalid': true, 'aria-describedby': id('err') } : {});
  return (
    <form onSubmit={submit} noValidate className={`uf-card p-6 flex flex-col gap-4 ${className}`}>
      <div>
        <label htmlFor={id('name')} className="uf-label">Your name</label>
        <input id={id('name')} required maxLength={80} className="uf-input" placeholder="e.g. Ananya" value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} autoComplete="name" {...errFor('name')} />
      </div>
      <div>
        <label htmlFor={id('phone')} className="uf-label">WhatsApp number</label>
        <div className="flex gap-2">
          <select aria-label="Country code" className="uf-input !w-auto shrink-0 !px-3" value={f.cc}
            onChange={e => { touchedCc.current = true; setF(x => ({ ...x, cc: e.target.value })); }} autoComplete="tel-country-code">
            {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
          </select>
          <input id={id('phone')} required type="tel" inputMode="tel" maxLength={20} className="uf-input min-w-0" placeholder={PHONE_PH[f.cc]} value={f.phone}
            onChange={e => setF(x => ({ ...x, phone: e.target.value }))} autoComplete="tel-national" {...errFor('phone')} />
        </div>
      </div>
      <div>
        <label htmlFor={id('goal')} className="uf-label">{goalLabel}</label>
        <select id={id('goal')} className="uf-input" value={f.goal} onChange={e => setF(x => ({ ...x, goal: e.target.value }))}>
          {goals.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      {/* honeypot — invisible to people, irresistible to bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor={id('company')}>Company</label>
        <input id={id('company')} tabIndex={-1} autoComplete="off" value={f.company} onChange={e => setF(x => ({ ...x, company: e.target.value }))} />
      </div>
      <label className="flex items-start gap-2.5 text-[0.85rem] uf-ink-soft cursor-pointer">
        <input type="checkbox" required checked={f.consent} onChange={e => setF(x => ({ ...x, consent: e.target.checked }))} className="mt-1 w-4 h-4 shrink-0" style={{ accentColor: 'var(--go)' }} {...errFor('consent')} />
        <span>{copy.consent} See our <Link to="/privacy" className="underline underline-offset-2">privacy policy</Link>.</span>
      </label>
      {err.msg && <p id={id('err')} className="text-[0.9rem]" style={{ color: '#B23B3B' }} role="alert">{err.msg}</p>}
      <button type="submit" disabled={busy} className={`uf-btn uf-btn--full ${solid ? 'uf-btn--solid' : 'uf-btn--primary'}`}>
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} {copy.cta}
      </button>
      <p className="text-center text-[0.8rem] uf-ink-soft">{copy.footnote ?? 'No card required'}</p>
    </form>
  );
}
