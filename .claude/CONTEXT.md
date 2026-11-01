# Unifitz web — project context (read first)

> Living handoff for new threads. Update the **Changelog** and any section you change
> before ending a task. Keep it factual and short — this file replaces re-analysing the repo.

## What this is
- **Unifitz** (brand is "Unifitz", never "UniFit") — fitness coaching platform. Web app = React 18 + Vite +
  Tailwind + Supabase (Postgres, Auth, Realtime, Storage, Edge Functions, pg_cron). Deployed on Vercel.
- **Source of truth for the backend.** All SQL lives in `supabase/*.sql` (idempotent migrations, run by hand in
  the Supabase SQL editor). Edge functions in `supabase/functions/`.
- Mobile: **one** Flutter app `../unifitz_app` (all roles, routed by `profiles.role` like the web; has its own
  `.claude/CONTEXT.md`). The old per-role apps `../unifitz_admin`, `../unifitz_student`, `../unifitz_teacher` are
  kept only as reference until it's verified — don't port new features to them.
- Workflow: build a feature on **web first** → user reviews → port to `../unifitz_app` (`lib/roles/<role>/`).

## Map
| Area | Where |
|---|---|
| Routes / role gates | `src/App.jsx` (`/app` client, `/teacher`, `/admin`; `Protected`) |
| Shell, nav, bell, unread badge | `src/components/DashboardLayout.jsx` (`NAV`, `HEADER_ONLY`) |
| UI primitives | `src/components/ui.jsx` (Card, StatCard, Avatar, StarRating, CategoryIcon, CLASS_TYPES…) |
| Date/time (viewer tz + label) | `src/lib/datetime.js` — never hand-roll offsets |
| Series form rules | `src/lib/seriesConstants.js` |
| Live classes helpers | `src/lib/liveClass.js` |
| Client pages | `src/pages/client/*` |
| Teacher pages | `src/pages/teacher/*`; shared staff pages `src/pages/staff/*` (teacher + admin) |
| Admin pages | `src/pages/admin/*` |
| Notifications page (all roles) | `src/pages/Notifications.jsx` |
| Plans / milestones | `.calude/.milestone/*.md` (folder name is spelled `.calude`) |

DB naming: series = `challenges` table, `challenge_teachers` for co-teachers, `enrollments` (status
active/paused/removed, access_type live/recorded), `sessions` (a class), `attendance` (`verified` generated col).

## Security rules (don't break)
- RLS is the boundary. Helpers: `get_my_role()`, `is_my_challenge()`, `is_enrolled()`.
- Teachers never get student phone/email → use RPCs `my_students`, `series_roster`, `series_members`, `live_class_candidates`.
- Notifications are written only by SECURITY DEFINER triggers/RPCs; `notify_user` is not callable from the API.
- Students' class ratings (`session_feedback`) are **teacher-only** — no admin policy, by design.
- `profiles` privileged columns (role, is_active, referral fields) are guarded by trigger
  `guard_profile_privileged` (`migration_security_hardening.sql`) — keep it in mind when touching `profiles`.

## Live Classes (recurring batches) — built 2026-10-26
Migration: `supabase/migration_live_classes.sql` (**must be run once in Supabase; needs pg_cron**).
- A live class = `challenges.is_recurring = true` + `recur_days` (ISO 1=Mon..7), `recur_time`, `recur_tz`,
  `recur_until`, `recur_duration_min`, `recur_category`, `recur_join_link` (one fixed Zoom/Meet link).
- Calendar: `sessions` rows with `occurrence_date` (unique per class), generated 14 days ahead by
  `live_class_tick()` (pg_cron `live-class-tick`, every 10 min). `is_cancelled` per date. `prompted_at`.
- Roster = enrollments (teacher picks; students can't self-join; `is_free_challenge` excludes recurring).
- Private: only roster/teachers/admin can read a recurring class (`challenges readable` policy).
- RPCs: `save_live_class` (create/edit; rebuilds future untouched dates, keeps cancellations),
  `end_live_class`, `live_class_candidates`, `set_live_class_roster`, `submit_session_feedback`.
- After each class: teacher inbox `class_ended` (link `/teacher/live/<id>?session=<sid>`), students `class_rate`.
  Remark on `attendance.remark` → `class_remark` to that student. First rating → `class_feedback` to teachers.
- `notifications.recipient_id` null = admin feed; set = personal inbox. `link` = web route.
- UI: staff `src/pages/staff/LiveClasses.jsx`, `LiveClassDetail.jsx` (`?roster=1`, `?session=<id>` deep links),
  `src/components/{LiveClassForm,RosterPicker,AttendanceSheet,ClassFeedback,MyLiveClasses}.jsx`,
  client `src/pages/client/LiveClass.jsx` (`/app/live/:id`). Series lists filter `is_recurring = false`.
- Verified on a local Supabase Postgres (create, roster, privacy, prompts, schedule edit, end).

## Push notifications (FCM) — 2026-11-01
Migration `supabase/migration_push.sql` (**run once**) + Edge Function `supabase/functions/send-push`
(**deploy with JWT verification off**; secret `FCM_SERVICE_ACCOUNT` = Firebase service-account JSON).
- `push_tokens` (token pk, user_id, platform android|ios|web; no client access) via RPCs
  `register_push_token(p_token, p_platform)` / `unregister_push_token(p_token)`; `send_test_push(p_silent)`.
- Trigger `trg_push_notification` on `notifications` insert → `private.post_push` (pg_net) → `send-push`, authed by
  `private.push_config.secret` (checked with `push_secret_ok`, service_role only). Admin feed rows → all active
  admins; inbox rows → recipient. `class_rate`/`class_ended` go to web only (phones ring a local alarm).
- Firebase project **`unifitz-7e01c`**. Web config (public): apiKey `AIzaSyB8Vu1H85Dzsnk7x3AvsywnpLKrj9DvCTw`,
  authDomain `unifitz-7e01c.firebaseapp.com`, messagingSenderId `401520391936`,
  appId `1:401520391936:web:816fffa9aeab21acbc65e5`, VAPID key
  `BF2r5KPSETADC9yUFDgg9mFa-6sN-RLdAzV99mvKy1K57X7NhOhP3TDV5OGTGWCtehYWPtvocs8QNEF-mA4a468`.
- Web client: `src/lib/push.js` (lazy-loads `firebase`; `enablePush` needs a click, `refreshPush` on
  DashboardLayout mount, `disablePush` in AuthContext `signOut`, `sendTestPush`), `PushCard` on the Notifications
  page (all roles), `public/firebase-messaging-sw.js` (gstatic compat **13.1.0** — keep equal to the npm version).
  Server sends `webpush` (title/body/icon/tag, link = https://www.unifitz.in + row link). Open visible tab = realtime
  bell handles it. CSP (report-only) allows gstatic + FCM endpoints.
- Setup walkthrough for the user: `../unifitz_app/docs/FIREBASE_SETUP.md`.

## Commands
```bash
pnpm dev            # local
pnpm build          # SSR prerender build (vercel)
npx eslint <files>  # Home.jsx has 2 pre-existing lint issues (weeklyDue unused, hook deps)
```

## Deferred / next
See `.calude/.milestone/future-plan.md` (push via FCM, class streak + revival, fees, self-subscribe, insights, capacity).

## Changelog
- **2026-11-01** — Push backend (FCM): `migration_push.sql` + `functions/send-push` (see "Push notifications").
  Mobile + web clients done. Verified SQL on throwaway Postgres; function passes `deno check`; `pnpm build` ok.
  End-to-end delivery not yet tested (needs function deployed + secret + migration).
- **2026-10-31** — New-lead alerts: `supabase/migration_lead_notifications.sql` (**run once**) — trigger
  `trg_notify_lead` on `leads` insert → admin feed row type `lead` (link `/admin/leads`; alert failure never blocks
  the lead). Web: Leads filter/icon in `Notifications.jsx`; `DashboardLayout` plays `public/sounds/new-lead.wav`
  for admins on a new lead. App: channel `leads` with its own tone (same wav). Verified on throwaway Postgres.
- **2026-10-31** — `/20minutes-fitness` = **FFW** paid-ad waitlist. Config + copy in `src/content/twentyMinutes.js`
  (`FFW`; `<<placeholder>>` values render nothing), helpers `src/lib/ffw.js`, Meta Pixel `src/lib/metaPixel.js`
  (loads only with a real id), page-only form `src/components/FfwWaitlistForm.jsx` (shared `LeadForm` untouched).
  Saves via RPC `join_ffw_waitlist` (dedupe by phone, seat `lead_number`, slots, utm/click ids, ref, Pixel
  `event_id` for future CAPI) + `ffw_waitlist_count` — **run `supabase/migration_ffw_waitlist.sql`**; until then the
  form falls back to the old insert. Prerender takes this page's meta/og/twitter + FAQ JSON-LD from the content file.
  Page + form use **shadcn/ui** (`src/components/ui/`, hand-added, no `components.json`/CLI — it would rewrite the
  global theme): Button (+ `brand`/`link` variants, `xl`/`inline` sizes), Input, Label, Select (Radix), Card, Badge,
  ToggleGroup (slots), Accordion (FAQ), Progress (seats). Radix deps added. New UI should reuse these.
  `/20minutes-fitness` has **no footer** (ad page). `SiteFooter` mobile = Explore/Contact columns + short legal
  labels (`legalLinks[].short`); `clearStickyBar` prop (Landing) pads it clear of the fixed mobile CTA bar.
- **2026-10-31** — Member account deletion (store requirement): `supabase/migration_account_deletion.sql`
  (**run once**; `profiles.deletion_requested_at`, RPCs `request_account_deletion`/`cancel_account_deletion`,
  pg_cron `purge-deleted-accounts` daily deletes after 30 days, admin feed type `account_deletion`). Web:
  `components/AccountDeletion.jsx` on client Profile + Home, public `/delete-account` page (prerendered).
  Verified on a throwaway supabase/postgres container.
- **2026-10-31** — Mobile apps merged into one: `../unifitz_app` (id `in.unifitz.app`, member icon). Single login,
  role → member/teacher/admin area. No backend change.
- **2026-10-31** — QA testing setup (qa-my-app plugin): `.claude/testing/` (README, `web/` catalog,
  empty `mobile-*`). `QA-tests` symlinks to `.claude/testing/web`. Browser agents in `.claude/agents/`.
  59 routes in `web/.qa-catalog/routes.json`. Browser run blocked until master-code login + QA accounts exist.
- **2026-10-31** — Landing pricing: all prices removed (content, `public/llms.txt`). Cards show a "hook" (3×, 5×,
  All-in); "Choose plan" opens `PlanModal` in `src/pages/Landing.jsx` → WhatsApp prefilled
  "I'd like to join the <Plan> <Monthly|Quarterly|Yearly> package". No longer links to `/auth?plan=`.
- **2026-10-26** — Live Classes v1 on web (teacher/admin/student) + per-user notification inbox for all roles.
  Ported to all three Flutter apps the same day (see their CONTEXT.md). Teacher Schedule attendance modal
  extracted to `components/AttendanceSheet.jsx`. `series_roster` now returns active members only.
- **2026-10-26** — App icon family for the three Flutter apps: `scripts/make_app_icons.py`
  (`preview <dir>` renders a comparison sheet; `install <app_dir> <member|teacher|admin>` writes the icons).
