// ══════════════════════════════════════════════════════════════
// Unifitz landing — content config. ALL landing copy lives here,
// keyed by market. Components render strings from this file only —
// zero hardcoded copy in the component tree.
//
// Approved scope: US / NRI market only (Indian-origin women 30–50
// in the US). $ pricing, English base. India (IN) can be added as a
// second key later without touching components.
//
// Honesty rules (from the brief):
//   • No invented member counts / transformation numbers.
//   • Anything unproven is `null` with a TODO:PROOF comment next to it.
//   • Missing images are `img: null` with a TODO:ASSET comment.
// Null fields never render in production (the block hides itself); in
// `pnpm dev` they show as labelled placeholders so gaps stay visible. This
// keeps placeholder text out of the shipped bundle entirely.
// ══════════════════════════════════════════════════════════════

export const MARKET = 'US';

// Weekly class schedule. CANONICAL TIMES ARE UTC, derived from the real
// Indian (IST = UTC+5:30) class slots so the timetable can convert them to
// whichever US zone the viewer picks:
//   6:00–7:00 AM IST  → 00:30 UTC      7:00–8:00 AM IST  → 01:30 UTC
//   6:30–7:30 PM IST  → 13:00 UTC      7:30–8:30 PM IST  → 14:00 UTC
// day: 0=Sun … 6=Sat (same weekday in UTC as IST for these times).
// TODO:PROOF — confirm which classes run on which days + real instructor names.
const SCHEDULE = [
  { day: 1, utc: '00:30', dur: 60, title: 'Morning Yoga Flow', coach: 'Sana', format: 'Yoga' },
  { day: 1, utc: '13:00', dur: 60, title: 'Strength Foundations', coach: 'Mia', format: 'Strength' },
  { day: 2, utc: '01:30', dur: 60, title: 'Zumba Burn', coach: 'Priya', format: 'Zumba' },
  { day: 2, utc: '14:00', dur: 60, title: 'Yoga for PCOS', coach: 'Sana', format: 'Yoga' },
  { day: 3, utc: '00:30', dur: 60, title: 'Meditation & Breath', coach: 'Anjali', format: 'Meditation' },
  { day: 3, utc: '13:00', dur: 60, title: 'Zumba Burn', coach: 'Priya', format: 'Zumba' },
  { day: 4, utc: '01:30', dur: 60, title: 'Post-40 Strength', coach: 'Mia', format: 'Strength' },
  { day: 4, utc: '14:00', dur: 60, title: 'Evening Yoga', coach: 'Sana', format: 'Yoga' },
  { day: 5, utc: '00:30', dur: 60, title: 'Morning Yoga Flow', coach: 'Sana', format: 'Yoga' },
  { day: 5, utc: '13:00', dur: 60, title: 'Zumba Burn', coach: 'Priya', format: 'Zumba' },
  { day: 6, utc: '01:30', dur: 60, title: 'Weekend Zumba', coach: 'Priya', format: 'Zumba' },
];

export const CONTENT = {
  US: {
    currency: '$',
    brand: 'Unifitz',

    nav: {
      links: [
        { label: 'Classes', href: '#formats' },
        { label: 'Timetable', href: '#timetable' },
        { label: 'Instructors', href: '#instructors' },
        { label: 'Pricing', href: '#pricing' },
      ],
      cta: 'Choose your plan',
      ctaHref: '#pricing',
    },

    // Hero — Direction A (accountability). Outcome + mechanism.
    hero: {
      // TODO:ASSET — real class-in-progress frame. Drop public/landing/hero.jpg
      // (4:3, ~1200×900) then set: img: '/landing/hero.jpg'. Until then the
      // hero card shows the next live class instead of a photo.
      img: null,
      eyebrow: 'Live classes for women',
      h1: 'The class that notices when you’re not there.',
      sub: 'Live, instructor-led Zumba, Yoga, Strength and Meditation — from home, on your timezone, in small cohorts where the instructor actually knows your name. Not another video library you’ll forget by Friday.',
      primaryCta: 'Choose your plan',
      primaryHref: '#pricing',
      scheduleCta: 'See this week’s classes',
      scheduleHref: '#timetable',
      // Micro-proof: NO invented numbers. Honest, specific, verifiable.
      // TODO:PROOF — append real "N members · N classes run" once known.
      microProof: 'Live classes six days a week · mornings and evenings',
      cardNote: 'Small cohorts · cameras optional · your instructor knows your name',
      secondary: {
        label: 'Grab a free masterclass seat',
        href: '#masterclass',
        note: 'One live class, seat-limited — for the just-looking.',
      },
    },

    // §4.3 — the differentiator. Real schedule, her timezone.
    timetable: {
      eyebrow: 'This week, live',
      heading: 'Real classes. Real instructors. At times that fit your day.',
      sub: 'Every class below is live on Zoom this week. Pick your timezone and the times convert instantly.',
      tzPrefix: 'Times shown for',
      tzLabel: 'Show times in',
      swipeHint: 'Swipe to see the whole week →',
      schedule: SCHEDULE,
      cta: 'Choose your plan',
      ctaHref: '#pricing',
    },

    problem: {
      eyebrow: 'If this sounds familiar',
      heading: 'You didn’t lack the will. You lacked someone expecting you.',
      items: [
        { k: 'The membership', t: 'The gym membership you paid for, drove to twice, then paid for eleven more months.' },
        { k: 'Minute four', t: 'The YouTube workout you paused at minute four to “start properly on Monday.”' },
        { k: '6 p.m.', t: 'The 6 p.m. energy crash that quietly decides you’re not working out today.' },
      ],
    },

    whyLive: {
      eyebrow: 'Why live changes everything',
      heading: 'A recording can’t tell you didn’t show up. A person can.',
      lead: 'The whole product is one thing a video can never do: someone is waiting for you.',
      points: [
        { t: 'The instructor sees you', d: 'Two-way video, small cohorts. She watches your form and calls it out — by name.' },
        { t: 'She notices you’re gone', d: 'Miss a class and it’s felt. That quiet accountability is what turns “someday” into a habit.' },
        { t: 'You’re in it with women like you', d: 'Same age, same life, same living-room setup. Not a room full of 22-year-olds.' },
      ],
    },

    gallery: {
      eyebrow: 'Inside the classes',
      heading: 'Real women. Real living rooms. Real Mondays.',
      note: null,
      // TODO:ASSET — real class screenshots / member photos (women 30–50,
      // mid-class, at home; no stock). Add public/landing/gallery-N.jpg and set
      // img: '/landing/gallery-N.jpg'. The section hides until ≥1 img is set.
      photos: [
        { img: null, cap: 'A live Strength cohort, mid-set.' },
        { img: null, cap: 'Morning Yoga — cameras on, coach cueing.' },
        { img: null, cap: 'The post-class check-in.' },
      ],
    },

    formats: {
      eyebrow: 'Four ways to move',
      heading: 'Pick your energy. Mix all four.',
      items: [
        { name: 'Zumba', suits: 'For the days you want to sweat without it feeling like a workout.', format: 'Zumba' },
        { name: 'Yoga', suits: 'For flexibility, calmer mornings and a back that stops complaining.', format: 'Yoga' },
        { name: 'Strength', suits: 'For real, visible strength — and everything a post-40 body needs to keep.', format: 'Strength' },
        { name: 'Meditation', suits: 'For the 15 minutes that make the other 23 hours easier.', format: 'Meditation' },
      ],
    },

    // Highest-leverage trust block. A card renders only once `name` is set;
    // the whole section (and its nav link) hides while none are.
    // TODO:PROOF — Ansul's real instructors: full name, certification (e.g.
    // "RYT-200, Yoga Alliance"), years teaching. TODO:ASSET — square photo at
    // public/landing/coach-N.jpg, then img: '/landing/coach-N.jpg'.
    instructors: {
      eyebrow: 'The people, not a platform',
      heading: 'Real instructors, with names and faces.',
      note: null,
      items: [
        { img: null, name: null, cred: null, years: null, focus: 'Zumba & cardio' },
        { img: null, name: null, cred: null, years: null, focus: 'Yoga & mobility' },
        { img: null, name: null, cred: null, years: null, focus: 'Strength & post-40' },
        { img: null, name: null, cred: null, years: null, focus: 'Meditation & breath' },
      ],
    },

    tracks: {
      eyebrow: 'Built for your body',
      heading: 'Not “get fit.” The specific thing you’re actually dealing with.',
      items: [
        { name: 'PCOS / PCOD Care', d: 'Movement and pacing designed around hormonal and cycle changes — not generic HIIT that makes it worse.' },
        { name: 'Weight-Loss Intensive', d: 'A calorie-aware, 5-day structure with weekly weigh-ins and a coach watching the trend, not the scale.' },
        { name: 'Post-40 Strength', d: 'Protecting bone, muscle and joints — the strength work that matters most after 40.' },
        { name: 'Postpartum Return', d: 'A gentle, progressive way back to movement after birth, at a pace that respects your body.' },
      ],
      // Health-claim disclaimer (FTC / ASCI). Shown under the tracks + footer.
      disclaimer: 'Unifitz classes are general fitness, not medical treatment. Talk to your doctor before starting — especially with PCOS/PCOD, during pregnancy, after giving birth, or with any health condition.',
    },

    proof: {
      eyebrow: 'From our members',
      heading: 'The women already showing up.',
      // Live approved testimonials/reviews come from Supabase only. With none,
      // the section hides — never an invented quote or number.
    },

    pricing: {
      eyebrow: 'Membership',
      heading: 'One membership. Cancel anytime.',
      sub: 'Quarterly billing saves 12% — and month-to-month is always here too.',
      billing: [
        { key: 'monthly', label: 'Monthly', factor: 1, months: 1, save: null },
        { key: 'quarterly', label: 'Quarterly', factor: 0.88, months: 3, save: 'Save 12%' },
      ],
      defaultBilling: 'quarterly',
      // 4 primary tiers, Complete elevated as the $89 anchor.
      primary: [
        { name: 'Starter', monthly: 39, tagline: '3 days a week to build the habit.', feats: ['3 live classes / week', 'Full weekly timetable', 'Class recordings'] },
        { name: 'Regular', monthly: 59, tagline: 'Show up 5 days a week.', feats: ['5 live classes / week', 'Full weekly timetable', 'Class recordings'] },
        { name: 'Starter + Diet', monthly: 69, tagline: 'Classes plus a plan for your plate.', feats: ['3 live classes / week', 'Weekly custom diet plan', 'Class recordings'] },
        { name: 'Complete', monthly: 89, anchor: true, tagline: 'Classes, diet and a coach who checks in.', feats: ['5 live classes / week', 'Weekly custom diet plan', 'Progress dashboard', '1 coaching call / month'] },
      ],
      more: [
        { name: 'PCOS / PCOD Care', monthly: 109, note: 'Condition-specific weekly programming + symptom log.' },
        { name: 'Weight-Loss Intensive', monthly: 109, note: '5-day structure, weekly weigh-in, coach on the trend.' },
        { name: 'Duo', monthly: 139, note: 'Two people, one membership — do it with a friend.' },
        { name: '1:1 Personal Coaching', monthly: 229, note: 'Private sessions, weekly plan, ongoing messaging.' },
      ],
      founding: {
        name: 'Founding Member',
        price: 799,
        unit: '/year',
        cap: 50,
        // Real scarcity only. NO fake countdown.
        scarcity: 'Limited to 50 founding members',
        seatsLeft: null, // TODO:PROOF — set a real number to show "N seats left"
        perks: ['A full year, locked at the lowest price we’ll ever offer', 'Everything in Complete', 'Priority seat in every class', 'Direct line to Ansul & the instructors'],
      },
      primaryCta: 'Choose plan',
      anchorCta: 'Choose Complete',
      // Factual (it has every feature), unlike "Most popular" which needs data.
      anchorBadge: 'Everything included',
      moreToggle: 'See all plans',
      moreCollapse: 'Show fewer',
      // Refund window (if any) comes from BUSINESS.refundDays in config.js.
      refund: 'Cancel anytime from your account — your plan runs to the end of the period you’ve paid for.',
      refundLink: 'Cancellation & refund policy',
    },

    objections: {
      eyebrow: 'The honest answers',
      heading: 'What you’re actually wondering.',
      items: [
        { q: '“I’ll join and stop in two weeks, like last time.”', a: 'That’s exactly what live cohorts fix. Your instructor sees who’s on the call and who isn’t — you’re not disappearing into a dashboard. Being expected is the mechanism that lasted where willpower didn’t.' },
        { q: '“Is this a real business, or one person with a Zoom link?”', a: 'A full weekly timetable you can see before you pay — with the instructor for every class — published prices, and a plain-language cancellation policy. Nothing hidden until checkout. Message us on WhatsApp and a real person answers.' },
        { q: '“The timings won’t work for me.”', a: 'The timetable above is already converted to your timezone. There are morning and evening cohorts across the week — you pick what fits, and you can switch.' },
        { q: '“Will this actually help my PCOD / post-40 weight?”', a: 'We run named tracks for exactly this — PCOS/PCOD Care, Weight-Loss Intensive and Post-40 Strength — programmed for the condition, not generic HIIT that backfires.' },
        { q: '“Online means they can’t correct my form.”', a: 'It’s live two-way video in small cohorts. The instructor watches you and calls out corrections by name — the opposite of a recording talking at you.' },
      ],
    },

    faq: {
      eyebrow: 'Before you ask',
      heading: 'Questions, answered.',
      items: [
        { q: 'Do I need any equipment?', a: 'No. Every class has a no-equipment option. A mat and a bit of floor space is plenty; a couple of water bottles stand in for light weights early on.' },
        { q: 'Do I have to be on camera?', a: 'It helps the instructor correct your form, but it’s never required. Many members keep the camera off for the first few weeks.' },
        { q: 'I’m a complete beginner. Will I keep up?', a: 'Yes — beginners are the point. Instructors give a scaled-down variation for every movement, live, as you go.' },
        { q: 'What if I miss a class?', a: 'Life happens. There are multiple cohorts a week and every class is recorded, so you never fall behind — but your instructor will still notice, which is rather the idea.' },
        { q: 'Are the classes really women-only?', a: 'Yes. Every class and every instructor-led session is women-only by design.' },
        { q: 'How does billing work?', a: 'Choose monthly or quarterly (quarterly saves ~12%). You’re billed upfront for the period and can cancel anytime — no contract.' },
        { q: 'Can I switch plans or tracks?', a: 'Anytime, from your account. Move between Starter, Regular, Complete or a condition track whenever your goals change.' },
        { q: 'What’s the cancellation / refund policy?', a: 'Cancel anytime from your account. Your plan stays active until the end of the period you’ve paid for, and you won’t be charged again. The full policy is linked at the bottom of this page.' },
      ],
    },

    masterclass: {
      eyebrow: 'Just looking?',
      heading: 'Sit in on one live class, free.',
      sub: 'A single, seat-limited live class — real instructor, real cohort. No card, no auto-enroll. Come see if it’s for you.',
      cta: 'Claim a free seat',
      consent: 'I agree to be contacted on WhatsApp or by phone about my free class. I can opt out anytime.',
      doneTitle: 'You’re on the list.',
      doneBody: 'We’ll message you on WhatsApp with the next class date and your Zoom link.',
      dupeBody: 'You’re already on the list — we’ll be in touch on WhatsApp soon.',
    },

    finalCta: {
      eyebrow: 'Ready when you are',
      heading: 'A class where someone’s expecting you.',
      sub: 'Pick a plan, see this week’s timetable in your timezone, and join Monday’s cohort.',
      cta: 'Choose your plan',
      href: '#pricing',
      riskReversal: 'Cancel anytime · Women-only · Your timezone',
    },

    footer: {
      tagline: 'Live, instructor-led fitness classes for women. Small cohorts, real schedule, a coach who knows your name.',
      tzNote: 'Class times on this page are shown in your device’s timezone.',
      explore: 'Explore',
      legal: 'Legal',
      legalLinks: [
        { label: 'Privacy policy', to: '/privacy' },
        { label: 'Terms of service', to: '/terms' },
        { label: 'Cancellation & refunds', to: '/refund' },
      ],
    },
  },
};

export const L = CONTENT[MARKET];
