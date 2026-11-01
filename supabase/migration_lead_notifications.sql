-- ═══════════════════════════════════════════════════════════════
-- Unifitz — New-lead alerts in the admin feed
--   Every new row in public.leads (landing form, masterclass, 20-min / FFW
--   waitlist) writes one admin-feed notification of type 'lead', so the web
--   bell and the app ring. The app plays a separate "new lead" tone.
--   Duplicate waitlist submissions never insert a lead, so they don't ring.
-- Standalone, idempotent. Run in the Supabase SQL editor after
-- migration_admin_notifications.sql and migration_live_classes.sql.
-- ═══════════════════════════════════════════════════════════════

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'signup', 'enrollment', 'payment', 'account_deletion', 'lead',              -- admin feed
  'class_added', 'class_ended', 'class_rate', 'class_remark', 'class_feedback'  -- inbox
));

create or replace function public.on_lead_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from text := case
    when new.source like '20min-waitlist%' then '20 min fitness'
    when new.source like 'masterclass%'    then 'masterclass'
    when new.source = 'landing'            then 'website'
    else new.source
  end;
begin
  insert into public.notifications (type, title, link, meta)
  values (
    'lead',
    coalesce(nullif(btrim(new.name), ''), 'Someone') || ' — new lead from ' || v_from
      || coalesce(' (' || nullif(btrim(new.goal), '') || ')', ''),
    '/admin/leads',
    jsonb_build_object('lead_id', new.id, 'source', new.source)
  );
  return new;
exception when others then
  -- A lead must never be lost because the alert failed.
  raise warning 'lead notification failed: %', sqlerrm;
  return new;
end $$;

revoke all on function public.on_lead_notify() from public, anon, authenticated;

drop trigger if exists trg_notify_lead on public.leads;
create trigger trg_notify_lead
after insert on public.leads
for each row execute function public.on_lead_notify();
