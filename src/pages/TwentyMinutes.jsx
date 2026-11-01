import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CheckCheck, Gift, Timer, Users, MessageSquareText, Sparkles, Sun, Moon } from 'lucide-react';
import { FFW, T, SLOTS } from '../content/twentyMinutes';
import { BUSINESS } from '../config';
import { supabase } from '../lib/supabase';
import { track, captureUtm } from '../lib/track';
import { loadPixel, pixel } from '../lib/metaPixel';
import { FAQ_ITEMS, captureAttribution, countdown, isIST, isSet, localSlot, slotId, tzAbbr, viewerTz } from '../lib/ffw';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import FfwWaitlistForm from '../components/FfwWaitlistForm';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import './landing.css';

// Waitlist page for FFW, the 20-minute daily series — the landing page for
// paid ads. Mobile first: short pointers, then the form, with a sticky CTA bar
// to reach it. On desktop the form sits in a sticky right column instead.
// Prerendered, so anything clock/timezone/live-count based appears after mount.
const ICON = { timer: Timer, users: Users, message: MessageSquareText, sparkles: Sparkles };
const IST = 'Asia/Kolkata';
const PAGE_URL = `${BUSINESS.url}/20minutes-fitness`;

// [h, m] IST → "5:30" (the AM/PM sits on the group label).
const hm = ([h, m]) => `${h % 12 || 12}:${String(m).padStart(2, '0')}`;
const motion = () => (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

// Page-specific head for SPA visits (prerendered HTML already carries these).
const HEAD = [
  ['meta[name="description"]', T.meta.description],
  ['meta[property="og:url"]', PAGE_URL],
  ['meta[property="og:title"]', T.meta.title],
  ['meta[property="og:description"]', T.meta.description],
  ['meta[property="og:image"]', BUSINESS.url + FFW.ogImage],
  ['meta[property="og:image:alt"]', 'FFW — 20-minute live workouts by Unifitz'],
  ['meta[name="twitter:card"]', 'summary_large_image'],
  ['meta[name="twitter:title"]', T.meta.title],
  ['meta[name="twitter:description"]', T.meta.description],
  ['meta[name="twitter:image"]', BUSINESS.url + FFW.ogImage],
];

export default function TwentyMinutes() {
  const [tz, setTz] = useState(IST);
  const [left, setLeft] = useState(null);           // countdown { d, h, m }
  const [live, setLive] = useState(null);           // seats claimed, from the backend
  const [slots, setSlots] = useState([]);
  const [done, setDone] = useState(false);
  const [vis, setVis] = useState({ hero: true, form: false });
  const heroRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const prevTitle = document.title;
    const prev = HEAD.map(([sel]) => document.head.querySelector(sel)?.getAttribute('content'));
    document.title = T.meta.title;
    HEAD.forEach(([sel, v]) => document.head.querySelector(sel)?.setAttribute('content', v));

    captureUtm();
    captureAttribution();
    setTz(viewerTz());
    if (loadPixel(FFW.metaPixelId)) pixel('PageView');
    supabase.rpc('ffw_waitlist_count').then(({ data }) => { if (Number.isInteger(data)) setLive(data); }, () => {});

    const tick = () => setLeft(countdown());
    tick();
    const t = setInterval(tick, 30_000);
    return () => {
      clearInterval(t);
      document.title = prevTitle;
      HEAD.forEach(([sel], i) => { if (prev[i] != null) document.head.querySelector(sel)?.setAttribute('content', prev[i]); });
    };
  }, []);

  // Mobile sticky CTA: visible once the hero is gone, hidden while the form is on screen.
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      setVis(v => {
        const n = { ...v };
        for (const e of entries) n[e.target === heroRef.current ? 'hero' : 'form'] = e.isIntersecting;
        return n;
      });
    });
    if (heroRef.current) io.observe(heroRef.current);
    if (formRef.current) io.observe(formRef.current);
    return () => io.disconnect();
  }, []);
  const showBar = !vis.hero && !vis.form && !done;

  const taken = Math.min(Math.max(live ?? 0, FFW.seatsTakenFallback), FFW.totalSeats);
  const seatsLeft = FFW.totalSeats - taken;
  const local = !isIST(tz);

  const cta = location => track('cta_click', { location, page: '20min' });
  const goToForm = location => e => {
    e?.preventDefault();
    cta(location);
    document.getElementById('waitlist')?.scrollIntoView({ behavior: motion(), block: 'start' });
    setTimeout(() => document.getElementById('ffw-name')?.focus({ preventScroll: true }), 500);
  };
  const goToSlots = () => document.getElementById('ffw-slots')?.scrollIntoView({ behavior: motion(), block: 'start' });
  const onDone = res => {
    setDone(true);
    setLive(n => (res.lead_number ? Math.max(n ?? 0, res.lead_number) : res.duplicate ? n : (n ?? 0) + 1));
  };

  return (
    <div className="uf min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <a href="#main" className="uf-skip">Skip to content</a>
      <header className="sticky top-0 z-40 border-b" style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderColor: 'var(--line)' }}>
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-8 h-14" aria-label="Main">
          <Link to="/" className="uf-serif text-xl font-semibold" style={{ color: 'var(--ink)' }}>Unifitz</Link>
          <Button asChild variant="link" size="inline" className="text-[0.95rem] no-underline hover:underline min-h-[44px]">
            <a href="#waitlist" onClick={goToForm('nav')}>Join waitlist</a>
          </Button>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        <div className="max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1fr_400px] gap-x-16">
          <div className="min-w-0">
            {/* ── Hero ── */}
            {/* Show, don't tell: chip → concept → H1 beside a live 20-min timer, then CTA + seats.
                The details live in "How it works", so the hero carries no paragraph. */}
            <section ref={heroRef} className="pt-6 pb-8 sm:pt-10 sm:pb-10 md:pt-14">
              <div className="flex flex-col items-center text-center gap-7 sm:flex-row sm:items-center sm:justify-between sm:text-left sm:gap-8">
                <div className="min-w-0">
                  <Badge className="gap-2 text-[0.8rem] font-bold px-3.5 py-1.5 bg-white border border-[#F1E4D6] text-slate-700 shadow-sm uf-tabular">
                    <span className="relative flex w-2 h-2" aria-hidden="true">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-brand-500 opacity-60 motion-safe:animate-ping" />
                      <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-700" />
                    </span>
                    {T.hero.chip}{left && left.d > 0 && <span className="font-semibold text-slate-500">· {left.d} {left.d === 1 ? 'day' : 'days'} left</span>}
                  </Badge>
                  <p className="mt-4 text-[1.35rem] sm:text-[1.5rem] font-extrabold leading-tight tracking-tight text-slate-900">{T.hero.concept}</p>
                  <h1 className="mt-1.5" style={{ fontSize: 'clamp(2.6rem, 2rem + 4vw, 4.4rem)' }}>
                    <span style={{ color: 'var(--clay)' }}>{T.hero.h1[0]}</span><br />{T.hero.h1[1]}
                  </h1>
                  {isSet(FFW.founderOffer) && (
                    <Badge tone="brand" className="mt-4 text-[0.8rem] px-3 py-1 bg-brand-100 text-[#9A3412]"><Gift className="w-4 h-4" /> {FFW.founderOffer}</Badge>
                  )}
                </div>
                <LiveTimer />
              </div>

              <div className="mt-7 max-w-sm mx-auto sm:mx-0">
                <Button asChild variant="brand" size="xl" className="w-full lg:hidden mb-4">
                  <a href="#waitlist" onClick={goToForm('hero')}>{T.hero.cta} <ArrowRight className="w-4.5 h-4.5" /></a>
                </Button>
                <p className="text-sm text-slate-600 text-center sm:text-left uf-tabular">
                  {taken > 0
                    ? <><b className="text-slate-900">{taken}/{FFW.totalSeats}</b> founding seats claimed</>
                    : <><b className="text-slate-900">{FFW.totalSeats}</b> founding seats · first come, first served</>}
                </p>
                {taken > 0 && <Progress className="mt-2 h-1.5" value={taken} max={FFW.totalSeats} aria-label="Founding seats claimed" />}
              </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-8" style={{ borderTop: '1px solid var(--line)' }}>
              <h2 className="uf-h3">{T.how.heading}</h2>
              <ul className="mt-5 flex flex-col gap-5">
                {T.how.points.map(p => {
                  const Icon = ICON[p.icon];
                  return (
                    <li key={p.t} className="flex items-start gap-4">
                      <span className="grid place-items-center w-11 h-11 shrink-0 rounded-full" style={{ background: 'var(--clay-tint)', color: 'var(--clay-deep)' }}><Icon className="w-5 h-5" /></span>
                      <div>
                        <p className="font-bold leading-snug">{p.t}</p>
                        <p className="text-[0.95rem] uf-ink-soft leading-snug">{p.d}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <Trainers />
            <FeedbackChat />

            {/* ── Slots: multi-select, sent with the lead ── */}
            <section id="ffw-slots" className="py-8 scroll-mt-16" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="uf-h3">{T.slots.heading}</h2>
                <span className="text-[0.85rem] uf-ink-soft">{T.slots.note}</span>
              </div>
              <p className="mt-2 text-[0.95rem] uf-ink-soft">{T.slots.helper}</p>
              {local && <p className="mt-1 text-[0.85rem] uf-ink-soft">{T.slots.tzLine} ({tzAbbr(tz)})</p>}
              {[['morning', Sun, 'AM'], ['evening', Moon, 'PM']].map(([key, Icon, ap]) => {
                const ids = SLOTS[key].map(slotId);
                return (
                  <div key={key} className="mt-5">
                    <p className="flex items-center gap-2 text-[0.85rem] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--clay)' }}>
                      <Icon className="w-4 h-4" /> {T.slots[key]} · {ap}
                    </p>
                    <ToggleGroup type="multiple" variant="outline" size="lg" aria-label={`${T.slots[key]} times, IST`}
                      className="mt-2.5 grid grid-cols-3 sm:grid-cols-6 gap-2"
                      value={slots.filter(id => ids.includes(id))}
                      onValueChange={v => setSlots(s => [...s.filter(id => !ids.includes(id)), ...v])}>
                      {SLOTS[key].map(s => {
                        const id = slotId(s);
                        const lt = local ? localSlot(s, tz) : null;
                        return (
                          <ToggleGroupItem key={id} value={id}
                            aria-label={`${hm(s)} ${ap} IST${lt ? `, ${lt.time} your time${lt.shift ? (lt.shift < 0 ? ' the day before' : ' the next day') : ''}` : ''}`}
                            className="group/slot flex-col gap-0 px-1 uf-tabular text-base bg-brand-50 border-[#F1E4D6]">
                            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 hidden group-data-[state=on]/slot:block" strokeWidth={3} />{hm(s)}</span>
                            {lt && (
                              <span className="text-[0.7rem] font-semibold leading-tight whitespace-nowrap text-slate-600 group-data-[state=on]/slot:text-white">
                                {lt.time}{lt.shift ? ` (${lt.shift > 0 ? '+' : '−'}1d)` : ''}
                              </span>
                            )}
                          </ToggleGroupItem>
                        );
                      })}
                    </ToggleGroup>
                  </div>
                );
              })}
            </section>
          </div>

          {/* ── Form: after the pointers on mobile, sticky beside them on desktop ── */}
          <aside id="waitlist" ref={formRef} className="scroll-mt-16 pt-8 pb-10 lg:pt-16 border-t lg:border-t-0" style={{ borderColor: 'var(--line)' }}>
            <div className="lg:sticky lg:top-[72px]">
              <h2 className="uf-h3">{T.form.heading}</h2>
              <p className="mt-1 text-[0.95rem] uf-ink-soft">{T.form.sub}</p>
              <FfwWaitlistForm tz={tz} slots={slots} onEditSlots={goToSlots} onDone={onDone} className="mt-4" />
            </div>
          </aside>
        </div>

        <Testimonials />

        {/* ── FAQ ── */}
        <section style={{ background: 'var(--cream-2)', borderTop: '1px solid var(--line)' }}>
          <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
            <h2 className="uf-h3">{T.faq.heading}</h2>
            <Accordion type="multiple" className="mt-5 flex flex-col gap-2">
              {FAQ_ITEMS.map(f => (
                <AccordionItem key={f.q} value={f.q} className="bg-white border border-[#F1E4D6] rounded-xl px-5">
                  <AccordionTrigger className="min-h-[52px] py-3">{f.q}</AccordionTrigger>
                  <AccordionContent className="-mt-1 text-[0.95rem] text-slate-600">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-8 text-[0.8rem] uf-ink-soft">{T.disclaimer}</p>
          </div>
        </section>

        {/* ── Final CTA ── */}
        {!done && (
          <section className="uf-dark">
            <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 text-center">
              <h2 className="uf-h3" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.1rem)' }}>{T.finalCta.heading}</h2>
              <p className="mt-2">{T.finalCta.sub}</p>
              <Button asChild variant="secondary" size="xl" className="mt-6 text-brand-700 border-white">
                <a href="#waitlist" onClick={goToForm('final_band')}>{T.hero.cta} <ArrowRight className="w-4.5 h-4.5" /></a>
              </Button>
            </div>
          </section>
        )}
      </main>

      {showBar && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 px-4 pt-3 flex items-center gap-3"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderTop: '1px solid var(--line)' }}>
          {seatsLeft > 0 && <span className="text-[0.8rem] font-semibold leading-tight uf-ink-soft shrink-0"><b className="uf-tabular" style={{ color: 'var(--ink)' }}>{seatsLeft}</b><br />seats left</span>}
          <Button asChild variant="brand" size="xl" className="flex-1">
            <a href="#waitlist" onClick={goToForm('sticky_mobile')}>Join free waitlist <ArrowRight className="w-4.5 h-4.5" /></a>
          </Button>
        </div>
      )}
      {/* On mobile the floating button would sit on the sticky bar — hide it while the bar shows. */}
      <div className={showBar ? 'max-lg:hidden' : undefined}><FloatingWhatsApp /></div>
    </div>
  );
}

// Hero visual: a "live class" ring counting down 20:00 (sped up), the current
// move, and a form-check bubble per move — the concept at a glance, no copy.
// Decorative (aria-hidden). Static at 20:00 under prefers-reduced-motion / SSR.
const SESSION_S = 1200;
const DEMO_STEP_S = 7;          // demo seconds per real second → one lap ≈ 3 min
const MOVE_S = 35;              // demo seconds per move → a new move every 5 s
const R = 88;
const RING = 2 * Math.PI * R;

function LiveTimer() {
  const [t, setT] = useState(SESSION_S);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setT(x => (x - DEMO_STEP_S <= 0 ? SESSION_S : x - DEMO_STEP_S)), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = SESSION_S - t;
  const [move, cue] = T.hero.moves[Math.floor(elapsed / MOVE_S) % T.hero.moves.length];
  const lap = t === SESSION_S;

  return (
    <div className="relative shrink-0 w-[208px] h-[208px] sm:w-[220px] sm:h-[220px]" aria-hidden="true">
      <div className="absolute inset-3 rounded-full blur-2xl opacity-70" style={{ background: 'radial-gradient(circle, #FFE7D3 0%, rgba(255,231,211,0) 70%)' }} />
      <svg viewBox="0 0 200 200" className="relative w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={R} fill="#fff" stroke="var(--clay-tint)" strokeWidth="10" />
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--clay)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={RING} strokeDashoffset={RING * (elapsed / SESSION_S)}
          style={{ transition: lap ? 'none' : 'stroke-dashoffset 1s linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-red-600">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-red-500" />
          </span>
          Live
        </span>
        <span className="mt-1 uf-serif uf-tabular text-[2.7rem] leading-none text-slate-900">
          {Math.floor(t / 60)}:{String(t % 60).padStart(2, '0')}
        </span>
        <span key={move} className="mt-1.5 text-sm font-semibold text-slate-600 animate-in fade-in slide-in-from-bottom-1 duration-500">{move}</span>
      </div>
      <span key={cue} className="absolute -right-4 top-5 flex items-center gap-1 rounded-full bg-white pl-2 pr-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg border border-slate-100 animate-in fade-in zoom-in-90 slide-in-from-left-2 duration-500">
        <span className="grid place-items-center w-4 h-4 rounded-full bg-emerald-500 text-white"><Check className="w-3 h-3" strokeWidth={3.5} /></span>
        {cue}
      </span>
      <span className="absolute -left-3 bottom-6 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg border border-slate-100">
        <span className="flex -space-x-1.5">
          <span className="w-4 h-4 rounded-full bg-brand-700 ring-2 ring-white" />
          <span className="w-4 h-4 rounded-full bg-amber-400 ring-2 ring-white" />
        </span>
        2 trainers live
      </span>
    </div>
  );
}

// Renders nothing until FFW.trainers is filled in.
function Trainers() {
  const list = FFW.trainers.filter(t => isSet(t.name) && isSet(t.cred));
  if (!list.length) return null;
  return (
    <section className="py-8" style={{ borderTop: '1px solid var(--line)' }}>
      <h2 className="uf-h3">{T.trainers.heading}</h2>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {list.map(t => (
          <Card key={t.name} className="p-4 flex items-center gap-4">
            {isSet(t.img) && <img src={t.img} alt="" width={72} height={72} loading="lazy" decoding="async" className="w-[72px] h-[72px] rounded-full object-cover shrink-0" />}
            <div>
              <p className="font-bold leading-snug">{t.name}</p>
              <p className="text-[0.9rem]" style={{ color: 'var(--clay)' }}>{t.role}</p>
              <p className="text-[0.85rem] uf-ink-soft">{t.cred}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

// A WhatsApp message mock, pure HTML/CSS.
function FeedbackChat() {
  const F = T.feedback;
  return (
    <section className="py-8" style={{ borderTop: '1px solid var(--line)' }}>
      <h2 className="uf-h3">{F.heading}</h2>
      <figure className="mt-5 max-w-md">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }} aria-label="Example WhatsApp message from a form coach" role="img">
          <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: '#075E54', color: '#fff' }}>
            <span className="grid place-items-center w-8 h-8 rounded-full text-[0.85rem] font-bold" style={{ background: '#fff', color: '#075E54' }} aria-hidden="true">U</span>
            <span className="text-[0.9rem] font-semibold">{F.coach}</span>
          </div>
          <div className="p-4" style={{ background: '#EFEAE2' }}>
            <div className="relative max-w-[88%] rounded-xl rounded-tl-none px-3.5 py-2.5 shadow-sm" style={{ background: '#fff', color: '#111B21' }}>
              <p className="text-[0.95rem] leading-snug">{F.message}</p>
              <p className="mt-1 text-right text-[0.7rem] flex items-center justify-end gap-1" style={{ color: '#54656F' }}>
                {F.time} <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53BDEB' }} aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>
        <figcaption className="mt-3 font-bold">{F.caption}</figcaption>
      </figure>
    </section>
  );
}

// Renders nothing until FFW.testimonials is filled in.
function Testimonials() {
  const list = FFW.testimonials.filter(t => isSet(t.name) && isSet(t.quote));
  if (!list.length) return null;
  return (
    <section style={{ borderTop: '1px solid var(--line)' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
        <h2 className="uf-h3">{T.testimonials.heading}</h2>
        <div className="mt-5 grid md:grid-cols-3 gap-4">
          {list.map(t => (
            <Card key={t.name} className="p-5"><figure>
              <blockquote className="text-[0.98rem]">“{t.quote}”</blockquote>
              <figcaption className="mt-3 flex items-center gap-3">
                {isSet(t.img) && <img src={t.img} alt="" width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover" />}
                <span className="text-[0.9rem]"><b>{t.name}</b>{isSet(t.city) && <span className="uf-ink-soft"> · {t.city}</span>}</span>
              </figcaption>
            </figure></Card>
          ))}
        </div>
      </div>
    </section>
  );
}
