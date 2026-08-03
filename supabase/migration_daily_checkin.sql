-- ═══════════════════════════════════════════════════════════════
-- Daily check-in — extra self-report fields (idempotent, safe to re-run).
-- Adds to the existing public.daily_checkins (user_id, checkin_date,
-- attended_session, water_glasses, sleep_hours). RLS already covers the
-- table (users read/write their own rows), so no policy changes needed.
-- ═══════════════════════════════════════════════════════════════

alter table public.daily_checkins
  add column if not exists slept_on_time  boolean,
  add column if not exists sleep_quality  int,
  add column if not exists diet_consistent boolean,
  add column if not exists ate_junk       boolean,
  add column if not exists junk_detail    text,
  add column if not exists did_workout    boolean,
  add column if not exists workout_rating int;

-- Bounds for the 1–5 ratings (added separately so re-runs don't error).
do $$ begin
  alter table public.daily_checkins add constraint daily_sleep_quality_range check (sleep_quality between 1 and 5);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.daily_checkins add constraint daily_workout_rating_range check (workout_rating between 1 and 5);
exception when duplicate_object then null; end $$;
