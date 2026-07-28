# Unifitz — Women's Online Fitness Platform

Production-ready platform for **live online fitness classes for women** (Zumba, Yoga, Meditation, Strength & Weight Training). Live Zoom classes, subscription **membership plans** (paid — Monthly / Quarterly / Annual with a $19 one-week trial), a diet engine, progress tracking, a 54-badge gamification system, referrals, paid series with Razorpay/cash, and a **US-targeted marketing landing page** with lead capture.

> **Brand:** the product is **Unifitz** (domain `unifitz.in`). The public landing page targets the **USA** — prices are in **USD**, times are in US zones, and there is **no free class** (the entry point is the paid **$19 one-week trial**). The seed/demo data below is still the older India dataset — see [Localization TODO](#localization-todo).

**Stack:** React 18 (Vite) · Tailwind CSS · lucide-react · recharts · framer-motion · Supabase (Auth, Postgres + RLS, Storage, Realtime, Edge Functions) · Gemini · Zoom (Server-to-Server OAuth) · Razorpay.

---

## Quick start

### 1. Create the Supabase project
[supabase.com](https://supabase.com) → New project (free tier is fine). Then **Authentication → Providers → Email → turn OFF "Confirm email"** (demo logins + instant signup need this).

### 2. Run the SQL (in order, in the SQL Editor)
| File | What |
|---|---|
| [`supabase/migration.sql`](supabase/migration.sql) | Core schema: profiles/roles, challenges, sessions, enrollments, check-ins, attendance, referrals, Zoom columns, diet + badges tables, functions, triggers, RLS, storage, realtime. |
| [`supabase/seed.sql`](supabase/seed.sql) | Demo users, both challenges, 11 days of sessions/attendance/check-ins, referrals, 54 badges, 12 recipes, demo badges. |
| [`supabase/migration_landing.sql`](supabase/migration_landing.sql) | `leads`, `reviews`, `testimonials` + RLS + 6 testimonials. |

Already ran the core migration on an older build? These idempotent add-ons cover later features:
- [`supabase/migration_session_description.sql`](supabase/migration_session_description.sql) — `sessions.description` + `sessions.category`
- [`supabase/migration_diet_badges.sql`](supabase/migration_diet_badges.sql) — standalone diet + badges (if not in your core run)

> All migrations are non-destructive (no `DROP`/`DELETE`). Don't re-run the **whole** `migration.sql` on an existing DB — its base `create type`/`create table` will error "already exists". Use the standalone add-ons instead.

### 3. Configure the app
```bash
cp .env.example .env
# from Supabase → Project Settings → API:
#   VITE_SUPABASE_URL=https://<ref>.supabase.co
#   VITE_SUPABASE_ANON_KEY=<anon key>
```
The anon key is browser-safe **only because RLS does the real security** — every table has policies.

Edit [`src/config.js`](src/config.js) `BUSINESS`: brand name (`Unifitz`), WhatsApp/phone number (digits only, e.g. `919810000000`), email, address/NAP, social links. Landing CTAs, floating WhatsApp, footer + JSON-LD all read from it. **Still holds the old India phone/handles — swap for your US number, domain and socials.**

### 4. Run
```bash
npm install
npm run dev
```

### 5. (Optional) Edge Functions — Zoom + AI
Needed only for live-Zoom automation and AI generation. See [Edge Functions](#edge-functions) below. The app runs fully without them (manual Zoom links, no AI).

### 6. Passwordless auth — Supabase Dashboard settings (NOT code)
Login is passwordless: a 6-digit **email OTP code** plus a **magic login link** that lands on `/auth/confirm`. Configure these once in the dashboard:

- **Authentication → URL Configuration**
  - **Site URL** = production domain (e.g. `https://www.unifitz.in`).
  - **Redirect URLs** allowlist must include both **`https://www.unifitz.in/auth/confirm`** and **`http://localhost:5173/auth/confirm`** (the app sends `emailRedirectTo = ${window.location.origin}/auth/confirm`).
- **Authentication → Providers → Email**: Email enabled. The OTP code is the `{{ .Token }}` template variable — make sure the **Magic Link** email template includes `{{ .Token }}` so users get a code as well as the link.
- **Authentication → SMTP**: set a custom SMTP provider (e.g. Resend, with its domain verified via DNS). Supabase's built-in email is heavily rate-limited and not for production.
- New users created via OTP land in the onboarding wizard automatically (`onboarding_complete=false`); signup passes `full_name`/`phone`/`referral_code` as metadata for the profile trigger.

---

## Demo logins (after `seed.sql`, password `password123`)

| Role | Email |
|---|---|
| Admin | admin@unifit.in |
| Teacher | priya@unifit.in · rahul@unifit.in |
| Client | ananya@unifit.in · kavita@unifit.in · neeta@unifit.in · sneha@unifit.in · pooja@unifit.in · meera@unifit.in · ritu@unifit.in · divya@unifit.in · shalini@unifit.in · anjali@unifit.in |

One login screen → auto-routes by role. Highlights: ananya has an 11-day streak + badges; kavita's referral shows *Reward earned* (approve in Admin → Referrals); meera is red-flagged on the teacher dashboard; 30-Day Challenge has Day 12 pinned live with a countdown.

> If login throws `Database error querying schema`, the seeded `auth.users` rows have NULL token columns — run:
> ```sql
> update auth.users set confirmation_token=coalesce(confirmation_token,''), recovery_token=coalesce(recovery_token,''),
>   email_change=coalesce(email_change,''), email_change_token_new=coalesce(email_change_token_new,''),
>   email_change_token_current=coalesce(email_change_token_current,''), phone_change=coalesce(phone_change,''),
>   phone_change_token=coalesce(phone_change_token,''), reauthentication_token=coalesce(reauthentication_token,'')
> where email like '%@unifit.in';
> ```

---

## Edge Functions

| Function | Purpose | Deploy |
|---|---|---|
| `zoom-create-meeting` | Create the Zoom meeting for a session (cloud-record, registration); returns existing if already created. | `supabase functions deploy zoom-create-meeting` |
| `zoom-register-student` | Register a student → personal identity-bound join URL + participant mapping. | `supabase functions deploy zoom-register-student` |
| `zoom-webhook` | Receives join/leave/ended/recording events → attendance % + recording link. | `supabase functions deploy zoom-webhook --no-verify-jwt` |
| `generate-diet-plan` | Gemini `gemini-2.0-flash` → 7-day Indian meal plan (JSON). | `supabase functions deploy generate-diet-plan` |
| `generate-session-image` | Gemini image (`gemini-3-pro-image-preview` → flash fallback) → session poster. | `supabase functions deploy generate-session-image` |
| `razorpay-create-order` | Create a Razorpay order for a paid series + a `payments` row. | `supabase functions deploy razorpay-create-order` |
| `razorpay-verify` | Verify checkout signature → mark paid → auto-enroll (DB trigger). | `supabase functions deploy razorpay-verify` |

### Secrets (Dashboard → Edge Functions → Secrets, or CLI)
```bash
supabase secrets set \
  ZOOM_ACCOUNT_ID=xxx ZOOM_CLIENT_ID=xxx ZOOM_CLIENT_SECRET=xxx \
  ZOOM_WEBHOOK_SECRET_TOKEN=xxx ZOOM_USER_ID=host@yourdomain.com \
  GEMINI_API_KEY=your-google-ai-studio-key \
  RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx
# SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically.
# Optional: GEMINI_IMAGE_MODEL to override the image model.
# Also add VITE_RAZORPAY_KEY_ID (public Key ID) to the frontend env (Vercel).
```

## Paid Series + payments

Challenges are now **Series** (UI label) and can be free or paid. Run [`supabase/migration_series.sql`](supabase/migration_series.sql): adds `challenges.price`, a `challenge_teachers` join (multiple teachers/series), a `payments` table, an enroll-on-payment trigger, a `series_earnings` view, and the `teacher_earnings` function.

- **Admin → Series**: create/edit a series — upload an image, assign **multiple teachers**, toggle free/paid and set the **price** (editable anytime).
- **Client → Series**: free → instant join; paid → modal with **Pay online (Razorpay)** or **Pay by cash** (pick which teacher/admin they handed cash to → status `pending_verification`).
- **Razorpay**: `razorpay-create-order` makes the order; checkout runs client-side ([lib/razorpay.js](src/lib/razorpay.js)); `razorpay-verify` checks the signature → marks paid → the DB trigger auto-enrolls.
- **Admin → Revenue**: verify pending cash (verify = enroll), see all payments, gross + **20% UniFitz / 80% teacher-pool split**, and per-teacher payouts (pool ÷ teachers per series, summed).
- Razorpay webhook signature secret optional; verification uses the checkout HMAC. Add `VITE_RAZORPAY_KEY_ID` to Vercel env.
Gemini key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey). `zoom-webhook` **must** deploy with `--no-verify-jwt` (Zoom can't send a Supabase JWT).

---

## Zoom automation

Auto-create a unique meeting per session, track each student's join/leave, compute attendance % (≥75% = attended), auto-attach the cloud recording. Flow: **Zoom → Edge Functions → Postgres → React reads live**. No video hosting (Zoom cloud links only).

**Setup:** [marketplace.zoom.us](https://marketplace.zoom.us) → Build App → **Server-to-Server OAuth** → copy Account/Client/Secret → scopes `meeting:write:admin`, `meeting:read:admin`, `recording:read:admin`, `user:read:admin` → **Feature → Event Subscriptions**: set endpoint, copy Secret Token, subscribe to `meeting.participant_joined/left`, `meeting.ended`, `recording.completed`.

**Webhook endpoint:** `https://<ref>.supabase.co/functions/v1/zoom-webhook` — set secret + deploy *before* clicking Validate, or url_validation fails.

| Step | What |
|---|---|
| Create session | inserts row → `zoom-create-meeting` → saves `zoom_meeting_id`, `zoom_join_url`, `zoom_start_url` (host-only). |
| Student opens live card | `zoom-register-student` → personal join_url + `session_participants` mapping. |
| Join/leave | webhook writes segment rows (dedupe on `participant_uuid+join_time`). |
| Meeting ends | SUM minutes/user → `attendance_pct`, `attended = pct≥75`, upsert `attendance` source `zoom` → fires Day-7 referral trigger. |
| Recording ready | saves play_url + passcode → `recording_status='available'` → shows on client cards live. |

Anonymous joiners land in the teacher attendance modal → "Unmatched Zoom participants", assignable to a member. Teacher can manually override any attendance (`source='manual'`). Meeting times are sent as IST wall-clock + `timezone: Asia/Kolkata`.

---

## Features

**Auth & onboarding** — single login, role routing, 4-step wizard → BMI + TDEE.

**Client** — Home (pinned live card w/ countdown→LIVE NOW, daily check-in, recordings, badge nudges), **Series** + detail (free/paid, consistency leaderboard), Session player, Progress (weight/BMI/inches charts, attendance %, weekly form + photo), **Diet Plan**, **Recipes**, **Badges**, Profile (view/edit + embedded Refer & Earn; mobile-restructured).

**Teacher** — Schedule (sessions newest-first, class-type icons, description, AI poster, Zoom create/copy/slot-lock/regenerate, WhatsApp share, go-live, attendance + reconcile), Students (red-flags, nudge, avg %, award badge), Announcements (realtime), Series (own series + member management).

**Admin** — Overview (stats + CSV export), Series (+ sessions, detail, member management), Users + detail (Member 360), Notifications, Reports, Referrals, Badges (definitions/leaderboard/award/revoke), Leads (CSV + reviews moderation + testimonials), **Revenue** (Razorpay + cash payments, verify-to-enroll, gross + 20/80 split, per-teacher payouts).

### Diet Plan (fixed dietician engine — NO AI)
Free for everyone, gated only by a complete profile. Run [`supabase/migration_diet_engine.sql`](supabase/migration_diet_engine.sql): seeds `diet_plan_template` (fixed dietician plan, base 1650 kcal), `diet_rules`, `workout_plan`, and recipe rows (with `code`).
- Flow: profile gate → **Veg/Non-Veg** toggle (saved to `profiles.diet_type`) → "Your Daily Targets" (BMR/TDEE/goal math in [lib/dietEngine.js](src/lib/dietEngine.js)) → day's meals with **per-person scaled quantities** (`scale_factor = target/1650`), each dish links to its recipe → rules + weekly workout → **Download PDF** ([lib/dietPdf.js](src/lib/dietPdf.js), text-only, clickable recipe links via jsPDF).
- **Custom plan → WhatsApp** handoff (no in-app AI generation), `api.whatsapp.com` link from `src/config.js`.
- Public recipe pages at `/recipes/:code` (open from app + PDF, no login). Recipes seeded with placeholder images — replace with real/Gemini images anytime.

### Badges
54 badges, 10 categories × 5 tiers (bronze 10 → diamond 200 pts). Postgres rules engine: `user_metrics` → `evaluate_badges` (awards + bumps points + returns new codes for confetti); `nearest_badges` powers the "You're close!" nudge; `award_manual_badge` / `revoke_badge` for staff. Premium medallion UI w/ tier gradients + glow.

### Landing page (US marketing + leads)
Conversion page at `/` ([src/pages/Landing.jsx](src/pages/Landing.jsx)) — served to logged-out visitors; logged-in users auto-redirect to their dashboard. **US-targeted, USD, no free class.** Sections, in order:

1. **Hero** — headline + live "Today's classes" schedule card, rating/avatar proof, primary CTA → `#pricing` ("Start your $19 trial").
2. **Stat band** — animated count-up (women / classes / badges / rating), respects `prefers-reduced-motion`.
3. **Programs** — Zumba, Yoga, Meditation, Strength, Weight Training.
4. **Membership** — everything a membership includes (feature grid).
5. **How it works** · **Diet spotlight** (weekly custom plan preview + PDF).
6. **Results** — live testimonials from Supabase + 54-badge wall.
7. **Why Unifitz** (women-only, US time zones, cancel anytime…).
8. **Pricing** — a **Monthly / Quarterly (−12%) / Annual (−20%) billing toggle** driving a **horizontally-scrollable row of 5 plans** (Trial $19/wk · Starter · Regular · Complete ⭐ · 1:1 Coaching), plus a **specialized add-ons** strip (Starter+Diet, PCOS/PCOD Care, Weight-Loss Intensive, Couple Fitness). Plan data lives in the `PLANS` / `ADDONS` / `BILLING` consts at the top of `Landing.jsx`.
9. **Lead form** ("Talk to a coach") → `leads` · **Reviews** (submit → `reviews` pending) · **FAQ** · final CTA · footer.

New reviews are hidden until approved in **Admin → Leads → Reviews**. SEO is injected client-side in `Landing.jsx` (`useSEO`): title/desc/OG/Twitter/canonical + JSON-LD (Organization/LocalBusiness/HealthClub with `areaServed: United States` + FAQPage + live aggregateRating). Also update [robots.txt](public/robots.txt) + [sitemap.xml](public/sitemap.xml) domain and add a real `public/og-image.jpg` (1200×630).

Backend for the landing lives in [`supabase/migration_landing.sql`](supabase/migration_landing.sql) — **run it or the lead/review forms error** `Could not find the table 'public.leads'`. It creates `leads` / `reviews` / `testimonials` + RLS (anon INSERT, admin/public read) and seeds 6 testimonials.

---

## Realtime
- New **announcement** → pops on every client's Home.
- Teacher **"Go live next"** → client card flips countdown → **LIVE NOW** without refresh.
- **Recording ready** → recording link appears on session cards automatically.

## Free-tier notes
- **Pauses after ~1 week idle** — open the dashboard weekly or ping the REST endpoint.
- **No auto-backup** — Admin → Overview → **Export CSV** weekly.
- **1GB storage** — progress photos compressed client-side (≤800px JPEG, <200KB); videos never uploaded.

## Architecture
```
supabase/
  migration.sql                     core schema + functions + triggers + RLS + storage + realtime
  seed.sql                          demo data (relative dates)
  migration_landing.sql             leads / reviews / testimonials (idempotent)
  migration_series.sql              series price + teachers join + payments + earnings (idempotent)
  migration_diet_engine.sql         diet templates / rules / workout / recipes (idempotent)
  migration_diet_badges.sql         diet + badges (idempotent add-on)
  migration_session_description.sql  sessions.description + category (idempotent add-on)
  functions/
    _shared/zoom.ts                 OAuth token cache, zoomFetch, HMAC, service client
    zoom-create-meeting/ zoom-register-student/ zoom-webhook/
    generate-diet-plan/ generate-session-image/
    razorpay-create-order/ razorpay-verify/
src/
  config.js          BUSINESS (brand, NAP, WhatsApp number, socials), waLink helpers
  lib/               supabase, calc (BMI/TDEE), compressImage, csv, zoom, dietEngine, dietPdf, badges, razorpay
  context/           AuthContext (session+role routing), ViewModeContext, ToastContext
  components/        DashboardLayout, FloatingWhatsApp, ui.jsx (cards, medallions, class-type icons…)
  pages/
    Landing.jsx Auth.jsx AuthConfirm.jsx Onboarding.jsx RecipeDetail.jsx StaffProfile.jsx NotFound.jsx
    client/  Home Series SeriesDetail SessionPlayer Progress Diet Recipes Badges Refer Profile
    teacher/ Schedule Students Announcements Series
    admin/   Overview Series SeriesDetail SeriesMembersPage Users UserDetail Notifications Reports Referrals Badges Leads Revenue
```

---

## Localization TODO

The app was originally built for India and the public landing was re-pointed to the **USA / Unifitz**. These still carry old India data and should be updated before a US launch:

- [`src/config.js`](src/config.js) `BUSINESS` — phone is `+91…`, socials are `@unifit`; set the US number, `unifitz.in` handles.
- [`supabase/seed.sql`](supabase/seed.sql) — demo users use `@unifit.in` emails and Indian names/cities; testimonials seeded in [`migration_landing.sql`](supabase/migration_landing.sql) are Indian (Jaipur/Bangalore). Reseed with US names/results for a real launch.
- [`supabase/migration_diet_engine.sql`](supabase/migration_diet_engine.sql) — the in-app diet engine is a fixed **1650 kcal Indian** plan; the landing's diet **preview** shows US meals for marketing only. Localize the engine/recipes if US members will use it.
- Zoom meeting times are sent as **IST** (`Asia/Kolkata`) — change to the target US zone in `zoom-create-meeting`.
- Payments use **Razorpay** (INR-oriented); a US launch typically wants Stripe. The landing prices ($19/$39/…) are display-only until checkout is wired for USD.
