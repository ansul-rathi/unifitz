-- Cash-collector list for a paid series: the series' teachers + all admins.
-- SECURITY DEFINER so clients (who can't read other profiles under RLS) still
-- get the names to pick who they handed cash to. Idempotent.

create or replace function public.series_collectors(p_challenge uuid)
returns table (id uuid, full_name text, avatar_url text, role text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url, 'teacher'::text as role
  from challenge_teachers ct
  join profiles p on p.id = ct.teacher_id
  where ct.challenge_id = p_challenge
  union
  select p.id, p.full_name, p.avatar_url, 'admin'::text as role
  from profiles p
  where p.role = 'admin' and p.is_active;
$$;
grant execute on function public.series_collectors(uuid) to authenticated;
