-- migration_teacher_membership.sql
-- A series can have multiple teachers (challenge_teachers), but is_my_challenge()
-- only matched the legacy lead teacher_id — so co-teachers couldn't manage their
-- own series' sessions/attendance. Extend it to also honour challenge_teachers.
--
-- This single change fixes every teacher RLS policy that calls is_my_challenge()
-- (sessions, challenges update, attendance, session_participants, …).
-- Idempotent + non-destructive. Run in the Supabase SQL editor.

create or replace function public.is_my_challenge(p_challenge uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.challenges
    where id = p_challenge and teacher_id = auth.uid()
  ) or exists (
    select 1 from public.challenge_teachers
    where challenge_id = p_challenge and teacher_id = auth.uid()
  );
$$;
