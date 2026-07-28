# Landing Page Generation Prompt — UniFit

Paste everything below the line into Slack (Claude tag) or any Claude chat.

---

Build a single-file, production-ready landing page for **UniFit** — a women-only online fitness platform based in Jaipur, India (`https://www.unifitz.in`). Output one self-contained `index.html` (inline Tailwind-style CSS + vanilla JS, no external CDN calls, no build step) that I can host anywhere. Make it visually striking, conversion-focused, and mobile-first.

## Brand
- Name: UniFit. Tagline direction: "Fitness that fits your life — live, at home, with women who get it."
- Audience: Indian women 25–50, mostly homemakers and working professionals, beginners welcome, body-conscious about gym environments.
- Tone: warm, encouraging, sisterly — not bro-gym. No shame language, no "shred/burn fat fast" clichés.
- Palette: energetic coral/pink primary, deep plum secondary, warm cream background, mint accent for success states. Rounded corners, soft shadows, generous whitespace.
- Fonts: a friendly geometric sans for headings, a clean readable sans for body (system font stack fallback — do NOT link external fonts).

## Freebies to headline (this is the hook — make it loud)
1. **Free demo class** — one live session, no card needed. Primary CTA everywhere.
2. **Free challenges/series** — multi-week live programs at zero cost (paid series also exist; show both tiers honestly).
3. **Free AI diet planner** — personalized calorie + meal plan, unlocked just by completing a profile. No paywall.
4. **Free recipe library** — 12+ Indian, dietician-approved recipes with macros.
5. **Free progress tracking** — daily check-ins, weight/measurement graphs, streaks.
6. **Referral rewards** — invite a friend, both get perks.
7. **Free downloadable plan PDF** — the diet/workout plan exports to PDF.

## Everything the platform provides (build sections for these)
- **Live online classes over Zoom**: Zumba, Yoga, Meditation, Strength & Weight Training. Real teachers, real time, camera optional.
- **Series/Challenges**: structured multi-week programs, multiple teachers per series, free or paid, instant join for free ones.
- **AI Diet Planner**: personalized daily calorie target, meal-by-meal plan, veg/non-veg aware, Indian foods, PDF export.
- **Recipe library** with per-recipe macros and steps.
- **Progress tracking**: daily check-ins, attendance history, weight and measurement charts, consistency streaks.
- **Gamification**: 54 unlockable badges across attendance, consistency, nutrition, and milestone categories.
- **Referrals**: shareable code, tracked signups, rewards.
- **Passwordless login**: 6-digit email OTP or magic link — no password to remember.
- **WhatsApp-first support**: direct chat with the team for booking and doubts.
- **Teacher & Admin tooling** (mention briefly under a "built for trainers too" note): session scheduling, Zoom automation, attendance, earnings dashboard, member 360 view.

## Required page sections, in order
1. **Sticky nav** — logo, anchor links, "Book Free Demo" button.
2. **Hero** — headline, subhead, dual CTA ("Book a free demo" → WhatsApp, "Explore free challenges" → anchor), trust strip (women-only · live on Zoom · beginners welcome · Jaipur-based, India-wide), and an animated stat row (members trained, live classes run, badges earned, avg. rating) using count-up on scroll.
3. **"Everything free before you pay a rupee"** — the freebies as a bold, visually distinct card grid with icons. This is the emotional centerpiece; give it the most design energy.
4. **Class types** — 4 cards (Zumba, Yoga, Meditation, Strength) with a one-line "who it's for" and typical duration.
5. **How it works** — 4 numbered steps: Book free demo → Join live on Zoom → Get your free AI diet plan → Track progress & earn badges.
6. **Series/Challenges** — 3 sample cards showing a FREE badge vs a priced one, teacher avatars (use inline SVG placeholders), duration, and a join CTA.
7. **AI Diet Planner spotlight** — split layout: copy on one side, a faux plan preview card (calorie ring, 4 meal rows, "Download PDF" button) on the other.
8. **Gamification** — badge wall: render ~12 distinct inline-SVG badges with a subtle hover-unlock animation, plus "54 badges to collect".
9. **Progress tracking** — mock chart (inline SVG line + bar) showing weight trend and attendance streak.
10. **Testimonials** — 6 cards, Indian women's names, specific outcome-based quotes (energy, consistency, comfort of a women-only space), star ratings.
11. **Referral banner** — "Bring a friend, both win."
12. **Pricing / plans** — honest 3-tier layout where tier one is genuinely free forever, plus a note that paid series can be paid online or by cash.
13. **FAQ** — accordion, 8 questions: Do I need equipment? Is my camera required? What if I miss a class? Is the diet plan really free? Are classes only for women? Can absolute beginners join? How do I pay? What if I'm not satisfied?
14. **Lead-capture form** — name, phone, WhatsApp opt-in, interest dropdown; validate client-side and on submit open a prefilled WhatsApp message to `917387846841`.
15. **Footer** — NAP (Jaipur, Rajasthan, India), email `hello@unifit.in`, phone `+91 73878 46841`, Instagram/Facebook/YouTube links, quick links, copyright.
16. **Floating WhatsApp button** — bottom-right, persistent, prefilled with "Hi UniFit! I'd like to book a free demo class."

## Technical requirements
- Single `index.html`, fully self-contained. No external requests of any kind (fonts, images, scripts). All imagery = inline SVG or CSS gradients.
- Mobile-first responsive; nothing overflows horizontally at 360px width.
- Accessible: semantic landmarks, alt/aria labels, keyboard-navigable accordion and nav, visible focus rings, WCAG AA contrast in both light and dark mode. Support `prefers-color-scheme: dark`.
- Respect `prefers-reduced-motion` — disable count-ups and scroll animations when set.
- Scroll-reveal animations via IntersectionObserver, smooth anchor scrolling, sticky nav that compacts on scroll.
- SEO: descriptive `<title>`, meta description, Open Graph + Twitter tags, and JSON-LD for `LocalBusiness` + `FAQPage` using the real NAP above.
- Performance: no layout shift, lazy-reveal heavy sections, total file under ~150KB.
- Every CTA points either to the WhatsApp link or to `#lead-form`.

## Copy rules
- Write all copy yourself — no lorem ipsum, no `[placeholder]` text.
- Indian English, rupee symbol for any price, realistic numbers (don't claim 100,000 members).
- Lead with the free stuff in every section headline where it applies.
- Short paragraphs, scannable, punchy subheads.

Deliver the finished `index.html` plus a 5-line summary of the design decisions you made.
