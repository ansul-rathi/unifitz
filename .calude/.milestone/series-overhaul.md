# Series Section Overhaul — Milestones

> Audit date: 2026-07-03. Covers admin, teacher (trainer), and student flows of the Series
> (internally "Challenges") section. Product serves premium-paying students in India metros,
> USA and Germany — must look premium and be dead simple.
>
> Execute milestones in order. Tick items as they land. Each milestone ends with a
> verification step — do not start the next one until it passes.

---

## Standing decisions

- **Naming:** All user-facing text says **"Series"**. Page files renamed (`client/Challenges.jsx → client/Series.jsx` etc., imports fixed in `App.jsx`), `/series` route aliases added with redirects from old `/challenges` paths. DB tables (`challenges`, `challenge_teachers`), edge functions and code identifiers keep their names — renaming them is all risk, no user value.
- **Timezone:** DB stays UTC (`timestamptz`). One helper `src/lib/datetime.js` (Intl-based) renders every timestamp in the viewer's local timezone with tz label ("Sat, Jul 4 · 7:30 PM CEST"). No +5:30 arithmetic anywhere. Server code compares UTC only.
- **Feature triage:** Build now — countdown timer, payment retry, attendance feedback, series completion badge. Later — certificates (needs PDF infra), live push notifications (needs FCM/OneSignal), leaderboard (delete dead code now, rebuild only if product wants it).
- **Ordering rationale:** Security first (paid recordings leaking = direct revenue loss). Repairs second (trust). Naming/timezone third (touches every file — do before visual redesign to avoid re-touching). Redesign fourth. Features last.

---

## Audit findings (evidence)

### A. Security / integrity — CRITICAL
| # | Finding | Where |
|---|---------|-------|
| A1 | **(Corrected during M1)** Paid-access bypass confirmed, but via enrollments not sessions: the `self enroll` RLS policy let ANY authenticated user insert an enrollment row for ANY series — including paid — via direct API call, skipping payment. Sessions RLS itself correctly checks enrollment; the gate it trusts was open. | `supabase/migration.sql:440-441` (`self enroll` policy) |
| A2 | Teacher restrictions (pricing, publish, teacher roster) enforced client-side only — a teacher with API access can change price/publish. | `src/pages/admin/SeriesDetail.jsx:123-133`, no backing RLS |
| A3 | No unique constraint on pending `payments(user_id, challenge_id)` — duplicate pending rows possible. | `supabase/migration_series.sql:26-40` |
| A4 | Race in `zoom-create-meeting`: concurrent calls can create two Zoom meetings (check-then-set without guard). | `supabase/functions/zoom-create-meeting/index.ts:28` |
| A5 | Zoom webhook swallows all errors (console-only, always 204) — attendance/lifecycle failures invisible. | `supabase/functions/zoom-webhook/index.ts:178-181` |
| A6 | `is_live_next` has no DB constraint — multiple sessions can be pinned "next" (only app-level unpin). | `sessions` table; teacher UI unpin logic only |
| A7 | No audit trail on manual attendance reconcile (who matched a Zoom participant to a user). | `src/pages/teacher/Schedule.jsx:590-597` |

### B. Broken / misleading functionality
| # | Finding | Where |
|---|---------|-------|
| B1 | Student Zoom registration: no loading state (double-click risk); on failure silently falls back to generic link — student loses identity-bound URL and attendance auto-tracking, never told. | `src/pages/client/ChallengeDetail.jsx:100-108` |
| B2 | Staff Zoom create fails silently when Zoom secrets missing/API down. | `src/pages/admin/SeriesDetail.jsx:169`, edge fn returns nothing useful |
| B3 | AI image generation (series + session posters) has no loading state — UI appears frozen during generation. | `src/pages/admin/Challenges.jsx:1048-1051`, `src/pages/teacher/Schedule.jsx:506` |
| B4 | "Recording not ready yet" dead-end toast; no polling/auto-refresh, students click repeatedly. | `src/pages/client/ChallengeDetail.jsx:94` |
| B5 | `HIDE_SESSION_IMAGES = true` hardcoded — staff upload session posters that students never see. | `src/pages/client/ChallengeDetail.jsx:13`, `src/pages/client/Home.jsx:16` |
| B6 | "Enroll to unlock" bounces to the series list instead of opening payment on the spot — dead end. | `src/pages/client/ChallengeDetail.jsx:141` |
| B7 | Cash payment stuck at "awaiting verification" — no ETA shown to student, no pending-payments queue for admin. | `src/pages/client/Challenges.jsx:165-167` |
| B8 | Zero validation: sessions can be scheduled in the past; zoom/recording link fields accept any text (no URL check). | `src/pages/admin/SeriesDetail.jsx:383-402` |
| B9 | Divergent hardcoded defaults: duration 45 min (admin) vs 60 (teacher); category 'Strength Training' (admin) vs 'Zumba' (teacher). | `src/pages/admin/SeriesDetail.jsx:156-173`, `src/pages/admin/Challenges.jsx:335,338,974` |
| B10 | Attendance self-mark on recording watch is silent — errors only logged to console; success never confirmed. | `src/pages/client/ChallengeDetail.jsx:77-83`, `src/pages/client/SessionPlayer.jsx:62-66` |
| B11 | Hardcoded +5:30 IST conversion in Zoom meeting creation — wrong session times for USA/Germany students. | `supabase/functions/zoom-create-meeting/index.ts:40` |
| B12 | 75% attendance threshold hardcoded in webhook — not configurable, not visible to anyone. | `supabase/functions/zoom-webhook/index.ts:139` |

### C. Confusing / inconsistent UI
| # | Finding | Where |
|---|---------|-------|
| C1 | Naming chaos: "Challenges" (admin page title, DB) vs "Series" (teacher + student UI) — same entity. | admin/teacher/client pages |
| C2 | "Mark done" (admin) vs "Mark completed" (teacher) for the same action. | `admin/SeriesDetail.jsx:408` vs `teacher/Schedule.jsx:511` |
| C3 | Uncontrolled inputs with `key={...}` remount hacks for zoom/recording link fields — stale-data workarounds. | `admin/SeriesDetail.jsx:384,398` |
| C4 | Grid/list view toggle with no clear active indicator; stored in localStorage. | `admin/Challenges.jsx:1020` |
| C5 | Free-preview banner doesn't explain locked sessions or how to unlock. | `client/ChallengeDetail.jsx:141` |
| C6 | Attendance modal has no cancel action. | `admin/SeriesDetail.jsx:915` |

### D. Dead / worthless — remove
| # | Finding | Where |
|---|---------|-------|
| D1 | **(Corrected during M2)** False alarm — leaderboard IS rendered ("Consistency Leaderboard" card on the series detail page). No dead code; nothing to remove in M6. | `client/ChallengeDetail.jsx` |
| D2 | Legacy `challenges.teacher_id` still written (first teacher only) alongside `challenge_teachers` junction — sync debt. | `admin/Challenges.jsx:78` |
| D3 | Challenge status `'active'` exists in enum but is never set — status effectively binary. | `challenges.status` enum |
| D4 | Unused `TYPE_MAP` / session-type constants. | staff pages |

---

## M1 — Security & data integrity  ✅ (code done 2026-07-03 — migration NOT yet run in Supabase)

**Goal:** No paid content readable without enrollment; server enforces what the UI pretends; no races; no silent webhook failures.
**Fixes:** A1–A6.

- ☑ New `supabase/migration_series_hardening.sql`:
  - Closed the paid-access bypass: `self enroll` policy now allows self-enrollment only into **published free** series (new `is_free_challenge()` security-definer helper). Paid enrollments only via payment trigger / webhook self-heal (service role) / admin. Sessions RLS itself was already correct — no rewrite needed (finding A1 corrected above).
  - Column locks on `challenges`: `trg_challenge_column_perms` trigger rejects non-admin changes to `price`, `currency`, `is_free`, `is_published`, `teacher_id`. (`challenge_teachers` was already admin-only via existing RLS.)
  - Partial unique index `uniq_open_payment_per_series` on `payments(user_id, challenge_id) WHERE status IN ('created','pending_verification')` — with duplicate cleanup first.
  - Partial unique index `uniq_live_next_per_series` on `sessions(challenge_id) WHERE is_live_next` — pre-unpins all but latest.
  - New `webhook_events` table (admin-read RLS; service role writes).
- ☑ `zoom-create-meeting/index.ts`: conditional claim `UPDATE … WHERE zoom_meeting_id IS NULL` + `.select()`; loser deletes its orphan Zoom meeting and returns the winner's. (Secrets-missing case already returned a 400 with message — the "silent" part is the frontend not surfacing it → M2.)
- ☑ `zoom-webhook/index.ts`: catch block now inserts into `webhook_events` (source, event_type, error, full payload); still 2xx to Zoom.

**Deploy checklist (manual):**
1. Run `supabase/migration_series_hardening.sql` in the Supabase SQL editor.
2. `supabase functions deploy zoom-create-meeting`
3. `supabase functions deploy zoom-webhook --no-verify-jwt`

**Verify (after deploy):** non-enrolled test user `insert into enrollments` for a paid series → RLS error; for a published free series → succeeds. Teacher UPDATE on `challenges.price` → "only admins…" exception. Second pending payment insert for same user+series → unique violation. Send malformed (signed) webhook event → row in `webhook_events`.

---

## M2 — Broken-functionality repairs  ✅ (code done 2026-07-03 — run migration_reconcile_audit.sql)

**Goal:** Everything clickable either works or explains why not.
**Fixes:** B1–B4, B8–B10, A7.

- ☑ Student Zoom register (`client/ChallengeDetail.jsx`): per-row spinner + in-flight guard (no double registration); on failure explicit toast "Could not get your personal link — joining with the class link. Attendance may not count automatically."
- ☑ Staff Zoom create: admin `addSession` no longer swallows Zoom failure (`catch {}` → explicit error toast with reason). Teacher page already surfaced these.
- ☑ AI image generation (admin SeriesDetail): per-target `aiBusy` state — spinner + "Generating…" on the clicked button (series banner + per-session). Teacher page already had `aiBusy`.
- ☑ Recording status: 60s polling on series detail (while any `completed && !recording_link`) and on SessionPlayer (processing state); dead "Recording not ready yet" toast → "Recording is processing — it will appear here automatically"; row hint 'Soon' → 'Processing…'.
- ☑ New `src/lib/seriesConstants.js`: `DEFAULT_SESSION_DURATION_MIN` (60), `DEFAULT_CATEGORY` ('Zumba'), `isValidUrl`, `sessionFormError`. All three staff forms (admin/Challenges quick-add, admin/SeriesDetail, teacher/Schedule) use it. Duration is now an editable field in both admin forms (was hardcoded 60 / 45); categories unified (was 'Zumba' vs 'Strength Training').
- ☑ Validation: live sessions must be scheduled in the future (recordings exempt — backfill by nature); duration bounds 10–240; http(s) URL check on recording/zoom link inputs (`patchLink` in admin SeriesDetail) + at form submit.
- ☑ `supabase/migration_reconcile_audit.sql`: `session_participants.matched_by/matched_at`; teacher reconcile writes them (toasts already existed).
- ☑ Attendance self-mark: SessionPlayer + detail now toast "Attendance recorded ✓" on success, retry once (skipping expected not-enrolled refusals), roll back optimistic state + error toast on final failure.

**Deploy checklist (manual):** run `supabase/migration_reconcile_audit.sql` in the Supabase SQL editor.

**Verify:** past date on live session rejected; junk URL rejected; break Zoom secrets locally → visible error toast; reconcile writes audit columns; recording chip flips to playable without reload when link arrives (≤60s).

---

## M3 — Naming + timezone foundation  ✅ (code done 2026-07-03 — deploy zoom-create-meeting)

**Goal:** One name ("Series") everywhere users look; correct local times for India/USA/Germany.
**Fixes:** C1, C2, B11 + groundwork for M4.

- ☑ New `src/lib/datetime.js`: `fmtDateTime`, `fmtDate`, `fmtTime`, `tzLabel`, `msUntil`, `fmtCountdown` — all `Intl.DateTimeFormat`-based in the viewer's tz, with tz label appended ("Sat, 4 Jul · 7:30 PM GMT+5:30").
- ☑ Swept all raw `toLocaleString`/`toLocaleDateString` for session times → `datetime.js` across client Series/SeriesDetail/SessionPlayer/Home, admin Series/SeriesDetail, teacher Schedule. (Revenue `₹` `toLocaleString('en-IN')` left as-is — currency, not time.)
- ☑ `zoom-create-meeting`: sends absolute UTC (`…Z`) + `timezone: 'UTC'`; Zoom now localizes per registrant. Removed hardcoded +5:30 IST offset (B11). **Needs redeploy.**
- ☑ User-facing "Challenge(s)" → "Series": nav labels (DashboardLayout), page headings, empty-state hints, "Select series…" dropdown. "Mark done" → "Mark completed" (admin SeriesDetail; teacher already said it). Landing marketing page left untouched (hidden, ambiguous marketing copy).
- ☑ File renames (via `git mv`, component names updated): `client/Challenges.jsx → client/Series.jsx` (`ClientSeries`), `client/ChallengeDetail.jsx → client/SeriesDetail.jsx` (`ClientSeriesDetail`), `admin/Challenges.jsx → admin/Series.jsx` (`AdminSeries`). `App.jsx` imports updated.
- ☑ Routes: `/app/series`, `/app/series/:id`, `/admin/series` now primary. Legacy `/app/challenges*` and `/admin/challenges` redirect via `RedirectToSeries` (preserves `:id`). All internal links repointed.

**Deploy checklist (manual):** `supabase functions deploy zoom-create-meeting` (timezone fix). No DB migration in M3.

**Verify:** build clean; only remaining "challenge" in src is code identifiers / DB columns / the `challenge` state var. Switch OS tz to America/New_York + Europe/Berlin → session times shift correctly with tz label. Old `/app/challenges/:id` bookmark → redirects to `/app/series/:id`.

---

## M4 — Student UX premium redesign  ✅ (code done 2026-07-03 — no migration/deploy)

**Goal:** Dead-simple funnel: browse → understand price → pay → join live → watch recording.
**Fixes:** B5–B7, C5 + now-tier features (countdown, retry, feedback).

- ☑ Deleted `HIDE_SESSION_IMAGES` (client SeriesDetail + Home). Posters now show; `SessionThumb` already renders a branded gradient "Day N" fallback when a poster is missing. Locked rows still hide the poster.
- ☑ Enroll-in-place: extracted a shared `src/components/PaymentSheet.jsx` (online/cash/retry). SeriesDetail's locked-session tap + "Enroll" banner open it on the page; on success `refreshEnrollment()` flips to unlocked state without navigating. Series list reuses the same component (deleted its inline modal + dead payment state).
- ☑ Payment retry: Razorpay failure keeps the sheet open, shows "Payment didn't go through — no money deducted", and the primary button becomes "Retry payment". (Cancel is distinguished from failure — no scary error on cancel.)
- ☑ Cash timeline copy: list badge now "Cash payment under verification · usually confirmed within a few hours · you'll be enrolled automatically". PaymentSheet has a WhatsApp "trouble paying?" link (`waLink` from `src/config`).
- ☑ Live countdown card on SeriesDetail: computes `nextLive` (earliest incomplete live session), 1s heartbeat → "Starts in 2h 14m" via `fmtCountdown`, flips to "Live now" + pulsing "Join live session" within the session's duration window. Home already had a `CountdownTimer` hero.
- ☑ Free-preview copy: "Your first N sessions are free" + "Watch free, then enroll to unlock all X sessions — ₹price"; enroll button shows the price.
- ☑ Visual pass: countdown hero uses the dark gradient card; posters + gradient fallbacks give the list visual identity.

**Verify:** full funnel as fresh test student — free preview watch, paid enroll via Razorpay test mode (in-place, stays on detail), cash flow, failed payment retry, live countdown flip. Requires M1 migration run first (enrollment RLS) for paid gating to behave.

---

## M5 — Staff UX cleanup  ✅ (code done 2026-07-03 — no migration/deploy)

**Goal:** Consistent, calm staff screens; admin honors the promise M4 makes to students.
**Fixes:** C3, C6 (+ C4/audit corrections).

- ☑ Cash-verification **queue already existed** in `admin/Revenue.jsx` ("Cash to verify" tab, verify/reject → auto-enroll). The real gap was discoverability: added a live red **count badge** on the admin Revenue nav item (sidebar + mobile tab) in `DashboardLayout.jsx`, fed by a `payments` count + realtime subscription. Admin now sees pending cash without opening the tab — this is what honors M4's student promise.
- ☑ Controlled `LinkInput` component in `admin/SeriesDetail.jsx` for recording/zoom link fields: syncs with webhook updates unless the admin is mid-edit (focus ref), replacing both `key={`rec-…`}` / `key={`zl-…`}` remount hacks.
- ☑ Attendance modal (`teacher/Schedule.jsx`): added an explicit **Cancel** button beside Save (previously only the corner X).
- ⏭️ **Grid/list toggle — kept, not removed.** Audit claim "no active indicator" was wrong (the active button is styled). It works and gives admins a choice; removing it is destructive with no user gain. Documented decision.
- ⏭️ Shared `SessionRow`/`SeriesCard` extraction — **deferred.** Admin and teacher session rows have diverged enough (different actions, layouts) that a shared component would need heavy prop-plumbing; not worth the risk now. Revisit if they reconverge.

**Verify:** create a cash payment as a student → red badge count appears on admin Revenue nav in real time → verify in the Cash tab → student's list badge reads "under verification" until then. Confirm no `key={\`rec-` / `key={\`zl-` remain in `admin/SeriesDetail.jsx`.

---

## M6 — Removals & data debt  ✅ (code done 2026-07-03 — run migration_attendance_threshold.sql + deploy zoom-webhook)

**Goal:** Delete what lies or does nothing.
**Fixes:** B12 (+ D1–D4 re-triaged).

- ☑ **Per-series attendance threshold** (B12): new `supabase/migration_attendance_threshold.sql` adds `challenges.attendance_threshold int not null default 75` (1–100 check). `zoom-webhook` meeting.ended now fetches the series' threshold and uses `pct >= threshold` instead of hardcoded 75. Admin edit form (`admin/SeriesDetail.jsx`) has an editable field ("% of a live class to count as attended"). **Migration + webhook redeploy needed.**
- ⏭️ **D1 leaderboard — not dead** (corrected in M2): it renders on the client detail page. Nothing removed.
- ⏭️ **D2 legacy `teacher_id` — kept.** It still feeds the teacher-name display on the client detail page + SessionPlayer, and `is_my_challenge` (already also checks `challenge_teachers`). Removing the write breaks display for edited series; ripping it out needs those reads repointed to `challenge_teachers` first — net-negative risk now. Left the first-teacher sync in place. Revisit only if display is migrated.
- ⏭️ **D3 `'active'` status — kept.** It IS settable (admin edit dropdown) and used for badges; the audit's "never set" meant no *auto*-transition, which is fine. Deriving live state at read time is scope creep with regression risk. Left as manual control.
- ⏭️ **D4 `TYPE_MAP` — not found** as live dead code worth a separate change; session types are the `live`/`recording` literals already used consistently.

**Deploy checklist (manual):** run `supabase/migration_attendance_threshold.sql`; `supabase functions deploy zoom-webhook --no-verify-jwt`.

**Verify:** set a series' threshold to e.g. 50 in the admin edit form; a student present for 60% of a live session is marked attended (would've been "missed" at 75). Default 75 preserved for existing series.

---

## M7 — New features (now-tier)  ✅ (code done 2026-07-03 — run migration_series_completion_badge.sql)

- ☑ **Series completion badge**: new `first_series` ("Series Finisher", silver) auto badge on `challenges_completed >= 1` — fills the gap between "Series Joiner" (enroll) and "Double Trouble" (2). Reuses the existing rules engine + metric, so no risky `user_metrics` rewrite. Migration `supabase/migration_series_completion_badge.sql` also renames the badge category + text "Challenge" → "Series" (category drives the Badges filter chip).
- ☑ **Wired the dormant rules engine**: `evaluateBadges`/`nearestBadges` existed in `src/lib/badges.js` but were **never called** — no auto badge could ever be awarded. `client/Badges.jsx` now runs `evaluateBadges` on load and shows the (previously unused) `BadgeEarnModal` celebration for freshly-earned badges.

**Deploy checklist (manual):** run `supabase/migration_series_completion_badge.sql`. No function/edge deploy.

**Verify:** enroll a test student in a series, admin sets its status to 'completed', open the student's Badges page → "Series Finisher" awards with the celebration modal. Existing challenge badges now read "Series".

**⚠️ Follow-up worth noting:** `challenges_completed` counts *enrolled-in-a-completed-series* regardless of attendance (same semantic the existing `double_trouble`/`veteran` badges already use). If you want attendance-verified completion, add a `series_finished` metric to `user_metrics` (attended ≥ `attendance_threshold`% of the series' sessions) and point a new badge at it — deferred to avoid rewriting `user_metrics`.

### Deferred (Later — do not build yet)
- Attendance-verified completion metric (see follow-up above).
- Certificates (needs shared PDF infra; revisit after dietPdf patterns settle).
- Push/email notification when a session goes live (needs FCM/OneSignal decision).
- Leaderboard rebuild (product call first).

---

## Deploy checklist (all milestones)

**SQL migrations — run in the Supabase SQL editor, in order:**
1. `migration_series_hardening.sql` (M1 — security: enrollment gate, teacher locks, indexes, webhook_events)
2. `migration_reconcile_audit.sql` (M2 — self-sufficient; also creates Zoom tables if missing)
3. `migration_attendance_threshold.sql` (M6 — per-series threshold column)
4. `migration_series_completion_badge.sql` (M7 — badge + naming)

**Edge functions:**
- `supabase functions deploy zoom-create-meeting` (M1 race guard + M3 timezone) — ⚠️ not yet deployed
- `supabase functions deploy zoom-webhook --no-verify-jwt` (M1 error log + M6 threshold) — ✅ deployed 2026-07-10

---

## Progress log

| Date | Milestone | Notes |
|------|-----------|-------|
| 2026-07-03 | Doc created | Audit complete, plan approved |
