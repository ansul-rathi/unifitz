-- ═══════════════════════════════════════════════════════════════
-- Unifitz — Free morning mindfulness session signups (/morning)
-- STANDALONE, idempotent, safe to re-run.
--
-- Signups reuse public.leads (created in migration_landing.sql), tagged
-- source = 'morning-session'. The existing "anon submit lead" INSERT policy
-- and admin-only SELECT policy already cover this page, so no new table and
-- no new RLS policies are needed — only two nullable columns.
-- ═══════════════════════════════════════════════════════════════

alter table public.leads add column if not exists occupation text;
alter table public.leads add column if not exists occupation_other text;

comment on column public.leads.occupation is
  'Student | Working professional | Housewife | Business | Other — collected on /morning';
comment on column public.leads.occupation_other is
  'Free text, only set when occupation = ''Other''';

-- The admin Leads page filters by source and sorts newest-first.
create index if not exists leads_source_created_idx
  on public.leads (source, created_at desc);
