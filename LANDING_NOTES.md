# Unifitz Landing — Build Notes (§10)

Redesign of `src/pages/Landing.jsx` into a warm-editorial, conversion-focused page for the **US / NRI** market (approved scope). Strategy rationale lives in [LANDING_STRATEGY.md](LANDING_STRATEGY.md).

## Positioning statement
> **Unifitz is the live class where the instructor knows your name — so you actually show up.** For Indian-origin women 30–50 who have already quit a gym and a YouTube plan, the product isn't workouts (they have those); it's *being expected*. Everything on the page proves three things: it's **live**, someone **notices you**, and it's **for your body** (PCOD / post-40 / postpartum).

## What changed vs the old page
- **Aesthetic:** killed orange/gradient/count-up hype → warm cream (`#FAF7F2`), Fraunces serif display, Plus Jakarta body, deep-clay brand, a single reserved conversion accent (deep pine `#12655A`). Flat surfaces, hairline warm borders, generous whitespace = trust signal for a 38-year-old.
- **New trust spine:** live **timetable strip auto-converted to her timezone**, **instructor** block, **named goal tracks** (PCOS/Weight-Loss/Post-40/Postpartum), **problem** + **objection** blocks in her words. None existed before.
- **Architecture:** all 14 sections from the brief, in order.
- **Content:** every string lives in [`src/content/landing.js`](src/content/landing.js), market-keyed. Zero hardcoded copy in the component.
- **Instrumentation:** [`src/lib/track.js`](src/lib/track.js) stub fires `cta_click`, `plan_select`, `billing_toggle`, `timetable_view`, `timezone_detected`, `faq_open`, `whatsapp_click`, `scroll_50/90`, `checkout_start`; `captureUtm()` persists `utm_*`/`gclid`/`fbclid` to sessionStorage and stamps them onto the lead `source`.
- **Design system** scoped under `.uf` in [`src/pages/landing.css`](src/pages/landing.css) so the app's Barlow/slate theme is untouched.

## Design decisions (section by section)
- **Hero** — Direction A. Headline is the mechanism ("notices when you're not there"), not an outcome. Primary CTA is the repeated conversion label; secondary points to the timetable. Visual is a `TODO:ASSET` real class frame, not an illustration.
- **Timetable** — canonical times are **UTC** in content; the component computes each next occurrence and formats it in `Intl…resolvedOptions().timeZone`, with the detected zone shown as a chip. No time is hardcoded. Kills objection #3.
- **Formats** — alternating left/right rows, one line of "who it suits" each — deliberately *not* four identical icon cards (banlist).
- **Instructors** — highest-leverage trust; placeholders are explicit `TODO:ASSET`/`TODO:PROOF` so nothing is invented.
- **Pricing** — 4 primary tiers with **$89 Complete** elevated as the anchor; quarterly pre-selected (~12% off) with effective `$/mo` shown; PCOS/Weight-Loss/Duo/1:1 + **Founding Member $799/yr** collapse behind "See all plans." **No motion** on this section. Founding scarcity is stated as real (cap 50) with remaining left as `TODO:PROOF` — no fake countdown.
- **Objections/FAQ** — the 5 real objections answered with mechanisms, then 8 friction-killers. Refund line is `TODO:CONFIRM`.
- **Masterclass** — the US secondary CTA (one seat-limited free live class), sits *below* pricing, never competing above the fold. Writes to the existing `leads` table.

---

## ⚠️ Ansul must supply — `TODO:PROOF`
1. **Micro-proof numbers** (hero) — real active-member count and/or classes-run figure, or leave the honest non-numeric line.
2. **Instructors** ×4 — full name, certification, years teaching (currently placeholders).
3. **Testimonials** — real member quotes with first name, city, and a *specific* change (symptom / inches / habit). Live approved reviews from Supabase auto-replace placeholders; until then the cards show `TODO:PROOF`.
4. **Real class schedule** — the timetable is seeded with a plausible weekly schedule (UTC) + placeholder instructor first names; replace with the real one in `SCHEDULE` in `landing.js`.
5. **Founding seats remaining** — real number, or keep it unstated.
6. **Refund / cancellation policy** — exact wording (`TODO:CONFIRM` in pricing + FAQ).

## ⚠️ Ansul must supply — `TODO:ASSET`
1. **Hero image** — real class-in-progress frame: women 30–50, live on Zoom, instructor mid-cue. WebP/AVIF, ~4:3, `fetchpriority=high`, explicit width/height (no CLS).
2. **Instructor photos** ×4.
3. **`public/og-image.jpg`** (1200×630) — social share card.

## Tooling note (the brief's assumptions vs reality)
- The brief assumes **TypeScript + react-hook-form + Zod**. This repo is **Vite + plain JSX** — none of those are installed, and it is **not CRA**. Per your approval I built in **JS/JSX to match the repo** (no migration, no build-tool change). Forms use the existing hand-rolled validation pattern.
- **Two-market switch (IN + ₹) was descoped** to US-only per your pick. `landing.js` is already keyed by market (`CONTENT.US`), so adding `CONTENT.IN` + a switch later is additive — no component changes.
- **Checkout is not wired.** Plan CTAs currently `track(plan_select + checkout_start)` then route to `/auth?plan=…`. Real US checkout = **Stripe (TODO: confirm entity + processor with the business)**; IN already has Razorpay for series.
- Fonts load from Google Fonts (added to `index.html`) — fine for a hosted app (unlike sandboxed artifacts).

## A/B hypotheses — ranked by expected lift
1. **Hero direction A (accountability) vs B (timetable-first).** Putting the live schedule *as* the hero may beat the accountability headline for cold paid traffic that needs proof-of-real first. Highest expected lift; cleanest to test (hero swap only).
2. **Paid-first vs masterclass-first for cold/US traffic.** Test the free seat as the *primary* hero CTA for `utm_*` cold audiences vs plan-select. Big lift potential, but watch non-payer quality downstream.
3. **Quarterly pre-selected vs monthly pre-selected.** Default billing framing moves both conversion rate and ARPU; small change, measurable revenue impact.
4. **Founding Member visible by default vs behind "See all plans."** Surfacing the $799 anchor early may lift AOV via price-anchoring; risk of overwhelming the 4-tier clarity.
5. **Named goal tracks above vs below pricing.** Moving PCOS/Post-40 tracks above the price table may raise qualified intent for condition-driven searchers before they see cost.

---

## Acceptance self-audit (§9)
| Check | Status |
|---|---|
| 38-yo knows what it is, that it's live, when classes run in HER time, next step — in 5s | ✅ hero + tz timetable strip |
| Page can't be swapped onto Cult.fit without breaking | ✅ warm-editorial + NRI copy + condition tracks |
| Primary CTA ≥4× identical ("Choose your plan") | ✅ hero, timetable, sticky, final |
| Every claim proven or `TODO:PROOF` | ✅ no invented numbers/quotes/instructors |
| Zero banlist violations | ✅ no "transform/unleash", no before/after, no fake countdown, no 4 identical cards |
| Zero purple/neon | ✅ verified none in Landing.jsx / index.css |
| Reads coherently with images off | ✅ all imagery is text-labelled placeholders |
| Mobile-first, ≥44px targets, sticky CTA after hero | ✅ min-height 48px buttons, sticky bar on scroll |
| Reduced-motion respected, no motion on pricing/CTAs | ✅ `MotionConfig reducedMotion="user"`, pricing static |
| Build passes | ✅ `vite build` clean |
| Lighthouse Perf≥95 / A11y100 / LCP<2s / CLS<0.05 | ⏳ **needs measuring on deployed build** — depends on the real hero asset being sized correctly (currently a CSS placeholder, so no image LCP yet) |
