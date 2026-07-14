-- ═══════════════════════════════════════════════════════════════
-- UniFit — Member follow-ups + admin email lookup (Member 360° page)
-- Standalone, idempotent, additive. Run in the Supabase SQL editor.
-- ═══════════════════════════════════════════════════════════════

-- Follow-up log the admin keeps against a member (notes, channel, next date).
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,   -- the member
  author_id uuid references public.profiles(id) on delete set null,          -- admin who logged it
  note text not null,
  channel text check (channel in ('whatsapp', 'call', 'other')),
  status text not null default 'open' check (status in ('open', 'done')),
  next_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_follow_ups_user on public.follow_ups(user_id, created_at desc);

alter table public.follow_ups enable row level security;

drop policy if exists "admin manages follow_ups" on public.follow_ups;
create policy "admin manages follow_ups" on public.follow_ups
  for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- Member email for the 360° header (profiles has no email column). Admin-only.
create or replace function public.admin_user_email(p_user uuid)
returns text
language sql
security definer
set search_path = public, auth
stable
as $$
  select case when get_my_role() = 'admin'
    then (select email from auth.users where id = p_user)
    else null end;
$$;
grant execute on function public.admin_user_email(uuid) to authenticated;
