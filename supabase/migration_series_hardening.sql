-- migration_series_hardening.sql
-- M1 of the Series overhaul: close the paid-access bypass, enforce staff
-- permissions server-side, add integrity constraints, and give webhooks an
-- error trail. Idempotent + non-destructive. Run in the Supabase SQL editor.

-- ────────────────────────────────────────────────────────────────────
-- 1) PAID-ACCESS BYPASS (critical)
-- The old "self enroll" policy let ANY authenticated user insert an
-- enrollment row for ANY challenge — including paid ones — straight through
-- the API, skipping payment entirely. Sessions RLS trusts enrollments, so
-- this was full free access to paid content (recordings included).
--
-- Fix: self-enroll is allowed only into published FREE series. Paid
-- enrollments are created exclusively by the payment trigger
-- (on_payment_settled, security definer), the Zoom webhook self-heal
-- (service role), or an admin.
-- ────────────────────────────────────────────────────────────────────
create or replace function public.is_free_challenge(p_challenge uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.challenges
    where id = p_challenge
      and is_published = true
      and (is_free = true or coalesce(price, 0) = 0)
  );
$$;
grant execute on function public.is_free_challenge(uuid) to authenticated;

drop policy if exists "self enroll" on public.enrollments;
create policy "self enroll" on public.enrollments
  for insert with check (
    user_id = auth.uid() and public.is_free_challenge(challenge_id)
  );

-- ────────────────────────────────────────────────────────────────────
-- 2) TEACHER FIELD LOCKS (server-side what the UI only pretends)
-- "teacher updates own challenge" allows a full-row UPDATE, so a teacher
-- could change price / publish state / free flag via the API. Lock the
-- commercial + visibility columns to admins with a trigger (RLS cannot do
-- column-level checks).
-- ────────────────────────────────────────────────────────────────────
create or replace function public.enforce_challenge_column_perms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role / SQL editor sessions have no auth.uid(); let them through.
  if auth.uid() is null then return new; end if;
  if public.get_my_role() = 'admin' then return new; end if;

  if new.price       is distinct from old.price
  or new.currency    is distinct from old.currency
  or new.is_free     is distinct from old.is_free
  or new.is_published is distinct from old.is_published
  or new.teacher_id  is distinct from old.teacher_id then
    raise exception 'only admins can change pricing, publish state, or the lead teacher';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_challenge_column_perms on public.challenges;
create trigger trg_challenge_column_perms
before update on public.challenges
for each row execute function public.enforce_challenge_column_perms();

-- ────────────────────────────────────────────────────────────────────
-- 3) INTEGRITY CONSTRAINTS
-- ────────────────────────────────────────────────────────────────────
-- One open (unsettled) payment per user per series. Settled/void rows are
-- history and may repeat (e.g. failed then paid).
-- Clean duplicates first so the index can build.
delete from public.payments p
using public.payments q
where p.user_id = q.user_id
  and p.challenge_id = q.challenge_id
  and p.status in ('created','pending_verification')
  and q.status in ('created','pending_verification')
  and p.created_at < q.created_at;

create unique index if not exists uniq_open_payment_per_series
  on public.payments (user_id, challenge_id)
  where status in ('created','pending_verification');

-- At most ONE pinned "live next" session per series (was app-level only).
-- Unpin all but the most recently scheduled one before building the index.
update public.sessions s
set is_live_next = false
where is_live_next
  and exists (
    select 1 from public.sessions s2
    where s2.challenge_id = s.challenge_id
      and s2.is_live_next
      and s2.id <> s.id
      and coalesce(s2.scheduled_at, 'epoch') > coalesce(s.scheduled_at, 'epoch')
  );

create unique index if not exists uniq_live_next_per_series
  on public.sessions (challenge_id)
  where is_live_next;

-- ────────────────────────────────────────────────────────────────────
-- 4) WEBHOOK ERROR TRAIL
-- zoom-webhook used to swallow every failure (console.error + 204). Failures
-- now land here so attendance/lifecycle gaps are visible and debuggable.
-- Written by edge functions with the service role (bypasses RLS); admins read.
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'zoom',        -- 'zoom' | 'razorpay' | ...
  event_type text,                            -- e.g. 'meeting.ended'
  status text not null default 'error',       -- 'error' | 'skipped'
  error text,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_webhook_events_created on public.webhook_events (created_at desc);

alter table public.webhook_events enable row level security;
drop policy if exists "admin reads webhook events" on public.webhook_events;
create policy "admin reads webhook events" on public.webhook_events
  for select using (public.get_my_role() = 'admin');
