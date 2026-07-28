import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig, useInView } from 'framer-motion';
import {
  Dumbbell, Menu, X, Music, Flower2, Brain, BicepsFlexed, Video, LineChart,
  Trophy, ArrowRight, Star, Instagram, Facebook, Youtube,
  Mail, Phone, CheckCircle2, Loader2, MapPin, ChevronDown, Heart,
  Salad, PlayCircle, FileDown, MessageCircle, Medal, Zap, Target, ShieldCheck,
  Sparkles, Clock, Quote, Calendar, Globe, Radio,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BUSINESS, waLink } from '../config';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

const NAV = [
  { label: 'Programs', href: '#programs' },
  { label: 'Membership', href: '#membership' },
  { label: 'Diet', href: '#diet' },
  { label: 'Results', href: '#results' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const PROGRAMS = [
  { icon: Music, name: 'Zumba', benefit: 'Dance-cardio that never feels like a workout.', timing: 'Mon · Wed · Fri' },
  { icon: Flower2, name: 'Yoga', benefit: 'Flexibility, calm and deeper sleep, at your pace.', timing: 'Tue · Thu · Sat' },
  { icon: Brain, name: 'Meditation', benefit: 'Melt the day’s stress in 15 guided minutes.', timing: 'Daily' },
  { icon: BicepsFlexed, name: 'Strength', benefit: 'Build real, visible strength from your living room.', timing: 'Mon · Wed · Fri' },
  { icon: Dumbbell, name: 'Weight Training', benefit: 'Progressive dumbbell programs that actually work.', timing: 'Tue · Thu · Sat' },
];

// Live-schedule teaser for the hero (US coaches / times).
const SCHEDULE = [
  { time: '6:00 AM ET', name: 'Yoga Flow', coach: 'Sana', live: false },
  { time: '12:30 PM ET', name: 'Zumba Burn', coach: 'Priya', live: true },
  { time: '6:00 PM ET', name: 'Strength 101', coach: 'Mia', live: false },
];

const MEMBERSHIP = [
  { icon: Video, title: 'Live daily classes', desc: 'Real coaches, real time — across US time zones.' },
  { icon: PlayCircle, title: 'Every class recorded', desc: 'Miss it live? Catch the replay on your schedule.' },
  { icon: Heart, title: 'Women-only community', desc: 'A supportive space built for women, zero judgement.' },
  { icon: LineChart, title: 'Progress tracking', desc: 'Weight, measurements and weekly charts that keep you honest.' },
  { icon: Salad, title: 'Custom diet plans', desc: 'Weekly meal plans built around your body and goals.' },
  { icon: Trophy, title: '54 badges to earn', desc: 'Streaks and milestones that make showing up stick.' },
];

const STEPS = [
  { icon: Sparkles, title: 'Pick your plan', desc: 'Start with the 1-week trial or jump straight into a membership.' },
  { icon: Video, title: 'Join live on Zoom', desc: 'Real coach, real class — keep your camera off if you like.' },
  { icon: Salad, title: 'Get your custom plan', desc: 'Complete plans include a weekly diet built around your goals.' },
  { icon: Trophy, title: 'Track, streak, earn badges', desc: 'Daily check-ins and 54 badges keep you coming back.' },
];

const WHY = [
  { icon: Heart, title: 'Women-only, always', desc: 'Every class, every coach. A space with zero judgement.' },
  { icon: Globe, title: 'On US time', desc: 'Morning, midday and evening slots across ET, CT, MT & PT.' },
  { icon: Salad, title: 'Diet that fits real life', desc: 'Simple, flexible weekly meal plans — no crash diets.' },
  { icon: LineChart, title: 'Progress you can see', desc: 'Weekly charts and check-ins that prove it’s working.' },
  { icon: Trophy, title: '54-badge motivation', desc: 'Small wins, collected — showing up gets rewarded.' },
  { icon: ShieldCheck, title: 'Cancel anytime', desc: 'No lock-in, no contracts. Stay because you love it.' },
];

const BADGE_ICONS = [Star, Trophy, Heart, Zap, Target, Medal, Video, LineChart, Dumbbell, Music, Flower2];

// The 5 headline plans (from the full rate card). Others are specialized add-ons.
const PLANS = [
  {
    name: 'Trial', tagline: 'A one-week taste of live classes.', trial: true,
    monthly: 19, quarterly: null, annual: null,
    feats: ['3 live classes / week', 'Group community access', 'Class recordings'],
  },
  {
    name: 'Starter', tagline: 'Build the habit, 3 days a week.',
    monthly: 39, quarterly: 105, annual: 375,
    feats: ['3 live classes / week', 'Basic progress log', 'Class recordings'],
  },
  {
    name: 'Regular', tagline: 'Show up 5 days a week.',
    monthly: 59, quarterly: 155, annual: 565,
    feats: ['5 live classes / week', 'Basic progress log', 'Class recordings'],
  },
  {
    name: 'Complete', tagline: 'Classes + diet + coaching.', featured: true,
    monthly: 89, quarterly: 239, annual: 799,
    feats: ['5 live classes / week', 'Weekly custom diet plan', 'Full progress dashboard', '1 coaching call / month (20 min)'],
  },
  {
    name: '1:1 Personal Coaching', tagline: 'Private, ongoing, all-in.',
    monthly: 229, quarterly: 609, annual: null,
    feats: ['3 private sessions / week', 'Weekly custom diet plan', 'Full dashboard', 'Ongoing unlimited messaging'],
  },
];

const ADDONS = [
  { name: 'Starter + Diet', price: 39 },
  { name: 'PCOS / PCOD Care', price: 109 },
  { name: 'Weight-Loss Intensive', price: 109 },
  { name: 'Couple Fitness', price: 139 },
];

const BILLING = [
  { key: 'monthly', label: 'Monthly', per: '/mo', months: 1, save: null },
  { key: 'quarterly', label: 'Quarterly', per: '/qtr', months: 3, save: 'Save 12%' },
  { key: 'annual', label: 'Annual', per: '/yr', months: 12, save: 'Save 20%' },
];

const FAQS = [
  { q: 'Do you offer a free trial?', a: 'We keep it low-risk instead: a $19 one-week trial with full access to live classes, so you can feel the fit before committing to a membership.' },
  { q: 'I’m a complete beginner. Will I keep up?', a: 'That’s exactly who we built this for. Coaches give a beginner variation for every move, and nobody is watching you struggle — it’s your living room, on your terms.' },
  { q: 'What time zones are classes in?', a: 'Classes run morning, midday and evening across ET, CT, MT and PT, so there’s always a slot that fits your day, wherever you are in the US.' },
  { q: 'Do I have to turn my camera on?', a: 'Never. Many members keep their camera off for weeks. Coaches guide by voice; you switch it on only when you’re comfortable.' },
  { q: 'Do I need any equipment?', a: 'No. Every class has a no-equipment option. A mat and floor space is plenty — water bottles double as light weights on day one.' },
  { q: 'How does billing work?', a: 'Choose monthly, quarterly (save 12%) or annual (save 20%). You’re billed upfront for the period you pick, and you can cancel anytime — no contracts.' },
  { q: 'What’s in the custom diet plan?', a: 'Complete and 1:1 plans include a weekly meal plan built around your goal, calories and preferences, with recipes and macros. Download it as a PDF anytime.' },
  { q: 'Can I switch plans or cancel?', a: 'Yes — upgrade, downgrade or cancel whenever you like from your dashboard. Changes take effect at your next billing date.' },
];

const GOALS = ['Lose weight', 'Get fit & toned', 'Build strength', 'Reduce stress', 'PCOS / PCOD support', 'Not sure yet'];

// Inject SEO <head> tags + JSON-LD (client-side; fine for most crawlers/social).
function useSEO(reviewAgg) {
  useEffect(() => {
    document.title = 'Live Online Fitness Classes for Women in the USA | Unifitz';
    const set = (sel, val) => {
      let el = document.head.querySelector(sel);
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      const [a, v] = sel.includes('property') ? ['property', sel.match(/"(.*?)"/)[1]] : ['name', sel.match(/"(.*?)"/)[1]];
      el.setAttribute(a, v); el.setAttribute('content', val);
    };
    const desc = 'Live online Zumba, Yoga, Meditation, Strength & Weight Training for women across the USA. Coaches on your time zone, custom weekly diet plans and progress tracking. Start with a $19 one-week trial.';
    set('meta[name="description"]', desc);
    set('meta[property="og:title"]', 'Unifitz — Live Online Fitness for Women · USA');
    set('meta[property="og:description"]', desc);
    set('meta[property="og:type"]', 'website');
    set('meta[property="og:url"]', BUSINESS.url);
    set('meta[property="og:image"]', `${BUSINESS.url}/og-image.jpg`);
    set('meta[name="twitter:card"]', 'summary_large_image');
    set('meta[name="twitter:title"]', 'Unifitz — Live Online Fitness for Women · USA');
    set('meta[name="twitter:description"]', desc);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = BUSINESS.url;

    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'HealthClub', 'LocalBusiness'],
          name: BUSINESS.name, url: BUSINESS.url,
          telephone: BUSINESS.phoneDisplay, email: BUSINESS.email,
          areaServed: 'United States',
          sameAs: Object.values(BUSINESS.socials),
          ...(reviewAgg?.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviewAgg.avg, reviewCount: reviewAgg.count } } : {}),
        },
        { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      ],
    };
    let script = document.getElementById('uf-jsonld');
    if (!script) { script = document.createElement('script'); script.id = 'uf-jsonld'; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(ld);
  }, [reviewAgg]);
}

// Count-up that fires once on scroll-into-view; respects reduced motion.
function CountUp({ end, suffix = '', decimals = 0, duration = 1400 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVal(end); return; }
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      setVal(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);
  return <span ref={ref} className="tabular-nums">{val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Landing() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [testimonials, setTestimonials] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setTestimonials(data ?? []));
    supabase.from('reviews').select('name, rating, text, created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => setReviews(data ?? []));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const reviewAgg = useMemo(() => {
    if (!reviews.length) return { avg: 4.9, count: 0 };
    const avg = +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    return { avg, count: reviews.length };
  }, [reviews]);

  useSEO(reviewAgg);

  const bill = BILLING.find(b => b.key === billing);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-slate-800 pb-24 lg:pb-0 selection:bg-brand-200 selection:text-brand-900">
        {/* ── Sticky header ── */}
        <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent'}`}>
          <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 h-16">
            <a href="#top" className="flex items-center gap-2 font-display text-2xl font-extrabold uppercase tracking-wide text-slate-900">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-brand-600 text-white"><Dumbbell className="w-4.5 h-4.5" /></span>
              Uni<span className="text-brand-500">fitz</span>
            </a>
            <ul className="hidden lg:flex items-center gap-7">
              {NAV.map(l => <li key={l.href}><a href={l.href} className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors duration-200">{l.label}</a></li>)}
            </ul>
            <div className="flex items-center gap-2">
              <Link to="/auth" className="hidden sm:inline text-sm font-semibold text-slate-600 hover:text-brand-600 px-2">Login</Link>
              <a href="#pricing" className="btn-primary !py-2.5 text-sm">View Plans</a>
              <button className="lg:hidden p-2.5 rounded-lg border border-slate-200 bg-white" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
          {open && (
            <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col">
              {NAV.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-2 py-3 font-semibold text-slate-700">{l.label}</a>)}
              <Link to="/auth" className="px-2 py-3 font-semibold text-slate-700">Login</Link>
            </div>
          )}
        </header>

        <main id="top">
          {/* ── Hero ── */}
          <section className="relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50 via-white to-white" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:22px_22px]" />
            <div aria-hidden="true" className="absolute -top-32 -right-40 -z-10 w-[42rem] h-[42rem] rounded-full bg-gradient-to-br from-brand-300/40 to-rose-300/30 blur-3xl" />
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-16 grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-14 lg:items-center">
              <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="flex -space-x-2">{['A', 'J', 'M', 'K'].map(a => <span key={a} className="w-7 h-7 rounded-full bg-brand-100 border-2 border-white grid place-items-center text-[10px] font-bold text-brand-700">{a}</span>)}</div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                    <span className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</span>
                    {reviewAgg.avg} · loved by 800+ women
                  </span>
                </motion.div>
                <motion.h1 variants={fadeUp} className="mt-5 font-display font-extrabold uppercase leading-[0.9] tracking-tight text-[clamp(2.7rem,7.5vw,5.25rem)]">
                  Get stronger<br />every week — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-brand-500 to-rose-500">live, from home.</span>
                </motion.h1>
                <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-600 max-w-xl leading-relaxed">
                  Women-only live classes — Zumba, Yoga, Strength & more — with real coaches on your time zone,
                  a weekly custom diet plan and progress you can actually see.
                </motion.p>
                <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a href="#pricing" className="btn-primary text-base px-7 py-4 shadow-lg shadow-brand-500/25">Start your 1-week trial — $19 <ArrowRight className="w-4 h-4" /></a>
                  <a href="#programs" className="btn-secondary text-base px-7 py-4">See how it works</a>
                </motion.div>
                <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
                  <span className="flex items-center gap-1.5"><Video className="w-4 h-4 text-brand-500" /> Camera optional</span>
                  <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-brand-500" /> Women-only</span>
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-brand-500" /> All US time zones</span>
                </motion.div>
              </motion.div>

              {/* Hero visual — live schedule card */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="relative">
                <div className="relative rounded-[1.75rem] bg-white border border-slate-200 shadow-2xl shadow-brand-900/10 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900"><Calendar className="w-5 h-5 text-brand-500" /> Today’s live classes</div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full"><Radio className="w-3.5 h-3.5" /> Live now</span>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {SCHEDULE.map(s => (
                      <li key={s.name} className={`flex items-center gap-3 rounded-xl border p-3 ${s.live ? 'border-brand-300 bg-brand-50/60' : 'border-slate-100 bg-slate-50/60'}`}>
                        <span className="grid place-items-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-brand-600 text-white"><PlayCircle className="w-5 h-5" /></span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-500">with {s.coach}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-700 tabular-nums">{s.time}</p>
                          {s.live && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> LIVE</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <a href="#pricing" className="mt-4 btn-primary w-full py-3.5">Join a class this week <ArrowRight className="w-4 h-4" /></a>
                </div>
                {/* floating stat chip */}
                <div className="absolute -bottom-5 -left-4 hidden sm:flex bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-3 items-center gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600"><LineChart className="w-4.5 h-4.5" /></span>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Avg. −6 lbs<br /><span className="text-slate-400 font-medium">in the first 8 weeks</span></span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── Animated stat band ── */}
          <section className="bg-stone-900 text-white">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { end: 800, suffix: '+', label: 'Women training' },
                { end: 1200, suffix: '+', label: 'Live classes run' },
                { end: 54, suffix: '', label: 'Badges to earn' },
                { end: 4.9, suffix: '/5', label: 'Member rating', decimals: 1 },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-display text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-brand-500">
                    <CountUp end={s.end} suffix={s.suffix} decimals={s.decimals || 0} />
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-400">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Programs ── */}
          <Section id="programs" eyebrow="Four ways to move" title={<>Pick your energy. <span className="text-brand-500">Or mix all four.</span></>}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROGRAMS.map(p => (
                <motion.div key={p.name} variants={fadeUp} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <span className="inline-flex w-12 h-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-brand-600 group-hover:text-white transition-all duration-200"><p.icon className="w-5.5 h-5.5" /></span>
                  <h3 className="mt-4 font-display text-xl font-bold uppercase">{p.name}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{p.benefit}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wide"><Clock className="w-3.5 h-3.5" /> {p.timing}</p>
                </motion.div>
              ))}
              <a href="#pricing" className="grid place-items-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-600 text-white font-bold p-6 text-center hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-1 transition-all duration-200">
                <Sparkles className="w-7 h-7" aria-hidden="true" />
                Start your 1-week trial <ArrowRight className="w-4 h-4 inline" />
              </a>
            </motion.div>
          </Section>

          {/* ── Membership includes ── */}
          <section id="membership" className="relative bg-stone-900 text-white overflow-hidden">
            <div aria-hidden="true" className="absolute -bottom-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-brand-600/20 blur-3xl" />
            <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
              <p className="inline-flex items-center gap-2 bg-white/10 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide"><Sparkles className="w-3.5 h-3.5" /> Your membership</p>
              <h2 className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[clamp(2rem,6vw,3.75rem)] text-white">
                One membership.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-brand-500">Everything you need to stay on track.</span>
              </h2>
              <p className="mt-5 text-stone-300 max-w-2xl text-lg leading-relaxed">
                Live coaching, a plan for your plate and progress you can measure — all in one place, all on your time zone.
              </p>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MEMBERSHIP.map(f => (
                  <motion.div key={f.title} variants={fadeUp} className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/90 to-brand-600 text-white"><f.icon className="w-5 h-5" /></span>
                    <h3 className="mt-4 font-bold text-white">{f.title}</h3>
                    <p className="mt-1 text-sm text-stone-400 leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-10">
                <a href="#pricing" className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-brand-500/25 transition-colors duration-200">See plans & pricing <ArrowRight className="w-5 h-5" /></a>
              </div>
            </div>
          </section>

          {/* ── How it works ── */}
          <Section id="how" eyebrow="Getting started" title={<>From “someday” to your <span className="text-brand-500">first class this week.</span></>}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <motion.div key={s.title} variants={fadeUp} className="relative bg-white border border-slate-200 rounded-2xl p-6">
                  <span className="absolute -top-4 left-6 font-display text-6xl font-extrabold text-slate-100 select-none tabular-nums" aria-hidden="true">{i + 1}</span>
                  <span className="relative inline-flex w-11 h-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-brand-600 text-white"><s.icon className="w-5 h-5" /></span>
                  <h3 className="relative mt-4 font-display text-lg font-bold uppercase">{s.title}</h3>
                  <p className="relative mt-1.5 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </Section>

          {/* ── Diet planner spotlight ── */}
          <section id="diet" className="bg-gradient-to-b from-amber-50/60 to-white border-y border-amber-100">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:items-center">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
                <motion.p variants={fadeUp} className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide"><Salad className="w-3.5 h-3.5" /> Included with Complete & 1:1</motion.p>
                <motion.h2 variants={fadeUp} className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[clamp(2rem,6vw,3.5rem)]">
                  A weekly diet plan,<br /><span className="text-brand-500">built around your body.</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="mt-4 text-slate-600 text-lg leading-relaxed">Real, flexible meals you’ll actually eat — no crash diets, no guesswork.</motion.p>
                <motion.ul variants={fadeUp} className="mt-6 space-y-3">
                  {[
                    'Personal daily calorie target from your goal, age & activity',
                    'A meal-by-meal plan matched to your preferences',
                    'Recipes with macros for every single meal',
                    'One-tap PDF download to take anywhere',
                  ].map(x => (
                    <li key={x} className="flex items-start gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> {x}</li>
                  ))}
                </motion.ul>
                <motion.a variants={fadeUp} href="#pricing" className="btn-primary mt-8 text-base px-7 py-4">Get the Complete plan <ArrowRight className="w-4 h-4" /></motion.a>
              </motion.div>
              {/* Faux plan preview */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-brand-900/5 p-6 md:p-7 max-w-md w-full mx-auto" aria-hidden="true">
                <div className="flex items-center gap-5">
                  <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 -rotate-90">
                    <circle cx="38" cy="38" r="32" fill="none" stroke="#FEE9D6" strokeWidth="9" />
                    <circle cx="38" cy="38" r="32" fill="none" stroke="url(#g)" strokeWidth="9" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="52" />
                    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBBF24" /><stop offset="1" stopColor="#EA580C" /></linearGradient></defs>
                  </svg>
                  <div>
                    <p className="text-3xl font-extrabold tabular-nums text-slate-900">1,560</p>
                    <p className="text-sm text-slate-500 font-semibold">kcal · your daily target</p>
                  </div>
                </div>
                <div className="mt-5 divide-y divide-slate-100">
                  {[
                    ['Breakfast', 'Greek yogurt, berries & granola', '340'],
                    ['Lunch', 'Grilled chicken & quinoa bowl', '480'],
                    ['Snack', 'Protein shake + almonds', '220'],
                    ['Dinner', 'Salmon, sweet potato & greens', '520'],
                  ].map(([slot, dish, kcal]) => (
                    <div key={slot} className="flex items-center justify-between py-3 gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-500">{slot}</p>
                        <p className="text-sm font-semibold text-slate-800">{dish}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-500 tabular-nums whitespace-nowrap">{kcal} kcal</span>
                    </div>
                  ))}
                </div>
                <span className="mt-5 flex items-center justify-center gap-2 bg-stone-900 text-white font-bold text-sm py-3.5 rounded-xl"><FileDown className="w-4 h-4" /> Download plan as PDF</span>
              </motion.div>
            </div>
          </section>

          {/* ── Results / transformations (live from Supabase) ── */}
          <section id="results" className="bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-500">Real members</p>
              <h2 className="mt-2 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[clamp(2rem,6vw,3.5rem)]">Women who stopped<br /><span className="text-brand-500">waiting for Monday.</span></h2>
              {testimonials.length > 0 && (
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {testimonials.map(t => (
                    <motion.figure key={t.id} variants={fadeUp} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col">
                      <Quote className="w-7 h-7 text-brand-200" aria-hidden="true" />
                      {t.result && <span className="mt-3 inline-flex self-start items-center gap-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full"><LineChart className="w-3.5 h-3.5" /> {t.result}</span>}
                      <blockquote className="mt-3 text-slate-700 leading-relaxed flex-1">“{t.quote}”</blockquote>
                      <figcaption className="mt-5 pt-4 border-t border-slate-200 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-brand-600 text-white grid place-items-center font-bold text-sm">{t.name.charAt(0)}</span>
                        <span>
                          <span className="block font-bold text-slate-900 text-sm">{t.name}</span>
                          <span className="block text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</span>
                        </span>
                      </figcaption>
                    </motion.figure>
                  ))}
                </motion.div>
              )}
              {/* Badge wall */}
              <div className="mt-10 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white p-7 md:p-9">
                <p className="font-display text-2xl font-bold uppercase">54 badges to collect.</p>
                <p className="mt-1.5 text-stone-300 max-w-2xl">First class, 7-day streak, 30 check-ins — every milestone unlocks one. Because showing up deserves applause.</p>
                <div className="mt-6 flex flex-wrap gap-3" aria-hidden="true">
                  {BADGE_ICONS.map((Icon, i) => (
                    <span key={i} className="w-12 h-12 rounded-full bg-white/5 border-2 border-white/15 grid place-items-center hover:border-amber-400 hover:scale-110 hover:-rotate-6 transition-all duration-200">
                      <Icon className={`w-5 h-5 ${i % 3 === 0 ? 'text-brand-400' : i % 3 === 1 ? 'text-amber-400' : 'text-emerald-400'}`} />
                    </span>
                  ))}
                  <span className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-brand-600 text-white grid place-items-center text-xs font-extrabold">+43</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Why Unifitz ── */}
          <Section id="why" eyebrow="Why women choose us" title={<>Built for how you <span className="text-brand-500">actually live.</span></>}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHY.map(w => (
                <motion.div key={w.title} variants={fadeUp} className="flex gap-4 bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-200 hover:shadow-md transition-all duration-200">
                  <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><w.icon className="w-5 h-5" /></span>
                  <div><h3 className="font-bold text-base">{w.title}</h3><p className="mt-1 text-sm text-slate-600 leading-relaxed">{w.desc}</p></div>
                </motion.div>
              ))}
            </motion.div>
          </Section>

          {/* ── Pricing (billing toggle + horizontal scroll cards) ── */}
          <section id="pricing" className="bg-slate-50 border-y border-slate-100">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-500">Pricing</p>
                <h2 className="mt-2 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[clamp(2rem,6vw,3.5rem)]">
                  Choose your pace.<br /><span className="text-brand-500">Pay less the longer you commit.</span>
                </h2>
              </div>

              {/* Billing toggle */}
              <div className="mt-8 flex justify-center">
                <div className="grid grid-cols-3 gap-1 w-full max-w-sm sm:w-auto sm:inline-flex bg-white border border-slate-200 rounded-2xl sm:rounded-full p-1 shadow-sm" role="tablist" aria-label="Billing period">
                  {BILLING.map(b => (
                    <button key={b.key} role="tab" aria-selected={billing === b.key} onClick={() => setBilling(b.key)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-5 py-2 rounded-xl sm:rounded-full text-sm font-bold leading-tight transition-colors duration-200 ${billing === b.key ? 'bg-brand-500 text-white shadow' : 'text-slate-600 hover:text-brand-600'}`}>
                      <span>{b.label}</span>
                      {b.save && <span className={`text-[10px] font-extrabold ${billing === b.key ? 'text-amber-200' : 'text-emerald-600'}`}>{b.save}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable plan cards */}
              <div className="mt-10 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-5 pb-4 min-w-max md:min-w-0 md:justify-center">
                  {PLANS.map(p => <PlanCard key={p.name} plan={p} bill={bill} />)}
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400 md:hidden">← swipe to compare all plans →</p>

              {/* Specialized add-ons */}
              <div className="mt-12 rounded-2xl bg-white border border-slate-200 p-6 md:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold uppercase">Specialized plans</h3>
                    <p className="text-sm text-slate-600">Targeted programs available on request — same billing options apply.</p>
                  </div>
                  <a href="#join" className="btn-secondary shrink-0">Ask about these</a>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ADDONS.map(a => (
                    <div key={a.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-800">{a.name}</span>
                      <span className="text-sm font-bold text-brand-600 tabular-nums">from ${a.price}<span className="text-slate-400 font-medium">/mo</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Lead form ── */}
          <section id="join" className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-rose-600">
            <div aria-hidden="true" className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,white,transparent_40%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
            <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-10 lg:items-center">
              <div className="text-white">
                <p className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide"><MessageCircle className="w-3.5 h-3.5" /> Not sure which plan?</p>
                <h2 className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[clamp(2rem,6vw,3.5rem)] text-white">Talk to a coach.<br />Get matched in minutes.</h2>
                <p className="mt-4 text-white/90 text-lg leading-relaxed">Tell us your goal and we’ll recommend the right plan — and the best classes to start with. No pressure, no card required to ask.</p>
                <ul className="mt-6 space-y-2.5 text-white/90 font-medium">
                  {['A plan matched to your goal', 'The best classes to start with', 'A real coach on the other end'].map(x => (
                    <li key={x} className="flex items-center gap-2.5"><CheckCircle2 className="w-5 h-5 shrink-0" /> {x}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/95 backdrop-blur rounded-3xl p-2 shadow-2xl"><LeadForm /></div>
            </div>
          </section>

          {/* ── Reviews ── */}
          <Section id="reviews" eyebrow="What women say" title={<>Rated <span className="text-brand-500">{reviewAgg.avg}/5</span> by our members.</>}>
            <ReviewsBlock reviews={reviews} />
          </Section>

          {/* ── FAQ ── */}
          <section id="faq" className="bg-slate-50 border-y border-slate-100">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24">
              <p className="text-center text-sm font-bold uppercase tracking-[0.15em] text-brand-500">Questions</p>
              <h2 className="mt-2 text-center font-display font-extrabold uppercase tracking-tight leading-none text-[clamp(2rem,6vw,3rem)] mb-10">Asked before you asked.</h2>
              <FAQList />
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="relative overflow-hidden bg-stone-900">
            <div aria-hidden="true" className="absolute -top-24 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-brand-600/20 blur-3xl" />
            <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-20 text-center">
              <h2 className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[clamp(2rem,6vw,3.75rem)] text-white">Your strongest year<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-brand-500">starts with one class.</span></h2>
              <a href="#pricing" className="mt-8 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-9 py-4.5 rounded-xl text-lg shadow-lg shadow-brand-500/25 transition-colors duration-200">Start your $19 trial <ArrowRight className="w-5 h-5" /></a>
              <p className="mt-4 text-sm text-stone-400">Women-only · All US time zones · Cancel anytime.</p>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="bg-stone-950 text-stone-300">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 grid gap-10 md:grid-cols-3">
            <div>
              <span className="flex items-center gap-2 font-display text-2xl font-extrabold uppercase text-white">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-brand-600 text-white"><Dumbbell className="w-4.5 h-4.5" /></span> Unifitz
              </span>
              <p className="mt-4 text-sm max-w-xs leading-relaxed">Live online fitness for women across the USA. Zumba, Yoga, Meditation, Strength — with custom diet plans and coaching.</p>
              <div className="mt-5 flex gap-3">
                <a href={BUSINESS.socials.instagram} aria-label="Instagram" className="p-2.5 rounded-lg bg-white/5 hover:bg-brand-500 transition-colors duration-200"><Instagram className="w-4 h-4" /></a>
                <a href={BUSINESS.socials.facebook} aria-label="Facebook" className="p-2.5 rounded-lg bg-white/5 hover:bg-brand-500 transition-colors duration-200"><Facebook className="w-4 h-4" /></a>
                <a href={BUSINESS.socials.youtube} aria-label="YouTube" className="p-2.5 rounded-lg bg-white/5 hover:bg-brand-500 transition-colors duration-200"><Youtube className="w-4 h-4" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-white mb-4">Explore</h4>
              <ul className="space-y-2.5 text-sm">
                {NAV.map(l => <li key={l.href}><a href={l.href} className="hover:text-white transition-colors duration-200">{l.label}</a></li>)}
                <li><Link to="/auth" className="hover:text-white transition-colors duration-200">Login / Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-white mb-4">Get in touch</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-brand-500" /> Serving women across the USA</li>
                <li><a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="w-4 h-4 text-brand-500" /> {BUSINESS.email}</a></li>
                <li><a href={`tel:${BUSINESS.phoneDisplay}`} className="flex items-center gap-2 hover:text-white"><Phone className="w-4 h-4 text-brand-500" /> {BUSINESS.phoneDisplay}</a></li>
                <li><a href={waLink()} className="flex items-center gap-2 hover:text-white"><MessageCircle className="w-4 h-4 text-brand-500" /> Message us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10"><p className="max-w-6xl mx-auto px-4 md:px-6 py-5 text-xs text-stone-500">© 2026 Unifitz. Live online fitness for women.</p></div>
        </footer>

        {/* Sticky mobile CTA + floating WhatsApp */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 p-3">
          <a href="#pricing" className="btn-primary w-full py-3.5">Start your $19 trial <ArrowRight className="w-4 h-4" /></a>
        </div>
        <FloatingWhatsApp />
      </div>
    </MotionConfig>
  );
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-10">
        {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-500">{eyebrow}</p>}
        <h2 className="mt-2 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[clamp(2rem,6vw,3.5rem)]">{title}</h2>
      </motion.div>
      {children}
    </section>
  );
}

function PlanCard({ plan, bill }) {
  const { featured, trial } = plan;
  // Resolve the price for the selected billing period.
  let big, per, effective = null, unavailable = false;
  if (trial) {
    big = '$19'; per = 'one week';
  } else {
    const val = plan[bill.key];
    if (val == null) { big = 'Contact'; per = 'us'; unavailable = true; }
    else {
      big = `$${val.toLocaleString('en-US')}`;
      per = bill.per;
      if (bill.months > 1) effective = `≈ $${Math.round(val / bill.months)}/mo`;
    }
  }
  return (
    <div className={`snap-start shrink-0 w-[270px] md:w-auto md:flex-1 md:max-w-[240px] rounded-3xl p-6 flex flex-col bg-white ${featured ? 'border-2 border-brand-500 shadow-xl shadow-brand-500/10 md:-translate-y-2' : 'border border-slate-200'}`}>
      <div className="flex items-center justify-between min-h-[24px]">
        <h3 className="font-display text-lg font-bold uppercase leading-tight">{plan.name}</h3>
        {featured && <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full bg-brand-500 text-white">Popular</span>}
        {trial && <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Try it</span>}
      </div>
      <p className="mt-1 text-sm text-slate-500 min-h-[40px]">{plan.tagline}</p>
      <div className="mt-4">
        <p className="font-display font-extrabold tabular-nums leading-none">
          <span className="text-4xl">{big}</span> <span className="text-sm text-slate-500 font-semibold">{per}</span>
        </p>
        <p className="mt-1 h-4 text-xs font-semibold text-emerald-600">{effective || (unavailable ? 'Custom pricing — let’s talk' : ' ')}</p>
      </div>
      <ul className="mt-5 space-y-2.5 text-sm text-slate-700 flex-1">
        {plan.feats.map(x => <li key={x} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {x}</li>)}
      </ul>
      <a href={unavailable ? '#join' : '#join'} className={`mt-6 w-full ${featured ? 'btn-primary' : 'btn-secondary'}`}>
        {trial ? 'Start trial' : unavailable ? 'Talk to us' : 'Choose plan'}
      </a>
    </div>
  );
}

function LeadForm({ compact }) {
  const [f, setF] = useState({ name: '', whatsapp: '', goal: GOALS[0], consent: true });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const digits = f.whatsapp.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) return setErr('Enter a valid phone number');
    setBusy(true);
    const { error } = await supabase.from('leads').insert({
      name: f.name.trim(), whatsapp: f.whatsapp.trim(), goal: f.goal, consent: f.consent,
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <p className="mt-3 font-bold text-emerald-900">You’re all set! 🎉</p>
        <p className="mt-1 text-sm text-emerald-700">A coach will message you with a plan recommendation shortly.</p>
        <a href={waLink('Hi Unifitz! I’d like a plan recommendation.')} target="_blank" rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 bg-brand-500 text-white font-bold px-5 py-3 rounded-xl text-sm">
          Message us now
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`rounded-2xl border border-slate-200 bg-white p-5 ${compact ? 'shadow-lg' : ''} space-y-3`}>
      {compact && <p className="font-bold text-center text-slate-900">Get your plan recommendation</p>}
      <div>
        <label htmlFor="lf-name" className="label">Your name</label>
        <input id="lf-name" required placeholder="e.g. Ashley" className="input" value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="lf-wa" className="label">Phone number</label>
        <input id="lf-wa" required type="tel" inputMode="numeric" placeholder="(555) 123-4567" className="input" value={f.whatsapp} onChange={e => setF(x => ({ ...x, whatsapp: e.target.value }))} autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="lf-goal" className="label">My goal</label>
        <select id="lf-goal" className="input" value={f.goal} onChange={e => setF(x => ({ ...x, goal: e.target.value }))}>
          {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <label className="flex items-start gap-2 text-xs text-slate-500">
        <input type="checkbox" checked={f.consent} onChange={e => setF(x => ({ ...x, consent: e.target.checked }))} className="w-4 h-4 accent-brand-500 mt-0.5" />
        I agree to receive messages from Unifitz about my plan.
      </label>
      {err && <p className="text-sm text-red-600" role="alert">{err}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full py-3.5">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Get my plan recommendation
      </button>
      <p className="text-center text-xs text-slate-400">No card required · A coach replies within the hour</p>
    </form>
  );
}

function ReviewsBlock({ reviews }) {
  const [f, setF] = useState({ name: '', rating: 5, text: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from('reviews').insert({ name: f.name.trim(), rating: f.rating, text: f.text.trim(), status: 'pending' });
    setBusy(false);
    if (!error) { setDone(true); setF({ name: '', rating: 5, text: '' }); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
        {reviews.length === 0 && <p className="text-sm text-slate-500">Be the first to leave a review!</p>}
        {reviews.map((r, i) => (
          <figure key={i} className="bg-white border border-slate-200 rounded-2xl p-5">
            <span className="flex gap-0.5">{Array.from({ length: 5 }, (_, j) => <Star key={j} className={`w-4 h-4 ${j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</span>
            {r.text && <blockquote className="mt-2 text-sm text-slate-700">“{r.text}”</blockquote>}
            <figcaption className="mt-3 text-sm font-bold text-slate-900">{r.name}</figcaption>
          </figure>
        ))}
      </div>
      <div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold">Leave a review</h3>
          {done ? (
            <p className="mt-3 text-sm text-emerald-600 font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Thanks! Your review is pending approval.</p>
          ) : (
            <form onSubmit={submit} className="mt-3 space-y-3">
              <input required placeholder="Your name" className="input" value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} aria-label="Name" />
              <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map(n => (
                  <button type="button" key={n} onClick={() => setF(x => ({ ...x, rating: n }))} aria-label={`${n} star`} className="p-0.5">
                    <Star className={`w-7 h-7 ${n <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <textarea rows="3" placeholder="How was your experience?" className="input" value={f.text} onChange={e => setF(x => ({ ...x, text: e.target.value }))} aria-label="Review text" />
              <button type="submit" disabled={busy} className="btn-secondary w-full">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Submit review</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FAQList() {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {FAQS.map((f, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span className="font-semibold text-slate-900">{f.q}</span>
            <ChevronDown className={`w-5 h-5 text-brand-500 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
