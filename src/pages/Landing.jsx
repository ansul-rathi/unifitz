import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import {
  Menu, X, Music, Flower2, Dumbbell, Brain, ArrowRight, ArrowUpRight, Check,
  Radio, Clock, Camera, ChevronDown, Instagram, Facebook, Youtube, Mail, MessageCircle,
  Loader2, Quote,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BUSINESS, waLink } from '../config';
import { L } from '../content/landing';
import { track, captureUtm } from '../lib/track';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import './landing.css';

const PRIMARY = 'Choose your plan';        // repeated verbatim ≥4×
const MARKET = 'US';
const FORMAT_ICON = { Zumba: Music, Yoga: Flower2, Strength: Dumbbell, Meditation: Brain };
const GOALS = ['Lose weight', 'Get stronger', 'PCOS / PCOD support', 'Post-40 strength', 'Postpartum return', 'Just exploring'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// warm-editorial reveal: fade + 8px rise, 200ms (reduced-motion via MotionConfig).
const rise = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

// Renders a real image when `src` is set (and loads); otherwise a labelled
// placeholder. So the page looks intentional before assets arrive, and each
// photo appears the moment its file exists in /public — no code change needed.
function PhotoInner({ src, alt, caption, hint }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt={alt || ''} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover" />;
  }
  return (
    <div className="p-5 text-center">
      <Camera className="w-8 h-8 mx-auto" style={{ color: 'var(--ink-faint)' }} />
      <p className="mt-2 text-[0.8rem] font-semibold" style={{ color: 'var(--ink-faint)' }}>Add photo</p>
      {caption && <p className="mt-1.5 text-[0.9rem] uf-ink-soft">{caption}</p>}
      {hint && <p className="mt-1 text-[0.8rem]" style={{ color: 'var(--ink-faint)' }}>{hint}</p>}
    </div>
  );
}

// ── timezone conversion: canonical UTC schedule → viewer's local zone ──
function nextOccurrence(day, utcHHMM) {
  const [h, m] = utcHHMM.split(':').map(Number);
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m));
  let delta = (day - d.getUTCDay() + 7) % 7;
  if (delta === 0 && d.getTime() < now.getTime()) delta = 7;
  d.setUTCDate(d.getUTCDate() + delta);
  return d;
}
// Selectable timezones — California/Pacific through Eastern, plus IST.
const ZONES = [
  { label: 'Pacific · California (PT)', tz: 'America/Los_Angeles' },
  { label: 'Mountain (MT)', tz: 'America/Denver' },
  { label: 'Central (CT)', tz: 'America/Chicago' },
  { label: 'Eastern (ET)', tz: 'America/New_York' },
  { label: 'India (IST)', tz: 'Asia/Kolkata' },
];
function tzShort(tz) {
  return (new Intl.DateTimeFormat('en-US', { timeZoneName: 'short', timeZone: tz })
    .formatToParts(new Date()).find(p => p.type === 'timeZoneName') || {}).value || tz;
}
function buildRows(tz) {
  return L.timetable.schedule.map(c => {
    const when = nextOccurrence(c.day, c.utc);
    return {
      ...c, when,
      dayLabel: new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(when),
      timeLabel: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(when),
    };
  }).sort((a, b) => a.when - b.when);
}
// Detected zone if we offer it, else default to Eastern (US).
function defaultZone() {
  const d = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return ZONES.some(z => z.tz === d) ? d : 'America/New_York';
}

// SEO + JSON-LD (Organization + Product + FAQPage), injected client-side.
function useSEO(reviewAgg) {
  useEffect(() => {
    document.title = 'Live Online Fitness Classes for Women | Unifitz';
    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'HealthClub', 'LocalBusiness'],
          name: 'Unifitz', url: BUSINESS.url, email: BUSINESS.email,
          areaServed: 'United States', sameAs: Object.values(BUSINESS.socials),
          ...(reviewAgg?.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviewAgg.avg, reviewCount: reviewAgg.count } } : {}),
        },
        {
          '@type': 'Product', name: 'Unifitz Membership',
          description: 'Live, instructor-led online fitness classes for women — Zumba, Yoga, Strength & Meditation in small cohorts.',
          brand: { '@type': 'Brand', name: 'Unifitz' },
          offers: L.pricing.primary.map(p => ({ '@type': 'Offer', name: p.name, price: p.monthly, priceCurrency: 'USD', availability: 'https://schema.org/InStock' })),
        },
        { '@type': 'FAQPage', mainEntity: L.faq.items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      ],
    };
    let s = document.getElementById('uf-jsonld');
    if (!s) { s = document.createElement('script'); s.id = 'uf-jsonld'; s.type = 'application/ld+json'; document.head.appendChild(s); }
    s.textContent = JSON.stringify(ld);
  }, [reviewAgg]);
}

export default function Landing() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const detectedTz = useMemo(() => defaultZone(), []);

  useEffect(() => {
    captureUtm();
    track('timezone_detected', { tz: detectedTz });
    supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setTestimonials(data ?? []));
    supabase.from('reviews').select('name, rating, text, created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(9).then(({ data }) => setReviews(data ?? []));
  }, [detectedTz]);

  // scroll: condense nav + fire 50/90 depth once.
  useEffect(() => {
    const hit = { 50: false, 90: false };
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const p = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      for (const d of [50, 90]) if (!hit[d] && p >= d) { hit[d] = true; track(`scroll_${d}`); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const reviewAgg = useMemo(() => {
    if (!reviews.length) return { avg: null, count: 0 };
    return { avg: +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1), count: reviews.length };
  }, [reviews]);
  useSEO(reviewAgg);

  const clickCta = (location, extra = {}) => track('cta_click', { location, market: MARKET, ...extra });

  return (
    <MotionConfig reducedMotion="user">
      <div className="uf min-h-screen">
        {/* ── Nav ── */}
        <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'border-b' : ''}`}
          style={{ background: scrolled ? 'rgba(250,247,242,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(8px)' : 'none', borderColor: 'var(--line)' }}>
          <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-8 h-16">
            <a href="#top" className="uf-serif text-2xl font-semibold" style={{ color: 'var(--ink)' }}>Unifitz</a>
            <ul className="hidden lg:flex items-center gap-8">
              {L.nav.links.map(l => <li key={l.href}><a href={l.href} className="text-[0.95rem] font-medium uf-ink-soft hover:text-[var(--clay)]">{l.label}</a></li>)}
            </ul>
            <div className="flex items-center gap-3">
              <Link to="/auth" className="hidden sm:inline text-[0.95rem] font-medium uf-ink-soft hover:text-[var(--clay)]">Login</Link>
              <a href="#pricing" onClick={() => clickCta('nav')} className="uf-btn uf-btn--primary !py-2.5 !px-5 text-[0.95rem]">{L.nav.cta}</a>
              <button className="lg:hidden p-2.5 rounded-lg" style={{ border: '1px solid var(--line)' }} onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
          {open && (
            <div className="lg:hidden px-5 py-3 flex flex-col" style={{ borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
              {L.nav.links.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-1 py-3 font-medium">{l.label}</a>)}
              <Link to="/auth" className="px-1 py-3 font-medium">Login</Link>
            </div>
          )}
        </header>

        <main id="top">
          {/* ── Hero (Direction A — accountability) ── */}
          <section className="max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-14 grid lg:grid-cols-[1.08fr_.92fr] gap-10 lg:gap-14 lg:items-center">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.p variants={rise} className="uf-eyebrow">{L.hero.eyebrow}</motion.p>
              <motion.h1 variants={rise} className="uf-h1 mt-4">{L.hero.h1}</motion.h1>
              <motion.p variants={rise} className="uf-lead mt-5 uf-measure">{L.hero.sub}</motion.p>
              <motion.div variants={rise} className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href={L.hero.primaryHref} onClick={() => clickCta('hero')} className="uf-btn uf-btn--primary">{PRIMARY} <ArrowRight className="w-4.5 h-4.5" /></a>
                <a href={L.hero.scheduleHref} onClick={() => clickCta('hero_schedule')} className="uf-btn uf-btn--ghost">{L.hero.scheduleCta}</a>
              </motion.div>
              <motion.p variants={rise} className="mt-5 text-[0.9rem] uf-ink-soft flex items-center gap-2"><Radio className="w-4 h-4" style={{ color: 'var(--clay)' }} /> {L.hero.microProof}</motion.p>
            </motion.div>

            {/* Hero visual: real class-in-progress frame (TODO:ASSET) */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <div className="uf-card overflow-hidden">
                <div className="aspect-[4/3] grid place-items-center text-center" style={{ background: 'var(--cream-3)' }}>
                  <PhotoInner src={L.hero.img} alt="Live Unifitz class in progress" caption="Class-in-progress frame" hint="women 30–50, live on Zoom" />
                </div>
                <div className="flex items-center gap-3 p-4" style={{ borderTop: '1px solid var(--line)' }}>
                  <span className="inline-flex items-center gap-1.5 uf-tag" style={{ color: '#8B2F2F', background: '#F3E0DA' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C0392B' }} /> Live now</span>
                  <span className="text-[0.9rem] uf-ink-soft">Small cohorts · cameras optional · your instructor knows your name</span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ── Timetable strip (the differentiator) ── */}
          <TimetableStrip initialTz={detectedTz} clickCta={clickCta} />

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

          {/* ── In-action gallery (trust images) ── */}
          <Band>
            <Head eyebrow={L.gallery.eyebrow} heading={L.gallery.heading} />
            <p className="mt-3 text-[0.9rem] uf-ink-soft">{L.gallery.note}</p>
            <div className="grid gap-5 sm:grid-cols-3 mt-8">
              {L.gallery.photos.map((ph, i) => (
                <figure key={i} className="uf-photo aspect-[4/5]">
                  <PhotoInner src={ph.img} alt={ph.cap} caption={ph.cap} />
                </figure>
              ))}
            </div>
          </Band>

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

          {/* ── Instructors (highest-leverage trust) ── */}
          <Band id="instructors">
            <Head eyebrow={L.instructors.eyebrow} heading={L.instructors.heading} />
            <p className="mt-3 text-[0.9rem] uf-ink-soft">{L.instructors.note}</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-8">
              {L.instructors.items.map((t, i) => (
                <div key={i} className="uf-card p-6">
                  <div className="uf-photo aspect-square">
                    <PhotoInner src={t.img} alt={t.name} />
                  </div>
                  <p className="mt-4 uf-serif" style={{ fontSize: '1.15rem' }}>{t.name}</p>
                  <p className="text-[0.85rem] uf-ink-soft">{t.cred} · {t.years}</p>
                  <p className="mt-2 text-[0.85rem] font-semibold" style={{ color: 'var(--clay)' }}>{t.focus}</p>
                </div>
              ))}
            </div>
          </Band>

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
          </Band>

          {/* ── Proof ── */}
          <Band id="proof">
            <Head eyebrow={L.proof.eyebrow} heading={L.proof.heading} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
              {(testimonials.length ? testimonials.map(t => ({ quote: t.quote, name: t.name, city: t.location, result: t.result }))
                : reviews.length ? reviews.map(r => ({ quote: r.text, name: r.name, city: '', result: '' }))
                : L.proof.placeholders).map((p, i) => (
                <figure key={i} className="uf-card p-6 flex flex-col">
                  <Quote className="w-6 h-6" style={{ color: 'var(--clay)', opacity: 0.4 }} />
                  {p.result ? <span className="mt-3 uf-tag">{p.result}</span> : null}
                  <blockquote className="mt-3 flex-1" style={{ color: 'var(--ink)' }}>{p.quote}</blockquote>
                  <figcaption className="mt-5 pt-4 text-[0.9rem] font-semibold" style={{ borderTop: '1px solid var(--line)' }}>
                    {p.name}{p.city ? <span className="uf-ink-soft font-normal"> · {p.city}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Band>

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
            <p className="mt-6 text-[0.9rem] uf-ink-soft">{L.pricing.refund}</p>
          </Band>

          {/* ── FAQ ── */}
          <Band>
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
              <div id="inquiry"><InquiryForm clickCta={clickCta} /></div>
            </div>
          </Band>

          {/* ── Final CTA ── */}
          <Band dark>
            <div className="text-center max-w-3xl mx-auto">
              <p className="uf-eyebrow" style={{ color: 'rgba(255,255,255,0.9)' }}>{L.finalCta.eyebrow}</p>
              <h2 className="uf-h2 mt-3" style={{ color: '#FFFFFF' }}>{L.finalCta.heading}</h2>
              <p className="mt-4 uf-lead mx-auto" style={{ color: 'rgba(255,255,255,0.92)' }}>{L.finalCta.sub}</p>
              <a href={L.finalCta.href} onClick={() => clickCta('final')} className="uf-btn uf-btn--primary mt-8">{PRIMARY} <ArrowRight className="w-4.5 h-4.5" /></a>
              <p className="mt-4 text-[0.9rem]" style={{ color: 'rgba(255,255,255,0.8)' }}>{L.finalCta.riskReversal}</p>
            </div>
          </Band>
        </main>

        {/* ── Footer ── */}
        <footer style={{ background: '#1E1710', color: '#CDBFAD' }}>
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 grid gap-10 md:grid-cols-3" style={{ color: '#CDBFAD' }}>
            <div>
              <p className="uf-serif text-2xl" style={{ color: '#FBF6EE' }}>Unifitz</p>
              <p className="mt-4 text-[0.95rem] max-w-xs" style={{ lineHeight: 1.6 }}>{L.footer.tagline}</p>
              <div className="mt-5 flex gap-3">
                {[[Instagram, BUSINESS.socials.instagram, 'Instagram'], [Facebook, BUSINESS.socials.facebook, 'Facebook'], [Youtube, BUSINESS.socials.youtube, 'YouTube']].map(([Icon, href, label]) => (
                  <a key={label} href={href} aria-label={label} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}><Icon className="w-4 h-4" /></a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[0.8rem] font-bold uppercase tracking-wider mb-4" style={{ color: '#FBF6EE' }}>{L.footer.explore}</h4>
              <ul className="space-y-2.5 text-[0.95rem]">
                {L.nav.links.map(l => <li key={l.href}><a href={l.href} className="hover:text-white">{l.label}</a></li>)}
                <li><Link to="/auth" className="hover:text-white">Login / Sign up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.8rem] font-bold uppercase tracking-wider mb-4" style={{ color: '#FBF6EE' }}>Get in touch</h4>
              <ul className="space-y-2.5 text-[0.95rem]">
                <li><a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="w-4 h-4" /> {BUSINESS.email}</a></li>
                <li><a href={waLink()} onClick={() => track('whatsapp_click', { location: 'footer' })} className="flex items-center gap-2 hover:text-white"><MessageCircle className="w-4 h-4" /> Message us</a></li>
                <li className="text-[0.85rem]" style={{ color: '#9C8E79' }}>{L.footer.tzNote}</li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="max-w-6xl mx-auto px-5 md:px-8 py-5 text-[0.8rem]" style={{ color: '#8A7C67' }}>© 2026 Unifitz. Live online fitness for women.</p>
          </div>
        </footer>

        {/* Sticky mobile CTA (after hero) + WhatsApp */}
        {scrolled && (
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-3" style={{ background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid var(--line)' }}>
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

function Head({ eyebrow, heading, lead, onDark }) {
  return (
    <div>
      <p className="uf-eyebrow" style={onDark ? { color: '#E8A87C' } : undefined}>{eyebrow}</p>
      <h2 className="uf-h2 mt-3" style={onDark ? { color: '#FBF6EE' } : undefined}>{heading}</h2>
      {lead && <p className="mt-4 uf-lead uf-measure">{lead}</p>}
    </div>
  );
}

function TimetableStrip({ initialTz, clickCta }) {
  const ref = useRef(null);
  const seen = useRef(false);
  const [tz, setTz] = useState(initialTz);
  const rows = useMemo(() => buildRows(tz), [tz]);
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
          <label className="shrink-0 flex items-center gap-2 uf-chip !py-2 cursor-pointer">
            <Clock className="w-4 h-4" style={{ color: 'var(--clay)' }} />
            <span className="sr-only">{L.timetable.tzLabel}</span>
            <select value={tz} onChange={e => { setTz(e.target.value); track('timezone_changed', { tz: e.target.value }); }}
              className="bg-transparent font-semibold text-[0.9rem] outline-none cursor-pointer" style={{ color: 'var(--ink)' }} aria-label={L.timetable.tzLabel}>
              {ZONES.map(z => <option key={z.tz} value={z.tz}>{z.label}</option>)}
            </select>
          </label>
        </div>

        <div className="uf-scroll-x mt-8 -mx-5 px-5 md:mx-0 md:px-0">
          <div className="grid gap-3 min-w-[640px] md:min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
            {rows.map((c, i) => {
              const Icon = FORMAT_ICON[c.format] || Music;
              return (
                <div key={i} className="uf-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid place-items-center w-9 h-9 rounded-full" style={{ background: 'var(--clay-tint)', color: 'var(--clay-deep)' }}><Icon className="w-4.5 h-4.5" /></span>
                    <span className="text-[0.8rem] font-bold uppercase tracking-wide uf-tabular" style={{ color: 'var(--clay)' }}>{c.dayLabel}</span>
                  </div>
                  <p className="mt-3 font-semibold" style={{ fontSize: '1.05rem' }}>{c.title}</p>
                  <p className="text-[0.9rem] uf-ink-soft">with {c.coach}</p>
                  <p className="mt-3 text-[0.95rem] font-bold uf-tabular">{c.timeLabel} <span className="uf-ink-soft font-normal">· {c.dur} min</span></p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <a href={L.timetable.ctaHref} onClick={() => clickCta('timetable')} className="uf-btn uf-btn--primary">{PRIMARY} <ArrowRight className="w-4.5 h-4.5" /></a>
        </div>
      </div>
    </section>
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
  const selectPlan = (name) => { track('plan_select', { plan: name, market: MARKET, billing }); track('checkout_start', { plan: name, market: MARKET, billing }); clickCta('pricing', { plan: name }); };

  return (
    <section id="pricing">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Head eyebrow={p.eyebrow} heading={p.heading} lead={p.sub} />

        {/* billing toggle */}
        <div className="mt-8 inline-flex p-1 rounded-full" style={{ background: 'var(--cream-2)', border: '1px solid var(--line)' }} role="tablist" aria-label="Billing period">
          {p.billing.map(opt => (
            <button key={opt.key} role="tab" aria-selected={billing === opt.key}
              onClick={() => { setBilling(opt.key); track('billing_toggle', { billing: opt.key, market: MARKET }); }}
              className="px-5 py-2.5 rounded-full text-[0.95rem] font-bold flex items-center gap-2"
              style={billing === opt.key ? { background: 'var(--go)', color: '#FCF9F4' } : { color: 'var(--ink-soft)' }}>
              {opt.label}{opt.save && <span className="text-[0.7rem]" style={{ color: billing === opt.key ? '#CDE9DF' : 'var(--go)' }}>{opt.save}</span>}
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
                {anchor && <span className="uf-tag self-start mb-3">Most popular</span>}
                <h3 className="uf-serif" style={{ fontSize: '1.35rem' }}>{plan.name}</h3>
                <p className="mt-1 text-[0.95rem] uf-ink-soft">{plan.tagline}</p>
                <p className="mt-4 uf-serif uf-tabular" style={{ fontSize: '2.4rem', lineHeight: 1 }}>
                  {p.currency ?? '$'}{pr.total}<span className="text-[0.9rem] uf-ink-soft"> {b.months === 1 ? '/mo' : '/quarter'}</span>
                </p>
                <p className="mt-1 h-5 text-[0.85rem]" style={{ color: 'var(--go)' }}>{b.months > 1 ? `$${pr.perMo}/mo, billed quarterly` : ''}</p>
                <ul className="mt-5 space-y-2.5 text-[0.95rem] flex-1">
                  {plan.feats.map(f => <li key={f} className="flex items-start gap-2"><Check className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--go)' }} /> {f}</li>)}
                </ul>
                <a href={`/auth?plan=${encodeURIComponent(plan.name)}`} onClick={() => selectPlan(plan.name)}
                  className={`uf-btn uf-btn--full mt-6 ${anchor ? 'uf-btn--primary' : 'uf-btn--ghost'}`}>
                  {anchor ? L.pricing.anchorCta : L.pricing.primaryCta}
                </a>
              </div>
            );
          })}
        </div>

        <button onClick={() => setShowMore(v => !v)} className="mt-6 inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--clay)' }} aria-expanded={showMore}>
          {showMore ? p.moreCollapse : p.moreToggle} <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>

        {showMore && (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr] items-start">
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
                    <a href={`/auth?plan=${encodeURIComponent(m.name)}`} onClick={() => selectPlan(m.name)} className="uf-btn uf-btn--ghost uf-btn--full mt-4 !py-2.5 text-[0.95rem]">{L.pricing.primaryCta}</a>
                  </div>
                );
              })}
            </div>
            {/* Founding member — real scarcity, no fake countdown */}
            <div className="rounded-[22px] p-7" style={{ background: 'var(--cream-2)', border: '1.5px solid var(--clay)' }}>
              <span className="uf-tag">{p.founding.name}</span>
              <p className="mt-4 uf-serif uf-tabular" style={{ fontSize: '2.2rem', lineHeight: 1 }}>${p.founding.price}<span className="text-[0.9rem] uf-ink-soft">{p.founding.unit}</span></p>
              <p className="mt-2 text-[0.85rem] font-semibold" style={{ color: 'var(--clay)' }}>{p.founding.scarcity}</p>
              <ul className="mt-4 space-y-2 text-[0.95rem]">
                {p.founding.perks.map(k => <li key={k} className="flex items-start gap-2"><Check className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--go)' }} /> {k}</li>)}
              </ul>
              <a href={`/auth?plan=${encodeURIComponent(p.founding.name)}`} onClick={() => selectPlan(p.founding.name)} className="uf-btn uf-btn--primary uf-btn--full mt-5">{L.pricing.primaryCta}</a>
            </div>
          </div>
        )}
        <p className="mt-8 text-[0.9rem] uf-ink-soft">{p.refund}</p>
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
          <button className="w-full flex items-center justify-between gap-4 py-5 text-left"
            onClick={() => { const next = open === i ? -1 : i; setOpen(next); if (next === i) track('faq_open', { question: f.q }); }} aria-expanded={open === i}>
            <span className="font-semibold" style={{ fontSize: '1.05rem' }}>{f.q}</span>
            <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} style={{ color: 'var(--clay)' }} />
          </button>
          {open === i && <p className="pb-5 uf-ink-soft uf-measure">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

function InquiryForm({ clickCta }) {
  const [f, setF] = useState({ name: '', phone: '', goal: GOALS[0], consent: true });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const digits = f.phone.replace(/\D/g, '');
    if (digits.length < 10) return setErr('Enter a valid phone number');
    setBusy(true);
    let utm = {};
    try { utm = JSON.parse(sessionStorage.getItem('uf_utm') || '{}'); } catch { utm = {}; }
    const { error } = await supabase.from('leads').insert({
      name: f.name.trim(), whatsapp: f.phone.trim(), goal: f.goal, consent: f.consent,
      source: `masterclass${utm.utm_source ? ':' + utm.utm_source : ''}`,
    });
    setBusy(false);
    if (error) return setErr(error.message);
    clickCta('masterclass_submit');
    track('checkout_start', { plan: 'masterclass', market: MARKET });
    setDone(true);
  }

  if (done) return (
    <div className="uf-card p-7 text-center">
      <Check className="w-9 h-9 mx-auto" style={{ color: 'var(--go)' }} />
      <p className="mt-3 uf-serif" style={{ fontSize: '1.25rem' }}>You’re on the list.</p>
      <p className="mt-1 uf-ink-soft text-[0.95rem]">We’ll send your seat details shortly.</p>
      <a href={waLink('Hi Unifitz! I’d like a free masterclass seat.')} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { location: 'masterclass_done' })} className="uf-btn uf-btn--ghost mt-4">Message us <ArrowUpRight className="w-4 h-4" /></a>
    </div>
  );

  return (
    <form onSubmit={submit} className="uf-card p-6 flex flex-col gap-4">
      <div>
        <label htmlFor="iq-name" className="uf-label">Your name</label>
        <input id="iq-name" required className="uf-input" placeholder="e.g. Ananya" value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="iq-phone" className="uf-label">Phone</label>
        <input id="iq-phone" required type="tel" inputMode="tel" className="uf-input" placeholder="(555) 123-4567" value={f.phone} onChange={e => setF(x => ({ ...x, phone: e.target.value }))} autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="iq-goal" className="uf-label">What are you working on?</label>
        <select id="iq-goal" className="uf-input" value={f.goal} onChange={e => setF(x => ({ ...x, goal: e.target.value }))}>
          {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <label className="flex items-start gap-2 text-[0.85rem] uf-ink-soft">
        <input type="checkbox" checked={f.consent} onChange={e => setF(x => ({ ...x, consent: e.target.checked }))} className="mt-1" style={{ accentColor: 'var(--go)' }} />
        I agree to be contacted about my seat.
      </label>
      {err && <p className="text-[0.9rem]" style={{ color: '#B23B3B' }} role="alert">{err}</p>}
      <button type="submit" disabled={busy} className="uf-btn uf-btn--primary uf-btn--full">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} {L.masterclass.cta}
      </button>
      <p className="text-center text-[0.8rem] uf-ink-soft">No card required</p>
    </form>
  );
}
