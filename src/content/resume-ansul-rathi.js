// ─────────────────────────────────────────────────────────────────────────────
// Ansul Rathi — public profile / resume page (/resume/ansul-rathi)
//
// EVERYTHING shown on the page lives in this file. Edit text, numbers, links and
// image paths here — no need to touch the layout in
// src/pages/resume/AnsulRathi.jsx.
//
// Placeholders: any string starting with "[ADD" is shown on the page with a
// dashed amber outline so it's easy to spot. Replace each one with real info
// (or delete the entry). Links built from a placeholder are disabled
// automatically until you fill them in.
//
// Images: files in /public are served from the site root, so
//   public/ansul-rathi/profile.jpg  →  '/ansul-rathi/profile.jpg'
// A missing image shows a neutral placeholder tile instead of a broken icon.
// ─────────────────────────────────────────────────────────────────────────────

export const RESUME = {
  // ── Site / SEO ────────────────────────────────────────────────────────────
  // Live domain, used for canonical URL, share previews and JSON-LD.
  siteUrl: 'https://www.unifitz.in', // [CONFIRM] change if the page lives on another domain
  path: '/resume/ansul-rathi',
  seo: {
    title: 'Ansul Rathi — Licensed Zumba & Dance Fitness Instructor | Event Host',
    description:
      'Profile of Ansul Rathi: licensed Zumba & dance fitness instructor and event host for corporate wellness sessions, marathons, house parties and gaming events.',
    // Share-preview image: 1200×630 JPG, under ~300 KB.
    ogImage: '/ansul-rathi/og-image.jpg',
  },

  // ── 1. Hero ───────────────────────────────────────────────────────────────
  name: 'Ansul Rathi',
  title: 'Licensed Zumba & Dance Fitness Instructor | Event Host',
  tagline: 'High-energy fitness sessions and events that get every crowd moving.', // edit to your own words
  photo: {
    src: '/ansul-rathi/profile.jpg', // portrait 4:5, ~900×1125
    alt: 'Ansul Rathi smiling, ready to lead a dance fitness session',
  },

  // ── Contact (used by hero buttons, sticky bar, contact section, JSON-LD) ──
  contact: {
    // Digits only, country code first, no + or spaces — e.g. 919876543210
    whatsapp: '[ADD: WhatsApp number, e.g. 919876543210]',
    whatsappMessage: 'Hi Ansul, I saw your profile and would like to discuss a session/event.',
    // Digits only, country code first — used for the Call button
    phone: '[ADD: phone number, e.g. 919876543210]',
    phoneDisplay: '[ADD: phone as shown, e.g. +91 98765 43210]',
    email: '[ADD: email address]',
    instagram: '[ADD: Instagram profile link]',
    youtube: '[ADD: YouTube channel link]',
    city: '[ADD: city]',
    areas: '[ADD: areas you are available in, e.g. Jaipur, Delhi NCR, travel on request]',
  },

  // ── 2. Quick stats ────────────────────────────────────────────────────────
  stats: [
    { value: '[ADD: years]', label: 'Years of experience' },
    { value: '[ADD: number]', label: 'Classes & sessions conducted' },
    { value: '[ADD: number]', label: 'Events hosted' },
    { value: '[ADD: number]', label: 'Biggest crowd handled' },
  ],

  // ── 3. About ──────────────────────────────────────────────────────────────
  about: [
    'I’m Ansul Rathi, a licensed Zumba and dance fitness instructor and event host based in [ADD: city].',
    'I lead fitness classes, corporate wellness sessions, marathon warm-ups, house parties and gaming sessions, in Hindi and English.',
    '[ADD: 1–2 lines about your style, experience or what clients can expect]',
  ],

  // ── 4. Services ── icon: one of zumba | corporate | marathon | party | gaming
  services: [
    { icon: 'zumba', title: 'Zumba & Dance Fitness Classes', text: 'Fun, high-energy dance workouts for every fitness level.' },
    { icon: 'corporate', title: 'Corporate Wellness & Fun Sessions', text: 'Active, feel-good sessions that bring teams together.' },
    { icon: 'marathon', title: 'Marathon Hosting & Warm-ups', text: 'Stage hosting and mass warm-ups that fire up runners.' },
    { icon: 'party', title: 'House Party Hosting', text: 'Games, music and dance that keep every guest involved.' },
    { icon: 'gaming', title: 'Gaming Sessions', text: 'Planned group games and activities for all age groups.' },
  ],

  // ── 5. Showreel ───────────────────────────────────────────────────────────
  // platform: 'youtube' or 'instagram'. Paste the normal video/reel link.
  // thumbnail: optional — YouTube auto-uses its own thumbnail if left empty.
  showreel: {
    platform: 'youtube',
    url: '[ADD: showreel video link]',
    thumbnail: '', // e.g. '/ansul-rathi/showreel-thumb.jpg' (16:9, ~1280×720) — needed for Instagram
    title: 'Ansul Rathi showreel',
  },

  // ── 6. Certifications ─────────────────────────────────────────────────────
  certifications: [
    { name: '[ADD: license / certification name]', issuer: '[ADD: issuing body]', year: '[ADD: year]' },
  ],

  // ── 7. Experience ─────────────────────────────────────────────────────────
  experience: [
    {
      group: 'Fitness Instruction',
      items: [
        {
          place: '[ADD: gym / studio / place]',
          role: '[ADD: role, e.g. Zumba Instructor]',
          duration: '[ADD: e.g. 2021 – Present]',
          highlights: ['[ADD: highlight with a number, e.g. batch size or classes per week]'],
        },
      ],
    },
    {
      group: 'Event Hosting',
      items: [
        {
          place: '[ADD: client / event]',
          role: '[ADD: role, e.g. Host & Warm-up Lead]',
          duration: '[ADD: date or year]',
          highlights: ['[ADD: highlight with a number, e.g. approximate crowd size]'],
        },
      ],
    },
  ],

  // ── 8. Clients & events ── logo optional (e.g. '/ansul-rathi/clients/acme.png')
  clients: [
    { name: '[ADD: client / company name]', logo: '' },
    { name: '[ADD: gym / studio name]', logo: '' },
    { name: '[ADD: event organizer name]', logo: '' },
  ],

  // ── 9. Gallery ── thumb: ~600px wide WebP/JPG; full: ~1600px wide
  gallery: [
    { thumb: '/ansul-rathi/gallery/1-thumb.jpg', full: '/ansul-rathi/gallery/1.jpg', alt: '[ADD: describe photo 1]' },
    { thumb: '/ansul-rathi/gallery/2-thumb.jpg', full: '/ansul-rathi/gallery/2.jpg', alt: '[ADD: describe photo 2]' },
    { thumb: '/ansul-rathi/gallery/3-thumb.jpg', full: '/ansul-rathi/gallery/3.jpg', alt: '[ADD: describe photo 3]' },
    { thumb: '/ansul-rathi/gallery/4-thumb.jpg', full: '/ansul-rathi/gallery/4.jpg', alt: '[ADD: describe photo 4]' },
    { thumb: '/ansul-rathi/gallery/5-thumb.jpg', full: '/ansul-rathi/gallery/5.jpg', alt: '[ADD: describe photo 5]' },
    { thumb: '/ansul-rathi/gallery/6-thumb.jpg', full: '/ansul-rathi/gallery/6.jpg', alt: '[ADD: describe photo 6]' },
  ],

  // ── 10. Testimonials ──────────────────────────────────────────────────────
  testimonials: [
    { quote: '[ADD: short testimonial quote]', name: '[ADD: name]', company: '[ADD: company / role]' },
    { quote: '[ADD: short testimonial quote]', name: '[ADD: name]', company: '[ADD: company / role]' },
  ],

  // ── 11. Skills & languages ────────────────────────────────────────────────
  skills: [
    'Crowd engagement',
    'Mic handling & anchoring',
    'Choreography',
    'Music selection',
    'Game planning',
    'Handling all age groups',
  ],
  languages: ['Hindi', 'English'],
};
