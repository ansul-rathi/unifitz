-- migration_profile_self_insert.sql
-- Some accounts have no profiles row (signup trigger missed it / id drift). The
-- onboarding wizard now upserts the profile, but profiles had no INSERT policy,
-- so the insert failed: "new row violates row-level security policy for table profiles".
-- Allow a logged-in user to create their OWN profile row (id must equal auth.uid()).
-- Idempotent + non-destructive. Run in the Supabase SQL editor.

drop policy if exists "self insert profile" on public.profiles;
create policy "self insert profile" on public.profiles
  for insert with check (id = auth.uid());

-- Optional: backfill profile rows for any auth users missing one.
insert into public.profiles (id, full_name, role)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', ''), 'client'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
