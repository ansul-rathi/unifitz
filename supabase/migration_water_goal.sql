-- ═══════════════════════════════════════════════════════════════
-- Water goal 8 → 16 glasses (1 litre = 4 glasses, so 16 = 4 L).
-- The original column carried `check (water_glasses between 0 and 8)`,
-- which now rejects any honest log above the old goal. Widen it to 0–24
-- (the form's hard cap) and default new rows to the 8-glass starting point.
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- Drop whatever check currently constrains water_glasses, whatever it's named.
do $$
declare c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    where ns.nspname = 'public'
      and rel.relname = 'daily_checkins'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%water_glasses%'
  loop
    execute format('alter table public.daily_checkins drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.daily_checkins
  add constraint daily_water_glasses_range check (water_glasses between 0 and 24);

-- New rows start at the halfway mark the form shows.
alter table public.daily_checkins
  alter column water_glasses set default 8;
