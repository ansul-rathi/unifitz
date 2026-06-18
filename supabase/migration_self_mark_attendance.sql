-- migration_self_mark_attendance.sql
-- Watching a session recording should count as attendance for that student.
-- Clients can INSERT their own attendance under RLS but cannot UPDATE it, so a
-- previously "missed" live session could never flip to attended. This SECURITY
-- DEFINER RPC handles both cases safely, after verifying the caller is enrolled.
--
-- Idempotent + non-destructive. Run in the Supabase SQL editor.

-- ── 0) Ensure the Zoom/attendance columns exist ─────────────────────────────
-- (some environments predate these; the zoom-webhook + this RPC both need them.)
alter table public.attendance
  add column if not exists attended_minutes int,
  add column if not exists session_minutes  int,
  add column if not exists attendance_pct    numeric,
  add column if not exists source            text not null default 'manual';  -- 'zoom' | 'manual' | 'recording'

create or replace function public.self_mark_attendance(p_session uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Caller must be enrolled in the session's series.
  if not exists (
    select 1
    from public.sessions s
    join public.enrollments e on e.challenge_id = s.challenge_id
    where s.id = p_session and e.user_id = auth.uid()
  ) then
    raise exception 'not enrolled in this series';
  end if;

  insert into public.attendance (session_id, user_id, attended, marked_by, source)
  values (p_session, auth.uid(), true, auth.uid(), 'recording')
  on conflict (session_id, user_id)
  do update set attended = true;  -- flip a prior "missed" row; leaves %/minutes intact
end;
$$;

grant execute on function public.self_mark_attendance(uuid) to authenticated;
