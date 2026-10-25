-- ═══════════════════════════════════════════════════════════════
-- Security hardening — audit 2026-10-25, Phase 16 (U-00, U-39, U-40 + more).
-- Run in the Supabase SQL editor. Idempotent; safe to re-run.
-- SAFE TO RUN IMMEDIATELY on the currently deployed frontend. After the new
-- frontend is live, also run migration_retire_email_exists.sql.
-- Verified against a local stack seeded from every repo migration: each
-- exploit below succeeded before this file and is blocked after it, while
-- normal client / onboarding / landing flows keep working.
--
--   1. U-00 CRITICAL  any client could PATCH own profiles.role → 'admin'
--                     (UPDATE policy had no WITH CHECK; self-insert/upsert too)
--   2. U-39           series_earnings view readable by anon (revenue leak)
--   3. U-40 + new     every SECURITY DEFINER function was executable by anon
--                     (Postgres grants EXECUTE to PUBLIC by default):
--                     email_exists → account enumeration, user_metrics(any
--                     user) → anyone's weight/BMI, notify_admin → anon spam
--                     in the admin feed, teacher_earnings(any) → payouts.
--   4. NEW (found while verifying): any client could insert a payment with
--                     status 'paid' (₹0) → auto-enrolled in any paid series.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. profiles: privileged columns can only change via admin/service ──────
-- A trigger (not just a policy) so it also covers upserts and any future
-- policy. Trusted contexts pass: SQL editor / migrations / the signup trigger
-- (no JWT user), the service role (edge functions), and admins.
create or replace function public.guard_profile_privileged()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
     or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
     or public.get_my_role() = 'admin' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Self-insert (onboarding self-heal) always creates a plain, active client.
    new.role := 'client';
    new.is_active := true;
    new.referred_by := null;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.is_active is distinct from old.is_active
     or new.referral_code is distinct from old.referral_code
     or new.referred_by is distinct from old.referred_by then
    raise exception 'not allowed to change role, account status or referral fields'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged on public.profiles;
create trigger profiles_guard_privileged
  before insert or update on public.profiles
  for each row execute function public.guard_profile_privileged();

-- Defence in depth at the policy level too.
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.get_my_role());

drop policy if exists "self insert profile" on public.profiles;
create policy "self insert profile" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and role = 'client');

-- ── 1b. payments: clients may only file a PENDING cash payment ─────────────
-- Found while verifying the audit (not in the original report): the insert
-- policy only checked user_id, and trg_payment_settled enrolls on 'paid' /
-- 'verified' — so any client could insert {status:'paid', amount:0} and get a
-- paid series free. Razorpay payments are written by edge functions with the
-- service role (unaffected); the app itself only inserts pending cash rows.
drop policy if exists "user creates own payment" on public.payments;
create policy "user creates own payment" on public.payments
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and method = 'cash'
    and status = 'pending_verification'
    and verified_by is null
    and razorpay_order_id is null
    and razorpay_payment_id is null
    and amount >= 0
  );

-- ── 1c. user_badges: direct inserts admin-only ─────────────────────────────
-- Teachers award badges through award_manual_badge(), which enforces the
-- manual/hybrid-only rule; the direct-insert path let them skip it.
drop policy if exists "staff grants badges" on public.user_badges;
create policy "staff grants badges" on public.user_badges
  for insert to authenticated
  with check (public.get_my_role() = 'admin');

-- ── 2. Views: no anon access; series_earnings respects caller RLS ──────────
-- security_invoker: the view now applies payments/challenges RLS of whoever
-- queries it (admins see everything; others only rows they could already
-- read). teacher_earnings() is SECURITY DEFINER, so payouts still compute.
alter view public.series_earnings set (security_invoker = on);
revoke all on public.series_earnings from anon, public;
revoke insert, update, delete, truncate, references, trigger on public.series_earnings from authenticated;
grant select on public.series_earnings to authenticated;

revoke all on public.leaderboard from anon, public;
revoke insert, update, delete, truncate, references, trigger on public.leaderboard from authenticated;
grant select on public.leaderboard to authenticated;

-- ── 3. Functions: explicit allow-list instead of EXECUTE-for-everyone ──────
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;

-- RLS helpers: policies run with the caller's privileges, so anon and
-- authenticated must be able to call these (they only describe the caller).
grant execute on function
  public.get_my_role(),
  public.is_my_challenge(uuid),
  public.is_enrolled(uuid),
  public.is_free_challenge(uuid),
  public.is_free_preview_session(uuid)
to anon, authenticated;

-- Logged-out signup form (referral code check).
grant execute on function public.validate_referral_code(text) to anon, authenticated;

-- TEMPORARY: the currently deployed Auth page still calls email_exists before
-- sending a code. The new frontend doesn't; migration_retire_email_exists.sql
-- revokes this once it's live (U-40).
do $$ begin
  if to_regprocedure('public.email_exists(text)') is not null then
    grant execute on function public.email_exists(text) to anon, authenticated;
  end if;
end $$;

-- App RPCs (each guards itself by role / auth.uid()).
grant execute on function
  public.current_streak(uuid),
  public.evaluate_badges(uuid),
  public.award_manual_badge(uuid, text, text),
  public.revoke_badge(uuid, text),
  public.admin_user_email(uuid),
  public.my_students(),
  public.series_roster(uuid),
  public.series_members(uuid),
  public.series_collectors(uuid),
  public.self_mark_attendance(uuid),
  public.top_referrers()
to authenticated;

-- Deliberately NOT granted (internal / triggers / cron / retired):
--   user_metrics,
--   nearest_badges, teacher_earnings, notify_admin, auto_complete_past_sessions,
--   current_streak's callers in triggers, and all on_* trigger functions.

-- Future functions: no implicit EXECUTE for anyone; grant explicitly (every
-- migration in this repo already does `grant execute … to authenticated`).
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ── 4. Report admins so rogue escalations can be spotted ───────────────────
-- Review the NOTICE output: every row should be someone you made admin.
-- To demote:  update public.profiles set role = 'client' where id = '<uuid>';
do $$
declare r record;
begin
  for r in
    select p.id, p.full_name, u.email, p.created_at
    from public.profiles p left join auth.users u on u.id = p.id
    where p.role = 'admin' order by p.created_at
  loop
    raise notice 'ADMIN: % | % | % | joined %', r.id, r.full_name, r.email, r.created_at;
  end loop;
end $$;
