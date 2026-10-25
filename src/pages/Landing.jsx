import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import {
  Menu, X, Music, Flower2, Dumbbell, Brain, ArrowRight, ArrowUpRight, Check,
  Radio, Clock, Camera, ChevronDown, Loader2, Quote, CalendarClock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BUSINESS, DIAL_CODES, toE164, waLink } from '../config';
import { L } from '../content/landing';
import { track, captureUtm } from '../lib/track';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import SiteFooter from '../components/SiteFooter';
import './landing.css';

const PRIMARY = 'Choose your plan';        // repeated verbatim ≥4×
const MARKET = 'US';
const CURRENCY = 'USD';
// Dev-only placeholders for unfilled content. `import.meta.env.DEV` is a
// build-time constant, so every `DEV &&` branch is stripped from production.
const DEV = import.meta.env.DEV;
const FORMAT_ICON = { Zumba: Music, Yoga: Flower2, Strength: Dumbbell, Meditation: Brain };
const GOALS = ['Lose weight', 'Get stronger', 'PCOS / PCOD support', 'Post-40 strength', 'Postpartum return', 'Just exploring'];
const PHONE_PH = { 1: '(555) 123-4567', 91: '98765 43210', 44: '7700 900123', 971: '50 123 4567', 61: '412 345 678', 65: '8123 4567' };

// warm-editorial reveal: fade + 8px rise, 200ms (reduced-motion via MotionConfig).
const rise = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

// What actually ships. Blocks with nothing real to show hide themselves.
const INSTRUCTORS = L.instructors.items.filter(i => i.name);
const GALLERY = L.gallery.photos.filter(p => p.img);
const SHOW_INSTRUCTORS = DEV || INSTRUCTORS.length > 0;
const SHOW_GALLERY = DEV || GALLERY.length > 0;
const NAV_LINKS = L.nav.links.filter(l => l.href !== '#instructors' || SHOW_INSTRUCTORS);

// Real image when `src` is set; on a load failure it falls back to the plain
// tinted slot. The "Add photo" hint only ever renders in dev.
function PhotoInner({ src, alt, caption, hint, priority }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img src={src} alt={alt || ''} onError={() => setFailed(true)} className="w-full h-full object-cover"
        decoding="async" loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : undefined} />
    );
  }
  if (!DEV) return null;
  return (
    <div className="p-5 text-center">
      <Camera className="w-8 h-8 mx-auto" style={{ color: 'var(--ink-faint)' }} />
      <p className="mt-2 text-[0.8rem] font-semibold" style={{ color: 'var(--ink-faint)' }}>Add photo (dev only)</p>
      {caption && <p className="mt-1.5 text-[0.9rem] uf-ink-soft">{caption}</p>}
      {hint && <p className="mt-1 text-[0.8rem]" style={{ color: 'var(--ink-faint)' }}>{hint}</p>}
    </div>
  );
}

// ── timezone conversion: canonical UTC schedule → viewer's local zone ──
// The page is prerendered at build time, so the first render (server + the
// hydrating client render) must not depend on the clock or the device zone.
// It uses a fixed reference week + Eastern; real values swap in after mount.
const REF_NOW = Date.UTC(2026, 0, 4, 0, 0);   // Sun 4 Jan 2026 00:00 UTC
const DEFAULT_TZ = 'America/New_York';

function nextOccurrence(day, utcHHMM, nowMs) {
  const [h, m] = utcHHMM.split(':').map(Number);
  const now = new Date(nowMs);
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m));
  let delta = (day - d.getUTCDay() + 7) % 7;
  if (delta === 0 && d.getTime() < nowMs) delta = 7;
  d.setUTCDate(d.getUTCDate() + delta);
  return d;
}
// Selectable timezones — US first, then the larger NRI hubs, plus IST.
const ZONES = [
  { label: 'Pacific · California (PT)', tz: 'America/Los_Angeles' },
  { label: 'Mountain (MT)', tz: 'America/Denver' },
  { label: 'Central (CT)', tz: 'America/Chicago' },
  { label: 'Eastern (ET)', tz: 'America/New_York' },
  { label: 'Canada · Toronto (ET)', tz: 'America/Toronto' },
  { label: 'UK (GMT/BST)', tz: 'Europe/London' },
  { label: 'UAE (GST)', tz: 'Asia/Dubai' },
  { label: 'Singapore (SGT)', tz: 'Asia/Singapore' },
  { label: 'Australia · Sydney (AET)', tz: 'Australia/Sydney' },
  { label: 'India (IST)', tz: 'Asia/Kolkata' },
];
function buildRows(tz, nowMs) {
  return L.timetable.schedule.map(c => {
    const when = nextOccurrence(c.day, c.utc, nowMs);
    return {
      ...c, when,
      dayLabel: new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(when),
      timeLabel: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(when),
    };
  }).sort((a, b) => a.when - b.when);
}
function tzAbbr(tz, nowMs) {
  return (new Intl.DateTimeFormat('en-US', { timeZoneName: 'short', timeZone: tz })
    .formatToParts(new Date(nowMs)).find(p => p.type === 'timeZoneName') || {}).value || '';
}
// Detected zone if we offer it, else default to Eastern (US).
function detectZone() {
  const d = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return ZONES.some(z => z.tz === d) ? d : DEFAULT_TZ;
}

export default function Landing() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [tz, setTz] = useState(DEFAULT_TZ);
  const [now, setNow] = useState(null);       // null until mounted (see REF_NOW)
  const menuBtn = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    document.title = 'Live Online Fitness Classes for Women | Unifitz';
    captureUtm();
    const detected = detectZone();
    setTz(detected);
    setNow(Date.now());
    track('timezone_detected', { tz: detected });
    // Proof data is below the fold — fetch once the browser is idle so it never
    // competes with first paint.
    const idle = window.requestIdleCallback || (cb => setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => {
      supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setTestimonials(data ?? []));
      supabase.from('reviews').select('name, rating, text, created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(9).then(({ data }) => setReviews(data ?? []));
    });
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => { cancel(id); clearInterval(tick); };
  }, []);

  // scroll: condense nav + fire 50/90 depth once.
  useEffect(() => {
    const hit = { 50: false, 90: false };
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const p = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      for (const d of [50, 90]) if (!hit[d] && p >= d) { hit[d] = true; track('scroll', { percent_scrolled: d }); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: focus first link on open; Esc / outside click closes and
  // returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('a')?.focus();
    const close = (refocus) => { setOpen(false); if (refocus) menuBtn.current?.focus(); };
    const onKey = e => { if (e.key === 'Escape') close(true); };
    const onDown = e => { if (!menuRef.current?.contains(e.target) && !menuBtn.current?.contains(e.target)) close(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [open]);

  const nowMs = now ?? REF_NOW;
  const rows = useMemo(() => buildRows(tz, nowMs), [tz, nowMs]);
  const next = now ? rows[0] : null;   // rows are sorted by next occurrence
  const proof = testimonials.length ? testimonials.map(t => ({ quote: t.quote, name: t.name, city: t.location, result: t.result }))
    : reviews.length ? reviews.map(r => ({ quote: r.text, name: r.name, city: '', result: '' }))
    : DEV ? [1, 2, 3].map(() => ({ quote: 'Placeholder (dev only) — a real member’s words with a specific change.', name: 'Member name', city: 'City' }))
    : [];

  const clickCta = (location, extra = {}) => track('cta_click', { location, market: MARKET, ...extra });
  const blur = scrolled ? 'blur(8px)' : 'none';

  return (
    <MotionConfig reducedMotion="user">
      <div className="uf min-h-screen">
        <a href="#main" className="uf-skip">Skip to content</a>
        {/* ── Nav ── */}
        <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'border-b' : ''}`}
          style={{ background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: blur, WebkitBackdropFilter: blur, borderColor: 'var(--line)' }}>
          <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-8 h-16" aria-label="Main">
            <a href="#top" className="uf-serif text-2xl font-semibold py-2" style={{ color: 'var(--ink)' }}>Unifitz</a>
            <ul className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(l => <li key={l.href}><a href={l.href} className="text-[0.95rem] font-medium uf-ink-soft hover:text-[var(--clay)] py-3">{l.label}</a></li>)}
            </ul>
            <div className="flex items-center gap-3">
              <Link to="/auth" className="hidden sm:inline-flex items-center min-h-11 px-2 text-[0.95rem] font-medium uf-ink-soft hover:text-[var(--clay)]">Login</Link>
              <a href={L.nav.ctaHref} onClick={() => clickCta('nav')} className="uf-btn uf-btn--primary !py-2.5 !px-5 text-[0.95rem] !hidden sm:!inline-flex">{L.nav.cta}</a>
              <button ref={menuBtn} className="lg:hidden grid place-items-center w-11 h-11 rounded-lg" style={{ border: '1px solid var(--line)' }}
                onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="uf-mobile-menu">
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
          {open && (
            <div id="uf-mobile-menu" ref={menuRef} className="lg:hidden px-5 py-3 flex flex-col" style={{ borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
              {NAV_LINKS.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-1 py-3 font-medium">{l.label}</a>)}
              <Link to="/auth" className="px-1 py-3 font-medium">Login</Link>
              <a href={L.nav.ctaHref} onClick={() => { setOpen(false); clickCta('nav_mobile'); }} className="uf-btn uf-btn--primary uf-btn--full mt-2 mb-1">{L.nav.cta}</a>
            </div>
          )}
        </header>

        <main id="main" tabIndex={-1} className="outline-none">
          <div id="top" />
          {/* ── Hero (Direction A — accountability). Text is static: it's the
              LCP element, so it must paint without waiting for JS/animation. ── */}
          <section className="max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-14 grid lg:grid-cols-[1.08fr_.92fr] gap-10 lg:gap-14 lg:items-center">
            <div className="min-w-0">
              <p className="uf-eyebrow">{L.hero.eyebrow}</p>
              <h1 className="uf-h1 mt-4">{L.hero.h1}</h1>
              <p className="uf-lead mt-5 uf-measure">{L.hero.sub}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href={L.hero.primaryHref} onClick={() => clickCta('hero')} className="uf-btn uf-btn--primary">{PRIMARY} <ArrowRight className="w-4.5 h-4.5" /></a>
                <a href={L.hero.scheduleHref} onClick={() => clickCta('hero_schedule')} className="uf-btn uf-btn--ghost">{L.hero.scheduleCta}</a>
              </div>
              <p className="mt-5 text-[0.9rem] uf-ink-soft flex items-center gap-2"><Radio className="w-4 h-4" style={{ color: 'var(--clay)' }} /> {L.hero.microProof}</p>
            </div>

            {/* Hero visual: real class photo once L.hero.img is set; until then
                the honest next-live-class card (no fake "Live now" badge). */}
            <div className="uf-rise min-w-0">
              <div className="uf-card overflow-hidden">
                {L.hero.img ? (
                  <div className="aspect-[4/3] grid place-items-center" style={{ background: 'var(--cream-3)' }}>
                    <PhotoInner src={L.hero.img} alt="A live Unifitz class in progress on Zoom" priority />
                  </div>
                ) : (
                  <NextClassCard next={next} rows={rows} tz={tz} nowMs={nowMs} />
                )}
                <div className="flex items-center gap-3 p-4" style={{ borderTop: '1px solid var(--line)' }}>
                  <span className="inline-flex items-center gap-1.5 uf-tag shrink-0"><CalendarClock className="w-3.5 h-3.5" /> {next ? `Next: ${next.dayLabel} ${next.timeLabel}` : 'Mon–Sat'}</span>
                  <span className="text-[0.9rem] uf-ink-soft">{L.hero.cardNote}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Timetable strip (the differentiator) ── */}
          <TimetableStrip tz={tz} setTz={setTz} rows={rows} nowMs={nowMs} clickCta={clickCta} />

          {/* ── Problem ── */}
          <Band>
            <Head eyebrow={L.problem.eyebrow} heading={L.problem.heading} />
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid gap-5 md:grid-cols-3 mt-10">
              {L.problem.items.map(it => (
                <motion.div key={it.k} variants={rise} className="uf-panel p-7">
                  <p className="uf-serif text-[2rem]" style={{ color: 'var(--clay)' }}>{it.k}</p>
                  <p className="mt-2 uf-ink-soft">{it.t}</p>
                </motion.div>
              ))}
            </motion.div>
          </Band>

          {/* ── Why live ── */}
          <Band>
            <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-10 lg:gap-14 lg:items-start">
              <Head eyebrow={L.whyLive.eyebrow} heading={L.whyLive.heading} lead={L.whyLive.lead} />
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid gap-4">
                {L.whyLive.points.map((p, i) => (
                  <motion.div key={p.t} variants={rise} className="uf-card p-6 flex gap-4">
                    <span className="uf-serif text-[1.4rem] shrink-0 uf-tabular" style={{ color: 'var(--clay)' }}>{String(i + 1).padStart(2, '0')}</span>
                    <div><h3 className="uf-h3" style={{ fontSize: '1.15rem' }}>{p.t}</h3><p className="mt-1 uf-ink-soft text-[1rem]">{p.d}</p></div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Band>

          {/* ── In-action gallery (trust images) — hidden until real photos exist ── */}
          {SHOW_GALLERY && (
            <Band>
              <Head eyebrow={L.gallery.eyebrow} heading={L.gallery.heading} />
              {L.gallery.note && <p className="mt-3 text-[0.9rem] uf-ink-soft">{L.gallery.note}</p>}
              <div className="grid gap-5 sm:grid-cols-3 mt-8">
                {(GALLERY.length ? GALLERY : L.gallery.photos).map((ph, i) => (
                  <figure key={i} className="uf-photo aspect-[4/5]">
                    <PhotoInner src={ph.img} alt={ph.cap} caption={ph.cap} />
                  </figure>
                ))}
              </div>
            </Band>
          )}

          {/* ── Formats (alternating, not identical cards) ── */}
          <Band id="formats">
            <Head eyebrow={L.formats.eyebrow} heading={L.formats.heading} />
            <div className="mt-10 flex flex-col">
              {L.formats.items.map((f, i) => {
                const Icon = FORMAT_ICON[f.format] || Music;
                return (
                  <motion.div key={f.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex items-center gap-5 md:gap-8 py-7 ${i > 0 ? 'border-t' : ''} ${i % 2 ? 'md:flex-row-reverse md:text-right' : ''}`} style={{ borderColor: 'var(--line)' }}>
                    <span className="grid place-items-center w-14 h-14 shrink-0 rounded-full" style={{ background: 'var(--clay-tint)', color: 'var(--clay-deep)' }}><Icon className="w-6 h-6" /></span>
                    <div className={i % 2 ? 'md:ml-auto' : ''}>
                      <h3 className="uf-serif" style={{ fontSize: 'var(--t-h3)' }}>{f.name}</h3>
                      <p className="mt-1 uf-ink-soft uf-measure">{f.suits}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Band>

          {/* ── Instructors (highest-leverage trust) — only real, named people ── */}
          {SHOW_INSTRUCTORS && (
            <Band id="instructors">
              <Head eyebrow={L.instructors.eyebrow} heading={L.instructors.heading} />
              {L.instructors.note && <p className="mt-3 text-[0.9rem] uf-ink-soft">{L.instructors.note}</p>}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                {(INSTRUCTORS.length ? INSTRUCTORS : L.instructors.items).map((t, i) => (
                  <div key={i} className="uf-card p-6">
                    <div className="uf-photo aspect-square">
                      <PhotoInner src={t.img} alt={t.name ? `${t.name}, Unifitz ${t.focus} instructor` : ''} />
                    </div>
                    <p className="mt-4 uf-serif" style={{ fontSize: '1.15rem' }}>{t.name ?? 'Instructor name (dev only)'}</p>
                    {(t.cred || t.years) && <p className="text-[0.85rem] uf-ink-soft">{[t.cred, t.years].filter(Boolean).join(' · ')}</p>}
                    <p className="mt-2 text-[0.85rem] font-semibold" style={{ color: 'var(--clay)' }}>{t.focus}</p>
                  </div>
                ))}
              </div>
            </Band>
          )}

          {/* ── Goal tracks (named conditions) ── */}
          <Band id="tracks">
            <Head eyebrow={L.tracks.eyebrow} heading={L.tracks.heading} />
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid gap-5 sm:grid-cols-2 mt-10">
              {L.tracks.items.map(t => (
                <motion.div key={t.name} variants={rise} className="uf-panel p-7">
                  <span className="uf-tag">{t.name}</span>
                  <p className="mt-3 uf-ink-soft">{t.d}</p>
                </motion.div>
              ))}
            </motion.div>
            <p className="mt-6 text-[0.85rem] uf-ink-soft uf-measure">{L.tracks.disclaimer}</p>
          </Band>

          {/* ── Proof — real testimonials/reviews only ── */}
          {proof.length > 0 && (
            <Band id="proof">
              <Head eyebrow={L.proof.eyebrow} heading={L.proof.heading} />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
                {proof.map((p, i) => (
                  <figure key={i} className="uf-card p-6 flex flex-col">
                    <Quote className="w-6 h-6" style={{ color: 'var(--clay)', opacity: 0.4 }} aria-hidden="true" />
                    {p.result ? <span className="mt-3 uf-tag self-start">{p.result}</span> : null}
                    <blockquote className="mt-3 flex-1" style={{ color: 'var(--ink)' }}>{p.quote}</blockquote>
                    <figcaption className="mt-5 pt-4 text-[0.9rem] font-semibold" style={{ borderTop: '1px solid var(--line)' }}>
                      {p.name}{p.city ? <span className="uf-ink-soft font-normal"> · {p.city}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Band>
          )}

          {/* ── Pricing (no motion) ── */}
          <Pricing clickCta={clickCta} />

          {/* ── Objections ── */}
          <Band>
            <Head eyebrow={L.objections.eyebrow} heading={L.objections.heading} />
            <div className="grid gap-5 lg:grid-cols-2 mt-10">
              {L.objections.items.map((o, i) => (
                <div key={i} className="uf-panel p-7">
                  <h3 className="uf-serif" style={{ fontSize: '1.2rem' }}>{o.q}</h3>
                  <p className="mt-2 uf-ink-soft">{o.a}</p>
                </div>
              ))}
            </div>
            <RefundNote className="mt-6" />
          </Band>

          {/* ── FAQ ── */}
          <Band id="faq">
            <Head eyebrow={L.faq.eyebrow} heading={L.faq.heading} />
            <div className="mt-10 max-w-3xl">
              <Faq />
            </div>
          </Band>

          {/* ── Masterclass + inquiry (secondary conversion) ── */}
          <Band id="masterclass">
            <div className="uf-panel p-7 md:p-10 grid lg:grid-cols-2 gap-10 lg:items-center">
              <div>
                <p className="uf-eyebrow">{L.masterclass.eyebrow}</p>
                <h2 className="uf-h2 mt-3" style={{ fontSize: 'clamp(1.7rem,1.3rem+1.6vw,2.4rem)' }}>{L.masterclass.heading}</h2>
                <p className="mt-3 uf-lead uf-measure">{L.masterclass.sub}</p>
              </div>
              <div id="inquiry"><InquiryForm clickCta={clickCta} tz={tz} /></div>
            </div>
          </Band>

          {/* ── Final CTA ── */}
          <Band dark>
            <div className="text-center max-w-3xl mx-auto">
              <p className="uf-eyebrow" style={{ color: 'rgba(255,255,255,0.9)' }}>{L.finalCta.eyebrow}</p>
              <h2 className="uf-h2 mt-3" style={{ color: '#FFFFFF' }}>{L.finalCta.heading}</h2>
              <p className="mt-4 uf-lead mx-auto" style={{ color: 'rgba(255,255,255,0.92)' }}>{L.finalCta.sub}</p>
              <a href={L.finalCta.href} onClick={() => clickCta('final')} className="uf-btn uf-btn--primary mt-8">{PRIMARY} <ArrowRight className="w-4.5 h-4.5" /></a>
              <p className="mt-4 text-[0.9rem]" style={{ color: 'rgba(255,255,255,0.9)' }}>{L.finalCta.riskReversal}</p>
            </div>
          </Band>
        </main>

        <SiteFooter />

        {/* Sticky mobile CTA (after hero) + WhatsApp */}
        {scrolled && (
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-3" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderTop: '1px solid var(--line)' }}>
            <a href="#pricing" onClick={() => clickCta('sticky_mobile')} className="uf-btn uf-btn--primary uf-btn--full">{PRIMARY} <ArrowRight className="w-4.5 h-4.5" /></a>
          </div>
        )}
        <FloatingWhatsApp />
      </div>
    </MotionConfig>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function Band({ id, dark, children }) {
  return (
    <section id={id} className={dark ? 'uf-dark' : ''}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">{children}</div>
    </section>
  );
}

function Head({ eyebrow, heading, lead }) {
  return (
    <div>
      <p className="uf-eyebrow">{eyebrow}</p>
      <h2 className="uf-h2 mt-3">{heading}</h2>
      {lead && <p className="mt-4 uf-lead uf-measure">{lead}</p>}
    </div>
  );
}

// Hero stand-in until a real class photo ships: the next three live classes,
// in the viewer's timezone. Honest proof the schedule exists.
function NextClassCard({ next, rows, tz, nowMs }) {
  const upcoming = rows.slice(0, 3);
  return (
    <div className="sm:aspect-[4/3] flex flex-col justify-center gap-3 p-5 md:p-8" style={{ background: 'var(--cream-2)' }}>
      <p className="uf-eyebrow"><Radio className="w-3.5 h-3.5" /> {next ? 'Coming up live' : 'Live this week'}</p>
      {upcoming.map((c, i) => {
        const Icon = FORMAT_ICON[c.format] || Music;
        return (
          <div key={i} className="uf-card flex items-center gap-4 p-4">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full" style={{ background: 'var(--clay-tint)', color: 'var(--clay-deep)' }}><Icon className="w-5 h-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{c.title}</p>
              <p className="text-[0.85rem] uf-ink-soft">with {c.coach} · {c.dur} min</p>
            </div>
            <p className="text-right text-[0.9rem] font-bold uf-tabular shrink-0" style={{ color: 'var(--clay)' }}>{c.dayLabel}<br />{c.timeLabel}</p>
          </div>
        );
      })}
      <p className="text-[0.8rem] uf-ink-soft">Times in {tzAbbr(tz, nowMs)} · live on Zoom</p>
    </div>
  );
}

function TimetableStrip({ tz, setTz, rows, nowMs, clickCta }) {
  const ref = useRef(null);
  const seen = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !seen.current) { seen.current = true; track('timetable_view', { tz }); } }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, [tz]);
  return (
    <section id="timetable" ref={ref} style={{ background: 'var(--cream-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="uf-eyebrow"><Radio className="w-3.5 h-3.5" /> {L.timetable.eyebrow}</p>
            <h2 className="uf-h2 mt-3">{L.timetable.heading}</h2>
            <p className="mt-3 uf-ink-soft">{L.timetable.sub}</p>
          </div>
          {/* Timezone picker */}
          <label className="shrink-0 flex items-center gap-2 uf-chip !py-2 min-h-11 cursor-pointer">
            <Clock className="w-4 h-4" style={{ color: 'var(--clay)' }} />
            <span className="sr-only">{L.timetable.tzLabel}</span>
            <select value={tz} onChange={e => { setTz(e.target.value); track('timezone_changed', { tz: e.target.value }); }}
              className="bg-transparent font-semibold text-[0.9rem] outline-none cursor-pointer" style={{ color: 'var(--ink)' }} aria-label={L.timetable.tzLabel}>
              {ZONES.map(z => <option key={z.tz} value={z.tz}>{z.label}</option>)}
            </select>
          </label>
        </div>

        <p className="mt-6 text-[0.85rem] uf-ink-soft md:hidden" aria-hidden="true">{L.timetable.swipeHint}</p>
        <div className="uf-fade-edge mt-3 md:mt-8 -mx-5 md:mx-0">
          <div className="uf-scroll-x px-5 md:px-0" tabIndex={0} role="region" aria-label={`Class timetable, times in ${tzAbbr(tz, nowMs)}`}>
            <ul className="flex md:grid gap-3 pb-1" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
              {rows.map((c, i) => {
                const Icon = FORMAT_ICON[c.format] || Music;
                return (
                  <li key={i} className="uf-card p-5 shrink-0 w-[68vw] max-w-[240px] md:w-auto md:max-w-none">
                    <div className="flex items-center justify-between">
                      <span className="grid place-items-center w-9 h-9 rounded-full" style={{ background: 'var(--clay-tint)', color: 'var(--clay-deep)' }}><Icon className="w-4.5 h-4.5" /></span>
                      <span className="text-[0.8rem] font-bold uppercase tracking-wide uf-tabular" style={{ color: 'var(--clay)' }}>{c.dayLabel}</span>
                    </div>
                    <p className="mt-3 font-semibold" style={{ fontSize: '1.05rem' }}>{c.title}</p>
                    <p className="text-[0.9rem] uf-ink-soft">with {c.coach}</p>
                    <p className="mt-3 text-[0.95rem] font-bold uf-tabular">{c.timeLabel} <span className="uf-ink-soft font-normal">· {c.dur} min</span></p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <a href={L.timetable.ctaHref} onClick={() => clickCta('timetable')} className="uf-btn uf-btn--primary">{PRIMARY} <ArrowRight className="w-4.5 h-4.5" /></a>
        </div>
      </div>
    </section>
  );
}

function RefundNote({ className = '' }) {
  return (
    <p className={`text-[0.9rem] uf-ink-soft ${className}`}>
      {L.pricing.refund}
      {BUSINESS.refundDays ? ` New members: full refund within ${BUSINESS.refundDays} days of your first payment.` : ''}{' '}
      <Link to="/refund" className="underline underline-offset-2 hover:text-[var(--clay)]">{L.pricing.refundLink}</Link>
    </p>
  );
}

function Pricing({ clickCta }) {
  const p = L.pricing;
  const [billing, setBilling] = useState(p.defaultBilling);
  const [showMore, setShowMore] = useState(false);
  const b = p.billing.find(x => x.key === billing);

  const price = (monthly) => {
    const total = Math.round(monthly * b.months * b.factor);
    const perMo = Math.round(monthly * b.factor);
    return { total, perMo };
  };
  // Carry the choice through signup: /auth reads plan + billing.
  const planHref = (name) => `/auth?mode=signup&plan=${encodeURIComponent(name)}&billing=${billing}`;
  // GA4 ecommerce: picking a plan is select_item (begin_checkout fires at payment).
  const selectPlan = (name, value) => {
    track('select_item', { item_list_name: 'pricing', currency: CURRENCY, value, items: [{ item_id: name, item_name: name, item_variant: billing, price: value }], market: MARKET });
    clickCta('pricing', { plan: name });
  };

  return (
    <section id="pricing">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Head eyebrow={p.eyebrow} heading={p.heading} lead={p.sub} />

        {/* billing toggle — a pressed-button pair, not tabs (no tabpanels here) */}
        <div className="mt-8 inline-flex p-1 rounded-full" style={{ background: 'var(--cream-2)', border: '1px solid var(--line)' }} role="group" aria-label="Billing period">
          {p.billing.map(opt => (
            <button key={opt.key} type="button" aria-pressed={billing === opt.key}
              onClick={() => { setBilling(opt.key); track('billing_toggle', { billing: opt.key, market: MARKET }); }}
              className="px-5 py-2.5 min-h-11 rounded-full text-[0.95rem] font-bold flex items-center gap-2"
              style={billing === opt.key ? { background: 'var(--go)', color: '#FFFFFF' } : { color: 'var(--ink-soft)' }}>
              {opt.label}{opt.save && <span className="text-[0.75rem]" style={{ color: billing === opt.key ? '#FFFFFF' : 'var(--go)' }}>{opt.save}</span>}
            </button>
          ))}
        </div>

        {/* 4 primary tiers, Complete anchor */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mt-8 items-stretch">
          {p.primary.map(plan => {
            const pr = price(plan.monthly);
            const anchor = plan.anchor;
            return (
              <div key={plan.name} className="rounded-[22px] p-7 flex flex-col"
                style={anchor ? { border: '1.5px solid var(--clay)', background: 'var(--cream)' } : { border: '1px solid var(--line)', background: 'var(--cream)' }}>
                {anchor && <span className="uf-tag self-start mb-3">{p.anchorBadge}</span>}
                <h3 className="uf-serif" style={{ fontSize: '1.35rem' }}>{plan.name}</h3>
                <p className="mt-1 text-[0.95rem] uf-ink-soft">{plan.tagline}</p>
                <p className="mt-4 uf-serif uf-tabular" style={{ fontSize: '2.4rem', lineHeight: 1 }}>
                  {p.currency ?? '$'}{pr.total}<span className="text-[0.9rem] uf-ink-soft"> {b.months === 1 ? '/mo' : '/quarter'}</span>
                </p>
                <p className="mt-1 h-5 text-[0.85rem]" style={{ color: 'var(--go)' }}>{b.months > 1 ? `$${pr.perMo}/mo, billed quarterly` : ''}</p>
                <ul className="mt-5 space-y-2.5 text-[0.95rem] flex-1">
                  {plan.feats.map(f => <li key={f} className="flex items-start gap-2"><Check className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--go)' }} /> {f}</li>)}
                </ul>
                <Link to={planHref(plan.name)} onClick={() => selectPlan(plan.name, pr.total)}
                  className={`uf-btn uf-btn--full mt-6 ${anchor ? 'uf-btn--primary' : 'uf-btn--ghost'}`}>
                  {anchor ? L.pricing.anchorCta : L.pricing.primaryCta}<span className="sr-only"> — {plan.name}</span>
                </Link>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => setShowMore(v => !v)} className="mt-6 inline-flex items-center gap-1.5 min-h-11 font-semibold" style={{ color: 'var(--clay)' }} aria-expanded={showMore} aria-controls="uf-more-plans">
          {showMore ? p.moreCollapse : p.moreToggle} <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>

        {showMore && (
          <div id="uf-more-plans" className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr] items-start">
            <div className="grid gap-3 sm:grid-cols-2">
              {p.more.map(m => {
                const pr = price(m.monthly);
                return (
                  <div key={m.name} className="uf-panel p-5 flex flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="font-semibold" style={{ fontSize: '1.05rem' }}>{m.name}</h4>
                      <span className="uf-serif uf-tabular shrink-0" style={{ fontSize: '1.3rem' }}>${pr.total}<span className="text-[0.75rem] uf-ink-soft">{b.months === 1 ? '/mo' : '/qtr'}</span></span>
                    </div>
                    <p className="mt-1.5 text-[0.9rem] uf-ink-soft flex-1">{m.note}</p>
                    <Link to={planHref(m.name)} onClick={() => selectPlan(m.name, pr.total)} className="uf-btn uf-btn--ghost uf-btn--full mt-4 !py-2.5 text-[0.95rem]">{L.pricing.primaryCta}<span className="sr-only"> — {m.name}</span></Link>
                  </div>
                );
              })}
            </div>
            {/* Founding member — real scarcity, no fake countdown */}
            <div className="rounded-[22px] p-7" style={{ background: 'var(--cream-2)', border: '1.5px solid var(--clay)' }}>
              <span className="uf-tag">{p.founding.name}</span>
              <p className="mt-4 uf-serif uf-tabular" style={{ fontSize: '2.2rem', lineHeight: 1 }}>${p.founding.price}<span className="text-[0.9rem] uf-ink-soft">{p.founding.unit}</span></p>
              <p className="mt-2 text-[0.85rem] font-semibold" style={{ color: 'var(--clay)' }}>
                {p.founding.scarcity}{p.founding.seatsLeft != null ? ` · ${p.founding.seatsLeft} seats left` : ''}
              </p>
              <ul className="mt-4 space-y-2 text-[0.95rem]">
                {p.founding.perks.map(k => <li key={k} className="flex items-start gap-2"><Check className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--go)' }} /> {k}</li>)}
              </ul>
              <Link to={`/auth?mode=signup&plan=${encodeURIComponent(p.founding.name)}&billing=yearly`} onClick={() => selectPlan(p.founding.name, p.founding.price)} className="uf-btn uf-btn--primary uf-btn--full mt-5">{L.pricing.primaryCta}<span className="sr-only"> — {p.founding.name}</span></Link>
            </div>
          </div>
        )}
        <RefundNote className="mt-8" />
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="flex flex-col">
      {L.faq.items.map((f, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ fontFamily: 'var(--sans)' }}>
            <button type="button" id={`faq-q-${i}`} className="w-full flex items-center justify-between gap-4 py-5 text-left"
              onClick={() => { const next = open === i ? -1 : i; setOpen(next); if (next === i) track('faq_open', { question: f.q }); }}
              aria-expanded={open === i} aria-controls={`faq-a-${i}`}>
              <span className="font-semibold" style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>{f.q}</span>
              <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} style={{ color: 'var(--clay)' }} />
            </button>
          </h3>
          {/* Answers stay in the DOM (hidden) so crawlers and in-page search see them. */}
          <p id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={open !== i} className="pb-5 uf-ink-soft uf-measure">{f.a}</p>
        </div>
      ))}
    </div>
  );
}

function InquiryForm({ clickCta, tz }) {
  const [f, setF] = useState({ name: '', cc: '1', phone: '', goal: GOALS[0], consent: false, company: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);   // null | 'new' | 'dupe'
  const [err, setErr] = useState({ field: null, msg: '' });
  const touchedCc = useRef(false);

  // Default the country code to India for IST visitors (unless they picked one).
  useEffect(() => { if (!touchedCc.current && tz === 'Asia/Kolkata') setF(x => ({ ...x, cc: '91' })); }, [tz]);

  const fail = (field, msg, reason) => { setErr({ field, msg }); track('form_error', { form: 'masterclass', field, reason }); };

  async function submit(e) {
    e.preventDefault();
    setErr({ field: null, msg: '' });
    if (f.company) { setDone('new'); return; }   // honeypot: bots fill hidden fields
    const name = f.name.trim();
    if (name.length < 2 || name.length > 80) return fail('name', 'Please enter your name.', 'length');
    const e164 = toE164(f.cc, f.phone);
    if (!e164) return fail('phone', 'Please enter a valid phone number for the country selected.', 'format');
    if (!f.consent) return fail('consent', 'Please tick the box so we can contact you about your seat.', 'consent');
    setBusy(true);
    let utm = {};
    try { utm = JSON.parse(sessionStorage.getItem('uf_utm') || '{}'); } catch { utm = {}; }
    const { error } = await supabase.from('leads').insert({
      name, whatsapp: e164, goal: f.goal, consent: true,
      source: `masterclass${utm.utm_source ? ':' + utm.utm_source : ''}`,
    });
    setBusy(false);
    if (error) {
      if (error.code === '23505') { setDone('dupe'); return; }      // unique (phone) — already signed up
      if (error.code === '23514') return fail('phone', 'Please check your name and phone number.', 'db_check');
      return fail(null, 'Something went wrong on our side. Please try again, or message us on WhatsApp.', 'db_error');
    }
    clickCta('masterclass_submit');
    track('generate_lead', { form: 'masterclass', goal: f.goal, country_code: f.cc, utm_source: utm.utm_source });
    setDone('new');
  }

  if (done) return (
    <div className="uf-card p-7 text-center" role="status">
      <Check className="w-9 h-9 mx-auto" style={{ color: 'var(--go)' }} />
      <p className="mt-3 uf-serif" style={{ fontSize: '1.25rem' }}>{L.masterclass.doneTitle}</p>
      <p className="mt-1 uf-ink-soft text-[0.95rem]">{done === 'dupe' ? L.masterclass.dupeBody : L.masterclass.doneBody}</p>
      <a href={waLink('Hi Unifitz! I’d like a free masterclass seat.')} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click', { location: 'masterclass_done' })} className="uf-btn uf-btn--ghost mt-4">Message us <ArrowUpRight className="w-4 h-4" /></a>
    </div>
  );

  const errFor = field => (err.field === field ? { 'aria-invalid': true, 'aria-describedby': 'iq-err' } : {});
  return (
    <form onSubmit={submit} noValidate className="uf-card p-6 flex flex-col gap-4">
      <div>
        <label htmlFor="iq-name" className="uf-label">Your name</label>
        <input id="iq-name" required maxLength={80} className="uf-input" placeholder="e.g. Ananya" value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} autoComplete="name" {...errFor('name')} />
      </div>
      <div>
        <label htmlFor="iq-phone" className="uf-label">WhatsApp number</label>
        <div className="flex gap-2">
          <select aria-label="Country code" className="uf-input !w-auto shrink-0 !px-3" value={f.cc}
            onChange={e => { touchedCc.current = true; setF(x => ({ ...x, cc: e.target.value })); }} autoComplete="tel-country-code">
            {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
          </select>
          <input id="iq-phone" required type="tel" inputMode="tel" maxLength={20} className="uf-input min-w-0" placeholder={PHONE_PH[f.cc]} value={f.phone}
            onChange={e => setF(x => ({ ...x, phone: e.target.value }))} autoComplete="tel-national" {...errFor('phone')} />
        </div>
      </div>
      <div>
        <label htmlFor="iq-goal" className="uf-label">What are you working on?</label>
        <select id="iq-goal" className="uf-input" value={f.goal} onChange={e => setF(x => ({ ...x, goal: e.target.value }))}>
          {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      {/* honeypot — invisible to people, irresistible to bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="iq-company">Company</label>
        <input id="iq-company" tabIndex={-1} autoComplete="off" value={f.company} onChange={e => setF(x => ({ ...x, company: e.target.value }))} />
      </div>
      <label className="flex items-start gap-2.5 text-[0.85rem] uf-ink-soft cursor-pointer">
        <input type="checkbox" required checked={f.consent} onChange={e => setF(x => ({ ...x, consent: e.target.checked }))} className="mt-1 w-4 h-4 shrink-0" style={{ accentColor: 'var(--go)' }} {...errFor('consent')} />
        <span>{L.masterclass.consent} See our <Link to="/privacy" className="underline underline-offset-2">privacy policy</Link>.</span>
      </label>
      {err.msg && <p id="iq-err" className="text-[0.9rem]" style={{ color: '#B23B3B' }} role="alert">{err.msg}</p>}
      <button type="submit" disabled={busy} className="uf-btn uf-btn--primary uf-btn--full">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} {L.masterclass.cta}
      </button>
      <p className="text-center text-[0.8rem] uf-ink-soft">No card required</p>
    </form>
  );
}
