# Admin Notifications + Member 360° — Milestones

> Created: 2026-07-11. Adds admin-facing visibility (activity feed) and a full member profile with
> follow-up logging. Admin-only. Execute milestones in order; each ends with a verification step —
> do not start the next until it passes.

## Standing decisions
- **Notification scope:** *people + money* events only — signup, enrollment, payment (created→paid/verified),
  cash pending. No teacher-content-edit or student-activity events (deferred, would drown the money signal).
- **Delivery:** in-app feed + realtime top-bar bell. Reuses the M5 realtime nav-count-badge pattern already
  in `DashboardLayout.jsx` ("Cash to verify"). No email/push this pass (needs Resend/SMTP or FCM).
- **Audience:** both features are admin-only (RLS `get_my_role()='admin'`). Teacher access deferred.
- **Write path:** notifications are written by DB triggers (SECURITY DEFINER), never by the client — the
  feed cannot be spoofed and needs zero app-side wiring on the event sources.
- **Naming:** DB keeps `challenges`/`enrollments`; UI says "Series"/"member" (per series-overhaul standing decision).

---

## N1 — Admin notification feed

**Goal:** Admin sees every signup / enrollment / payment live, without asking anyone.

### DB — `supabase/migration_admin_notifications.sql` (idempotent, additive)
- ☐ **`notifications`** table:
  `id uuid pk, type text ('signup'|'enrollment'|'payment'), title text, actor_id uuid → profiles,
   challenge_id uuid → challenges, amount numeric, meta jsonb default '{}', is_read boolean default false,
   created_at timestamptz default now()`. Index `(is_read, created_at desc)`.
- ☐ **RLS**: admin `select` + `update` (mark-read) only; no client insert.
- ☐ **Helper** `notify_admin(p_type, p_title, p_actor, p_challenge, p_amount)` — SECURITY DEFINER, inserts one row.
- ☐ **Triggers** (SECURITY DEFINER, call `notify_admin`):
  - `trg_notify_signup` — after insert on `profiles` → *"{name} signed up"*
    (name = `coalesce(nullif(full_name,''),'New member')`; feed UI re-resolves live name via `actor_id`).
  - `trg_notify_enrollment` — after insert on `enrollments` → *"{name} enrolled in {series} ({access_type})"*.
  - `trg_notify_payment` — after insert OR update of `status` on `payments`:
    cash insert (`pending_verification`) → *"{name} — cash payment pending for {series}"*;
    status → `paid`/`verified` → *"{name} paid ₹{amount} for {series}"*. Razorpay `created` inserts skip.
    (Additive alongside the existing `on_payment_settled` trigger — that one is untouched.)
- ☐ Add `notifications` to the `supabase_realtime` publication (`do $$ … duplicate_object` guard, as in
  `migration_reconcile_audit.sql`).

### Frontend
- ☐ **`src/pages/admin/Notifications.jsx`** (new): feed list, type-filter chips (All / Signups / Enrollments /
  Payments), relative time via `src/lib/datetime.js`, `Avatar` + live name joined from `profiles` on
  `actor_id`, "Mark all read", realtime `postgres_changes` subscription prepending new rows.
- ☐ **Route** in `src/App.jsx`: lazy `AdminNotifications` + `<Route path="notifications" …>` under `/admin`.
- ☐ **Bell + nav** in `src/components/DashboardLayout.jsx`: top-bar bell with unread-count badge, fed by a
  `notifications` count (`is_read=false`) + realtime subscription — mirror the existing "Cash to verify"
  red count badge already in this file. Bell → `/admin/notifications`; add a "Notifications" nav item.

**Verify:** fresh test user signs up → admin bell increments live + *"X signed up"* row appears (no reload).
Enroll + pay (Razorpay test / cash) → enrollment + payment rows; cash shows "pending" then "paid" on verify.
Mark-all-read clears the badge. Non-admin cannot read `notifications` (RLS).

---

## N2 — Member 360° page + follow-ups

**Goal:** Click a member → know everything about them and manage follow-ups in one place.

### DB — `supabase/migration_follow_ups.sql` (idempotent, additive)
- ☐ **`follow_ups`** table:
  `id uuid pk, user_id uuid → profiles (member), author_id uuid → profiles (admin), note text,
   channel text ('whatsapp'|'call'|'other'), status text default 'open' ('open'|'done'),
   next_at timestamptz, created_at timestamptz default now()`. Index `(user_id, created_at desc)`.
- ☐ **RLS**: admin all.
- ☐ **`admin_user_email(p_user uuid)`** — SECURITY DEFINER RPC returning `auth.users.email`, admin-only
  (profiles has no email column). Modeled on the `email_exists` RPC.

### Frontend
- ☐ **`src/config.js`**: add `waTo(phone, text)` → `https://wa.me/{digits}?text=…` (strip non-digits, keep
  country code) — messages the **member's** number, distinct from the business-number `waLink`.
- ☐ **`src/pages/admin/UserDetail.jsx`** (new), route `/admin/users/:id` in `src/App.jsx`.
  One parallel `load()` (reuses existing admin RLS reads): `profiles.*` + `admin_user_email`;
  `enrollments` + challenge name/status/access_type; `payments`; `attendance` count + recent attended
  sessions (join `sessions.title`); `user_badges`/`badges`; latest `weekly_checkins` + `daily_checkins`
  streak; `diet_preferences`/`diet_plans`; referral (`referred_by` + referrals made); `follow_ups`.
  - Sections: **Header** (avatar, name, role, active, phone + **WhatsApp** via `waTo`, email) ·
    **Basics** (age, gender, height, joined, referral code, referred by) · **Goals** (fitness_goal,
    activity_level, start/target weight, diet_type) · **Missing-data checklist** (empty expected fields,
    WhatsApp nudge) · **Engagement** (# series, # sessions attended, streak, badges) · **Enrollments** ·
    **Payments** · **Follow-ups** (add form: note + channel + next date; timeline with author + time;
    WhatsApp quick-action pre-fills a message).
  - Reuse `Card`, `StatCard`, `Avatar`, `EmptyState`, `ProgressBar` from `src/components/ui.jsx`.
- ☐ **`src/pages/admin/Users.jsx`**: make each row + mobile card clickable → `/admin/users/:id`; keep
  promote/deactivate buttons via `e.stopPropagation()`.

**Verify:** Users tab → click member → 360° shows basics/goals, enrollments, payments, attendance, badges;
empty onboarding fields flagged missing; WhatsApp button opens chat to the member's number with prefilled
text; add a follow-up → appears in timeline + persists on reload; non-admin hitting `/admin/users/:id`
blocked by route guard + RLS.

---

## Deploy checklist (manual, after code)
**SQL — Supabase SQL editor, in order:**
1. `migration_admin_notifications.sql` (N1)
2. `migration_follow_ups.sql` (N2)

No edge-function deploys. `npm run build` must be clean.

## Out of scope (later)
- Teacher-content-edit + student-activity notifications.
- Email/push delivery (Resend/SMTP or FCM decision needed).
- Teacher access to the member 360° page.

## Progress log
| Date | Milestone | Notes |
|------|-----------|-------|
| 2026-07-11 | Doc created | Plan approved; awaiting user verification before build |
