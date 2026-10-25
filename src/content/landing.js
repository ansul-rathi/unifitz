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
        { label: 'Stories', href: '#stories' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
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
      sub: 'Live, instructor-led Zumba, Yoga, Strength, Tabata and Meditation — from home, on your timezone, in small cohorts where the instructor actually knows your name. Not another video library you’ll forget by Friday.',
      primaryCta: 'Choose your plan',
      primaryHref: '#pricing',
      scheduleCta: 'Explore the classes',
      scheduleHref: '#formats',
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

    // Photo + testimonial carousel. Photo slides and quote slides alternate —
    // a quote is never laid over a photo of someone else.
    gallery: {
      eyebrow: 'Inside the classes',
      heading: 'Real women. Real living rooms. Real Mondays.',
      lead: 'No studio lighting, no perfect outfits. Just women fitting a class in between school runs, work calls and dinner — and showing up again next week.',
      // TODO:ASSET — drop public/landing/gallery-N.jpg (portrait 4:5) and set
      // img. Slides without an img are skipped in production.
      photos: [
        { img: null, cap: 'Monday-morning Zumba — living room, coffee table pushed aside.' },
        { img: null, cap: 'Strength cohort, mid-set. Water bottles count as weights in week one.' },
        { img: null, cap: 'Evening Yoga — cameras on, instructor cueing the stretch by name.' },
        { img: null, cap: 'Tabata: twenty seconds on, ten off. Four minutes that feel like forty.' },
        { img: null, cap: 'The post-class check-in. Wins, aches and what’s for dinner.' },
        { img: null, cap: 'Weekend class — the kids joined for the cool-down.' },
      ],
      // TODO:PROOF — real member quotes only (with permission). Approved rows
      // from the Supabase `testimonials` table are added automatically.
      quotes: [
        // { quote: '…', name: 'First name', city: 'City, State', result: 'Optional short result' },
      ],
    },

    formats: {
      eyebrow: 'Five ways to move',
      heading: 'Pick your energy. Mix all five.',
      items: [
        { name: 'Zumba', suits: 'For the days you want to sweat without it feeling like a workout.', format: 'Zumba' },
        { name: 'Yoga', suits: 'For flexibility, calmer mornings and a back that stops complaining.', format: 'Yoga' },
        { name: 'Strength', suits: 'For real, visible strength — and everything a post-40 body needs to keep.', format: 'Strength' },
        { name: 'Tabata', suits: 'For busy days: 20 seconds on, 10 off — short, sharp intervals that get the heart going fast.', format: 'Tabata' },
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
    },

    // Health-claim disclaimer (FTC / ASCI). Shown under the tracks + footer.
    disclaimer: 'Unifitz classes are general fitness, not medical treatment. Talk to your doctor before starting — especially with PCOS/PCOD, during pregnancy, after giving birth, or with any health condition.',

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
      anchorCta: 'Get Complete',
      // Factual (it has every feature), unlike "Most popular" which needs data.
      anchorBadge: 'Everything included',
      moreToggle: 'See all plans',
      moreCollapse: 'Show fewer',
      // Refund window (if any) comes from BUSINESS.refundDays in config.js.
      refund: 'Cancel anytime from your account — your plan runs to the end of the period you’ve paid for.',
      refundLink: 'Cancellation & refund policy',
    },

    faq: {
      eyebrow: 'Before you ask',
      heading: 'Questions, answered.',
      lead: 'The things women ask us most before their first class.',
      helpTitle: 'Still unsure?',
      helpBody: 'Message us on WhatsApp — a real person on the team replies, usually the same day.',
      helpCta: 'Ask on WhatsApp',
      // Grouped so the list scans; the flat list also feeds the FAQPage JSON-LD.
      groups: [
        {
          name: 'Getting started',
          items: [
            { q: 'I’m a complete beginner and haven’t exercised in years. Will I keep up?', a: 'Yes — most members start exactly there. Instructors show an easier and a harder version of every move, live, so you pick the level that fits that day. Nobody is expected to keep pace with the instructor in week one.' },
            { q: 'Is there an age limit? I’m in my 40s / 50s.', a: 'No. Unifitz is built for women in their 30s, 40s and 50s. Classes are paced for real bodies — knees, backs and busy schedules included — not for 22-year-olds.' },
            { q: 'Do I need any equipment?', a: 'No. Every class can be done with bodyweight only. A yoga mat and a water bottle is plenty to start; light dumbbells or a resistance band help later in Strength, but they’re optional.' },
            { q: 'How much space do I need?', a: 'About the length of a yoga mat with room to stretch your arms out. Move any loose rugs or small tables aside and you’re set — most members train in a living room or bedroom.' },
          ],
        },
        {
          name: 'In class',
          items: [
            { q: 'How do I join a class?', a: 'Every class runs live on Zoom. After you sign up you’ll see your classes in your Unifitz account with a one-tap join link. A phone works, but a laptop or TV gives you a bigger view of the instructor. Joining 5 minutes early to check sound is a good habit.' },
            { q: 'Do I have to turn my camera on?', a: 'No. Camera on helps the instructor correct your form, but it’s always your choice. Plenty of women keep it off for the first few classes and switch it on once they’re comfortable. Only the instructor and your small cohort can see you — nobody else.' },
            { q: 'Are classes really women-only?', a: 'Yes. Every participant and every instructor is a woman, by design.' },
            { q: 'What if I miss a class?', a: 'Life happens. There are morning and evening classes through the week, so you can catch another one, and recordings are included in your plan so you never fall behind.' },
            { q: 'Which class should I start with?', a: 'If you’re new, start with Yoga or Zumba — both are easy to follow from day one. Add Strength once you’re comfortable, and try Tabata when you want a short, intense session. Meditation fits anywhere.' },
            { q: 'Is Tabata too intense for a beginner?', a: 'It’s short and hard by design — 20 seconds of effort, 10 seconds of rest — but the effort is yours to set. The instructor always shows a low-impact version with no jumping.' },
          ],
        },
        {
          name: 'Health & results',
          items: [
            { q: 'I have PCOS / PCOD, thyroid, back or knee issues. Can I join?', a: 'Usually, yes — tell us when you sign up and your instructor will suggest modifications. Unifitz is general fitness, not medical treatment, so please check with your doctor first if you have any health condition.' },
            { q: 'Can I join while pregnant or after giving birth?', a: 'Please get your doctor’s go-ahead first. After birth, most women wait at least 6 weeks (longer after a C-section) before returning to exercise. Once cleared, start gently with Yoga and tell your instructor so they can adjust moves for you.' },
            { q: 'How soon will I see results?', a: 'Most women notice better energy and sleep within the first 2–3 weeks. Visible changes in strength and shape usually take 8–12 weeks of showing up 3–5 times a week — consistency matters more than intensity.' },
            { q: 'How does the diet plan work?', a: 'On plans with diet, you get a weekly plan built around your goal, routine and the food you actually eat at home — Indian meals included. It’s adjusted as your week-to-week progress comes in.' },
          ],
        },
        {
          name: 'Plans & billing',
          items: [
            { q: 'How does billing work?', a: 'Pick monthly or quarterly (quarterly saves 12%). You’re billed upfront for the period, in US dollars, and there’s no long-term contract.' },
            { q: 'Can I switch plans later?', a: 'Yes, anytime from your account — move between Starter, Regular, Complete or a specialised plan as your goals change.' },
            { q: 'How do I cancel?', a: 'Cancel anytime from your account. Your plan stays active until the end of the period you’ve paid for and you won’t be charged again. The full policy is linked at the bottom of this page.' },
            { q: 'Can I try a class before I pay?', a: 'Yes — claim a free seat in our live masterclass below. No card needed.' },
          ],
        },
      ],
    },

    masterclass: {
      eyebrow: 'Just looking?',
      heading: 'Sit in on one live class, free.',
      sub: 'A single, seat-limited live class — real instructor, real cohort. No card, no auto-enroll. Come see if it’s for you.',
      cta: 'Claim a free seat',
      consent: 'I agree to be contacted on WhatsApp or by phone about my free class. I can opt out anytime.',
      consentError: 'Please tick the box so we can contact you about your seat.',
      waText: 'Hi Unifitz! I’d like a free masterclass seat.',
      doneTitle: 'You’re on the list.',
      doneBody: 'We’ll message you on WhatsApp with the next class date and your Zoom link.',
      dupeBody: 'You’re already on the list — we’ll be in touch on WhatsApp soon.',
    },

    finalCta: {
      eyebrow: 'Ready when you are',
      heading: 'A class where someone’s expecting you.',
      sub: 'Pick a plan, choose the classes that fit your week, and join Monday’s cohort.',
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
