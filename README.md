# UniFit — Women's Online Fitness Platform

Production-ready fitness platform for live online classes (Zumba, Yoga, Meditation, Strength & Weight Training) with free challenges, Zoom automation, progress tracking, an AI diet planner, a 54-badge gamification system, referrals, and an SEO landing page with lead capture.

**Stack:** React 18 (Vite) · Tailwind CSS · lucide-react · recharts · framer-motion · Supabase (Auth, Postgres + RLS, Storage, Realtime, Edge Functions) · Gemini · Zoom (Server-to-Server OAuth).

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

Edit [`src/config.js`](src/config.js): WhatsApp business number (digits only, e.g. `919810000000`), phone, email, Jaipur NAP, social links. Landing CTAs, floating WhatsApp, footer + JSON-LD all read from it.

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

**Client** — Home (pinned live card w/ countdown→LIVE NOW, daily check-in, recordings, badge nudges), Challenges + detail (consistency leaderboard), Progress (weight/BMI/inches charts, attendance %, weekly form + photo), **Diet Plan**, **Badges**, Profile (view/edit + embedded Refer & Earn; mobile-restructured).

**Teacher** — Schedule (sessions newest-first, class-type icons, description, AI poster, Zoom create/copy/slot-lock/regenerate, WhatsApp share, go-live, attendance + reconcile), Students (red-flags, nudge, avg %, award badge), Announcements (realtime).

**Admin** — Overview (stats + CSV export), Challenges (+ sessions), Users, Referrals, Badges (definitions/leaderboard/award/revoke), Leads (CSV + reviews moderation + testimonials), Revenue (paid-phase placeholder).

### Diet Plan (fixed dietician engine — NO AI)
Free for everyone, gated only by a complete profile. Run [`supabase/migration_diet_engine.sql`](supabase/migration_diet_engine.sql): seeds `diet_plan_template` (fixed dietician plan, base 1650 kcal), `diet_rules`, `workout_plan`, and recipe rows (with `code`).
- Flow: profile gate → **Veg/Non-Veg** toggle (saved to `profiles.diet_type`) → "Your Daily Targets" (BMR/TDEE/goal math in [lib/dietEngine.js](src/lib/dietEngine.js)) → day's meals with **per-person scaled quantities** (`scale_factor = target/1650`), each dish links to its recipe → rules + weekly workout → **Download PDF** ([lib/dietPdf.js](src/lib/dietPdf.js), text-only, clickable recipe links via jsPDF).
- **Custom plan → WhatsApp** handoff (no in-app AI generation), `api.whatsapp.com` link from `src/config.js`.
- Public recipe pages at `/recipes/:code` (open from app + PDF, no login). Recipes seeded with placeholder images — replace with real/Gemini images anytime.

### Badges
54 badges, 10 categories × 5 tiers (bronze 10 → diamond 200 pts). Postgres rules engine: `user_metrics` → `evaluate_badges` (awards + bumps points + returns new codes for confetti); `nearest_badges` powers the "You're close!" nudge; `award_manual_badge` / `revoke_badge` for staff. Premium medallion UI w/ tier gradients + glow.

### Landing page (SEO + leads)
Single-CTA conversion page at `/`. Live testimonials + approved reviews from Supabase; 3-field lead form → `leads`; review submit → `reviews` (pending). New reviews are hidden until approved in **Admin → Leads → Reviews**. SEO: title/desc/OG/canonical in [index.html](index.html) + JSON-LD (Organization/LocalBusiness/HealthClub + FAQPage + live aggregateRating), [robots.txt](public/robots.txt) + [sitemap.xml](public/sitemap.xml) (update domain), floating WhatsApp button. Add a real `public/og-image.jpg` (1200×630).

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
  migration.sql                    core schema + functions + triggers + RLS + storage + realtime
  seed.sql                         demo data (relative dates)
  migration_landing.sql            leads / reviews / testimonials (idempotent)
  migration_diet_badges.sql        diet + badges (idempotent add-on)
  migration_session_description.sql sessions.description + category (idempotent add-on)
  functions/
    _shared/zoom.ts                OAuth token cache, zoomFetch, HMAC, service client
    zoom-create-meeting/ zoom-register-student/ zoom-webhook/
    generate-diet-plan/ generate-session-image/
src/
  config.js          business NAP, WhatsApp number, socials
  lib/               supabase, calc (BMI/TDEE), compressImage, csv, zoom, diet, badges
  context/           AuthContext (session+role routing), ToastContext
  components/        DashboardLayout, FloatingWhatsApp, ui.jsx (cards, medallions, class-type icons…)
  pages/
    Landing.jsx Auth.jsx Onboarding.jsx
    client/  Home Challenges ChallengeDetail Progress Diet Badges Refer Profile
    teacher/ Schedule Students Announcements
    admin/   Overview Challenges Users Referrals Badges Leads Revenue
```
### New Plan
