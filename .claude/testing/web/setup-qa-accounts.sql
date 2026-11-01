-- QA test accounts — run once in the Supabase SQL editor AFTER signing up the 3 emails
-- on the site (normal OTP signup). Idempotent. Only touches these three emails.
-- Uses Gmail plus-aliases so every OTP lands in the owner's own inbox.

update public.profiles p
set role = v.role::user_role,
    full_name = v.name
from auth.users u
join (values
  ('jitinrathi41+qaclient@gmail.com',  'client',  'QA Client'),
  ('jitinrathi41+qateacher@gmail.com', 'teacher', 'QA Teacher'),
  ('jitinrathi41+qaadmin@gmail.com',   'admin',   'QA Admin')
) as v(email, role, name) on lower(u.email) = v.email
where p.id = u.id;

-- Check
select u.email, p.role, p.full_name
from auth.users u join public.profiles p on p.id = u.id
where u.email like 'jitinrathi41+qa%@gmail.com';
