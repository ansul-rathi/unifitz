-- migration_auto_complete_sessions.sql
-- Auto-complete a live session once its scheduled end time (start + duration)
-- has passed — a safety net in case the Zoom `meeting.ended` webhook never fires
-- (host closed the tab, didn't formally "End for all", or the event was missed).
--
-- Flow after this:
--   1. start + duration passes  → cron flips completed=true, is_live_next=false,
--      and marks recording_status='processing' (so students see "recording coming").
--   2. Zoom finishes the cloud recording → zoom-webhook `recording.completed`
--      fills recording_link + recording_status='available' + session_type='recording'.
--   3. Student view shows the recording in place of the live Zoom link.
--
-- Idempotent + non-destructive. Run the whole file in the Supabase SQL editor.

-- ── 0) Ensure the recording_status column exists ────────────────────────────
-- (some environments predate it; zoom-webhook also writes this column.)
alter table public.sessions
  add column if not exists recording_status text not null default 'none';  -- 'none' | 'processing' | 'available'

-- ── 1) The worker function ──────────────────────────────────────────────────
create or replace function public.auto_complete_past_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.sessions
     set completed = true,
         is_live_next = false,
         -- only nudge to 'processing' while we wait for the recording webhook;
         -- never downgrade an already-available recording.
         recording_status = case
           when recording_link is null and recording_status = 'none' then 'processing'
           else recording_status
         end
   where completed = false
     and session_type = 'live'
     and scheduled_at is not null
     and scheduled_at + make_interval(mins => coalesce(duration_minutes, 60)) < now();
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ── 2) Schedule it every 10 minutes via pg_cron ─────────────────────────────
-- PREREQUISITE: enable the pg_cron extension once
--   Supabase Dashboard → Database → Extensions → search "pg_cron" → enable.
-- (or: create extension if not exists pg_cron;  -- needs superuser)

-- Replace any prior copy of this job, then (re)create it.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'auto-complete-sessions') then
    perform cron.unschedule('auto-complete-sessions');
  end if;
end $$;

select cron.schedule(
  'auto-complete-sessions',
  '*/10 * * * *',
  $$ select public.auto_complete_past_sessions(); $$
);

-- ── 3) Backfill once now (catch sessions already past) ──────────────────────
select public.auto_complete_past_sessions();
