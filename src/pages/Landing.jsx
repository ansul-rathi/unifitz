import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import {
  Dumbbell, Menu, X, Music, Flower2, Brain, Weight, BicepsFlexed, Video, LineChart,
  Trophy, Gift, Users, BadgeCheck, ArrowRight, Star, Instagram, Facebook, Youtube,
  Mail, Phone, Flame, CheckCircle2, Loader2, MapPin, ChevronDown, Heart,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BUSINESS, waLink } from '../config';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

const NAV = [
  { label: 'Programs', href: '#programs' },
  { label: 'Challenges', href: '#offer' },
  { label: 'Results', href: '#results' },
  { label: 'FAQ', href: '#faq' },
];

const PROGRAMS = [
  { icon: Music, name: 'Zumba', benefit: 'Dance off the calories — no steps to memorize.', timing: 'Mon · Wed · Fri, 7 PM' },
  { icon: Flower2, name: 'Yoga', benefit: 'Flexibility, calm and better sleep.', timing: 'Tue · Thu · Sat, 6:30 AM' },
  { icon: Brain, name: 'Meditation', benefit: 'Reset stress in 15 guided minutes.', timing: 'Daily, 9:30 PM' },
  { icon: BicepsFlexed, name: 'Strength Training', benefit: 'Tone and build real strength at home.', timing: 'Mon · Wed · Fri, 6 PM' },
  { icon: Weight, name: 'Weight Training', benefit: 'Progressive dumbbell programs.', timing: 'Tue · Thu · Sat, 7 PM' },
];

const STEPS = [
  { icon: BadgeCheck, title: 'Book a free demo', desc: 'One minute on WhatsApp, no card.' },
  { icon: Video, title: 'Join live on Zoom', desc: 'One tap into the live class.' },
  { icon: LineChart, title: 'Track your transformation', desc: 'Weekly reports + badges.' },
];

const TRAINERS = [
  { name: 'Priya Nair', specialty: 'Zumba & HIIT', bio: 'Certified Zumba instructor, 8 yrs.', cert: 'ZIN® Certified' },
  { name: 'Rahul Verma', specialty: 'Strength & Weights', bio: 'Strength coach for women 30+.', cert: 'ACE-CPT' },
  { name: 'Sana Kapoor', specialty: 'Yoga & Meditation', bio: 'Hatha & breathwork specialist.', cert: 'RYT-500' },
];

const WHY = [
  { icon: Video, title: 'Live + recorded', desc: 'Join live or watch the recording.' },
  { icon: LineChart, title: 'Progress reports', desc: 'BMI, TDEE & weekly charts.' },
  { icon: Trophy, title: '54-badge gamification', desc: 'Stay motivated, earn rewards.' },
  { icon: Gift, title: 'Referral rewards', desc: 'Bring a friend, both win.' },
  { icon: Heart, title: 'Women-only community', desc: 'Supportive, never judged.' },
  { icon: Users, title: 'India-friendly timings', desc: 'Hinglish support, local batches.' },
];

const FAQS = [
  { q: 'Is there a free trial?', a: 'Yes — your first demo class is completely free, no credit card needed. After that, affordable monthly and quarterly plans keep you going.' },
  { q: 'Do I need any equipment?', a: 'No. A mat and some floor space is enough. Water bottles double as light weights.' },
  { q: 'What are the timings?', a: 'Morning, evening and night batches across the week — pick what fits. India + USA friendly slots.' },
  { q: 'Do I need to be fit already?', a: 'Not at all. Most members start as complete beginners; trainers scale every move to your level.' },
  { q: 'How do the live sessions work?', a: 'You get a Zoom link on your dashboard. One tap joins the live class with a real trainer.' },
  { q: 'Can I do it from home?', a: 'Entirely. Every class is online and live — join from your living room.' },
  { q: 'Is it women-only?', a: 'Yes — UniFit is a women-only supportive space designed for women 30+.' },
];

const GOALS = ['Lose weight', 'Get fit', 'Build strength', 'Just exploring'];

// Inject SEO <head> tags + JSON-LD (client-side; fine for most crawlers/social).
function useSEO(reviewAgg) {
  useEffect(() => {
    document.title = 'Online Zumba & Fitness Classes for Women in Jaipur, India | UniFit';
    const set = (sel, attr, val) => {
      let el = document.head.querySelector(sel);
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      const [a, v] = sel.includes('property') ? ['property', sel.match(/"(.*?)"/)[1]] : ['name', sel.match(/"(.*?)"/)[1]];
      el.setAttribute(a, v); el.setAttribute('content', val);
    };
    const desc = 'Live online Zumba, Yoga, Meditation, Strength & Weight Training for women in Jaipur & across India. Book a free demo class — live daily on Zoom, no gym needed.';
    set('meta[name="description"]', 'content', desc);
    set('meta[property="og:title"]', 'content', 'UniFit — Online Fitness for Women · Free Demo Class');
    set('meta[property="og:description"]', 'content', desc);
    set('meta[property="og:type"]', 'content', 'website');
    set('meta[property="og:url"]', 'content', BUSINESS.url);
    set('meta[property="og:image"]', 'content', `${BUSINESS.url}/og-image.jpg`);
    set('meta[name="twitter:card"]', 'content', 'summary_large_image');
    set('meta[name="twitter:title"]', 'content', 'UniFit — Online Fitness for Women · Free Demo Class');
    set('meta[name="twitter:description"]', 'content', desc);

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
          areaServed: BUSINESS.area,
          address: { '@type': 'PostalAddress', addressLocality: BUSINESS.area, addressRegion: BUSINESS.region, addressCountry: BUSINESS.country },
          sameAs: Object.values(BUSINESS.socials),
          ...(reviewAgg?.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviewAgg.avg, reviewCount: reviewAgg.count } } : {}),
        },
        {
          '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
      ],
    };
    let script = document.getElementById('uf-jsonld');
    if (!script) { script = document.createElement('script'); script.id = 'uf-jsonld'; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(ld);
  }, [reviewAgg]);
}

export default function Landing() {
  const [open, setOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setTestimonials(data ?? []));
    supabase.from('reviews').select('name, rating, text, created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => setReviews(data ?? []));
  }, []);

  const reviewAgg = useMemo(() => {
    if (!reviews.length) return { avg: 4.9, count: 0 };
    const avg = +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    return { avg, count: reviews.length };
  }, [reviews]);

  useSEO(reviewAgg);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-slate-800 pb-20 lg:pb-0">
        {/* ── Sticky header ── */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100">
          <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 h-16">
            <a href="#top" className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
              <Dumbbell className="w-6 h-6 text-brand-500" /> Uni<span className="text-brand-500">Fitz</span>
            </a>
            <ul className="hidden lg:flex items-center gap-7">
              {NAV.map(l => <li key={l.href}><a href={l.href} className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors duration-200">{l.label}</a></li>)}
            </ul>
            <div className="flex items-center gap-2">
              <Link to="/auth" className="hidden sm:inline text-sm font-semibold text-slate-600 hover:text-brand-600 px-2">Login</Link>
              <a href="#join" className="btn-primary !py-2.5 text-sm">Free Demo</a>
              <button className="lg:hidden p-2.5 rounded-lg border border-slate-200" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
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
          <section className="bg-gradient-to-b from-orange-50 via-white to-white">
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 grid lg:grid-cols-2 gap-10 lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  <Flame className="w-3.5 h-3.5" /> New batch starts Monday — book your demo class
                </p>
                <h1 className="mt-5 font-display font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,4.5rem)]">
                  Transform Your Body in <span className="text-brand-500">30 Days.</span>
                </h1>
                <p className="mt-4 text-lg text-slate-600 max-w-lg">
                  Live online Zumba, Yoga & Strength classes for women. No gym needed — join from home, guided by certified trainers. Start with a <strong className="text-slate-800">free demo class</strong>.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <a href="#join" className="btn-primary text-base">Book a Free Demo Class <ArrowRight className="w-4 h-4" /></a>
                  <a href="#how" className="btn-secondary text-base">Watch how it works</a>
                </div>
                {/* Trust badges */}
                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-brand-500" /> 500+ women trained</span>
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {reviewAgg.avg} rating</span>
                  <span className="flex items-center gap-1.5"><Video className="w-4 h-4 text-brand-500" /> Live daily on Zoom</span>
                  <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-brand-500" /> Certified trainers</span>
                </div>
              </div>

              {/* Hero image + inline lead form (desktop) */}
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-orange-100 bg-gradient-to-br from-brand-400 to-orange-600 aspect-[4/3] flex items-center justify-center" role="img" aria-label="Women in a live online UniFit fitness class">
                  <span className="font-display text-2xl font-bold uppercase text-white/90 text-center px-6">Real women,<br />real live classes</span>
                </div>
                <div className="hidden lg:block">
                  <LeadForm compact />
                </div>
              </div>
            </div>
          </section>

          {/* ── Social proof bar ── */}
          <section className="border-y border-slate-100 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div className="flex -space-x-2.5">
                {['KS', 'NP', 'AM', 'SK', 'PR'].map(a => (
                  <span key={a} className="w-9 h-9 rounded-full bg-brand-100 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-700">{a}</span>
                ))}
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Join <strong>500+ women</strong> getting stronger with UniFit ·
                <span className="inline-flex items-center gap-1 ml-1">
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  <span className="ml-1">{reviewAgg.avg}{reviewAgg.count ? ` (${reviewAgg.count} reviews)` : ''}</span>
                </span>
              </p>
            </div>
          </section>

          {/* ── Programs ── */}
          <Section id="programs" title={<>Five programs.<br /><span className="text-brand-500">One membership.</span></>}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROGRAMS.map(p => (
                <div key={p.name} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-brand-300 hover:shadow-md transition-all duration-200">
                  <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200"><p.icon className="w-5 h-5" /></span>
                  <h3 className="mt-3 font-display text-xl font-bold uppercase">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{p.benefit}</p>
                  <p className="mt-3 text-xs font-bold text-brand-600 uppercase tracking-wide">{p.timing}</p>
                </div>
              ))}
              <a href="#join" className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 text-white font-bold p-5 hover:bg-brand-600 transition-colors duration-200">
                Book a Free Demo Class <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </Section>

          {/* ── The free offer ── */}
          <section id="offer" className="bg-slate-900 text-white">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20 text-center">
              <p className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">Free demo class — no card needed</p>
              <h2 className="mt-5 font-display font-extrabold uppercase tracking-tight leading-none text-[clamp(2rem,6vw,3.5rem)] text-white">
                Try Before You Join
              </h2>
              <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
                Book a <strong className="text-white">free demo class</strong>, feel the energy, then pick a plan that fits.
                Members get live sessions, recordings, progress tracking, a diet plan and a women-only community.
                <strong className="text-white"> New batch starts Monday.</strong>
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm">
                {['Free demo class', 'Live Zoom sessions', 'Class recordings', 'Progress tracking', 'Diet plan', 'Supportive community'].map(x => (
                  <span key={x} className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full font-semibold"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {x}</span>
                ))}
              </div>
              <a href="#join" className="mt-8 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-emerald-500/25 transition-colors duration-200">
                Book a Free Demo Class <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </section>

          {/* ── How it works ── */}
          <Section id="how" title={<>How it <span className="text-brand-500">works.</span></>}>
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative bg-white border border-slate-200 rounded-2xl p-6">
                  <span className="absolute -top-4 left-6 font-display text-5xl font-extrabold text-slate-100 select-none" aria-hidden="true">{i + 1}</span>
                  <span className="relative inline-flex w-11 h-11 items-center justify-center rounded-xl bg-brand-500 text-white"><s.icon className="w-5 h-5" /></span>
                  <h3 className="relative mt-3 font-display text-lg font-bold uppercase">{s.title}</h3>
                  <p className="relative mt-1 text-sm text-slate-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Results / transformations (live from Supabase) ── */}
          <section id="results" className="bg-orange-50/60">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
              <h2 className="font-display font-extrabold uppercase tracking-tight leading-none text-[clamp(2rem,6vw,3.5rem)]">Real members.<br /><span className="text-brand-500">Real results.</span></h2>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map(t => (
                  <figure key={t.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
                    <span className="inline-flex self-start items-center gap-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full"><LineChart className="w-3.5 h-3.5" /> {t.result}</span>
                    <blockquote className="mt-3 text-sm text-slate-700 leading-relaxed flex-1 italic">“{t.quote}”</blockquote>
                    <figcaption className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{t.name.charAt(0)}</span>
                      <span>
                        <span className="block font-bold text-slate-900 text-sm">{t.name}</span>
                        <span className="block text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</span>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="mt-10 text-center">
                <a href="#join" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-emerald-500/25 transition-colors duration-200">
                  Start With a Free Demo Class <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </section>

          {/* ── Trainers ── */}
          <Section id="trainers" title={<>Meet your <span className="text-brand-500">trainers.</span></>}>
            <div className="grid gap-5 sm:grid-cols-3">
              {TRAINERS.map(t => (
                <div key={t.name} className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                  <span className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-display text-2xl font-bold mx-auto">{t.name.charAt(0)}</span>
                  <h3 className="mt-3 font-bold">{t.name}</h3>
                  <p className="text-sm font-semibold text-brand-600">{t.specialty}</p>
                  <p className="mt-1 text-sm text-slate-600">{t.bio}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-slate-400"><BadgeCheck className="w-3.5 h-3.5" /> {t.cert}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Why UniFit ── */}
          <Section id="why" title={<>Why <span className="text-brand-500">UniFit.</span></>}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHY.map(w => (
                <div key={w.title} className="flex gap-4 bg-white border border-slate-200 rounded-2xl p-5">
                  <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><w.icon className="w-5 h-5" /></span>
                  <div><h3 className="font-bold text-base">{w.title}</h3><p className="mt-1 text-sm text-slate-600">{w.desc}</p></div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Lead form ── */}
          <section id="join" className="bg-gradient-to-b from-white to-orange-50">
            <div className="max-w-xl mx-auto px-4 md:px-6 py-16 md:py-20">
              <h2 className="text-center font-display font-extrabold uppercase tracking-tight leading-none text-[clamp(2rem,6vw,3rem)]">
                Book your <span className="text-brand-500">free demo class</span>
              </h2>
              <p className="mt-3 text-center text-slate-600">Drop your details — we'll WhatsApp you the demo class link. No card needed.</p>
              <div className="mt-7"><LeadForm /></div>
            </div>
          </section>

          {/* ── Reviews ── */}
          <Section id="reviews" title={<>What women <span className="text-brand-500">say.</span></>}>
            <ReviewsBlock reviews={reviews} agg={reviewAgg} onSubmitted={r => setReviews(rv => rv)} />
          </Section>

          {/* ── FAQ ── */}
          <section id="faq" className="bg-slate-50 border-y border-slate-100">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-20">
              <h2 className="text-center font-display font-extrabold uppercase tracking-tight leading-none text-[clamp(2rem,6vw,3rem)] mb-10">Questions, answered.</h2>
              <FAQList />
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="bg-slate-900">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 text-center">
              <h2 className="font-display font-extrabold uppercase tracking-tight leading-none text-[clamp(2rem,5vw,3.5rem)] text-white">Your transformation starts <span className="text-brand-500">today.</span></h2>
              <a href="#join" className="mt-7 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-emerald-500/25 transition-colors duration-200">Book a Free Demo Class <ArrowRight className="w-5 h-5" /></a>
              <p className="mt-3 text-sm text-slate-400">Free demo class · No card needed · Cancel anytime.</p>
            </div>
          </section>
        </main>

        {/* ── Footer (NAP for local SEO) ── */}
        <footer className="bg-slate-950 text-slate-300">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 grid gap-10 md:grid-cols-3">
            <div>
              <span className="flex items-center gap-2 font-display text-2xl font-bold uppercase text-white"><Dumbbell className="w-6 h-6 text-brand-500" /> UniFit</span>
              <p className="mt-3 text-sm max-w-xs">Live online fitness classes for women — Zumba, Yoga, Meditation, Strength & Weight Training. Free demo class available.</p>
              <div className="mt-4 flex gap-3">
                <a href={BUSINESS.socials.instagram} aria-label="Instagram" className="p-2.5 rounded-lg bg-slate-800 hover:bg-brand-500 transition-colors duration-200"><Instagram className="w-4 h-4" /></a>
                <a href={BUSINESS.socials.facebook} aria-label="Facebook" className="p-2.5 rounded-lg bg-slate-800 hover:bg-brand-500 transition-colors duration-200"><Facebook className="w-4 h-4" /></a>
                <a href={BUSINESS.socials.youtube} aria-label="YouTube" className="p-2.5 rounded-lg bg-slate-800 hover:bg-brand-500 transition-colors duration-200"><Youtube className="w-4 h-4" /></a>
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
              <h4 className="text-sm font-bold uppercase tracking-wide text-white mb-4">UniFit · {BUSINESS.area}</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500" /> {BUSINESS.addressLine}</li>
                <li><a href={`tel:${BUSINESS.phoneDisplay}`} className="flex items-center gap-2 hover:text-white"><Phone className="w-4 h-4 text-brand-500" /> {BUSINESS.phoneDisplay}</a></li>
                <li><a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="w-4 h-4 text-brand-500" /> {BUSINESS.email}</a></li>
                <li><a href={waLink()} className="flex items-center gap-2 hover:text-white"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1s-.8.9-.9 1.1-.3.2-.6.1c-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9s0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3 2 3.1 4.9 4.3c.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg> WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800"><p className="max-w-6xl mx-auto px-4 md:px-6 py-5 text-xs text-slate-500">© 2026 UniFit · {BUSINESS.addressLine}. All rights reserved.</p></div>
        </footer>

        {/* Sticky mobile CTA + floating WhatsApp */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 p-3">
          <a href="#join" className="btn-primary w-full">Book a Free Demo Class <ArrowRight className="w-4 h-4" /></a>
        </div>
        <FloatingWhatsApp />
      </div>
    </MotionConfig>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}
        className="font-display font-extrabold uppercase tracking-tight leading-none text-[clamp(2rem,6vw,3.5rem)] mb-10">{title}</motion.h2>
      {children}
    </section>
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
    if (digits.length < 10 || digits.length > 13) return setErr('Enter a valid WhatsApp number');
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
        <p className="mt-3 font-bold text-emerald-900">You're booked! 🎉</p>
        <p className="mt-1 text-sm text-emerald-700">We'll WhatsApp you the free demo class link shortly.</p>
        <a href={waLink("Hi UniFit! I just booked a free demo class.")} target="_blank" rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-5 py-3 rounded-xl text-sm">
          Message us now
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`rounded-2xl border border-slate-200 bg-white p-5 ${compact ? 'shadow-lg' : 'shadow-sm'} space-y-3`}>
      {compact && <p className="font-bold text-center">Book your free demo class</p>}
      <input required placeholder="Your name" className="input" value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} aria-label="Name" />
      <input required type="tel" placeholder="WhatsApp number" className="input" value={f.whatsapp} onChange={e => setF(x => ({ ...x, whatsapp: e.target.value }))} aria-label="WhatsApp number" />
      <select className="input" value={f.goal} onChange={e => setF(x => ({ ...x, goal: e.target.value }))} aria-label="Goal">
        {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <label className="flex items-start gap-2 text-xs text-slate-500">
        <input type="checkbox" checked={f.consent} onChange={e => setF(x => ({ ...x, consent: e.target.checked }))} className="w-4 h-4 accent-brand-500 mt-0.5" />
        I agree to receive WhatsApp updates from UniFit.
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Book a Free Demo Class
      </button>
    </form>
  );
}

function ReviewsBlock({ reviews, agg }) {
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
            {r.text && <blockquote className="mt-2 text-sm text-slate-700 italic">“{r.text}”</blockquote>}
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
            <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
