-- ═══════════════════════════════════════════════════════════════
-- UniFit — Series access management
--   • Enrolled-member status (active / paused / removed)
--   • Live vs recorded entitlements on the SAME series (access_type)
--   • Per-session free/paid paywall (sessions.is_free)
--   • series_members() RPC for the admin/teacher member panel
-- Standalone, idempotent, additive. Run after migration_series.sql.
-- ═══════════════════════════════════════════════════════════════

-- What the series currently SELLS: a live batch, or its recordings afterwards.
alter table public.challenges
  add column if not exists access_type text not null default 'live'
  check (access_type in ('live', 'recorded'));

-- Per-session paywall override — a free session is watchable without enrolling,
-- regardless of the series' free_session_count preview count.
alter table public.sessions
  add column if not exists is_free boolean not null default false;

-- Enrollment lifecycle: admins can pause (block access) or remove students.
-- access_type separates live-batch members from recorded-only buyers.
alter table public.enrollments
  add column if not exists status text not null default 'active'
    check (status in ('active', 'paused', 'removed')),
  add column if not exists access_type text not null default 'live'
    check (access_type in ('live', 'recorded')),
  add column if not exists status_changed_at timestamptz,
  add column if not exists status_changed_by uuid references public.profiles(id);

-- Which entitlement this payment buys.
alter table public.payments
  add column if not exists access_type text not null default 'live'
    check (access_type in ('live', 'recorded'));

-- ── Auto-enroll trigger (rewrite) ──
-- On paid/verified: enroll with the payment's access_type. If a row already
-- exists (e.g. paused/removed), a fresh payment REACTIVATES it and refreshes
-- the entitlement — so "pay again to regain access" just works.
create or replace function public.on_payment_settled()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('paid', 'verified') then
    insert into public.enrollments (user_id, challenge_id, access_type, status)
    values (new.user_id, new.challenge_id, coalesce(new.access_type, 'live'), 'active')
    on conflict (user_id, challenge_id) do update
      set status = 'active',
          access_type = excluded.access_type,
          status_changed_at = now(),
          status_changed_by = null;
  end if;
  return new;
end; $$;
drop trigger if exists trg_payment_settled on public.payments;
create trigger trg_payment_settled
after insert or update of status on public.payments
for each row execute function public.on_payment_settled();

-- ── Member list for a series (admin + teacher panel) ──
-- SECURITY DEFINER so it can read profiles + join payment status past RLS.
-- Only the challenge's teachers and admins get rows; phone is admin-only
-- (teachers stay PII-free, per migration_teacher_no_pii.sql).
create or replace function public.series_members(p_challenge uuid)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  phone text,
  status text,
  access_type text,
  joined_at timestamptz,
  pay_method text,
  pay_status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    e.user_id,
    p.full_name,
    p.avatar_url,
    case when get_my_role() = 'admin' then p.phone else null end as phone,
    e.status,
    e.access_type,
    e.joined_at,
    lp.method as pay_method,
    lp.status as pay_status
  from enrollments e
  join profiles p on p.id = e.user_id
  -- most recent payment for this user+series, if any
  left join lateral (
    select method, status
    from payments pm
    where pm.user_id = e.user_id and pm.challenge_id = e.challenge_id
    order by created_at desc
    limit 1
  ) lp on true
  where e.challenge_id = p_challenge
    and (
      get_my_role() = 'admin'
      or exists (
        select 1 from challenge_teachers ct
        where ct.challenge_id = p_challenge and ct.teacher_id = auth.uid()
      )
    )
  order by e.joined_at desc;
$$;
grant execute on function public.series_members(uuid) to authenticated;
