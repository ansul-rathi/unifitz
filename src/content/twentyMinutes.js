// ══════════════════════════════════════════════════════════════
// /20minutes-fitness — waitlist page for the 20-minute daily series.
// All copy for the page lives here (same rule as content/landing.js).
// Keep every line short: the page is read on a phone, at a swipe.
// Slot times are IST.
// ══════════════════════════════════════════════════════════════

// 1 December 2026, 5:00 AM IST (= 30 Nov 23:30 UTC).
export const START_MS = Date.UTC(2026, 10, 30, 23, 30);

// Six back-to-back slots, every 30 min. [hour, minute] in IST, 24h.
const slots = from => Array.from({ length: 6 }, (_, i) => [from + Math.floor(i / 2), (i % 2) * 30]);
export const SLOTS = { morning: slots(5), evening: slots(17) };

export const T = {
  meta: {
    title: '20-Minute Fitness — Join the Founding Batch Waitlist | Unifitz',
  },

  hero: {
    eyebrow: 'Starts 1 December · Limited seats',
    h1: '20 minutes. Every day.',
    sub: 'Live workouts for busy people — with a trainer checking your form.',
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

  slots: {
    heading: 'Pick your time',
    morning: 'Morning',
    evening: 'Evening',
    note: 'IST · 20–25 min each',
  },

  form: {
    heading: 'Join the waitlist',
    sub: 'Free. First batch, limited seats.',
    goals: ['Build a daily habit', 'Lose weight', 'Get stronger', 'Fix posture & back pain', 'More energy', 'Just exploring'],
    goalLabel: 'Your main goal',
    copy: {
      cta: 'Join the waitlist',
      consent: 'I agree to be contacted on WhatsApp or by phone about the 20-minute series. I can opt out anytime.',
      consentError: 'Please tick the box so we can message you when seats open.',
      doneTitle: 'You’re on the waitlist.',
      doneBody: 'We’ll WhatsApp you before 1 December so you can pick your slot first.',
      dupeBody: 'You’re already on the waitlist — we’ll WhatsApp you before 1 December.',
      waText: 'Hi Unifitz! I just joined the 20-minute fitness waitlist.',
      footnote: 'No payment now',
    },
  },

  faq: {
    heading: 'Quick answers',
    items: [
      { q: 'Is the waitlist free?', a: 'Yes. No payment, no commitment.' },
      { q: 'Beginner?', a: 'Welcome. Every move has an easier version.' },
      { q: 'Equipment?', a: 'None. Just a mat.' },
      { q: 'Camera on?', a: 'Yes, so the trainer can check your form.' },
    ],
  },

  disclaimer: 'General fitness, not medical advice. Check with your doctor if you have a health condition.',
};
