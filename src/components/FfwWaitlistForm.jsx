import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BatteryCharging, Check, Dumbbell, Loader2, PersonStanding, Repeat, Scale, Sparkles, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { waLink } from '../config';
import { track } from '../lib/track';
import { pixel } from '../lib/metaPixel';
import { COUNTRIES, captureAttribution, ccForTz, formatPhone, isSet, phoneError, toPhone, uuid, waitlistMessage } from '../lib/ffw';
import { FFW, T } from '../content/twentyMinutes';
import { cn } from '../lib/cn';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import WhatsAppIcon from './WhatsAppIcon';

// FFW waitlist form for /20minutes-fitness (the shared LeadForm stays as-is for
// the landing page). Saves via the join_ffw_waitlist RPC — dedupe by phone +
// founding-seat number — and falls back to a plain leads insert if the
// migration hasn't been run yet. Render inside `.uf`.
const C = T.form;
const ID = { name: 'ffw-name', phone: 'ffw-phone', goal: 'ffw-goal' };
const ORDER = ['name', 'phone', 'goal'];
const GOAL_ICON = {
  'Build a daily habit': Repeat, 'Lose weight': Scale, 'Get stronger': Dumbbell,
  'Fix posture & back pain': PersonStanding, 'More energy': BatteryCharging, 'Just curious': Sparkles,
};

const check = {
  name: f => { const n = f.name.trim(); return n.length < 2 ? 'Please enter your name.' : n.length > 80 ? 'Please use a shorter name.' : ''; },
  phone: f => (toPhone(f.cc, f.phone) ? '' : phoneError(f.cc)),
  goal: f => (f.goal ? '' : 'Please pick your main goal.'),
};

export default function FfwWaitlistForm({ tz, slots, onEditSlots, onDone, className = '' }) {
  const [f, setF] = useState({ name: '', cc: '91', phone: '', goal: '', company: '' });
  const [errs, setErrs] = useState({});
  const [status, setStatus] = useState('idle');      // idle | busy | whatsapp (save failed → handed to WhatsApp)
  const [waUrl, setWaUrl] = useState('');
  const [done, setDone] = useState(null);            // { name, lead_id, lead_number, duplicate }
  const touchedCc = useRef(false);

  useEffect(() => { if (!touchedCc.current) setF(x => ({ ...x, cc: ccForTz(tz) })); }, [tz]);

  const fRef = useRef(f);
  fRef.current = f;

  const setVal = (k, v) => {
    setF(x => ({ ...x, [k]: v }));
    if (errs[k]) setErrs(x => ({ ...x, [k]: check[k]({ ...f, [k]: v }) }));   // clear as they fix it
  };
  const set = k => e => setVal(k, e.target.value);
  const blur = k => () => setErrs(x => ({ ...x, [k]: check[k](f) }));
  const setCc = v => {
    touchedCc.current = true;
    const phone = formatPhone(v, f.phone);          // re-group (and cap) for the new country
    setF(x => ({ ...x, cc: v, phone }));
    if (errs.phone) setErrs(x => ({ ...x, phone: check.phone({ ...f, cc: v, phone }) }));
  };
  // Select has no real blur (focus moves into the list); validate when it closes, after the pick has rendered.
  const closedGoal = open => { if (!open) setTimeout(() => setErrs(x => ({ ...x, goal: check.goal(fRef.current) })), 0); };

  async function submit(e) {
    e.preventDefault();
    if (status === 'busy') return;
    if (f.company) { setDone({ name: f.name.trim(), duplicate: false }); return; }   // honeypot: drop silently
    const next = Object.fromEntries(ORDER.map(k => [k, check[k](f)]));
    setErrs(next);
    const bad = ORDER.find(k => next[k]);
    if (bad) {
      const el = document.getElementById(ID[bad]);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      track('form_error', { form: 'ffw_waitlist', field: bad });
      return;
    }

    setStatus('busy');
    const name = f.name.trim();
    const phone = toPhone(f.cc, f.phone);
    const eventId = uuid();
    const a = captureAttribution();
    const payload = {
      name, phone, phone_country: f.cc, goal: f.goal, preferred_slots: slots,
      consent: true, consent_text: FFW.consentVersion, consent_wording: C.consent,
      utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign, utm_content: a.utm_content, utm_term: a.utm_term,
      fbclid: a.fbclid, gclid: a.gclid, src: a.src, referred_by: a.ref,
      landing_url: a.landing_url, referrer: a.referrer, user_timezone: tz, event_id: eventId,
    };

    // 1) RPC (dedupe + seat number). 2) Any RPC failure → plain insert with the columns every leads table
    //    has (no consent_version: it only exists after migration_leads_hardening.sql). 3) Both fail → WhatsApp.
    let res = null;
    let reason = 'db_error';
    try {
      const { data, error } = await supabase.rpc('join_ffw_waitlist', { p: payload });
      if (!error && data) res = data;
      else {
        reason = error?.code || reason;
        const r = await supabase.from('leads').insert({
          name, whatsapp: phone, goal: f.goal, consent: true,
          source: `20min-waitlist${a.utm_source ? ':' + a.utm_source.slice(0, 60) : ''}`,
        });
        if (!r.error) res = { lead_id: null, lead_number: null, duplicate: false };
        else if (r.error.code === '23505') res = { lead_id: null, lead_number: null, duplicate: true };
        else reason = r.error.code || reason;
      }
    } catch { reason = 'network'; }

    if (!res) {
      // Never lose the lead: hand the full details to WhatsApp, pre-formatted.
      const url = waLink(waitlistMessage({ name, phone, goal: f.goal, slots, tz, attribution: a }));
      setWaUrl(url);
      setStatus('whatsapp');
      pixel('Contact', { content_name: 'FFW Waitlist' }, eventId);
      track('lead_whatsapp_fallback', { form: 'ffw_waitlist', reason });
      setTimeout(() => window.location.assign(url), 1200);
      return;
    }

    if (!res.duplicate) {
      const ev = { content_name: 'FFW Waitlist', value: 0, currency: 'INR' };
      pixel('Lead', ev, eventId);
      track('generate_lead', { form: 'ffw_waitlist', goal: f.goal, country_code: f.cc, slots: slots.length, utm_source: a.utm_source, event_id: eventId });
    } else {
      track('waitlist_duplicate', { form: 'ffw_waitlist' });
    }
    const result = { ...res, name };
    setDone(result);
    setStatus('idle');
    onDone?.(result);
  }

  if (done) return <Success {...done} className={className} />;

  const country = COUNTRIES.find(c => c.code === f.cc);
  const aria = k => (errs[k] ? { 'aria-invalid': true, 'aria-describedby': `${ID[k]}-err` } : {});
  const err = k => (
    <p id={`${ID[k]}-err`} aria-live="polite" className="text-sm mt-1 text-red-700">{errs[k] || ''}</p>
  );

  return (
    <Card className={cn('p-6', className)}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div>
          <Label htmlFor={ID.name}>Your name</Label>
          <Input id={ID.name} maxLength={80} className="h-12" placeholder="e.g. Ananya" value={f.name}
            onChange={set('name')} onBlur={blur('name')} autoComplete="given-name" {...aria('name')} />
          {err('name')}
        </div>

        <div>
          <Label htmlFor={ID.phone}>WhatsApp number</Label>
          <div className="flex gap-2">
            <Select value={f.cc} onValueChange={setCc} name="country-code">
              <SelectTrigger aria-label={`Country code, ${country?.name} +${f.cc}`} className="h-12 w-auto shrink-0 pl-3 pr-2.5 gap-1.5 uf-tabular">
                <SelectValue>
                  <span className="text-lg leading-none" aria-hidden="true">{country?.flag}</span> +{f.cc}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" className="w-auto min-w-[16rem]">
                <SelectGroup>
                  <SelectLabel>Country code</SelectLabel>
                  {COUNTRIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="text-lg leading-none" aria-hidden="true">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                      <span className="ml-auto pl-3 text-slate-500 font-normal uf-tabular">+{c.code}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* No maxLength: it would cut a pasted "+91 98765 43210" before formatPhone can strip the +91. */}
            <Input id={ID.phone} type="tel" inputMode="tel" className="h-12 min-w-0 uf-tabular" placeholder={country?.ph}
              value={f.phone} onChange={e => setVal('phone', formatPhone(f.cc, e.target.value))} onBlur={blur('phone')}
              autoComplete="tel-national" {...aria('phone')} />
          </div>
          {err('phone')}
        </div>

        <div>
          <Label htmlFor={ID.goal}>{C.goalLabel}</Label>
          <Select value={f.goal} onValueChange={v => setVal('goal', v)} onOpenChange={closedGoal} name="goal">
            <SelectTrigger id={ID.goal} className="h-12" {...aria('goal')}>
              <SelectValue placeholder={C.goalPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {C.goals.map(g => {
                const Icon = GOAL_ICON[g] ?? Sparkles;
                return (
                  <SelectItem key={g} value={g}>
                    <Icon className="w-4 h-4 shrink-0 text-brand-700" aria-hidden="true" /> {g}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {err('goal')}
        </div>

        <p className="text-sm text-slate-600">
          {slots.length
            ? <><b className="text-slate-900">{slots.length} {slots.length === 1 ? 'time' : 'times'} selected</b> · </>
            : 'Preferred time (optional) · '}
          <Button type="button" variant="link" size="inline" onClick={onEditSlots} className="min-h-[44px] align-middle">{slots.length ? 'change' : 'pick'}</Button>
        </p>

        {/* honeypot — invisible to people, irresistible to bots */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor="ffw-company">Company</label>
          <input id="ffw-company" tabIndex={-1} autoComplete="off" value={f.company} onChange={set('company')} />
        </div>

        <Button type="submit" variant="brand" size="xl" className="w-full" disabled={status === 'busy'} aria-busy={status === 'busy'}>
          {status === 'busy' ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</> : C.cta}
        </Button>
        <div aria-live="polite" className={status === 'whatsapp' ? 'rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-900 -mt-1' : 'sr-only'}>
          {status === 'whatsapp' && <>
            <p className="font-semibold">{C.waFallback.title}</p>
            <p className="mt-0.5">{C.waFallback.body}</p>
            <Button asChild variant="secondary" size="xl" className="w-full mt-3 border-emerald-300">
              <a href={waUrl}><WhatsAppIcon className="w-5 h-5 text-[#25D366]" /> {C.waFallback.cta}</a>
            </Button>
          </>}
        </div>

        <p className="text-xs text-slate-600 leading-snug -mt-1">
          {C.consent}{' '}
          <Button asChild variant="link" size="inline" className="text-xs text-slate-600 font-normal"><Link to="/privacy">Privacy policy</Link></Button>
        </p>
        <p className="text-center text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> {C.proof(FFW.socialProof)}
        </p>
      </form>
    </Card>
  );
}

// Primary next step: the community group once its link is set, else a chat with us.
function CommunityButton({ location, className }) {
  const community = isSet(FFW.whatsappCommunityUrl);
  return (
    <Button asChild variant="brand" size="xl" className={cn('w-full', className)}>
      <a href={community ? FFW.whatsappCommunityUrl : waLink(C.waText)} target="_blank" rel="noopener noreferrer"
        onClick={() => track('whatsapp_click', { location: community ? `${location}_group` : location })}>
        <WhatsAppIcon className="w-5 h-5" /> {community ? C.thanks.community : 'Message us on WhatsApp'}
      </a>
    </Button>
  );
}

// After signup: a party-popper blast + a short note with one action (join the
// community). The pop-up opens once; a compact card stays in the form's place.
function Success({ name, duplicate, className }) {
  const [open, setOpen] = useState(true);
  const first = name.split(/\s+/)[0];
  const title = duplicate ? C.thanks.dupeTitle(first) : C.thanks.title(first);

  return (
    <>
      <Card className={cn('p-6 text-center', className)} role="status" aria-live="polite">
        <span className="mx-auto grid place-items-center w-12 h-12 rounded-full bg-emerald-50"><Check className="w-6 h-6 text-emerald-600" strokeWidth={3} /></span>
        <p className="mt-3 uf-serif" style={{ fontSize: '1.35rem' }}>{title}</p>
        <p className="mt-1 text-slate-600 text-[0.95rem]">{C.thanks.line}</p>
        <CommunityButton location="ffw_done_card" className="mt-5" />
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        {open && !duplicate && <Blast />}
        <DialogContent className="text-center px-6 pt-10 pb-8" tabIndex={-1}
          onOpenAutoFocus={e => { e.preventDefault(); e.currentTarget.focus(); }}>
          <span className="block text-[4.5rem] leading-none motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:spin-in-12 duration-700" aria-hidden="true">
            {duplicate ? '👋' : '🎉'}
          </span>
          <DialogTitle className="mt-5 uf-serif font-medium text-[2rem] leading-tight">{title}</DialogTitle>
          <DialogDescription className="mt-2.5 text-[1.05rem] leading-relaxed">{C.thanks.line}</DialogDescription>
          <CommunityButton location="ffw_thanks" className="mt-7" />
          {isSet(FFW.whatsappCommunityUrl) && <p className="mt-2.5 text-xs text-slate-500">{C.thanks.communityNote}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Party-popper blast ── a burst from the middle + two poppers firing up from
// the bottom corners. Each piece flies out (outer span) while gravity pulls it
// down (inner span); keyframes ffw-burst-out / ffw-burst-fall in landing.css.
// Deterministic "random" so it's identical every time and SSR-safe.
const BLAST_COLORS = ['#C2410C', '#F59E0B', '#10B981', '#FB923C', '#FDBA74', '#0EA5E9', '#EC4899', '#FACC15'];
const rnd = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
const spray = (count, seed, [a0, a1], [d0, d1], lift = 0) => Array.from({ length: count }, (_, i) => {
  const k = seed + i;
  const angle = ((a0 + (a1 - a0) * rnd(k)) * Math.PI) / 180;
  const dist = d0 + (d1 - d0) * rnd(k + 0.5);
  const shape = i % 3;
  return {
    x: `${(Math.cos(angle) * dist).toFixed(1)}vmin`,
    y: `${(Math.sin(angle) * dist - lift).toFixed(1)}vmin`,
    r: `${Math.round(360 + 720 * rnd(k + 0.25))}deg`,
    w: shape === 0 ? 9 : shape === 1 ? 7 : 12,
    h: shape === 0 ? 9 : shape === 1 ? 14 : 6,
    round: shape === 0 ? '50%' : '2px',
    color: BLAST_COLORS[i % BLAST_COLORS.length],
    delay: `${(rnd(k + 0.75) * 0.15).toFixed(2)}s`,
  };
});
const BURSTS = [
  { left: '50%', top: '40%', pieces: spray(90, 1, [0, 360], [20, 52], 10) },
  { left: '0%', top: '100%', pieces: spray(45, 200, [-80, -35], [55, 115]) },
  { left: '100%', top: '100%', pieces: spray(45, 400, [-145, -100], [55, 115]) },
];

function Blast() {
  return (
    <div className="fixed inset-0 z-[71] pointer-events-none overflow-hidden motion-reduce:hidden" aria-hidden="true">
      {BURSTS.map((b, bi) => (
        <div key={bi} className="absolute" style={{ left: b.left, top: b.top }}>
          {b.pieces.map((p, i) => (
            <span key={i} className="absolute ffw-burst-out" style={{ '--x': p.x, '--y': p.y, animationDelay: p.delay }}>
              <span className="block ffw-burst-fall" style={{ '--r': p.r, width: p.w, height: p.h, borderRadius: p.round, background: p.color, animationDelay: p.delay }} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
