-- Series visibility toggle. Disabled series are hidden from students + teachers;
-- only admins see/manage them. Idempotent, no data loss.

alter table public.challenges add column if not exists is_published boolean not null default true;

-- Replace the "everyone can read" policy: non-admins only see published series.
-- (Admins keep full access via the existing "admin writes challenges" FOR ALL policy.)
drop policy if exists "challenges readable" on public.challenges;
create policy "challenges readable" on public.challenges
  for select using (is_published = true or get_my_role() = 'admin');
