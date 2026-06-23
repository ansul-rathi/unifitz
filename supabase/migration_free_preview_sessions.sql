-- migration_free_preview_sessions.sql
-- Let a paid series offer the first N sessions as a free preview. Non-enrolled
-- students can watch those; the rest are locked until they enroll/pay.
-- Idempotent + non-destructive. Run in the Supabase SQL editor.

alter table public.challenges
  add column if not exists free_session_count int not null default 0;

-- Let anyone (logged-in) read the first N sessions of a PUBLISHED series so they
-- can sample the free preview before enrolling. Locked sessions (beyond N) stay
-- invisible to non-enrolled users. Ranked by day_number.
--
-- IMPORTANT: the rank check must live in a SECURITY DEFINER function. Doing the
-- count() inline in the policy makes the policy query `sessions` again, which
-- re-triggers this very policy → "infinite recursion detected in policy for
-- relation sessions" → ALL session reads fail. The definer function bypasses RLS
-- for that inner count, breaking the cycle.
create or replace function public.is_free_preview_session(p_session uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.sessions s
    join public.challenges c on c.id = s.challenge_id
    where s.id = p_session
      and c.is_published = true
      and c.free_session_count > 0
      and (
        select count(*) from public.sessions s2
        where s2.challenge_id = s.challenge_id
          and s2.day_number < s.day_number
      ) < c.free_session_count
  );
$$;
grant execute on function public.is_free_preview_session(uuid) to authenticated, anon;

drop policy if exists "free preview sessions readable" on public.sessions;
create policy "free preview sessions readable" on public.sessions
  for select using ( public.is_free_preview_session(id) );

-- Co-teachers (challenge_teachers) can edit their series' details, not just the
-- legacy lead teacher. (Relies on is_my_challenge from migration_teacher_membership.)
drop policy if exists "teacher updates own challenge" on public.challenges;
create policy "teacher updates own challenge" on public.challenges
  for update using (public.is_my_challenge(id));
