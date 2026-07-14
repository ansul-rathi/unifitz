-- migration_attendance_threshold.sql
-- M6 of the Series overhaul: make the attendance threshold configurable per
-- series instead of a magic 75 hardcoded in the Zoom webhook. A student counts
-- as "attended" for a live session once they've been present for at least this
-- percentage of the meeting's duration.
-- Idempotent + non-destructive. Run in the Supabase SQL editor.

alter table public.challenges
  add column if not exists attendance_threshold int not null default 75;

-- Keep it sane (1–100).
do $$
begin
  alter table public.challenges
    add constraint challenges_attendance_threshold_ck check (attendance_threshold between 1 and 100);
exception when duplicate_object then
  null;
end $$;
