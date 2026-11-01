-- ═══════════════════════════════════════════════════════════════
-- Unifitz — member account deletion (App Store 5.1.1(v) / Google Play)
--
--   • A member asks to delete their account (app Profile or web /app/profile):
--     profiles.deletion_requested_at = now(), and they are signed out.
--   • 30-day grace period: signing back in shows "scheduled for deletion on …"
--     with a "Keep my account" button that cancels the request.
--   • After 30 days a daily pg_cron job deletes the auth user, which cascades
--     to the profile and everything the member owns (enrollments, check-ins,
--     payments, attendance, notifications…). Nothing is kept.
--   • Staff (teacher/admin) accounts are removed by an admin, not self-service.
--
-- Idempotent. Needs pg_cron (already used by live classes).
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists deletion_requested_at timestamptz;

create index if not exists idx_profiles_deletion_requested
  on public.profiles (deletion_requested_at) where deletion_requested_at is not null;

-- Admin feed gets a row when a member asks (so the studio can reach out).
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'signup', 'enrollment', 'payment', 'account_deletion',  -- admin feed
  'class_added', 'class_ended', 'class_rate', 'class_remark', 'class_feedback'  -- inbox
));

-- ── Member RPCs ───────────────────────────────────────────────
create or replace function public.request_account_deletion()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_name text;
  v_at timestamptz;
begin
  if v_uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  select role, full_name into v_role, v_name from public.profiles where id = v_uid;
  if v_role is distinct from 'client' then
    raise exception 'Staff accounts are removed by the Unifitz admin.' using errcode = '42501';
  end if;

  select deletion_requested_at into v_at from public.profiles where id = v_uid;
  if v_at is null then
    update public.profiles set deletion_requested_at = now() where id = v_uid
    returning deletion_requested_at into v_at;

    insert into public.notifications (recipient_id, type, title, actor_id)
    values (null, 'account_deletion',
            coalesce(nullif(v_name, ''), 'A member') || ' asked to delete their account (in 30 days)', v_uid);
  end if;

  return v_at + interval '30 days';
end;
$$;

create or replace function public.cancel_account_deletion()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set deletion_requested_at = null where id = auth.uid();
$$;

revoke execute on function public.request_account_deletion() from public, anon;
revoke execute on function public.cancel_account_deletion() from public, anon;
grant execute on function public.request_account_deletion() to authenticated;
grant execute on function public.cancel_account_deletion() to authenticated;

-- ── Purge (cron only) ─────────────────────────────────────────
-- References to profiles(id) without ON DELETE CASCADE / SET NULL (e.g.
-- referred_by, marked_by, verified_by) would block the delete: clear nullable
-- ones, delete rows where the column is required. Found from the catalog so
-- future tables are covered too.
create or replace function public.purge_deleted_accounts()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_fk record;
  v_count int := 0;
begin
  -- Run as a trusted context even if called from a session carrying a JWT,
  -- so the profiles guard trigger lets referred_by be cleared.
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);

  for v_uid in
    select id from public.profiles
     where role = 'client'
       and deletion_requested_at is not null
       and deletion_requested_at < now() - interval '30 days'
  loop
    for v_fk in
      select c.conrelid::regclass as tbl, a.attname as col, a.attnotnull as required
        from pg_constraint c
        join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
       where c.contype = 'f'
         and c.confrelid = 'public.profiles'::regclass
         and c.confdeltype in ('a', 'r')
         and array_length(c.conkey, 1) = 1
    loop
      if v_fk.required then
        execute format('delete from %s where %I = $1', v_fk.tbl, v_fk.col) using v_uid;
      else
        execute format('update %s set %I = null where %I = $1', v_fk.tbl, v_fk.col, v_fk.col) using v_uid;
      end if;
    end loop;

    delete from auth.users where id = v_uid;      -- cascades to profiles + owned rows
    delete from public.profiles where id = v_uid;  -- orphan profile without an auth user
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke execute on function public.purge_deleted_accounts() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'purge-deleted-accounts') then
    perform cron.unschedule('purge-deleted-accounts');
  end if;
end $$;

-- Daily 03:30 UTC (09:00 IST).
select cron.schedule('purge-deleted-accounts', '30 3 * * *', $$ select public.purge_deleted_accounts(); $$);
