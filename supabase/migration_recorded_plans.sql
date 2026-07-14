-- ═══════════════════════════════════════════════════════════════
-- UniFit — Recorded-series plans + live→recorded phase gating
--   • recorded_plans: custom time-limited plans per series (label/months/price)
--   • enrollments.expires_at: recorded access expiry (null = live / lifetime)
--   • payments.plan_months / plan_label: what recorded plan was bought
--   • on_payment_settled rewritten to compute the expiry
-- Standalone, idempotent, additive. Run after migration_series_access.sql.
-- ═══════════════════════════════════════════════════════════════

-- Custom recorded plans for a series. months = null → lifetime.
create table if not exists public.recorded_plans (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  label text not null,
  months int check (months is null or months > 0),
  price numeric not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_recorded_plans_ch on public.recorded_plans(challenge_id);

alter table public.enrollments
  add column if not exists expires_at timestamptz;   -- null = no expiry (live / lifetime)

alter table public.payments
  add column if not exists plan_months int,
  add column if not exists plan_label text;

-- ── RLS ──
alter table public.recorded_plans enable row level security;
-- Clients need to see plans + prices to buy; only admin writes.
drop policy if exists "recorded plans readable" on public.recorded_plans;
create policy "recorded plans readable" on public.recorded_plans
  for select using (auth.role() = 'authenticated');
drop policy if exists "admin writes recorded plans" on public.recorded_plans;
create policy "admin writes recorded plans" on public.recorded_plans
  for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- ── Auto-enroll trigger (rewrite) ──
-- On paid/verified: enroll with the payment's access_type + compute the recorded
-- expiry from plan_months (lifetime = null). A recorded purchase overwrites a
-- prior live row — that's the "pay again to keep watching" upgrade.
create or replace function public.on_payment_settled()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_expires timestamptz;
begin
  if new.status in ('paid', 'verified') then
    v_expires := case
      when coalesce(new.access_type, 'live') = 'recorded' and new.plan_months is not null
        then now() + make_interval(months => new.plan_months)
      else null
    end;
    insert into public.enrollments (user_id, challenge_id, access_type, status, expires_at)
    values (new.user_id, new.challenge_id, coalesce(new.access_type, 'live'), 'active', v_expires)
    on conflict (user_id, challenge_id) do update
      set status = 'active',
          access_type = excluded.access_type,
          expires_at = excluded.expires_at,
          status_changed_at = now(),
          status_changed_by = null;
  end if;
  return new;
end; $$;
drop trigger if exists trg_payment_settled on public.payments;
create trigger trg_payment_settled
after insert or update of status on public.payments
for each row execute function public.on_payment_settled();

-- ── series_members(): add expires_at so the admin panel can show recorded expiry ──
-- Return signature changes → drop then recreate (same body as migration_series_access
-- plus expires_at).
drop function if exists public.series_members(uuid);
create function public.series_members(p_challenge uuid)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  phone text,
  status text,
  access_type text,
  expires_at timestamptz,
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
    e.expires_at,
    e.joined_at,
    lp.method as pay_method,
    lp.status as pay_status
  from enrollments e
  join profiles p on p.id = e.user_id
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
