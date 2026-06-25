-- fix_onboarding_loop.sql
-- Clients who completed onboarding but got bounced back to the form because the
-- wizard's update silently wrote 0 rows (onboarding_complete stayed false).
-- Run top to bottom in the Supabase SQL editor. Non-destructive.

-- 1) DIAGNOSE the reported client (read-only). If profile_id is null or differs
--    from auth_id, that's "id drift" — share the row for a targeted fix.
select u.id as auth_id, p.id as profile_id, u.email, p.full_name, p.role, p.onboarding_complete
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'raginijalora@gmail.com';

-- 2) UNBLOCK the reported client.
update public.profiles
set onboarding_complete = true
where id = (select id from auth.users where email = 'raginijalora@gmail.com');

-- 3) HEAL anyone else already stuck: any client who clearly finished onboarding
--    (entered age + height + starting weight) but is still flagged incomplete.
--    The frontend upsert fix prevents NEW occurrences; this clears existing ones.
update public.profiles
set onboarding_complete = true
where role = 'client'
  and onboarding_complete = false
  and age is not null
  and height_cm is not null
  and starting_weight_kg is not null;
