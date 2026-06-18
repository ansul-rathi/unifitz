-- migration_teacher_no_pii.sql
-- Teachers must NOT see student personal contact details (phone; email lives in
-- auth.users and was never exposed). RLS is row-level, so we can't hide just the
-- phone column — instead we remove teachers' direct read of the profiles table
-- and serve only safe fields (name, avatar) through SECURITY DEFINER RPCs.
--
-- Idempotent + non-destructive. Run in the Supabase SQL editor.

-- 1) Revoke teachers' blanket read of student profile rows.
drop policy if exists "teacher reads students" on public.profiles;
-- (own-profile read, admin-full, and the referral validation RPC remain.)

-- 2) Safe student directory for a teacher's whole roster (name + avatar only).
create or replace function public.my_students()
returns table (user_id uuid, full_name text, avatar_url text, challenge_id uuid, challenge_name text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url, c.id, c.name
  from public.enrollments e
  join public.challenges c on c.id = e.challenge_id
  join public.profiles p   on p.id = e.user_id
  where get_my_role() in ('teacher', 'admin')
    and (
      c.teacher_id = auth.uid()
      or exists (select 1 from public.challenge_teachers ct where ct.challenge_id = c.id and ct.teacher_id = auth.uid())
      or get_my_role() = 'admin'
    );
$$;
grant execute on function public.my_students() to authenticated;

-- 3) Safe roster for one series (used by the attendance sheet).
create or replace function public.series_roster(p_challenge uuid)
returns table (user_id uuid, full_name text, avatar_url text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url
  from public.enrollments e
  join public.profiles p on p.id = e.user_id
  where e.challenge_id = p_challenge
    and (public.is_my_challenge(p_challenge) or get_my_role() = 'admin');
$$;
grant execute on function public.series_roster(uuid) to authenticated;
