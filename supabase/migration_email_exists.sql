-- ═══════════════════════════════════════════════════════════════
-- UniFit — email_exists() for the login flow
-- Lets the login screen tell a brand-new email "please sign up" instead of
-- silently creating an account. SECURITY DEFINER to read auth.users. Idempotent.
-- NOTE: intentionally reveals whether an email is registered (account
-- enumeration) — a deliberate product choice for the login UX.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1 from auth.users
    where lower(email) = lower(trim(p_email))
  );
$$;

grant execute on function public.email_exists(text) to anon, authenticated;
