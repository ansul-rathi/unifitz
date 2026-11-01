// ══════════════════════════════════════════════════════════════
// /20minutes-fitness — waitlist page for FFW (Fast Fitness Workout), the
// 20-minute daily series. All copy + config for the page lives here (same
// rule as content/landing.js). Keep every line short: the page is read on a
// phone, at a swipe. Slot times are IST.
//
// A value still written as <<placeholder>> renders nothing (see isSet in
// lib/ffw.js), so the page never shows a half-filled block.
// ══════════════════════════════════════════════════════════════

// 1 December 2026, 5:00 AM IST (= 30 Nov 23:30 UTC) — the first class.
export const START_MS = Date.UTC(2026, 10, 30, 23, 30);

// Six back-to-back slots, every 30 min. [hour, minute] in IST, 24h.
const slots = from => Array.from({ length: 6 }, (_, i) => [from + Math.floor(i / 2), (i % 2) * 30]);
export const SLOTS = { morning: slots(5), evening: slots(17) };

export const FFW = {
  launchDate: '2026-12-01',            // IST calendar date of START_MS
  totalSeats: 100,
  seatsTakenFallback: 0,               // used if the live count (ffw_waitlist_count RPC) is unavailable
  founderOffer: '<<First week free + founding price locked for life>>', // TODO: confirm offer
  priceHint: '<<Under ₹999/month after launch>>',                       // TODO: confirm price
  metaPixelId: '<<PIXEL_ID>>',         // TODO: real Meta Pixel id (digits). Placeholder → pixel never loads.
  // GA4 is site-wide: set VITE_GA4_ID and lib/track sends generate_lead. Nothing to add here.
  gaId: null,
  whatsappCommunityUrl: 'https://chat.whatsapp.com/JjoBnNAhdE30UaK3pR1Qo9', // FFW founding-batch WhatsApp group
  socialProof: '2,000+',               // TODO: confirm the real member count before running ads
  consentVersion: 'ffw-2026-10-31',    // bump when T.form.consent changes; stored with each lead
  ogImage: '/og-image.jpg',            // TODO: make /og/ffw.jpg (1200×630) and point here
  // TODO: { name, role, cred, img } × 2 — section renders once these are filled.
  trainers: [],
  // TODO: { name, city, quote, img? } × 3 — section renders once these are filled.
  testimonials: [],
};

export const T = {
  meta: {
    title: '20-Minute Fitness (FFW): Live 20-min workouts with form check | Unifitz',
    description: 'Fast Fitness Workout: 20-minute live sessions, Mon–Fri, with a second trainer checking your form. Founding batch starts 1 Dec. Join the free waitlist.',
  },

  hero: {
    chip: 'Starts 1 December',
    concept: 'Fast Fitness Workout',
    h1: ['20 minutes.', 'Every day.'],   // line 1 in brand orange
    // Live-timer visual: [move, form cue shown while it runs].
    moves: [['Squats', 'Knees out'], ['Plank', 'Hips level'], ['Lunges', 'Chest up'], ['Push-ups', 'Elbows in'], ['High knees', 'Great pace']],
    cta: 'Join the free waitlist',
  },

  how: {
    heading: 'How it works',
    points: [
      { icon: 'timer', t: '20-minute live sessions', d: 'Mon–Fri. Quick, focused, done.' },
      { icon: 'users', t: 'Two trainers, every session', d: 'One teaches. One checks your posture.' },
      { icon: 'message', t: 'Personal form feedback', d: 'What to fix — on WhatsApp after class.' },
      { icon: 'sparkles', t: 'Saturday: dance + 1:1', d: 'Dance fitness, then your questions answered.' },
    ],
  },

  trainers: { heading: 'Meet your trainers' },

  feedback: {
    heading: 'What form feedback looks like',
    coach: 'Unifitz form coach',
    message: 'Hi Ananya 👋 Today’s squats: knees caving in slightly. Try pushing them out over your toes. Great pace on the plank! 💪',
    time: '7:42 AM',
    caption: 'Every session. Personal. On WhatsApp.',
  },

  slots: {
    heading: 'Pick your time',
    morning: 'Morning',
    evening: 'Evening',
    note: 'IST · 20–25 min each',
    helper: 'Pick all times that work. We’ll open batches at the most popular slots.',
    tzLine: 'Times shown in IST · your local time below',
  },

  testimonials: { heading: 'From Unifitz members' },

  form: {
    heading: 'Join the waitlist',
    sub: 'Free. Founding batch, limited seats.',
    goals: ['Build a daily habit', 'Lose weight', 'Get stronger', 'Fix posture & back pain', 'More energy', 'Just curious'],
    goalLabel: 'Your main goal',
    goalPlaceholder: 'Select your main goal',
    cta: 'Join free waitlist',
    consent: 'By joining you agree to get WhatsApp/phone updates about FFW. Opt out anytime.',
    // Save failed → we hand the details to WhatsApp instead.
    waFallback: {
      title: 'Opening WhatsApp with your details…',
      body: 'Our form hiccuped, so just hit send there and we’ll add you to the founding batch.',
      cta: 'Open WhatsApp',
    },
    // Thank-you pop-up after a successful signup.
    thanks: {
      title: n => `You’re in, ${n}!`,
      dupeTitle: n => `You’re already in, ${n}!`,
      line: 'Thank you for joining. See you on 1 December — let’s make every 20 minutes count. 💪',
      community: 'Join the FFW community',
      communityNote: 'Batch updates and class links land here.',
    },
    proof: n => `Free · No payment · ${n} Unifitz members`,
    waText: 'Hi Unifitz! I just joined the FFW (20-minute fitness) waitlist.',
  },

  faq: {
    heading: 'Quick answers',
    items: [
      { q: 'Is the waitlist free?', a: 'Yes. No payment, no commitment.' },
      { q: 'Beginner?', a: 'Welcome. Every move has an easier version.' },
      { q: 'Equipment?', a: 'None. Just a mat.' },
      { q: 'Camera on?', a: 'Yes, so the trainer can check your form.' },
      { q: 'What will it cost after launch?', a: FFW.priceHint },
      { q: 'Miss a class?', a: '<<Recordings available for 48 hours>>' },        // TODO
      { q: 'Which app?', a: '<<Zoom>>, link on WhatsApp before each class.' },   // TODO
      { q: 'Is it for men too?', a: 'Yes. FFW is for anyone who’s busy.' },
      { q: 'Can I cancel?', a: 'Waitlist is free. Leave anytime.' },
    ],
  },

  finalCta: {
    heading: 'Founding seats close when the batch fills.',
    sub: 'Join free in 20 seconds.',
  },

  disclaimer: 'General fitness, not medical advice. Check with your doctor if you have a health condition.',
};
