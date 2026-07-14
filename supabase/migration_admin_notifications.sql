-- ═══════════════════════════════════════════════════════════════
-- UniFit — Admin notification feed (people + money events)
--   Signup / enrollment / payment events → notifications table, written by
--   SECURITY DEFINER triggers so the client never touches it. Admin-only RLS.
-- Standalone, idempotent, additive. Run in the Supabase SQL editor.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('signup', 'enrollment', 'payment')),
  title text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  challenge_id uuid references public.challenges(id) on delete set null,
  amount numeric,
  meta jsonb not null default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_feed on public.notifications(is_read, created_at desc);

alter table public.notifications enable row level security;

-- Admin reads the whole feed and can mark rows read. No client inserts —
-- rows are created only by the SECURITY DEFINER triggers below.
drop policy if exists "admin reads notifications" on public.notifications;
create policy "admin reads notifications" on public.notifications
  for select using (get_my_role() = 'admin');
drop policy if exists "admin updates notifications" on public.notifications;
create policy "admin updates notifications" on public.notifications
  for update using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- ── Helper: insert one feed row ──
create or replace function public.notify_admin(
  p_type text, p_title text, p_actor uuid, p_challenge uuid, p_amount numeric
) returns void
language sql security definer set search_path = public as $$
  insert into public.notifications (type, title, actor_id, challenge_id, amount)
  values (p_type, p_title, p_actor, p_challenge, p_amount);
$$;

-- ── Signup ──
create or replace function public.on_profile_created_notify()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform notify_admin(
    'signup',
    coalesce(nullif(new.full_name, ''), 'New member') || ' signed up',
    new.id, null, null
  );
  return new;
end; $$;
drop trigger if exists trg_notify_signup on public.profiles;
create trigger trg_notify_signup
after insert on public.profiles
for each row execute function public.on_profile_created_notify();

-- ── Enrollment ──
create or replace function public.on_enrollment_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_series text;
begin
  select coalesce(nullif(full_name, ''), 'A member') into v_name from profiles where id = new.user_id;
  select name into v_series from challenges where id = new.challenge_id;
  perform notify_admin(
    'enrollment',
    coalesce(v_name, 'A member') || ' enrolled in ' || coalesce(v_series, 'a series')
      || ' (' || coalesce(new.access_type, 'live') || ')',
    new.user_id, new.challenge_id, null
  );
  return new;
end; $$;
drop trigger if exists trg_notify_enrollment on public.enrollments;
create trigger trg_notify_enrollment
after insert on public.enrollments
for each row execute function public.on_enrollment_notify();

-- ── Payment ── cash-pending on insert; "paid ₹X" when settled.
create or replace function public.on_payment_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_series text;
begin
  select coalesce(nullif(full_name, ''), 'A member') into v_name from profiles where id = new.user_id;
  select name into v_series from challenges where id = new.challenge_id;

  if tg_op = 'INSERT' then
    -- Only the cash "pending verification" insert is worth surfacing; a
    -- razorpay 'created' row is a half-finished checkout (noise).
    if new.status = 'pending_verification' then
      perform notify_admin(
        'payment',
        coalesce(v_name, 'A member') || ' — cash payment pending for ' || coalesce(v_series, 'a series'),
        new.user_id, new.challenge_id, new.amount
      );
    end if;
  elsif new.status in ('paid', 'verified') and coalesce(old.status, '') is distinct from new.status then
    perform notify_admin(
      'payment',
      coalesce(v_name, 'A member') || ' paid ₹' || trim(to_char(new.amount, 'FM999999990.00'))
        || ' for ' || coalesce(v_series, 'a series'),
      new.user_id, new.challenge_id, new.amount
    );
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_payment on public.payments;
create trigger trg_notify_payment
after insert or update of status on public.payments
for each row execute function public.on_payment_notify();

-- ── Realtime ──
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then
  null;
end $$;
