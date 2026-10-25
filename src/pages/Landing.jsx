import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import {
  Menu, X, Music, Flower2, Dumbbell, Brain, Timer, ArrowRight, Check,
  Radio, Clock, Camera, ChevronDown, ChevronLeft, ChevronRight, Quote, CalendarClock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BUSINESS, waLink } from '../config';
import { L } from '../content/landing';
import { track, captureUtm } from '../lib/track';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import SiteFooter from '../components/SiteFooter';
import WhatsAppIcon from '../components/WhatsAppIcon';
import LeadForm from '../components/LeadForm';
import './landing.css';

const PRIMARY = 'Choose your plan';        // repeated verbatim ≥4×
const MARKET = 'US';
const CURRENCY = 'USD';
// Dev-only placeholders for unfilled content. `import.meta.env.DEV` is a
// build-time constant, so every `DEV &&` branch is stripped from production.
const DEV = import.meta.env.DEV;
const FORMAT_ICON = { Zumba: Music, Yoga: Flower2, Strength: Dumbbell, Tabata: Timer, Meditation: Brain };
const GOALS = ['Lose weight', 'Get stronger', 'PCOS / PCOD support', 'Post-40 strength', 'Postpartum return', 'Just exploring'];

// warm-editorial reveal: fade + 8px rise, 200ms (reduced-motion via MotionConfig).
const rise = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

// Sections parked for now — flip to true to bring one back.
const SHOW_TIMETABLE = false;
const SHOW_INSTRUCTORS = false;
const SHOW_TRACKS = false;

// What actually ships. Blocks with nothing real to show hide themselves.
const INSTRUCTORS = L.instructors.items.filter(i => i.name);
const GALLERY = L.gallery.photos.filter(p => p.img);
const NAV_LINKS = L.nav.links;

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
  const fetched = testimonials.length ? testimonials.map(t => ({ quote: t.quote, name: t.name, city: t.location, result: t.result }))
    : reviews.map(r => ({ quote: r.text, name: r.name, city: '', result: '' }));
  const proof = [...L.gallery.quotes, ...fetched];
  if (DEV && !proof.length) proof.push(...[1, 2, 3].map(() => ({ quote: 'Placeholder (dev only) — a real member’s words with a specific change.', name: 'Member name', city: 'City' })));

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

          {/* ── Timetable strip ── */}
          {SHOW_TIMETABLE && <TimetableStrip tz={tz} setTz={setTz} rows={rows} nowMs={nowMs} clickCta={clickCta} />}

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

          {/* ── Photos + member stories carousel — hides with nothing real to show ── */}
          <Stories photos={DEV && !GALLERY.length ? L.gallery.photos : GALLERY} quotes={proof} />

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
          {SHOW_TRACKS && <Band id="tracks">
            <Head eyebrow={L.tracks.eyebrow} heading={L.tracks.heading} />
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid gap-5 sm:grid-cols-2 mt-10">
              {L.tracks.items.map(t => (
                <motion.div key={t.name} variants={rise} className="uf-panel p-7">
                  <span className="uf-tag">{t.name}</span>
                  <p className="mt-3 uf-ink-soft">{t.d}</p>
                </motion.div>
              ))}
            </motion.div>
            <p className="mt-6 text-[0.85rem] uf-ink-soft uf-measure">{L.disclaimer}</p>
          </Band>}

          {/* ── Pricing (no motion) ── */}
          <Pricing clickCta={clickCta} />

          {/* ── FAQ ── */}
          <Band id="faq">
            <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-10 lg:gap-16 lg:items-start">
              <div className="lg:sticky lg:top-24">
                <Head eyebrow={L.faq.eyebrow} heading={L.faq.heading} lead={L.faq.lead} />
                <div className="uf-panel p-6 mt-8">
                  <p className="font-semibold">{L.faq.helpTitle}</p>
                  <p className="mt-1 text-[0.95rem] uf-ink-soft">{L.faq.helpBody}</p>
                  <a href={waLink('Hi Unifitz! I have a question before I join.')} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click', { location: 'faq' })} className="uf-btn uf-btn--ghost mt-4 !py-2.5">
                    <WhatsAppIcon className="w-5 h-5 text-[#25D366]" /> {L.faq.helpCta}
                  </a>
                </div>
              </div>
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
              <div id="inquiry">
                <LeadForm idPrefix="iq" source="masterclass" formName="masterclass" goals={GOALS} tz={tz}
                  copy={L.masterclass} onSuccess={() => clickCta('masterclass_submit')} />
              </div>
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

function Head({ eyebrow, heading, lead, center }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className="uf-eyebrow">{eyebrow}</p>
      <h2 className="uf-h2 mt-3">{heading}</h2>
      {lead && <p className={`mt-4 uf-lead uf-measure ${center ? 'mx-auto' : ''}`}>{lead}</p>}
    </div>
  );
}

// Photo slides and member-quote slides, alternating, in one swipeable row.
// A quote is its own card — never laid over a photo of someone else.
function Stories({ photos, quotes }) {
  const rail = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const slides = [];
  for (let i = 0; i < Math.max(photos.length, quotes.length); i++) {
    if (photos[i]) slides.push({ kind: 'photo', ...photos[i] });
    if (quotes[i]) slides.push({ kind: 'quote', ...quotes[i] });
  }
  const onScroll = () => {
    const el = rail.current; if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(onScroll, [slides.length]);
  if (!slides.length) return null;

  const go = (dir) => {
    const el = rail.current; if (!el) return;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * step, behavior: smooth ? 'smooth' : 'auto' });
    track('stories_nav', { dir });
  };
  const arrow = 'grid place-items-center w-11 h-11 rounded-full bg-white disabled:opacity-35 hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors';

  return (
    <section id="stories" style={{ background: 'var(--cream-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <Head eyebrow={L.gallery.eyebrow} heading={L.gallery.heading} lead={L.gallery.lead} />
          <div className="hidden md:flex gap-2 shrink-0">
            <button type="button" onClick={() => go(-1)} disabled={edge.start} className={arrow} style={{ border: '1px solid var(--line)' }} aria-label="Previous"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => go(1)} disabled={edge.end} className={arrow} style={{ border: '1px solid var(--line)' }} aria-label="Next"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="mt-10 -mx-5 md:mx-0">
          <div ref={rail} onScroll={onScroll} className="uf-scroll-x px-5 md:px-0" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Photos and member stories">
            <ul className="flex gap-5 pb-1">
              {slides.map((s, i) => (
                <li key={i} className="shrink-0 w-[78vw] max-w-[320px] sm:w-[320px]" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
                  {s.kind === 'photo' ? (
                    <figure className="uf-photo aspect-[4/5]">
                      <PhotoInner src={s.img} alt={s.cap} hint={s.cap} />
                      {s.img && s.cap && (
                        <figcaption className="absolute inset-x-0 bottom-0 p-4 pt-12 text-left text-[0.9rem] font-medium text-white" style={{ background: 'linear-gradient(to top, rgba(20,14,8,0.78), rgba(20,14,8,0))', lineHeight: 1.45 }}>{s.cap}</figcaption>
                      )}
                    </figure>
                  ) : (
                    <figure className="uf-card aspect-[4/5] p-7 flex flex-col">
                      <Quote className="w-7 h-7" style={{ color: 'var(--clay)', opacity: 0.45 }} aria-hidden="true" />
                      {s.result ? <span className="mt-4 uf-tag self-start">{s.result}</span> : null}
                      <blockquote className="mt-4 flex-1 uf-serif overflow-hidden" style={{ fontSize: '1.2rem', lineHeight: 1.45, color: 'var(--ink)' }}>{s.quote}</blockquote>
                      <figcaption className="mt-5 pt-4 text-[0.95rem] font-semibold" style={{ borderTop: '1px solid var(--line)' }}>
                        {s.name}{s.city ? <span className="uf-ink-soft font-normal"> · {s.city}</span> : null}
                      </figcaption>
                    </figure>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
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
        <Head eyebrow={p.eyebrow} heading={p.heading} lead={p.sub} center />

        {/* billing toggle — a pressed-button pair, not tabs (no tabpanels here) */}
        <div className="mt-8 flex justify-center">
        <div className="inline-flex p-1 rounded-full" style={{ background: 'var(--cream-2)', border: '1px solid var(--line)' }} role="group" aria-label="Billing period">
          {p.billing.map(opt => (
            <button key={opt.key} type="button" aria-pressed={billing === opt.key}
              onClick={() => { setBilling(opt.key); track('billing_toggle', { billing: opt.key, market: MARKET }); }}
              className="px-5 py-2.5 min-h-11 rounded-full text-[0.95rem] font-bold flex items-center gap-2"
              style={billing === opt.key ? { background: 'var(--go)', color: '#FFFFFF' } : { color: 'var(--ink-soft)' }}>
              {opt.label}{opt.save && <span className="text-[0.75rem]" style={{ color: billing === opt.key ? '#FFFFFF' : 'var(--go)' }}>{opt.save}</span>}
            </button>
          ))}
        </div>
        </div>

        {/* 4 primary tiers, Complete anchor. Headline price is always per
            month so the four cards compare at a glance. */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-12 items-stretch">
          {p.primary.map(plan => {
            const pr = price(plan.monthly);
            const anchor = plan.anchor;
            return (
              <div key={plan.name} className={`relative rounded-[22px] p-6 flex flex-col ${anchor ? 'shadow-[0_18px_40px_-24px_rgba(194,65,12,0.55)]' : ''}`}
                style={anchor ? { border: '2px solid var(--clay)', background: 'var(--cream-2)' } : { border: '1px solid var(--line)', background: 'var(--cream)' }}>
                {anchor && (
                  <span className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] whitespace-nowrap" style={{ background: 'var(--clay)', color: '#FFFFFF' }}>{p.anchorBadge}</span>
                )}
                <h3 className="font-bold whitespace-nowrap" style={{ fontFamily: 'var(--sans)', fontSize: '1.1rem' }}>{plan.name}</h3>
                <p className="mt-1 text-[0.9rem] uf-ink-soft lg:min-h-[2.8rem]" style={{ lineHeight: 1.45 }}>{plan.tagline}</p>
                <p className="mt-5 uf-serif uf-tabular whitespace-nowrap" style={{ fontSize: '2.6rem', lineHeight: 1 }}>
                  ${pr.perMo}<span className="text-[0.95rem] uf-ink-soft" style={{ fontFamily: 'var(--sans)' }}>/mo</span>
                </p>
                <p className="mt-2 text-[0.8rem] uf-ink-soft">{b.months > 1 ? `$${pr.total} billed every 3 months` : 'Billed monthly'}</p>
                <hr className="uf-hr my-5" />
                <ul className="space-y-2.5 text-[0.92rem] flex-1">
                  {plan.feats.map(f => <li key={f} className="flex items-start gap-2.5"><Check className="w-4 h-4 shrink-0 mt-[3px]" style={{ color: 'var(--go)' }} /> {f}</li>)}
                </ul>
                <Link to={planHref(plan.name)} onClick={() => selectPlan(plan.name, pr.total)}
                  className={`uf-btn uf-btn--full mt-6 !px-4 whitespace-nowrap ${anchor ? 'uf-btn--solid' : 'uf-btn--ghost'}`}>
                  {anchor ? L.pricing.anchorCta : L.pricing.primaryCta}<span className="sr-only"> — {plan.name}</span>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <RefundNote className="text-center max-w-2xl" />
          <button type="button" onClick={() => setShowMore(v => !v)} className="inline-flex items-center gap-1.5 min-h-11 font-semibold" style={{ color: 'var(--clay)' }} aria-expanded={showMore} aria-controls="uf-more-plans">
            {showMore ? p.moreCollapse : p.moreToggle} <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* More plans: one compact list instead of another grid of boxes. */}
        {showMore && (
          <div id="uf-more-plans" className="mt-4 max-w-4xl mx-auto">
            <ul className="uf-card divide-y" style={{ borderColor: 'var(--line)' }}>
              {p.more.map(m => {
                const pr = price(m.monthly);
                return (
                  <li key={m.name} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5" style={{ borderColor: 'var(--line)' }}>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold" style={{ fontSize: '1.02rem' }}>{m.name}</h4>
                      <p className="text-[0.9rem] uf-ink-soft">{m.note}</p>
                    </div>
                    <p className="uf-serif uf-tabular shrink-0" style={{ fontSize: '1.5rem', lineHeight: 1 }}>${pr.perMo}<span className="text-[0.8rem] uf-ink-soft" style={{ fontFamily: 'var(--sans)' }}>/mo</span></p>
                    <Link to={planHref(m.name)} onClick={() => selectPlan(m.name, pr.total)} className="uf-btn uf-btn--ghost !py-2 !px-5 !min-h-11 text-[0.95rem] whitespace-nowrap shrink-0">{L.pricing.primaryCta}<span className="sr-only"> — {m.name}</span></Link>
                  </li>
                );
              })}
            </ul>
            {/* Founding member — real scarcity, no fake countdown */}
            <div className="mt-5 rounded-[22px] p-6 flex flex-col md:flex-row md:items-center gap-5" style={{ background: 'var(--cream-2)', border: '1.5px solid var(--clay)' }}>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="uf-tag">{p.founding.name}</span>
                  <span className="text-[0.85rem] font-semibold" style={{ color: 'var(--clay)' }}>
                    {p.founding.scarcity}{p.founding.seatsLeft != null ? ` · ${p.founding.seatsLeft} seats left` : ''}
                  </span>
                </div>
                <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[0.92rem]">
                  {p.founding.perks.map(k => <li key={k} className="flex items-start gap-2"><Check className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--go)' }} /> {k}</li>)}
                </ul>
              </div>
              <div className="shrink-0 md:text-right">
                <p className="uf-serif uf-tabular" style={{ fontSize: '2.2rem', lineHeight: 1 }}>${p.founding.price}<span className="text-[0.9rem] uf-ink-soft" style={{ fontFamily: 'var(--sans)' }}>{p.founding.unit}</span></p>
                <Link to={`/auth?mode=signup&plan=${encodeURIComponent(p.founding.name)}&billing=yearly`} onClick={() => selectPlan(p.founding.name, p.founding.price)} className="uf-btn uf-btn--solid mt-3 whitespace-nowrap">{L.pricing.primaryCta}<span className="sr-only"> — {p.founding.name}</span></Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState('0-0');
  return (
    <div className="flex flex-col gap-10">
      {L.faq.groups.map((g, gi) => (
        <div key={g.name}>
          <p className="uf-eyebrow">{g.name}</p>
          <div className="mt-2 flex flex-col">
            {g.items.map((f, i) => {
              const id = `${gi}-${i}`;
              const isOpen = open === id;
              return (
                <div key={id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <h3 style={{ fontFamily: 'var(--sans)' }}>
                    <button type="button" id={`faq-q-${id}`} className="w-full flex items-center justify-between gap-4 py-4 text-left hover:text-[var(--clay)] transition-colors"
                      onClick={() => { setOpen(isOpen ? null : id); if (!isOpen) track('faq_open', { question: f.q }); }}
                      aria-expanded={isOpen} aria-controls={`faq-a-${id}`}>
                      <span className="font-semibold" style={{ fontSize: '1.02rem', lineHeight: 1.45 }}>{f.q}</span>
                      <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full" style={{ background: isOpen ? 'var(--clay)' : 'var(--clay-tint)', color: isOpen ? '#FFFFFF' : 'var(--clay-deep)' }}>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                  </h3>
                  {/* Answers stay in the DOM (hidden) so crawlers and in-page search see them. */}
                  <p id={`faq-a-${id}`} role="region" aria-labelledby={`faq-q-${id}`} hidden={!isOpen} className="pb-5 pr-12 uf-ink-soft text-[0.98rem]">{f.a}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
