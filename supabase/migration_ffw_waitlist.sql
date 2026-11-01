-- ═══════════════════════════════════════════════════════════════
-- Unifitz — FFW waitlist v2 (/20minutes-fitness). STANDALONE, idempotent.
-- Run after migration_20min_waitlist.sql.
--
-- Signups still live in public.leads (source '20min-waitlist[:utm_source]').
-- Adds: preferred slots, ad attribution, referrals, Pixel event_id (for CAPI
-- dedupe) and a founding-seat number. The page writes through
-- join_ffw_waitlist() so it can dedupe by phone and hand back the seat
-- number; until this file is run it falls back to the plain insert.
-- ═══════════════════════════════════════════════════════════════

-- Also created by migration_leads_hardening.sql; repeated so this file works on its own.
alter table public.leads add column if not exists consent_version text;
alter table public.leads add column if not exists phone_country   text;
alter table public.leads add column if not exists preferred_slots text[];
alter table public.leads add column if not exists consent_text    text;
alter table public.leads add column if not exists utm_source      text;
alter table public.leads add column if not exists utm_medium      text;
alter table public.leads add column if not exists utm_campaign    text;
alter table public.leads add column if not exists utm_content     text;
alter table public.leads add column if not exists utm_term        text;
alter table public.leads add column if not exists fbclid          text;
alter table public.leads add column if not exists gclid           text;
alter table public.leads add column if not exists src             text;
alter table public.leads add column if not exists referred_by     uuid;
alter table public.leads add column if not exists landing_url     text;
alter table public.leads add column if not exists referrer        text;
alter table public.leads add column if not exists user_timezone   text;
alter table public.leads add column if not exists event_id        uuid;
alter table public.leads add column if not exists lead_number     int;

comment on column public.leads.preferred_slots is 'FFW: IST slots the lead can make, e.g. {AM-06:30,PM-07:00}';
comment on column public.leads.lead_number is 'FFW: founding seat / waitlist position, 1-based, in signup order';
comment on column public.leads.event_id is 'Meta Pixel Lead event_id — send the same id via CAPI to dedupe';

-- Number the waitlist rows that existed before this migration, in signup order.
with n as (
  select id, row_number() over (order by created_at, id) as rn
  from public.leads where source like '20min-waitlist%'
)
update public.leads l set lead_number = n.rn
from n where l.id = n.id and l.lead_number is null
  and not exists (select 1 from public.leads x where x.source like '20min-waitlist%' and x.lead_number is not null);

create unique index if not exists leads_ffw_number_uq
  on public.leads (lead_number) where source like '20min-waitlist%';

-- ── join_ffw_waitlist(p jsonb) → { lead_id, lead_number, duplicate } ──
-- Validates everything server-side (the anon client is untrusted), dedupes by
-- phone, assigns the next seat number under a lock.
-- A repeat phone gets its existing id/number back only when the name matches,
-- so the RPC can't be used to look up who signed up with a number.
create or replace function public.join_ffw_waitlist(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name   text := btrim(coalesce(p->>'name', ''));
  v_phone  text := p->>'phone';
  v_goal   text := nullif(btrim(coalesce(p->>'goal', '')), '');
  v_slots  text[] := '{}';
  v_ref    uuid;
  v_event  uuid;
  v_utm    text := nullif(left(btrim(coalesce(p->>'utm_source', '')), 60), '');
  v_old    public.leads;
  v_id     uuid;
  v_num    int;
  uuid_re  constant text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
begin
  if char_length(v_name) not between 2 and 80 then
    raise exception 'invalid name' using errcode = '22023';
  end if;
  if v_phone is null or v_phone !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'invalid phone' using errcode = '22023';
  end if;
  if v_goal is null or char_length(v_goal) > 60 then
    raise exception 'invalid goal' using errcode = '22023';
  end if;

  if jsonb_typeof(p->'preferred_slots') = 'array' then
    select coalesce(array_agg(distinct s order by s), '{}') into v_slots
    from jsonb_array_elements_text(p->'preferred_slots') s
    where s ~ '^(AM|PM)-[0-9]{2}:[0-9]{2}$';
    v_slots := v_slots[1:24];
  end if;

  if coalesce(p->>'event_id', '') ~ uuid_re then v_event := (p->>'event_id')::uuid; end if;
  if coalesce(p->>'referred_by', '') ~ uuid_re then
    select id into v_ref from public.leads
    where id = (p->>'referred_by')::uuid and source like '20min-waitlist%';
  end if;

  -- One signup at a time: keeps seat numbers gapless and the dedupe race-free.
  perform pg_advisory_xact_lock(hashtext('ffw_waitlist'));

  select * into v_old from public.leads
  where whatsapp = v_phone and source like '20min-waitlist%'
  order by created_at limit 1;
  if found then
    if lower(btrim(v_old.name)) = lower(v_name) then
      return jsonb_build_object('lead_id', v_old.id, 'lead_number', v_old.lead_number, 'duplicate', true);
    end if;
    return jsonb_build_object('lead_id', null, 'lead_number', null, 'duplicate', true);
  end if;

  select coalesce(max(lead_number), 0) + 1 into v_num
  from public.leads where source like '20min-waitlist%';

  insert into public.leads (
    name, whatsapp, goal, consent, consent_version, consent_text, source,
    phone_country, preferred_slots,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, gclid, src,
    referred_by, landing_url, referrer, user_timezone, event_id, lead_number
  ) values (
    v_name, v_phone, v_goal, true,
    left(nullif(p->>'consent_text', ''), 40), left(nullif(p->>'consent_wording', ''), 300),
    '20min-waitlist' || coalesce(':' || v_utm, ''),
    left(nullif(p->>'phone_country', ''), 4), v_slots,
    v_utm,
    left(nullif(p->>'utm_medium', ''), 100), left(nullif(p->>'utm_campaign', ''), 200),
    left(nullif(p->>'utm_content', ''), 200), left(nullif(p->>'utm_term', ''), 200),
    left(nullif(p->>'fbclid', ''), 200), left(nullif(p->>'gclid', ''), 200), left(nullif(p->>'src', ''), 100),
    v_ref, left(nullif(p->>'landing_url', ''), 500), left(nullif(p->>'referrer', ''), 500),
    left(nullif(p->>'user_timezone', ''), 64), v_event, v_num
  ) returning id into v_id;

  return jsonb_build_object('lead_id', v_id, 'lead_number', v_num, 'duplicate', false);
end $$;

revoke all on function public.join_ffw_waitlist(jsonb) from public;
grant execute on function public.join_ffw_waitlist(jsonb) to anon, authenticated;

-- ── ffw_waitlist_count() → seats claimed, for the public seat counter ──
create or replace function public.ffw_waitlist_count()
returns int
language sql
stable
security definer
set search_path = public
as $$ select count(*)::int from public.leads where source like '20min-waitlist%' $$;

revoke all on function public.ffw_waitlist_count() from public;
grant execute on function public.ffw_waitlist_count() to anon, authenticated;

-- Popular slots, for picking which batches to open:
--   select s, count(*) from public.leads, unnest(preferred_slots) s
--   where source like '20min-waitlist%' group by 1 order by 2 desc;
