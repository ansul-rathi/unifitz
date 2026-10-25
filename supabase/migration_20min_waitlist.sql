-- ═══════════════════════════════════════════════════════════════
-- Unifitz — 20-minute series waitlist (/20minutes-fitness)
-- STANDALONE, idempotent, safe to re-run.
--
-- Signups reuse public.leads, tagged source = '20min-waitlist' (plus an
-- optional ":<utm_source>" suffix). Existing RLS already covers anon inserts
-- and admin reads, so the page works without this file — it only adds
-- dedupe + consent checks for the new source.
-- ═══════════════════════════════════════════════════════════════

-- Consent is required for waitlist leads (the form blocks submit without it).
do $$ begin
  alter table public.leads add constraint leads_20min_consent check (source not like '20min-waitlist%' or consent) not valid;
exception when duplicate_object then null; end $$;

-- One waitlist entry per phone number. The form shows "already on the
-- waitlist" on the resulting 23505 error.
-- If this fails with "could not create unique index", find duplicates first:
--   select whatsapp, count(*) from public.leads
--   where source like '20min-waitlist%' group by 1 having count(*) > 1;
create unique index if not exists leads_20min_waitlist_phone_uq
  on public.leads (whatsapp) where source like '20min-waitlist%';
