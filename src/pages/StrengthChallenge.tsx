import React, { FC, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import WhatsAppButton from '../components/landing/WhatsAppButton';

// ─── Country Config ─────────────────────────────────────────────────────────
type Country = 'india' | 'bahrain' | 'usa';

const COUNTRY_CONFIG: Record<Country, {
  label: string;
  flag: string;
  batchTime: string;
  amount: string;
  paymentNumber: string;
  paymentMethod: string;
}> = {
  india: {
    label: 'India',
    flag: '🇮🇳',
    batchTime: '8:30 AM – 9:30 AM',
    amount: '₹499',
    paymentNumber: '8107505074',
    paymentMethod: 'PhonePe / GPay / Paytm / UPI',
  },
  bahrain: {
    label: 'Bahrain',
    flag: '🇧🇭',
    batchTime: '6:00 AM – 7:00 AM',
    amount: '5 BD',
    paymentNumber: '+973 3386 2809',
    paymentMethod: 'Bank Transfer / WhatsApp Pay',
  },
  usa: {
    label: 'USA',
    flag: '🇺🇸',
    batchTime: '8:00 AM – 9:00 AM',
    amount: '₹499',
    paymentNumber: '8107505074',
    paymentMethod: 'PhonePe / GPay / Paytm / UPI',
  },
};

// ─── Schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  whatsapp_number: z
    .string()
    .min(1, 'WhatsApp number is required')
    .min(6, 'Enter a valid phone number'),
  age: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Age is required', invalid_type_error: 'Age must be a number' })
      .int('Age must be an integer')
      .min(15, 'Min age 15')
      .max(80, 'Max age 80')
  ),
  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City name must be at least 2 characters'),
  batch_timing: z.string().min(1, 'Select a batch timing'),
  primary_goal: z.string().min(1, 'Select your primary goal'),
  fitness_experience: z.string().min(1, 'Select your fitness level'),
  payment_screenshot: z
    .any()
    .refine((files) => {
      return files && files instanceof FileList && files.length > 0;
    }, 'Payment screenshot is required')
    .refine((files) => {
      if (!files || !(files instanceof FileList) || files.length === 0) return true;
      return files[0].size <= 5 * 1024 * 1024;
    }, 'File must be under 5 MB')
    .refine((files) => {
      if (!files || !(files instanceof FileList) || files.length === 0) return true;
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(files[0].type);
    }, 'Only JPG, PNG or WebP accepted'),
});

type FormValues = z.infer<typeof schema>;

// ─── Constants ─────────────────────────────────────────────────────────────
const CHALLENGE_START = new Date('June 1, 2026 00:00:00').getTime();
const GOALS = ['Weight Loss', 'Muscle Gain', 'Stamina', 'Flexibility'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];
// const FEATURES = [
//   { icon: 'fitness_center', title: 'Daily Strength Workouts', desc: 'Progressive overload plans for home or gym — no experience needed.' },
//   { icon: 'restaurant', title: 'Nutrition Guidance', desc: 'High-protein Indian meal plans tailored for sustainable fat loss.' },
//   { icon: 'groups', title: 'WhatsApp Community', desc: '24/7 access to coaches and 100+ participants on the same journey.' },
//   { icon: 'verified', title: 'Accountability Check-ins', desc: 'Daily coach check-ins to keep you on track through all 30 days.' },
//   { icon: 'bolt', title: 'Weekly Live Sessions', desc: 'High-energy live calls to boost motivation and correct form.' },
//   { icon: 'trending_up', title: 'Progress Tracking', desc: 'Visual metrics and reward systems to celebrate every milestone.' },
// ];
// const PAIN_POINTS = [
//   { q: '"Tired of restarting every Monday?"', a: 'Breaking the cycle of inconsistency requires a system, not willpower. We give you both.' },
//   { q: '"No time for the gym?"', a: 'Our program is 45 mins a day from home — designed for busy schedules.' },
//   { q: '"Confused by diets?"', a: 'No complex jargon. Simple Indian home-cooked meals that work for your body.' },
// ];
// const STEPS = [
//   { n: '1', label: 'Register', desc: 'Fill out the form below.', active: true },
//   { n: '2', label: 'Payment', desc: 'Complete your registration fee.' },
//   { n: '3', label: 'Upload', desc: 'Share payment screenshot.' },
//   { n: '4', label: 'Verify', desc: 'Our team verifies your slot.' },
//   { n: '5', label: 'Join Group', desc: 'Get added to the community.' },
//   { n: '6', label: 'Start', desc: 'June 1st, 2026 🔥' },
// ];
const FAQS = [
  { q: 'Do I need any equipment?', a: 'Most workouts are bodyweight-focused. A pair of dumbbells or resistance bands helps but is not mandatory.' },
  { q: 'What if I miss a live session?', a: 'All sessions are recorded and uploaded within 2 hours so you never miss out.' },
  { q: 'Is the diet plan vegetarian-friendly?', a: 'Yes! Meal plans cover Vegetarian, Vegan, and Non-Vegetarian options using locally available Indian ingredients.' },
  { q: 'Is this suitable for beginners?', a: 'Absolutely. Each workout has beginner modifications. Coaches guide you at your own pace.' },
  { q: 'How do I pay the registration fee?', a: 'After filling the form, there is a nu ber given pay using any app and attach the screenshot' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

const GoldInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  ({ error, className = '', ...props }, ref) => (
    <div>
      <input
        {...props}
        ref={ref}
        className={`w-full bg-[#201f1f] border ${error ? 'border-red-400' : 'border-[#99907c]/30'} rounded-lg px-4 h-[52px] text-[#e5e2e1] placeholder:text-[#99907c] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all font-lexend text-sm ${className}`}
      />
      {error && <p className="mt-1 text-red-400 text-xs font-lexend">{error}</p>}
    </div>
  )
);
GoldInput.displayName = 'GoldInput';

const GoldSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }>(
  ({ error, children, className = '', ...props }, ref) => (
    <div>
      <select
        {...props}
        ref={ref}
        className={`w-full bg-[#201f1f] border ${error ? 'border-red-400' : 'border-[#99907c]/30'} rounded-lg px-4 h-[52px] text-[#e5e2e1] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all font-lexend text-sm appearance-none ${className}`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-red-400 text-xs font-lexend">{error}</p>}
    </div>
  )
);
GoldSelect.displayName = 'GoldSelect';

// ─── Main Page ─────────────────────────────────────────────────────────────
const StrengthChallenge: FC = () => {
  const [country, setCountry] = useState<Country | null>(null);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [fileLabel, setFileLabel] = useState('Choose File');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (country) {
      setValue('batch_timing', COUNTRY_CONFIG[country].batchTime);
    }
  }, [country, setValue]);

  // Countdown
  useEffect(() => {
    const tick = () => {
      const diff = CHALLENGE_START - Date.now();
      if (diff <= 0) { setCountdown({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitStatus('loading');
    setSubmitError('');
    try {
      let screenshotUrl: string | null = null;
      const file = data.payment_screenshot[0];
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('payment-screenshots')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (upErr) throw new Error(upErr.message);
      screenshotUrl = path;

      const { error: insertErr } = await supabase.from('strength_challenge_registrations').insert({
        full_name: data.full_name,
        whatsapp_number: data.whatsapp_number,
        age: data.age,
        city: data.city,
        batch_timing: data.batch_timing,
        primary_goal: data.primary_goal,
        fitness_experience: data.fitness_experience,
        payment_screenshot_url: screenshotUrl,
      });

      if (insertErr) throw new Error(insertErr.message);
      setSubmitStatus('success');
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setSubmitStatus('error');
    }
  };

  const cfg = country ? COUNTRY_CONFIG[country] : null;

  return (
    <>
      {/* ── Country Selection Popup ───────────────────────────────────── */}
      {!country && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1a1a1a] border border-[#d4af37]/30 rounded-3xl p-8 sm:p-10 max-w-sm w-full shadow-[0_0_60px_rgba(212,175,55,0.2)] text-center">
            <div className="w-14 h-14 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[#f2ca50] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
            </div>
            <h2 className="text-white font-black text-xl sm:text-2xl mb-2">Select Your Country</h2>
            <p className="text-[#99907c] text-sm mb-7">We will show you the right batch time and payment details.</p>
            <div className="flex flex-col gap-3">
              {(Object.keys(COUNTRY_CONFIG) as Country[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCountry(c)}
                  className="flex items-center gap-4 bg-[#201f1f] border border-[#99907c]/20 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/5 rounded-xl px-5 py-4 transition-all active:scale-[0.98] group"
                >
                  <span className="text-3xl">{COUNTRY_CONFIG[c].flag}</span>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm group-hover:text-[#f2ca50] transition-colors">{COUNTRY_CONFIG[c].label}</div>
                  </div>
                  <span className="material-symbols-outlined text-[#99907c] group-hover:text-[#d4af37] ml-auto text-sm transition-colors">arrow_forward_ios</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Helmet>
        <title>30-Day Strength Challenge | Unifitz</title>
        <meta name="description" content="Join the Unifitz 30-Day Strength Challenge. Daily workouts, nutrition guidance and live coaching for Indian women & men. Starting June 1, 2026. Register now." />
        <link rel="canonical" href="https://unifitz.in/30-days-strength-challenge" />
        <meta property="og:title" content="30-Day Strength Challenge | Unifitz" />
        <meta property="og:description" content="Transform in 30 days with daily strength workouts, nutrition plans and WhatsApp community support." />
        <meta property="og:image" content="https://unifitz.in/og-image.jpg" />
        <meta property="og:url" content="https://unifitz.in/30-days-strength-challenge" />
      </Helmet>

      <div className="bg-[#131313] text-[#e5e2e1] font-lexend min-h-screen">

        {/* ── NavBar ───────────────────────────────────────────────────── */}
        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#131313]/95 backdrop-blur-2xl shadow-[0_4px_20px_rgba(212,175,55,0.1)] border-b border-[#d4af37]/20' : 'bg-transparent backdrop-blur-sm'}`}>
          <nav className="flex justify-between items-center h-16 sm:h-20 px-4 sm:px-10 max-w-[1200px] mx-auto">
            <a href="/" className="text-lg sm:text-xl font-black tracking-tight text-[#f2ca50] uppercase">
              UNI<span className="text-white">FITZ</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              {[['challenge', 'The Challenge'], ['success', 'Results'], ['register', 'Register'], ['faq', 'FAQ']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} className="text-[#d0c5af] hover:text-[#f2ca50] transition-colors font-semibold text-sm tracking-wide">{label}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollTo('register')}
                className="bg-[#d4af37] text-[#3c2f00] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm hover:bg-[#e9c349] active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Register Now
              </button>
              <button
                className="md:hidden w-9 h-9 rounded-full bg-white/5 border border-[#d4af37]/20 flex items-center justify-center text-[#d0c5af]"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-lg">{mobileOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </nav>
          {mobileOpen && (
            <div className="md:hidden bg-[#131313]/98 backdrop-blur-2xl border-t border-[#d4af37]/10 px-4 py-4 flex flex-col gap-1">
              {[['challenge', 'The Challenge'], ['success', 'Transformations'], ['register', 'Register'], ['faq', 'FAQ']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} className="text-left px-4 py-3 text-[#d0c5af] hover:text-[#f2ca50] font-semibold text-sm rounded-xl hover:bg-white/5 transition-all">
                  {label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative min-h-[90vh] flex items-center pt-8 pb-16 sm:pt-16 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-72 sm:w-[500px] h-72 sm:h-[500px] bg-[#d4af37]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-60 sm:w-[400px] h-60 sm:h-[400px] bg-[#d4af37]/5 rounded-full blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="max-w-[1200px] mx-auto px-4 sm:px-10 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Text */}
              <div className="space-y-6 sm:space-y-8 order-2 lg:order-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 px-4 py-2 rounded-full mx-auto lg:mx-0">
                  <span className="material-symbols-outlined text-[#f2ca50] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>
                  <span className="text-[#f2ca50] font-bold text-xs tracking-widest uppercase">Limited Slots — June Batch</span>
                </div>

                <h1 className="text-[32px] sm:text-[48px] font-bold leading-[1.15] sm:leading-[1.2] text-white">
                  30 Days Can Change<br />
                  <span className="text-[#f2ca50]">More Than Your Body</span>
                </h1>

                <p className="text-[#d0c5af] text-base sm:text-lg leading-relaxed max-w-xl">
                  Join hundreds starting their transformation journey from June 1st with daily strength workouts, accountability & community support.
                </p>

                {/* Countdown */}
                <div className="flex gap-3 sm:gap-6 bg-[#1c1b1b]/70 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-[#d4af37]/10 shadow-[0_0_20px_rgba(212,175,55,0.08)] w-fit mx-auto lg:mx-0">
                  {[['d', 'Days'], ['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([key, label], i) => (
                    <div key={key} className="flex items-center gap-3 sm:gap-5">
                      <div className="text-center">
                        <div className="text-2xl sm:text-4xl font-black text-[#f2ca50] tabular-nums">
                          {pad(countdown[key as keyof typeof countdown])}
                        </div>
                        <div className="text-[9px] sm:text-xs uppercase text-[#d0c5af] font-bold tracking-widest mt-0.5">{label}</div>
                      </div>
                      {i < 3 && <div className="text-2xl sm:text-3xl font-black text-[#d4af37]/30 -mt-3">:</div>}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                  <button
                    onClick={() => scrollTo('register')}
                    className="bg-[#d4af37] text-[#3c2f00] px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base hover:bg-[#e9c349] active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    Register Now
                  </button>
                  {/* <button
                    onClick={() => scrollTo('challenge')}
                    className="border border-[#d4af37]/50 text-[#f2ca50] px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base hover:bg-[#d4af37]/5 active:scale-95 transition-all"
                  >
                    See Challenge Details
                  </button> */}
                </div>
              </div>

              {/* Image */}
              <div className="relative order-1 lg:order-2">
                <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-[#d4af37]/20 shadow-[0_0_40px_rgba(212,175,55,0.1)] p-1.5">
                  <img
                    className="w-full h-64 sm:h-80 lg:h-[500px] object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700"
                    src="/strenght-30days-challenge/hero-image.png"
                    alt="Athlete strength training"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                {/* Trust badge */}
                <div className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-6 bg-white/5 backdrop-blur-2xl border border-[#d4af37]/20 shadow-[0_0_20px_rgba(212,175,55,0.15)] p-4 sm:p-5 rounded-xl">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex -space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#131313] bg-[#201f1f]" />
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#131313] bg-[#2a2a2a]" />
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#131313] bg-[#d4af37] flex items-center justify-center text-[9px] font-black text-[#3c2f00]">100+</div>
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm sm:text-base">100+ Participants</div>
                      <div className="text-[10px] sm:text-xs text-[#d0c5af]">Starting June 1st</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social Proof ─────────────────────────────────────────────── */}
        {/* <section className="py-16 sm:py-20 bg-[#0e0e0e]" id="success">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-10">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-white mb-3">Transformations that Inspire</h2>
              <p className="text-[#d0c5af] max-w-2xl mx-auto text-sm sm:text-base">Real people, real results. See what dedication and professional guidance can achieve in 30 days.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMYcfFSLPDVm4btmP3xMOayTas2jY1EWK8o-d1iwoaQTH4_TswazX8hRUK5Kw_-bNCA-oxssgkcv2rX6AKGjfg-fwdKVaEDuiZVb64Gx8v7jr_witQcil3xCFz-85eCiaMxLqpsxMS1y5rIr9guqCurTHrZYE0F4NRA6hpiWqxgCwC_0QpzgesPfK4bGUeR5Va0zGJRTnRZYK5l6zNxhngbDwmbUD_3YltBVSel3VOo2c9Xp1hqlD71k-yu23eFW8w_O_lem5FeUXl', name: 'Rahul M.', result: '-6.5 kg', quote: '"The accountability kept me going on days I wanted to quit. Life-changing!"' },
                { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgLj2pAGm7dwbF26kWKHi6rSB5wZI_Ceovi5ZyP9xqKF1rCWjFVfjF6uTcD9m-d81B_6vnEyNELVG0EVMGBF3j-wbqNVzcRWHvyWSdcvm_b3fI-tH7KKmtzt9xDl26o5DuJJq4yCbluWbxH-HMX_esZhn5PfaMlFkSyQeI41zVby2sBJKIRvT7wqxZx1W5VhQFdODMtzNFH0DvntHvw9-kZpk_6-D-PUfHy0reH716GV6mqTi4-3zTGpe8aUOyLryjVmgFNJqrQwJu', name: 'Priya S.', result: '-4 kg & Toned', quote: '"I finally learned how to eat for my goals without starving. Incredible program!"' },
                { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxYL6IDnMCNPiEjTJkXF5gliFSNllHcMkpdb6eaSXMdUZWuUBfkiXGbu5yqay9IbMt7ZkeIcKTTxHPO_MhzFj8jXryR5QVKrBsztws7ufz6QiZgZRWy15UrTES8DLC9pJj2m7dRObIKQgfx5p-c6nLeq5PMkhNceHl-78jon69A3VVzrn1vakvH7R6R8wQvdpYcitL4BQlZIZjkAS5SCp2sG8WhZXVyUZ67gXLEzb2vNOmGaFLMLBVEj0_0QIVoX_6rD6SfzdLcYg', name: 'Amit V.', result: 'Stamina Boost', quote: '"From struggling with one flight of stairs to running 5k daily. Unmatched!"' },
              ].map((s) => (
                <div key={s.name} className="bg-white/5 backdrop-blur-xl border border-[#d4af37]/20 shadow-[0_0_20px_rgba(212,175,55,0.08)] rounded-2xl overflow-hidden group">
                  <div className="relative h-56 sm:h-64">
                    <img className="w-full h-full object-cover" src={s.img} alt={`${s.name} transformation`} loading="lazy" decoding="async" />
                    <div className="absolute bottom-4 left-4 bg-[#d4af37] text-[#3c2f00] px-3 py-1 rounded text-xs font-black uppercase">Before / After</div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-white font-bold text-lg">{s.name}</h3>
                      <span className="text-[#f2ca50] font-black text-sm">{s.result}</span>
                    </div>
                    <p className="text-[#d0c5af] text-sm italic leading-relaxed">{s.quote}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── Features Grid ─────────────────────────────────────────────── */}
        {/* <section className="py-16 sm:py-20" id="challenge">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-10">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-white mb-3">Everything You Need to Succeed</h2>
              <p className="text-[#d0c5af] text-sm sm:text-base">A holistic ecosystem designed for busy Indian professionals.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white/5 backdrop-blur-xl border border-[#d4af37]/20 p-6 sm:p-8 rounded-2xl hover:border-[#d4af37]/50 transition-all duration-300 group text-center sm:text-left">
                  <span className="material-symbols-outlined text-[#f2ca50] text-3xl sm:text-4xl mb-4 sm:mb-6 block group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3">{f.title}</h3>
                  <p className="text-[#d0c5af] text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── Is This You? ─────────────────────────────────────────────── */}
        {/* <section className="py-16 sm:py-20 bg-[#201f1f]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-10 text-center">
            <h2 className="text-[28px] sm:text-[32px] font-bold text-white mb-10 sm:mb-14">Is This You?</h2>
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center items-stretch">
              {PAIN_POINTS.map((p) => (
                <div key={p.q} className="bg-white/5 backdrop-blur-xl border border-[#d4af37]/20 px-6 sm:px-8 py-8 sm:py-10 rounded-2xl border-l-4 border-l-[#d4af37] max-w-sm w-full mx-auto sm:mx-0 text-center sm:text-left">
                  <p className="text-white font-bold text-lg sm:text-xl italic mb-4">{p.q}</p>
                  <p className="text-[#d0c5af] text-sm leading-relaxed">{p.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── 6-Step Journey ───────────────────────────────────────────── */}
        {/* <section className="py-16 sm:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-10">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-white mb-3">Simple 6-Step Journey</h2>
              <p className="text-[#d0c5af] text-sm sm:text-base">Your path to transformation starts here.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
              {STEPS.map((s, i) => (
                <div key={s.n} className="text-center group">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-black text-xl sm:text-2xl mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform ${s.active ? 'bg-[#d4af37] text-[#3c2f00] shadow-[0_0_20px_rgba(212,175,55,0.3)]' : i === 5 ? 'bg-[#d4af37]/20 border border-[#d4af37] text-[#f2ca50]' : 'bg-[#201f1f] border border-[#d4af37]/30 text-[#f2ca50]'}`}>
                    {s.n}
                  </div>
                  <h4 className="text-white font-bold mb-1 text-sm sm:text-base">{s.label}</h4>
                  <p className="text-[10px] sm:text-xs text-[#d0c5af] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── Registration Form ─────────────────────────────────────────── */}
        <section className="py-16 sm:py-20" id="register" ref={formRef as React.RefObject<HTMLElement>}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-white/5 backdrop-blur-2xl border border-[#d4af37]/20 shadow-[0_0_40px_rgba(212,175,55,0.1)] p-6 sm:p-10 lg:p-12 rounded-3xl border-t-4 border-t-[#d4af37]">
              {submitStatus === 'success' ? (
                <div className="text-center py-10 sm:py-14">
                  {/* Trophy + green check */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-7">
                    <div className="absolute inset-0 rounded-full bg-[#d4af37]/20 animate-ping" />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#f2ca50] to-[#b8860b] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.5)]">
                      <span className="material-symbols-outlined text-[#3c2f00] text-4xl sm:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    </div>
                    {/* Green confirmed tick */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-2 border-[#1a1a1a] flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.6)]">
                      <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  </div>

                  <p className="text-[#f2ca50] text-xs font-black uppercase tracking-widest mb-3">Registration Confirmed</p>
                  <h2 className="text-white text-3xl sm:text-4xl font-black mb-2 leading-tight">
                    Welcome to the<br />
                    <span className="text-[#f2ca50]">30-Day Challenge!</span>
                  </h2>
                  <p className="text-[#d0c5af] text-sm sm:text-base mt-4 max-w-sm mx-auto leading-relaxed">
                    Your spot is secured. Our team will verify your payment and add you to the WhatsApp group within <span className="text-white font-bold">24 hours</span>.
                  </p>

                  <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    {[
                      { icon: 'verified', label: 'Spot Locked' },
                      { icon: 'groups', label: 'Group Access' },
                      { icon: 'local_fire_department', label: 'June 1st' },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl py-3 px-2 flex flex-col items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#f2ca50] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                        <span className="text-[10px] text-[#d0c5af] font-bold text-center">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[#99907c] text-xs mt-7">Get ready — your transformation starts soon. 🔥</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8 sm:mb-10">
                    <h2 className="text-[#f2ca50] text-2xl sm:text-[32px] font-black mb-2">Secure Your Spot</h2>
                    <p className="text-[#d0c5af] text-sm sm:text-base">Only a few slots remaining for the June batch.</p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 sm:space-y-6">
                    {/* Row 1: Name + WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-widest uppercase text-[#d0c5af]">Full Name *</label>
                        <GoldInput {...register('full_name')} placeholder="Your full name" error={errors.full_name?.message} autoComplete="name" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-widest uppercase text-[#d0c5af]">WhatsApp Number *</label>
                        <GoldInput
                          {...register('whatsapp_number')}
                          type="tel"
                          placeholder="10-digit mobile number"
                          error={errors.whatsapp_number?.message}
                          autoComplete="tel"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    {/* Row 2: Age + City + Batch */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-widest uppercase text-[#d0c5af]">Age *</label>
                        <GoldInput {...register('age')} type="number" placeholder="25" min={15} max={80} error={errors.age?.message} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-widest uppercase text-[#d0c5af]">City *</label>
                        <GoldInput {...register('city')} placeholder="Mumbai" error={errors.city?.message} autoComplete="address-level2" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-widest uppercase text-[#d0c5af]">Batch Timing</label>
                        <div className="flex items-center gap-3 bg-[#201f1f] border border-[#d4af37]/30 rounded-lg px-4 h-[52px]">
                          <span className="material-symbols-outlined text-[#f2ca50] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                          <span className="text-[#f2ca50] font-bold text-sm">{cfg?.batchTime ?? '—'}</span>
                        </div>
                        <input type="hidden" {...register('batch_timing')} />
                      </div>
                    </div>

                    {/* Fitness Experience */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase text-[#d0c5af]">Fitness Experience *</label>
                      <GoldSelect {...register('fitness_experience')} error={errors.fitness_experience?.message} defaultValue="">
                        <option value="" disabled>Select your level</option>
                        {EXPERIENCE.map((e) => <option key={e} value={e}>{e}</option>)}
                      </GoldSelect>
                    </div>

                    {/* Primary Goal — chip selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-widest uppercase text-[#d0c5af]">Primary Goal *</label>
                      <Controller
                        name="primary_goal"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            {GOALS.map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => field.onChange(g)}
                                className={`h-12 rounded-lg text-xs sm:text-sm font-bold border transition-all active:scale-95 ${field.value === g
                                  ? 'bg-[#d4af37] text-[#3c2f00] border-[#d4af37] shadow-[0_0_16px_rgba(212,175,55,0.3)]'
                                  : 'border-[#99907c]/30 text-[#d0c5af] hover:border-[#d4af37] hover:text-[#f2ca50]'
                                  }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                      {errors.primary_goal && <p className="text-red-400 text-xs font-lexend">{errors.primary_goal.message}</p>}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-[#d4af37]/8 border border-[#d4af37]/30 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black uppercase tracking-widest text-[#d0c5af]">Step 1 — Pay Registration Fee</p>
                        {cfg && (
                          <button
                            type="button"
                            onClick={() => setCountry(null)}
                            className="flex items-center gap-1.5 text-[10px] text-[#99907c] hover:text-[#f2ca50] transition-colors"
                          >
                            <span className="text-base">{cfg.flag}</span>
                            <span>{cfg.label}</span>
                            <span className="material-symbols-outlined text-xs">edit</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[#d0c5af] text-sm mb-1">Amount: <span className="text-[#f2ca50] font-black">{cfg?.amount ?? '—'}</span></p>
                      <p className="text-[#d0c5af] text-sm mb-3">Send via {cfg?.paymentMethod ?? '—'}:</p>
                      <div className="flex items-center gap-3 bg-[#201f1f] border border-[#d4af37]/30 rounded-lg px-4 py-3">
                        <span className="material-symbols-outlined text-[#f2ca50] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>smartphone</span>
                        <span className="text-[#f2ca50] font-black text-xl tracking-widest">{cfg?.paymentNumber ?? '—'}</span>
                      </div>
                      <p className="text-[10px] text-[#99907c] mt-2">Then take a screenshot and upload it below.</p>
                    </div>

                    {/* Payment Screenshot */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase text-[#d0c5af]">Step 2 — Upload Screenshot * <span className="normal-case font-normal text-[#99907c]">(JPG/PNG, max 5 MB)</span></label>
                      <label
                        htmlFor="payment_screenshot"
                        className={`flex flex-col items-center justify-center gap-3 w-full min-h-[120px] p-5 bg-[#d4af37]/5 border-2 border-dashed ${errors.payment_screenshot ? 'border-red-400' : 'border-[#d4af37]/30'} rounded-xl cursor-pointer hover:border-[#d4af37]/60 transition-all`}
                      >
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="h-24 object-contain rounded-lg" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[#f2ca50] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
                            <p className="text-sm text-[#d0c5af] text-center">{fileLabel}</p>
                          </>
                        )}
                      </label>
                      <input
                        id="payment_screenshot"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="sr-only"
                        {...register('payment_screenshot', {
                          onChange: (e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setFileLabel(f.name);
                              setPreviewUrl(URL.createObjectURL(f));
                            }
                          },
                        })}
                      />
                      {errors.payment_screenshot && <p className="text-red-400 text-xs font-lexend">{errors.payment_screenshot.message as string}</p>}
                    </div>

                    {/* Error banner */}
                    {submitStatus === 'error' && (
                      <div className="bg-red-900/30 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-sm">
                        {submitError}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitStatus === 'loading'}
                      className="w-full bg-[#d4af37] text-[#3c2f00] h-14 sm:h-16 rounded-xl font-black text-base sm:text-lg hover:bg-[#e9c349] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitStatus === 'loading' ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                          Securing your spot…
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>
                          Secure My Spot
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Urgency Banner ────────────────────────────────────────────── */}
        {/* <section className="relative overflow-hidden py-14 sm:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] via-[#c49b28] to-[#a87c10]" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3c2f00 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#fff]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#3c2f00]/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-10 text-center text-[#3c2f00]">
            <div className="inline-flex items-center gap-2 bg-[#3c2f00]/15 border border-[#3c2f00]/20 px-4 py-1.5 rounded-full mb-5">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="text-xs font-black uppercase tracking-widest">June Batch — Almost Full</span>
            </div>

            <h2 className="text-[28px] sm:text-[40px] font-black uppercase leading-tight mb-3">
              Registration Closing Soon
            </h2>
            <p className="text-sm sm:text-lg font-semibold opacity-75 mb-8 max-w-lg mx-auto">
              Don&apos;t watch others transform. Be the transformation.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
              {[
                { value: '12', label: 'Slots Left' },
                { value: 'June 1', label: 'Start Date' },
                { value: '30', label: 'Day Program' },
              ].map((s) => (
                <div key={s.label} className="bg-[#3c2f00]/15 border border-[#3c2f00]/20 backdrop-blur-sm px-6 py-4 rounded-2xl min-w-[100px]">
                  <div className="text-2xl sm:text-3xl font-black">{s.value}</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="max-w-sm mx-auto mb-8">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-70">
                <span>Spots Filled</span>
                <span>88%</span>
              </div>
              <div className="w-full h-2.5 bg-[#3c2f00]/20 rounded-full overflow-hidden">
                <div className="h-full w-[88%] bg-[#3c2f00]/50 rounded-full" />
              </div>
            </div>

            <button
              onClick={() => scrollTo('register')}
              className="inline-flex items-center gap-2 bg-[#3c2f00] text-[#f2ca50] px-10 sm:px-14 py-4 sm:py-5 rounded-full font-black text-sm sm:text-base hover:bg-[#2a2000] active:scale-95 transition-all shadow-[0_8px_30px_rgba(60,47,0,0.35)]"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>
              Claim My Spot Now
            </button>
          </div>
        </section> */}

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20" id="faq">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-[28px] sm:text-[32px] font-bold text-white mb-10 sm:mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {FAQS.map((f, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-[#d4af37]/20 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex justify-between items-center p-5 sm:p-6 text-left gap-3 focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:outline-none"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-white font-bold text-sm sm:text-base">{f.q}</span>
                    <span className={`material-symbols-outlined text-[#d0c5af] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-[#d0c5af] text-sm leading-relaxed">{f.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[120px]" />
          </div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
            <p className="text-[#f2ca50] font-black uppercase tracking-widest text-xs sm:text-sm mb-5 sm:mb-6">Your Transformation Awaits</p>
            <h2 className="text-[28px] sm:text-[40px] lg:text-[48px] font-bold text-white mb-8 sm:mb-10 leading-tight">
              &ldquo;Your body does not change in one day.<br className="hidden sm:block" />
              But one decision can change everything.&rdquo;
            </h2>
            <button
              onClick={() => scrollTo('register')}
              className="bg-[#d4af37] text-[#3c2f00] px-10 sm:px-14 py-5 sm:py-6 rounded-full font-black text-base sm:text-xl hover:bg-[#e9c349] active:scale-95 transition-all shadow-[0_0_50px_rgba(212,175,55,0.4)]"
            >
              Join The 30 Days Challenge
            </button>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="bg-[#0e0e0e] border-t border-[#353534] py-12 sm:py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-10 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            <div className="text-center sm:text-left">
              <div className="text-xl font-black tracking-tight text-[#f2ca50] uppercase mb-4 sm:mb-6">UNIFITZ</div>
              <p className="text-[#d0c5af] mb-5 sm:mb-6 max-w-sm text-sm leading-relaxed mx-auto sm:mx-0">Premium fitness excellence tailored for the ambitious. We don&apos;t just build bodies — we build habits that last a lifetime.</p>
              <div className="flex gap-3 justify-center sm:justify-start">
                {[['photo_camera', 'Instagram', '#'], ['video_library', 'YouTube', '#'], ['chat', 'WhatsApp', '#']].map(([icon, label, href]) => (
                  <a key={label} href={href} aria-label={label} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-[#d4af37]/20 flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] transition-all focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:outline-none">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 text-center sm:text-left">
              <div>
                <h5 className="text-white font-bold mb-3 sm:mb-4 text-sm">Quick Links</h5>
                <ul className="space-y-2 text-[#d0c5af] text-sm">
                  <li><a href="/" className="hover:text-[#f2ca50] transition-colors">Home</a></li>
                  <li><button onClick={() => scrollTo('challenge')} className="hover:text-[#f2ca50] transition-colors">The Challenge</button></li>
                  <li><button onClick={() => scrollTo('register')} className="hover:text-[#f2ca50] transition-colors">Register</button></li>
                  {/* <li><a href="/30-days-strength-challenge/results" className="hover:text-[#f2ca50] transition-colors">Results</a></li> */}
                </ul>
              </div>
              <div>
                <h5 className="text-white font-bold mb-3 sm:mb-4 text-sm">Legal</h5>
                <ul className="space-y-2 text-[#d0c5af] text-sm">
                  <li><a href="/privacy-policy" className="hover:text-[#f2ca50] transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-[#f2ca50] transition-colors">Terms of Service</a></li>
                  {/* <li><a href="https://wa.me/917387846841?text=I%20want%20to%20know%20more%20about" target="_blank" rel="noreferrer" className="hover:text-[#f2ca50] transition-colors">Support</a></li> */}
                </ul>
                <p className="text-[#99907c] text-xs mt-6">© 2025 Unifitz. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>

        {/* ── Mobile Bottom Bar ─────────────────────────────────────────── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-2 bg-[#131313]/90 backdrop-blur-lg border-t border-[#d4af37]/30 shadow-[0_-8px_30px_rgba(212,175,55,0.15)]">
          <button
            onClick={() => scrollTo('register')}
            className="flex items-center justify-center gap-2 w-full bg-[#d4af37] text-[#3c2f00] py-4 rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>
            JOIN THE 30-DAY CHALLENGE
          </button>
        </div>

        {/* Spacer for mobile bottom bar */}
        <div className="md:hidden h-20" />

      </div>

      <WhatsAppButton />
    </>
  );
};

export default StrengthChallenge;
