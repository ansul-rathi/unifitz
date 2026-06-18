-- migration_backfill_enrollments.sql
-- Fix: a series shows 0 enrolled even though a student participated.
-- Root cause: an enrollment row was never created — either the student attended
-- via Zoom (webhook writes attendance with the service role, no enrollment check),
-- or an old cash-verify transaction rolled back before the trg_eval_badges fix,
-- so the auto-enroll trigger (on_payment_settled) never committed.
--
-- This script is NON-DESTRUCTIVE and IDEMPOTENT (on conflict do nothing).
-- Safe to run multiple times. Run the whole file in the Supabase SQL editor.
--
-- PREREQUISITE: trg_eval_badges must be the fixed version (references new.user_id,
-- not referrer_id). It is in migration_diet_badges.sql. If unsure, re-run that file
-- first, otherwise these inserts could roll back on the badge trigger.

-- ── 1) DIAGNOSE — run these SELECTs first to see the gap ─────────────────────
-- Anyone with attendance in a challenge but no enrollment row:
--   select distinct a.user_id, s.challenge_id, c.name
--   from public.attendance a
--   join public.sessions s   on s.id = a.session_id
--   join public.challenges c on c.id = s.challenge_id
--   left join public.enrollments e
--          on e.user_id = a.user_id and e.challenge_id = s.challenge_id
--   where a.user_id is not null and e.id is null;
--
-- Anyone with a settled payment but no enrollment:
--   select p.user_id, p.challenge_id, c.name, p.status
--   from public.payments p
--   join public.challenges c on c.id = p.challenge_id
--   left join public.enrollments e
--          on e.user_id = p.user_id and e.challenge_id = p.challenge_id
--   where p.status in ('paid','verified') and e.id is null;

-- ── 2) BACKFILL — create the missing enrollments ────────────────────────────

-- From attendance (someone clearly participated in a session of that series).
insert into public.enrollments (user_id, challenge_id)
select distinct a.user_id, s.challenge_id
from public.attendance a
join public.sessions s on s.id = a.session_id
where a.user_id is not null
on conflict (user_id, challenge_id) do nothing;

-- From settled payments (paid online / cash verified).
insert into public.enrollments (user_id, challenge_id)
select distinct p.user_id, p.challenge_id
from public.payments p
where p.status in ('paid','verified')
on conflict (user_id, challenge_id) do nothing;

-- ── 3) VERIFY — enrolled counts per series after backfill ───────────────────
--   select c.name, count(e.id) as enrolled
--   from public.challenges c
--   left join public.enrollments e on e.challenge_id = c.id
--   group by c.name order by enrolled desc;
