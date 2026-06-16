-- ═══════════════════════════════════════════════════════════════
-- UniFit — Paid Series + Payments (Razorpay + cash) + revenue split
-- Standalone, idempotent, no data loss. Run after the core migration.
-- ═══════════════════════════════════════════════════════════════

-- Pricing on challenges (a.k.a. "series").
alter table public.challenges
  add column if not exists price numeric not null default 0,
  add column if not exists currency text not null default 'INR';

-- Multiple teachers per series.
create table if not exists public.challenge_teachers (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  unique (challenge_id, teacher_id)
);
create index if not exists idx_challenge_teachers_ch on public.challenge_teachers(challenge_id);

-- Backfill from the legacy single teacher_id.
insert into public.challenge_teachers (challenge_id, teacher_id)
select id, teacher_id from public.challenges where teacher_id is not null
on conflict do nothing;

-- Payments — Razorpay or cash; verified/paid → auto-enroll via trigger.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'INR',
  method text not null,                       -- 'razorpay' | 'cash'
  status text not null default 'created',     -- created | paid | pending_verification | verified | rejected | failed
  razorpay_order_id text,
  razorpay_payment_id text,
  cash_collector_id uuid references public.profiles(id),  -- who the client paid (teacher/admin)
  verified_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (razorpay_order_id)
);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);

-- Auto-enroll once a payment is paid/verified.
create or replace function public.on_payment_settled()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('paid','verified') then
    insert into public.enrollments (user_id, challenge_id)
    values (new.user_id, new.challenge_id)
    on conflict (user_id, challenge_id) do nothing;
  end if;
  return new;
end; $$;
drop trigger if exists trg_payment_settled on public.payments;
create trigger trg_payment_settled
after insert or update of status on public.payments
for each row execute function public.on_payment_settled();

-- ── RLS ──
alter table public.challenge_teachers enable row level security;
alter table public.payments enable row level security;

drop policy if exists "teachers readable" on public.challenge_teachers;
create policy "teachers readable" on public.challenge_teachers
  for select using (auth.role() = 'authenticated');
drop policy if exists "admin writes ch teachers" on public.challenge_teachers;
create policy "admin writes ch teachers" on public.challenge_teachers
  for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- payments: user sees + creates own; staff (collector / challenge teacher) sees relevant; admin all.
drop policy if exists "own payments read" on public.payments;
create policy "own payments read" on public.payments
  for select using (
    user_id = auth.uid()
    or cash_collector_id = auth.uid()
    or get_my_role() = 'admin'
    or exists (select 1 from challenge_teachers ct where ct.challenge_id = payments.challenge_id and ct.teacher_id = auth.uid())
  );
drop policy if exists "user creates own payment" on public.payments;
create policy "user creates own payment" on public.payments
  for insert with check (user_id = auth.uid());
drop policy if exists "admin manages payments" on public.payments;
create policy "admin manages payments" on public.payments
  for all using (get_my_role() = 'admin');

-- ── Earnings: 20% UniFitz, 80% split equally among the series' teachers ──
create or replace view public.series_earnings as
select
  c.id as challenge_id,
  c.name,
  coalesce(sum(p.amount) filter (where p.status in ('paid','verified')), 0) as gross,
  round(coalesce(sum(p.amount) filter (where p.status in ('paid','verified')), 0) * 0.20, 2) as unifitz_cut,
  round(coalesce(sum(p.amount) filter (where p.status in ('paid','verified')), 0) * 0.80, 2) as teacher_pool,
  (select count(*) from challenge_teachers ct where ct.challenge_id = c.id) as teacher_count
from challenges c
left join payments p on p.challenge_id = c.id
group by c.id, c.name;

-- Per-teacher payout = teacher_pool / teacher_count, across all series they teach.
create or replace function public.teacher_earnings(p_teacher uuid)
returns numeric language sql security definer set search_path = public stable as $$
  select coalesce(sum(
    case when e.teacher_count > 0 then e.teacher_pool / e.teacher_count else 0 end
  ), 0)
  from series_earnings e
  join challenge_teachers ct on ct.challenge_id = e.challenge_id
  where ct.teacher_id = p_teacher;
$$;
grant execute on function public.teacher_earnings(uuid) to authenticated;
