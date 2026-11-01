# Future Plan — Live Classes follow-ups

> Created: 2026-10-26. Items discussed while scoping Live Classes (recurring batches) and
> deliberately deferred. Live Classes v1 (web) = `supabase/migration_live_classes.sql` +
> `src/pages/staff/LiveClass*.jsx`, `src/pages/client/LiveClass.jsx`.
> Order below is a suggestion, not a commitment — revisit after v1 is signed off.

---

## Standing decisions (carry forward)
- A live class **is a series** (`challenges.is_recurring = true`). Reuse sessions / enrollments /
  attendance — never fork a parallel table set.
- One **fixed join link** per class (`recur_join_link`), copied onto each generated session.
  No per-day Zoom meeting creation.
- **Teachers pick the roster.** Students cannot self-join a live class.
- Student ratings are **teacher-only**. No admin read path — keep it that way in every app.

---

## F1 — Port to mobile apps (next, after web sign-off)
- ☐ **Unifitz Student (Flutter):** "My Live Classes" home card (join + rate last class),
  class page (attendance, trainer remark, session summary, rating), notifications inbox.
- ☐ **Unifitz Teacher (Flutter):** Live Classes list, create/edit form, roster picker,
  attendance sheet with remarks, upcoming calendar (cancel/restore a date), ratings view.
- ☐ **Admin app:** Live Classes list/detail (create for a teacher, roster, attendance). No ratings.
- Same RPCs as web: `save_live_class`, `end_live_class`, `live_class_candidates`,
  `set_live_class_roster`, `submit_session_feedback`, `series_roster`.

## F2 — Push notifications (web + Android + iOS)
Today notifications are in-app only (bell + inbox, realtime). Push extends the same rows.
- ☐ **FCM** for all three platforms (one service, free). iOS via an APNs key in Firebase.
- ☐ `device_tokens` table (user_id, token, platform, updated_at) — apps upsert on login.
- ☐ Edge function `send-push`, fired by a Supabase Database Webhook on `notifications` INSERT
  where `recipient_id is not null`; deep-link with the row's `link`.
- ☐ Ask for permission at a meaningful moment (e.g. after joining a first class), not on launch —
  App Store / Play policy friendly.
- ☐ Web push on iPhone only works when the site is added to the Home Screen (iOS 16.4+) — document
  this for students; Android/desktop browsers work directly.
- ☐ Pre-class reminder (e.g. 15 min before) — add to `live_class_tick()`.

## F3 — Class streak + streak revival
User idea (raw): streak = consecutive scheduled classes attended (days with no class don't break it).
When a streak is about to break, the student taps **"Save my streak"** → teacher is notified →
teacher sends a small task on **WhatsApp** (squats, crunches…) → student sends a video there →
teacher taps **Accept** (streak continues) or **Reject** (streak breaks) in the app.
- ☐ Decide: replace the current daily check-in streak on Home, or show a separate class streak.
- ☐ `streak_revivals` table (user_id, challenge_id, session_id missed, status requested/accepted/rejected,
  decided_by, decided_at). Revival window (e.g. 24 h after the missed class).
- ☐ Revival **limits** (e.g. N per month) — undecided.
- ☐ Streak badges (reuse `badge_definitions` rules engine with a new metric).

## F4 — Fees per class
- ☐ Monthly fee per student per live class; paid / due status; who collected (reuse `payments`
  with `challenge_id` + cash collector — check if Razorpay flow fits a recurring fee).
- ☐ Due reminders (in-app → push once F2 lands).

## F5 — Self-subscribe / join requests
- ☐ Student requests to join a class → teacher approves (roster stays teacher-controlled).

## F6 — Insights
- ☐ Teacher: average rating per class over time, students missing 3+ classes in a row (drop-off alert).
- ☐ Teacher reminder if attendance isn't marked within X hours of class end; admin sees pending count.
- ☐ Optional energy-level field on remarks (1–5) if teachers want a trend line.

## F7 — Capacity
- ☐ Optional max students per class (no limit for now — batches are 5–15).
