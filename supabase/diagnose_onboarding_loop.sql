-- diagnose_onboarding_loop.sql
-- One client completes onboarding but is repeatedly sent back to the form.
-- Cause: profiles.onboarding_complete stays false (the wizard's update wrote 0
-- rows silently). Use these to find the cause + unblock the account.
-- Read-only diagnostics first; the UPDATE at the end is the fix. Replace the email.

-- 1) Compare the auth user id with the profile row + see the flag/role.
--    If profile_id is NULL or differs from auth_id, that's the root cause (id drift).
select u.id as auth_id, p.id as profile_id, u.email, p.full_name, p.role, p.onboarding_complete
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'CLIENT_EMAIL_HERE';

-- 2) Any orphan profile rows whose id is not a real auth user (id drift across the table).
select p.id, p.full_name, p.role, p.onboarding_complete
from public.profiles p
left join auth.users u on u.id = p.id
where u.id is null;

-- 3) Duplicate profile rows for the same person (shouldn't happen — id is PK).
select email, count(*)
from auth.users
group by email
having count(*) > 1;

-- ── FIX: unblock the client (run after confirming with #1) ──────────────────
update public.profiles
set onboarding_complete = true
where id = (select id from auth.users where email = 'CLIENT_EMAIL_HERE');

-- Verify:
-- select onboarding_complete from public.profiles
-- where id = (select id from auth.users where email = 'CLIENT_EMAIL_HERE');
