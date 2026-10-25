import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
  Activity, Armchair, ArrowRight, Battery, Check, CheckCircle2, ChevronDown,
  HeartPulse, Laptop, Leaf, Mail, Menu, Minus, Move, Plus, Quote, Repeat,
  Salad, Sparkles, Star, Sun, Target, Users, X, Zap, Home, Clock, ShieldCheck,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   Demo content. Photos are Unsplash placeholders; names, roles and
   quotes are sample copy — swap for real coaches/members pre-launch.
   ────────────────────────────────────────────────────────────── */

const unsplash = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

const PHOTOS = {
  hero: '1518611012118-696072aa579a',
  heroInset: '1552196563-55cd4e45efb3',
  desk: '1498050108023-c5249f4df085',
  wfh: '1522202176988-66273c2fd55f',
  parent: '1593164842264-854604db2260',
  unsure: '1554151228-14d9def656e4',
  homeYoga: '1575052814086-f385e2e2ad1b',
  group: '1588286840104-8957b019727f',
  sunset: '1544367567-0f2fcb009e0b',
};

const AVATARS = [
  { id: '1487412720507-e7ab37603c6f', name: 'Hannah' },
  { id: '1524504388940-b1c1722653e1', name: 'Nora' },
  { id: '1560250097-0b93528c311a', name: 'Mark' },
  { id: '1573496359142-b8d87734a5a2', name: 'Leah' },
];

const NAV = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#who-its-for', label: "Who it's for" },
  { href: '#coaches', label: 'Coaches' },
  { href: '#faq', label: 'FAQ' },
];

const STATS = [
  { value: '1,200+', label: 'People on the waitlist' },
  { value: '15 min', label: 'Daily movement sessions' },
  { value: '4', label: 'Certified coaches' },
  { value: '92%', label: 'Beta members felt less stiff' },
];

const PROBLEMS = [
  { title: 'Neck Pain', desc: 'From hours looking down at screens.', icon: Zap },
  { title: 'Lower Back Discomfort', desc: 'From long stretches of sitting.', icon: Activity },
  { title: 'Stiffness', desc: 'Joints that feel older than you are.', icon: Move },
  { title: 'Bloating', desc: 'Digestion slowed by low movement.', icon: Salad },
  { title: 'Poor Posture', desc: 'Rounded shoulders, forward head.', icon: Armchair },
  { title: 'Too Much Sitting', desc: '8–10 hours a day, most days.', icon: Laptop },
  { title: 'Lack of Movement', desc: 'Fewer than 4,000 steps a day.', icon: HeartPulse },
  { title: 'Low Energy', desc: 'The 3 PM slump, every afternoon.', icon: Battery },
];

const DIFFERENT = [
  { title: 'Lifestyle First', desc: 'We start with your everyday lifestyle, not just your fitness goal.', icon: Leaf },
  { title: 'Everyday Problems', desc: 'We focus on the physical problems people experience in their daily routines.', icon: Target },
  { title: 'Sustainable Movement', desc: 'Build movement habits that can actually become part of your life.', icon: Repeat },
  { title: 'Long-Term Thinking', desc: "The goal isn't a temporary transformation. It's a healthier way of living.", icon: Sun },
  { title: 'Beyond the Workout', desc: "Fitness isn't only what happens during a workout. It's how you move, work and live every day.", icon: Sparkles },
];

const AUDIENCE = [
  { target: 'The desk worker', text: "8 hours at a laptop? Your body shouldn't have to pay the price.", photo: PHOTOS.desk, icon: Laptop },
  { target: 'The work-from-home pro', text: 'Work, meetings, laptop, repeat. Your spine notices.', photo: PHOTOS.wfh, icon: Home },
  { target: 'The busy parent', text: "Your schedule is full. Your health shouldn't be an afterthought.", photo: PHOTOS.parent, icon: Clock },
  { target: "Anyone who feels “something isn't right”", text: 'Stiffness, bloating or low energy starting to feel normal?', photo: PHOTOS.unsure, icon: HeartPulse },
];

const EXPECT = [
  'Lifestyle assessment',
  'Movement guidance',
  'Structured fitness routines',
  'Mobility and flexibility work',
  'Posture and movement awareness',
  'Everyday lifestyle guidance',
  'Progress tracking',
  'Sustainable routines',
];

const COACHES = [
  { name: 'Priya Sharma', role: 'Head Coach · Mobility & Posture', exp: '11 yrs experience', photo: '1580489944761-15a19d654956' },
  { name: 'Arjun Mehta', role: 'Strength & Conditioning', exp: 'NSCA-CSCS · 9 yrs', photo: '1507003211169-0a1dd7228f2d' },
  { name: 'Maya Chen', role: 'Yoga & Breathwork', exp: 'RYT-500 · 8 yrs', photo: '1534528741775-53994a69daeb' },
  { name: 'Dr. Daniel Brooks', role: 'Physiotherapy Advisor', exp: 'DPT · 15 yrs', photo: '1472099645785-5658abf4ff4e' },
];

const TESTIMONIALS = [
  { name: 'Emily Carter', role: 'Product Manager, Austin', quote: 'Three weeks in and my afternoon neck ache is basically gone. It never felt like a "workout" — just better habits.', photo: '1438761681033-6461ffad8d80' },
  { name: 'Rahul Verma', role: 'Software Engineer, Seattle', quote: "I sit for 10 hours a day. Unifitz didn't ask me to change my job — it showed me how to move around it.", photo: '1500648767791-00dcc994a43e' },
  { name: 'Sofia Martinez', role: 'Mom of two, Chicago', quote: 'Fifteen minutes I can actually fit in. My back feels better and I have energy left for the kids in the evening.', photo: '1494790108377-be9c29b29330' },
];

const GOALS = [
  'Neck / Shoulder discomfort',
  'Lower-back discomfort',
  'Stiffness / Mobility',
  'Bloating / Digestion',
  'General fitness',
  'Better lifestyle habits',
  'Other',
];

const FAQS = [
  { q: 'Is Unifitz a gym?', a: 'No. Unifitz is a lifestyle-correction fitness program focused on helping you build healthier movement and lifestyle habits — no gym membership or equipment needed.' },
  { q: 'Is Unifitz Yoga or Zumba?', a: 'Not specifically. Unifitz may use different forms of movement and exercise, but the focus is your overall lifestyle rather than one specific fitness format.' },
  { q: 'Is Unifitz for weight loss?', a: "Weight management can be part of someone's fitness journey, but Unifitz is not designed around weight loss alone. The focus is long-term lifestyle and physical well-being." },
  { q: 'Do I need to be fit already?', a: 'No. Unifitz is designed for everyday people and everyday lifestyles. Every routine has an easier and harder variation.' },
  { q: 'How much time will it take each day?', a: 'Most daily sessions take around 15 minutes, designed to fit around work, meetings and family time.' },
  { q: 'When is Unifitz launching?', a: "We're opening to the first waitlist members soon. Join the waitlist and you'll be the first to know — with early-member pricing." },
];

/* ─────────────────────────── primitives ─────────────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

// Unsplash image with responsive srcset. Parent sizes the box; on load
// failure it falls back to a branded gradient so nothing renders blank.
function Photo({ id, alt, width = 800, sizes = '100vw', eager = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={alt} className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-200 via-brand-100 to-brand-50 p-4 ${className}`}>
        <span className="text-center font-display text-lg font-bold text-brand-700/70">{alt}</span>
      </div>
    );
  }
  return (
    <img
      src={unsplash(id, width)}
      srcSet={`${unsplash(id, Math.round(width / 2))} ${Math.round(width / 2)}w, ${unsplash(id, width)} ${width}w, ${unsplash(id, width * 2)} ${width * 2}w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

function Logo({ dark = false }) {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label="Unifitz home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/30">
        <Activity className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className={`font-display text-2xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
        Unifitz
      </span>
    </a>
  );
}

function Eyebrow({ children, dark = false }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${dark ? 'bg-white/10 text-brand-300' : 'bg-brand-50 text-brand-600 ring-1 ring-brand-100'}`}>
      {children}
    </span>
  );
}

function SectionHead({ eyebrow, title, sub, dark = false, className = '' }) {
  return (
    <motion.div {...fadeUp} className={`mx-auto mb-12 max-w-3xl text-center md:mb-16 ${className}`}>
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2 className={`mt-4 text-[2.25rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem] ${dark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
      {sub && <p className={`mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{sub}</p>}
    </motion.div>
  );
}

function Stars({ className = '' }) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
    </div>
  );
}

function AvatarStack({ size = 'h-10 w-10' }) {
  return (
    <div className="flex -space-x-3">
      {AVATARS.map((a) => (
        <div key={a.id} className={`${size} overflow-hidden rounded-full bg-brand-100 ring-2 ring-white`}>
          <Photo id={a.id} alt={a.name} width={96} sizes="48px" />
        </div>
      ))}
    </div>
  );
}

function FaqItem({ q, a, open, onToggle, idx }) {
  return (
    <div className="border-b border-slate-200 last:border-0">
      <h3 className="font-sans">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-${idx}`}
          className="flex w-full items-center justify-between gap-4 rounded-lg py-5 text-left text-base font-semibold text-slate-900 transition-colors hover:text-brand-600 sm:text-lg"
        >
          {q}
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${open ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-${idx}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-12 leading-relaxed text-slate-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function WaitlistLanding() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', goal: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Unifitz — Lifestyle Correction Fitness | Join the Waitlist';
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.title = prevTitle;
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.from('leads').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      details: { goal: form.goal },
      source: 'waitlist',
    });
    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  const container = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900 selection:bg-brand-100">

      {/* ── Navbar ── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-white/90 shadow-[0_1px_0_0_rgb(226,232,240)] backdrop-blur-lg' : 'bg-transparent'}`}>
        <nav className={`${container} flex h-16 items-center justify-between md:h-20`}>
          <Logo />
          <div className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm font-semibold text-slate-600 transition-colors hover:text-brand-600">
                {n.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href="#waitlist" className="btn-primary hidden !rounded-full !px-5 !py-2.5 text-sm sm:inline-flex">
              Join Waitlist
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 md:hidden"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-100 bg-white md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-6">
                {NAV.map((n) => (
                  <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-4 font-display text-2xl font-bold text-slate-900 hover:bg-brand-50">
                    {n.label}
                  </a>
                ))}
                <a href="#waitlist" onClick={() => setMenuOpen(false)} className="btn-primary mt-4 !rounded-full !py-4 text-lg">
                  Join the Waitlist <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* ── 1. Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white pb-16 pt-28 sm:pt-32 md:pb-24 lg:pb-28 lg:pt-40">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-40 top-1/2 h-[380px] w-[380px] rounded-full bg-amber-100/60 blur-3xl" />

          <div className={`${container} relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16`}>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="flex flex-col items-center text-center lg:items-start lg:text-left"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                <Eyebrow><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Launching soon · Limited early spots</Eyebrow>
              </motion.div>

              <motion.h1
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="mt-6 text-[2.75rem] font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
              >
                Your Lifestyle Is Your <span className="text-brand-500">First Fitness Goal.</span>
              </motion.h1>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl"
              >
                Unifitz is a lifestyle-correction fitness program designed to help you move better, feel better, and build healthier habits for everyday life.
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              >
                <a href="#waitlist" className="btn-primary !rounded-full !px-8 !py-4 text-lg">
                  Join the Waitlist <ArrowRight className="h-5 w-5" />
                </a>
                <a href="#how-it-works" className="btn-secondary !rounded-full !px-8 !py-4 text-lg">
                  How Unifitz Works <ChevronDown className="h-5 w-5" />
                </a>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-center"
              >
                <AvatarStack />
                <div className="text-center sm:text-left">
                  <Stars className="justify-center sm:justify-start" />
                  <p className="mt-1 text-sm text-slate-600"><strong className="text-slate-900">1,200+ people</strong> already on the waitlist</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-100 shadow-2xl shadow-brand-900/10 sm:aspect-[5/5] lg:aspect-[4/5]">
                <Photo id={PHOTOS.hero} alt="Women doing a guided movement session on mats" width={900} sizes="(min-width: 1024px) 45vw, (min-width: 640px) 512px, 92vw" eager />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
              </div>

              {/* Floating: today's session */}
              <div className="absolute -left-2 bottom-6 w-[15.5rem] rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-900/5 sm:-left-8 sm:bottom-10 sm:w-72 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-100 sm:h-14 sm:w-14">
                    <Photo id={PHOTOS.heroInset} alt="Seated mobility stretch" width={120} sizes="56px" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Today · 15 min</p>
                    <p className="truncate font-semibold text-slate-900">Desk-Posture Reset</p>
                    <p className="text-xs text-slate-500">with Coach Priya Sharma</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-2/3 rounded-full bg-brand-500" />
                </div>
              </div>

              {/* Floating: streak */}
              <div className="absolute -right-2 top-6 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-900/5 sm:-right-6 sm:top-10 sm:p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold leading-none text-slate-900">21 days</p>
                  <p className="text-xs text-slate-500">Habit streak</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats strip */}
          <div className={`${container} relative mt-16 md:mt-24`}>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-slate-200 ring-1 ring-slate-200 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white px-4 py-6 text-center sm:px-6 sm:py-8">
                  <p className="font-display text-3xl font-extrabold text-brand-500 sm:text-4xl lg:text-5xl">{s.value}</p>
                  <p className="mt-1 text-sm text-slate-600 sm:text-base">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Problem ── */}
        <section id="how-it-works" className="scroll-mt-16 bg-slate-50 py-20 md:scroll-mt-20 md:py-28">
          <div className={container}>
            <SectionHead
              eyebrow="The everyday signals"
              title="Your body is telling you something."
              sub="These may feel like small problems today. But when they become part of your everyday routine, they start affecting how you work, move and live."
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {PROBLEMS.map((item, i) => (
                <motion.div
                  key={item.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 sm:p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white sm:h-12 sm:w-12">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <h3 className="mt-4 font-sans text-base font-bold leading-snug text-slate-900 sm:text-lg">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Reframe ── */}
        <section className="relative overflow-hidden bg-slate-900 py-20 text-white md:py-28">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-500/20 blur-[120px]" />
          <div className={`${container} relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
            <motion.div {...fadeUp} className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-800 lg:aspect-[4/5]">
                <Photo id={PHOTOS.desk} alt="Laptop on a desk where most of the day is spent" width={800} sizes="(min-width: 1024px) 45vw, 92vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20 sm:inset-x-6 sm:bottom-6 sm:p-5">
                  <p className="font-display text-3xl font-extrabold text-brand-300 sm:text-4xl">9.5 hrs</p>
                  <p className="text-sm text-slate-200">Average time an office worker spends sitting each day</p>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="order-1 text-center lg:order-2 lg:text-left">
              <Eyebrow dark>A different starting point</Eyebrow>
              <h2 className="mt-5 text-[2.25rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                You don&apos;t need another fitness goal. <span className="text-brand-400">You need a better lifestyle.</span>
              </h2>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-slate-300 sm:text-xl">
                <p>Most fitness programs start with a goal — lose weight, build muscle, get abs, become flexible.</p>
                <p className="font-semibold text-white">Unifitz starts somewhere else.</p>
                <p>We look at your everyday lifestyle, identify what&apos;s affecting your body, and work toward correcting it.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── 4. What is Unifitz ── */}
        <section className="bg-white py-20 md:py-28">
          <div className={container}>
            <SectionHead
              eyebrow="The program"
              title="So, what exactly is Unifitz?"
              sub="Whether you work from an office, work from home, manage a household, or spend most of your day sitting — your lifestyle affects how your body feels. Unifitz helps you work on those everyday habits through movement, fitness and sustainable lifestyle practices."
            />

            <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:gap-8">
              <motion.div {...fadeUp} className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Traditional fitness</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-500">Goal-first</h3>
                <ol className="mt-8 flex flex-1 flex-col gap-3">
                  {['Pick a goal', 'Follow a workout', 'Short-term result', 'Old habits return'].map((s, i) => (
                    <li key={s} className="flex items-center gap-4 rounded-xl bg-white px-4 py-3.5 text-slate-500 ring-1 ring-slate-200">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">{i + 1}</span>
                      <span className="font-medium">{s}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.5 }} className="relative flex flex-col overflow-hidden rounded-3xl bg-brand-500 p-6 text-white shadow-2xl shadow-brand-500/25 sm:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
                <p className="relative text-xs font-bold uppercase tracking-[0.14em] text-brand-100">The Unifitz way</p>
                <h3 className="relative mt-2 text-3xl font-bold text-white">Lifestyle-first</h3>
                <ol className="relative mt-8 flex flex-1 flex-col gap-3">
                  {['Understand your lifestyle', 'Identify what affects your body', 'Correct with guided movement', 'Sustain as daily habits'].map((s, i) => (
                    <li key={s} className="flex items-center gap-4 rounded-xl bg-white/10 px-4 py-3.5 ring-1 ring-white/20">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-600">{i + 1}</span>
                      <span className="font-semibold">{s}</span>
                    </li>
                  ))}
                </ol>
                <p className="relative mt-5 flex items-center gap-2 font-display text-xl font-bold">
                  <CheckCircle2 className="h-6 w-6" /> Long-term well-being
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 5. What makes it different ── */}
        <section className="bg-brand-50/60 py-20 md:py-28">
          <div className={container}>
            <SectionHead eyebrow="Why Unifitz" title="What makes it different?" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {DIFFERENT.map((f, i) => (
                <motion.div
                  key={f.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.06, duration: 0.45 }}
                  className="flex flex-col rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/25">
                      <f.icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-4xl font-extrabold text-brand-100">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{f.desc}</p>
                </motion.div>
              ))}
              {/* 6th tile keeps every grid breakpoint full */}
              <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.45 }} className="relative min-h-[260px] overflow-hidden rounded-3xl bg-slate-900">
                <Photo id={PHOTOS.homeYoga} alt="Home stretching routine" width={700} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" className="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="font-display text-2xl font-bold text-white">No gym. No equipment.</p>
                  <p className="mt-1 text-slate-200">Just your living room and 15 minutes.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 6. Who it's for ── */}
        <section id="who-its-for" className="scroll-mt-16 bg-white py-20 md:scroll-mt-20 md:py-28">
          <div className={container}>
            <SectionHead eyebrow="Who it's for" title="Built for real life." sub="If your lifestyle affects your body, Unifitz is for you." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCE.map((a, i) => (
                <motion.article
                  key={a.target}
                  {...fadeUp}
                  transition={{ delay: i * 0.06, duration: 0.45 }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
                    <Photo id={a.photo} alt={a.target} width={600} sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 92vw" className="transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 shadow-md">
                      <a.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-2xl font-bold leading-tight">{a.target}</h3>
                    <p className="mt-2 leading-relaxed text-slate-600">{a.text}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. What to expect ── */}
        <section className="border-y border-slate-100 bg-slate-50 py-20 md:py-28">
          <div className={`${container} grid items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
            <motion.div {...fadeUp} className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-[2rem] bg-brand-100 shadow-xl">
                <Photo id={PHOTOS.group} alt="Guided group movement class" width={900} sizes="(min-width: 1024px) 45vw, 92vw" />
              </div>
              <div className="absolute -bottom-6 right-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl ring-1 ring-slate-900/5 sm:right-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Small guided groups</p>
                  <p className="text-xs text-slate-500">Coaches who know your name</p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="text-center lg:text-left">
              <Eyebrow>What to expect</Eyebrow>
              <h2 className="mt-4 text-[2.25rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl">A structured, guided experience.</h2>
              <p className="mt-4 text-lg text-slate-600">Everything designed around the way you already live.</p>
              <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
                {EXPECT.map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className="font-medium text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* ── 8. Coaches ── */}
        <section id="coaches" className="scroll-mt-16 bg-white py-20 md:scroll-mt-20 md:py-28">
          <div className={container}>
            <SectionHead eyebrow="Meet the team" title="Guided by real experts." sub="Certified coaches and a physiotherapy advisor who design every routine around everyday bodies." />
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {COACHES.map((c, i) => (
                <motion.article key={c.name} {...fadeUp} transition={{ delay: i * 0.06, duration: 0.45 }} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-brand-50">
                    <Photo id={c.photo} alt={c.name} width={500} sizes="(min-width: 1024px) 23vw, 46vw" className="transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 backdrop-blur sm:text-xs">
                      {c.exp}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold leading-tight sm:text-2xl">{c.name}</h3>
                  <p className="mt-0.5 text-sm font-medium text-brand-600 sm:text-base">{c.role}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. Testimonials ── */}
        <section className="bg-brand-50/60 py-20 md:py-28">
          <div className={container}>
            <SectionHead eyebrow="From our beta group" title="Small changes. Real difference." />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.figure
                  key={t.name}
                  {...fadeUp}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className={`flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8 ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <Stars />
                    <Quote className="h-8 w-8 fill-brand-100 text-brand-100" />
                  </div>
                  <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand-100">
                      <Photo id={t.photo} alt={t.name} width={120} sizes="48px" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-sm text-slate-500">{t.role}</p>
                    </div>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. Philosophy ── */}
        <section className="relative overflow-hidden bg-slate-900 py-24 text-center text-white md:py-36">
          <div className="absolute inset-0">
            <Photo id={PHOTOS.sunset} alt="" width={1600} sizes="100vw" className="opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90" />
          </div>
          <motion.div {...fadeUp} className={`${container} relative`}>
            <h2 className="mx-auto max-w-4xl text-[2.25rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              We aren&apos;t building bodies for the next 90 days.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-2xl">
              We&apos;re helping you build a lifestyle your body can live with for years.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-3 font-display text-3xl font-extrabold sm:flex-row sm:gap-8 md:text-5xl">
              <span>Move better.</span>
              <span className="hidden h-2 w-2 rounded-full bg-brand-500 sm:block" />
              <span>Feel better.</span>
              <span className="hidden h-2 w-2 rounded-full bg-brand-500 sm:block" />
              <span className="text-brand-400">Live better.</span>
            </div>
          </motion.div>
        </section>

        {/* ── 11. Waitlist ── */}
        <section id="waitlist" className="scroll-mt-16 bg-white py-20 md:scroll-mt-20 md:py-28">
          <div className={`${container} grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16`}>
            <motion.div {...fadeUp} className="text-center lg:sticky lg:top-28 lg:text-left">
              <Eyebrow>Early access</Eyebrow>
              <h2 className="mt-4 text-[2.25rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Be the first to experience Unifitz.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-lg text-slate-600 lg:mx-0">
                Unifitz is coming soon. Join the waitlist and we&apos;ll let you know when we&apos;re ready for you.
              </p>
              <ul className="mx-auto mt-8 max-w-md space-y-4 text-left lg:mx-0">
                {[
                  { icon: Sparkles, title: 'Early-member pricing', text: 'Locked in for waitlist members only.' },
                  { icon: Target, title: 'Free lifestyle assessment', text: 'A personal starting point before day one.' },
                  { icon: ShieldCheck, title: 'No spam, ever', text: 'Only launch updates. Unsubscribe anytime.' },
                ].map((b) => (
                  <li key={b.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <b.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{b.title}</p>
                      <p className="text-slate-600">{b.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 hidden items-center gap-3 lg:flex">
                <AvatarStack size="h-9 w-9" />
                <p className="text-sm text-slate-600"><strong className="text-slate-900">48 people</strong> joined this week</p>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/60 sm:p-8 lg:p-10">
              {status === 'success' ? (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center sm:py-16">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="mt-6 text-4xl font-extrabold">You&apos;re on the list{form.name ? `, ${form.name.split(' ')[0]}` : ''}!</h3>
                  <p className="mx-auto mt-3 max-w-sm text-lg text-slate-600">Thanks for joining Unifitz. We&apos;ll keep you posted on what&apos;s coming.</p>
                  <button
                    type="button"
                    onClick={() => { setForm({ name: '', email: '', phone: '', goal: '' }); setStatus('idle'); }}
                    className="mt-8 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Submit another response
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-sans text-xl font-bold text-slate-900 sm:text-2xl">Reserve your spot</h3>
                    <p className="mt-1 text-sm text-slate-500">Takes less than 30 seconds.</p>
                  </div>

                  <div>
                    <label htmlFor="wl-name" className="label">Full name</label>
                    <input id="wl-name" required type="text" autoComplete="name" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input" placeholder="Jane Doe" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="wl-email" className="label">Email address</label>
                      <input id="wl-email" required type="email" autoComplete="email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input" placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label htmlFor="wl-phone" className="label">Phone number</label>
                      <input id="wl-phone" required type="tel" autoComplete="tel" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <fieldset>
                    <legend className="label">
                      What would you like to improve? <span className="font-normal text-slate-400">(Optional)</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {GOALS.map((g) => {
                        const active = form.goal === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setForm({ ...form, goal: active ? '' : g })}
                            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${active
                              ? 'border-brand-500 bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'}`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {status === 'error' && (
                    <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <button type="submit" disabled={status === 'loading'} className="btn-primary w-full !py-4 text-lg">
                    {status === 'loading' ? 'Joining…' : <>Join the Unifitz Waitlist <ArrowRight className="h-5 w-5" /></>}
                  </button>
                  <p className="text-center text-xs text-slate-400">By joining you agree to receive launch updates from Unifitz.</p>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── 12. FAQ ── */}
        <section id="faq" className="scroll-mt-16 border-t border-slate-100 bg-slate-50 py-20 md:scroll-mt-20 md:py-28">
          <div className={`${container} grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16`}>
            <motion.div {...fadeUp} className="text-center lg:text-left">
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-4 text-[2.25rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl">Frequently asked questions</h2>
              <p className="mt-4 text-lg text-slate-600">Still curious? Write to us anytime.</p>
              <a href="mailto:hello@unifitz.in" className="btn-outline mt-6 !rounded-full">
                <Mail className="h-4 w-4" /> hello@unifitz.in
              </a>
            </motion.div>
            <motion.div {...fadeUp} className="rounded-3xl bg-white px-5 shadow-sm ring-1 ring-slate-200 sm:px-8">
              {FAQS.map((f, i) => (
                <FaqItem key={f.q} idx={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── 13. Final CTA ── */}
        <section className="bg-white py-16 md:py-24">
          <div className={container}>
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] bg-brand-500 px-6 py-14 text-center text-white sm:px-12 md:py-20">
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand-700/40 blur-2xl" />
              <h2 className="relative mx-auto max-w-3xl text-[2.25rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your lifestyle is already shaping your health.
              </h2>
              <p className="relative mt-4 text-xl text-brand-50 sm:text-2xl">Let&apos;s make it work for you.</p>
              <a href="#waitlist" className="relative mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-brand-600 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-brand-50 sm:px-10 sm:py-5 sm:text-xl">
                Join the Waitlist <ArrowRight className="h-5 w-5" />
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400">
        <div className={`${container} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4`}>
          <div className="sm:col-span-2">
            <Logo dark />
            <p className="mt-4 max-w-sm leading-relaxed">
              A lifestyle-correction fitness program to help you move better, feel better and live better — every day.
            </p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((n) => (
                <li key={n.href}><a href={n.href} className="transition-colors hover:text-brand-400">{n.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white">Contact</p>
            <ul className="mt-4 space-y-2.5">
              <li><a href="mailto:hello@unifitz.in" className="transition-colors hover:text-brand-400">hello@unifitz.in</a></li>
              <li><a href="#waitlist" className="transition-colors hover:text-brand-400">Join the waitlist</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className={`${container} flex flex-col items-center justify-between gap-2 py-6 text-sm sm:flex-row`}>
            <p>&copy; {new Date().getFullYear()} Unifitz. All rights reserved.</p>
            <p>Made for everyday bodies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
