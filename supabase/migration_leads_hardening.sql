-- ═══════════════════════════════════════════════════════════════
-- Leads hardening (audit 2026-10-25, U-03 / U-15 / U-17).
-- Safe to re-run. Constraints are NOT VALID so existing rows aren't
-- rejected — only new inserts are checked.
-- Run in Supabase SQL editor BEFORE deploying the new landing page is fine
-- (the page only writes columns that already exist).
-- ═══════════════════════════════════════════════════════════════

-- Which consent wording the lead agreed to (matches CONSENT_VERSION in
-- src/config.js). created_at already timestamps the consent.
alter table public.leads add column if not exists consent_version text default '2026-10-25';

-- Input sanity: bounded name/goal, E.164 phone, consent required for
-- masterclass leads (the form now blocks submission without it).
do $$ begin
  alter table public.leads add constraint leads_name_len check (char_length(name) between 1 and 80) not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.leads add constraint leads_goal_len check (goal is null or char_length(goal) <= 60) not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.leads add constraint leads_phone_e164 check (whatsapp ~ '^\+[1-9][0-9]{7,14}$') not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.leads add constraint leads_masterclass_consent check (source not like 'masterclass%' or consent) not valid;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.leads add constraint leads_source_len check (char_length(source) <= 80) not valid;
exception when duplicate_object then null; end $$;

-- One masterclass lead per phone number. The form shows a friendly
-- "you're already on the list" on the resulting 23505 error.
-- If this fails with "could not create unique index", find duplicates first:
--   select whatsapp, count(*) from public.leads
--   where source like 'masterclass%' group by 1 having count(*) > 1;
create unique index if not exists leads_masterclass_phone_uq
  on public.leads (whatsapp) where source like 'masterclass%';

-- Anti-spam (needs Cloudflare Turnstile keys — see the audit follow-up list):
-- once an edge function verifies a Turnstile token and inserts with the
-- service role, drop the open anon policy:
--   drop policy if exists "anon submit lead" on public.leads;
