-- ═══════════════════════════════════════════════════════════════
-- Unifitz — Push notifications (Firebase Cloud Messaging)
--   Every new row in public.notifications is pushed to its recipients'
--   devices (admin feed → every active admin; inbox → that user), so phones
--   ring even when the app is closed.
--
--   notifications insert → trg_push_notification → pg_net POST →
--   Edge Function `send-push` (deploy with JWT verification OFF) → FCM.
--
-- Needs: Edge Function secret FCM_SERVICE_ACCOUNT (Firebase service-account
-- JSON) and the `send-push` function deployed. Standalone, idempotent.
-- Run after migration_live_classes.sql (and the other notification migrations).
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pg_net with schema extensions;

-- ── Device tokens ── one row per app install / browser.
create table if not exists public.push_tokens (
  token      text primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  platform   text not null check (platform in ('android', 'ios', 'web')),
  updated_at timestamptz not null default now()
);
create index if not exists idx_push_tokens_user on public.push_tokens(user_id);

-- No client policies: tokens are written/removed only through the RPCs below
-- and read only by the send-push function (service role).
alter table public.push_tokens enable row level security;
revoke all on public.push_tokens from anon, authenticated;

-- Register (or move) this device's token to the signed-in user. A token that
-- was used by another account on the same device is reassigned, never shared.
create or replace function public.register_push_token(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if p_token is null or char_length(p_token) not between 20 and 4096 then
    raise exception 'invalid token' using errcode = '22023';
  end if;
  if p_platform not in ('android', 'ios', 'web') then
    raise exception 'invalid platform' using errcode = '22023';
  end if;

  insert into public.push_tokens (token, user_id, platform, updated_at)
  values (p_token, v_uid, p_platform, now())
  on conflict (token) do update
    set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();

  -- Keep the 10 most recent devices per user.
  delete from public.push_tokens
  where user_id = v_uid
    and token not in (
      select token from public.push_tokens where user_id = v_uid order by updated_at desc limit 10
    );
end $$;

-- Called on sign-out so the device stops getting this user's pushes.
create or replace function public.unregister_push_token(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.push_tokens where token = p_token and user_id = auth.uid();
$$;

revoke all on function public.register_push_token(text, text) from public, anon;
revoke all on function public.unregister_push_token(text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;
grant execute on function public.unregister_push_token(text) to authenticated;

-- ── Private config: function URL + shared secret (generated once) ──
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.push_config (
  id           boolean primary key default true check (id),
  function_url text not null,
  secret       text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
);
insert into private.push_config (function_url)
values ('https://wgoyflrhdswftharsbzc.supabase.co/functions/v1/send-push')
on conflict (id) do nothing;
revoke all on private.push_config from public, anon, authenticated;
-- No policies: only the SECURITY DEFINER functions below (table owner) read it.
alter table private.push_config enable row level security;

-- send-push asks the database whether a request really came from here.
create or replace function public.push_secret_ok(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from private.push_config where secret = p_secret);
$$;
revoke all on function public.push_secret_ok(text) from public, anon, authenticated;
grant execute on function public.push_secret_ok(text) to service_role;

-- ── Fire a push for a body; never blocks or fails the caller ──
create or replace function private.post_push(p_body jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c private.push_config;
begin
  select * into c from private.push_config;
  if not found then return; end if;
  perform net.http_post(
    url := c.function_url,
    body := p_body,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', c.secret),
    timeout_milliseconds := 10000
  );
exception when others then
  raise warning 'push request failed: %', sqlerrm;
end $$;
revoke all on function private.post_push(jsonb) from public, anon, authenticated;

create or replace function public.on_notification_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform private.post_push(jsonb_build_object('id', new.id));
  return new;
end $$;
revoke all on function public.on_notification_push() from public, anon, authenticated;

drop trigger if exists trg_push_notification on public.notifications;
create trigger trg_push_notification
after insert on public.notifications
for each row execute function public.on_notification_push();

-- ── Test push to the caller's own devices ──
--   p_silent = false: visible "push works" notification (Reminders test button).
--   p_silent = true : invisible ping the app uses to confirm the whole chain
--                     works before it hands alerting over to push.
drop function if exists public.send_test_push();
create or replace function public.send_test_push(p_silent boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  perform private.post_push(jsonb_build_object('test', true, 'silent', coalesce(p_silent, false), 'user_id', auth.uid()));
end $$;
revoke all on function public.send_test_push(boolean) from public, anon;
grant execute on function public.send_test_push(boolean) to authenticated;

-- Check after running:
--   select * from net._http_response order by created desc limit 5;   -- send-push replies
