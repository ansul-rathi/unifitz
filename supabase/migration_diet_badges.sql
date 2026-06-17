-- ═══════════════════════════════════════════════════════════════
-- UniFit — Diet Plan + Badges (STANDALONE, idempotent)
-- Run this whole file in the Supabase SQL Editor. Safe to re-run:
-- every statement guards against "already exists". No DROP/DELETE of data.
-- Requires the base UniFit migration to be applied first.
-- ═══════════════════════════════════════════════════════════════

-- ── DIET: profile columns ──
alter table public.profiles
  add column if not exists bmi numeric,
  add column if not exists tdee numeric,
  add column if not exists calorie_target int,
  add column if not exists updated_metrics_at timestamptz,
  add column if not exists points int not null default 0;

-- ── DIET: tables ──
create table if not exists public.diet_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  diet_type text not null default 'veg',
  allergies_or_dislikes text,
  meals_per_day int not null default 3,
  updated_at timestamptz not null default now()
);

create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan jsonb not null,
  calorie_target int,
  generated_count int not null default 1,
  is_free_plan boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  image_url text,
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  calories int, protein_g int, carbs_g int, fat_g int,
  is_premium boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.app_settings (key, value) values ('diet_regeneration_enabled', 'false')
on conflict (key) do nothing;

alter table public.diet_preferences enable row level security;
alter table public.diet_plans enable row level security;
alter table public.recipes enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "own diet prefs" on public.diet_preferences;
create policy "own diet prefs" on public.diet_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own diet plans" on public.diet_plans;
create policy "own diet plans" on public.diet_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "admin reads diet plans" on public.diet_plans;
create policy "admin reads diet plans" on public.diet_plans
  for select using (get_my_role() = 'admin');

drop policy if exists "recipes readable" on public.recipes;
create policy "recipes readable" on public.recipes
  for select using (auth.role() = 'authenticated');
drop policy if exists "staff writes recipes" on public.recipes;
create policy "staff writes recipes" on public.recipes
  for all using (get_my_role() in ('teacher', 'admin')) with check (get_my_role() in ('teacher', 'admin'));

drop policy if exists "settings readable" on public.app_settings;
create policy "settings readable" on public.app_settings
  for select using (auth.role() = 'authenticated');
drop policy if exists "admin writes settings" on public.app_settings;
create policy "admin writes settings" on public.app_settings
  for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- ── BADGES: tables ──
create table if not exists public.badge_definitions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  category text not null,
  tier text not null,
  points int not null default 0,
  icon text not null default 'Award',
  award_type text not null default 'auto',
  rule jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_code text not null references public.badge_definitions(code) on delete cascade,
  earned_at timestamptz not null default now(),
  awarded_by uuid references public.profiles(id),
  source text not null default 'auto',
  note text,
  unique (user_id, badge_code)
);
create index if not exists idx_user_badges_user on public.user_badges(user_id);

alter table public.badge_definitions enable row level security;
alter table public.user_badges enable row level security;

drop policy if exists "defs readable" on public.badge_definitions;
create policy "defs readable" on public.badge_definitions
  for select using (auth.role() = 'authenticated');
drop policy if exists "admin writes defs" on public.badge_definitions;
create policy "admin writes defs" on public.badge_definitions
  for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

drop policy if exists "own badges read" on public.user_badges;
create policy "own badges read" on public.user_badges
  for select using (
    user_id = auth.uid()
    or get_my_role() = 'admin'
    or (get_my_role() = 'teacher' and exists (
      select 1 from enrollments e join challenges c on c.id = e.challenge_id
      where e.user_id = user_badges.user_id and c.teacher_id = auth.uid()
    ))
  );
drop policy if exists "staff grants badges" on public.user_badges;
create policy "staff grants badges" on public.user_badges
  for insert with check (get_my_role() in ('teacher', 'admin'));
drop policy if exists "admin manages badges" on public.user_badges;
create policy "admin manages badges" on public.user_badges
  for all using (get_my_role() = 'admin');

-- ── METRICS ──
create or replace function public.user_metrics(p_user uuid)
returns jsonb language plpgsql security definer set search_path = public stable as $$
declare
  m jsonb;
  v_start numeric; v_latest numeric; v_target numeric; v_height numeric;
  v_start_in numeric; v_latest_in numeric;
  v_start_bmi numeric; v_latest_bmi numeric; v_bmi_improved int := 0;
  v_goal_pct numeric := 0;
begin
  select starting_weight_kg, target_weight_kg, height_cm into v_start, v_target, v_height
  from profiles where id = p_user;
  select weight_kg into v_latest from weekly_checkins
  where user_id = p_user and weight_kg is not null order by week_number desc limit 1;
  v_latest := coalesce(v_latest, v_start);
  select (coalesce(waist_in,0)+coalesce(hips_in,0)+coalesce(chest_in,0)) into v_start_in
  from weekly_checkins where user_id = p_user and waist_in is not null order by week_number asc limit 1;
  select (coalesce(waist_in,0)+coalesce(hips_in,0)+coalesce(chest_in,0)) into v_latest_in
  from weekly_checkins where user_id = p_user and waist_in is not null order by week_number desc limit 1;
  if v_height is not null and v_height > 0 then
    if v_start is not null then v_start_bmi := v_start / ((v_height/100)^2); end if;
    if v_latest is not null then v_latest_bmi := v_latest / ((v_height/100)^2); end if;
  end if;
  if v_start_bmi is not null and v_latest_bmi is not null then
    if floor(least(v_latest_bmi,40)/5) < floor(least(v_start_bmi,40)/5) then v_bmi_improved := 1; end if;
  end if;
  if v_start is not null and v_target is not null and v_start > v_target then
    v_goal_pct := round(((v_start - v_latest) / (v_start - v_target)) * 100);
  end if;
  m := jsonb_build_object(
    'signed_up', 1,
    'profile_complete', (select case when onboarding_complete and bmi is not null then 1 else 0 end from profiles where id = p_user),
    'streak', public.current_streak(p_user),
    'sessions_attended', (select count(*) from attendance where user_id = p_user and attended),
    'checkin_days', (select count(*) from daily_checkins where user_id = p_user),
    'water_days', (select count(*) from daily_checkins where user_id = p_user and water_glasses > 0),
    'sleep_days', (select count(*) from daily_checkins where user_id = p_user and sleep_hours is not null),
    'weekly_forms', (select count(*) from weekly_checkins where user_id = p_user and week_number > 0),
    'progress_photos', (select count(*) from weekly_checkins where user_id = p_user and photo_url is not null),
    'weight_lost', greatest(0, coalesce(v_start,0) - coalesce(v_latest,0)),
    'inches_lost', greatest(0, coalesce(v_start_in,0) - coalesce(v_latest_in,0)),
    'goal_progress_pct', greatest(0, v_goal_pct),
    'bmi_improved', v_bmi_improved,
    'referrals_signed_up', (select count(*) from referrals where referrer_id = p_user),
    'referrals_earned', (select count(*) from referrals where referrer_id = p_user and status = 'reward_earned'),
    'enrollments', (select count(*) from enrollments where user_id = p_user),
    'challenges_completed', (select count(*) from enrollments e join challenges c on c.id = e.challenge_id where e.user_id = p_user and c.status = 'completed'),
    'diet_plans', (select count(*) from diet_plans where user_id = p_user),
    'points', (select coalesce(points,0) from profiles where id = p_user),
    'account_days', (select floor(extract(epoch from (now() - created_at)) / 86400) from profiles where id = p_user)
  );
  return m;
end; $$;

create or replace function public.evaluate_badges(p_user uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := coalesce(p_user, auth.uid());
  m jsonb; b record; v_metric text; v_gte numeric; v_val numeric;
  newly jsonb := '[]'::jsonb;
begin
  if v_user is null then return newly; end if;
  m := public.user_metrics(v_user);
  for b in
    select * from badge_definitions
    where is_active and award_type in ('auto','hybrid') and rule is not null
      and code not in (select badge_code from user_badges where user_id = v_user)
  loop
    v_metric := b.rule ->> 'metric';
    v_gte := (b.rule ->> 'gte')::numeric;
    v_val := coalesce((m ->> v_metric)::numeric, 0);
    if v_val >= v_gte then
      insert into user_badges (user_id, badge_code, source) values (v_user, b.code, 'auto')
      on conflict (user_id, badge_code) do nothing;
      if found then
        update profiles set points = coalesce(points,0) + b.points where id = v_user;
        newly := newly || to_jsonb(b.code);
      end if;
    end if;
  end loop;
  return newly;
end; $$;
grant execute on function public.evaluate_badges(uuid) to authenticated;
grant execute on function public.user_metrics(uuid) to authenticated;

create or replace function public.nearest_badges(p_user uuid default null)
returns table (code text, name text, tier text, icon text, metric text, current numeric, threshold numeric, remaining numeric)
language plpgsql security definer set search_path = public stable as $$
declare v_user uuid := coalesce(p_user, auth.uid()); m jsonb;
begin
  if v_user is null then return; end if;
  m := public.user_metrics(v_user);
  return query
  select d.code, d.name, d.tier, d.icon, d.rule ->> 'metric',
         coalesce((m ->> (d.rule ->> 'metric'))::numeric, 0),
         (d.rule ->> 'gte')::numeric,
         (d.rule ->> 'gte')::numeric - coalesce((m ->> (d.rule ->> 'metric'))::numeric, 0)
  from badge_definitions d
  where d.is_active and d.award_type in ('auto','hybrid') and d.rule is not null
    and d.code not in (select badge_code from user_badges where user_id = v_user)
    and coalesce((m ->> (d.rule ->> 'metric'))::numeric, 0) < (d.rule ->> 'gte')::numeric
  order by ((d.rule ->> 'gte')::numeric - coalesce((m ->> (d.rule ->> 'metric'))::numeric, 0)) asc
  limit 2;
end; $$;
grant execute on function public.nearest_badges(uuid) to authenticated;

create or replace function public.award_manual_badge(p_user uuid, p_code text, p_note text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_pts int;
begin
  if get_my_role() not in ('teacher','admin') then raise exception 'not allowed'; end if;
  if get_my_role() = 'teacher' and not exists (
    select 1 from badge_definitions where code = p_code and award_type in ('manual','hybrid')
  ) then raise exception 'teachers can grant manual badges only'; end if;
  insert into user_badges (user_id, badge_code, source, awarded_by, note)
  values (p_user, p_code, 'manual', auth.uid(), p_note)
  on conflict (user_id, badge_code) do nothing;
  if not found then return false; end if;
  select points into v_pts from badge_definitions where code = p_code;
  update profiles set points = coalesce(points,0) + coalesce(v_pts,0) where id = p_user;
  return true;
end; $$;
grant execute on function public.award_manual_badge(uuid, text, text) to authenticated;

create or replace function public.revoke_badge(p_user uuid, p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_pts int;
begin
  if get_my_role() <> 'admin' then raise exception 'admin only'; end if;
  if exists (select 1 from user_badges where user_id = p_user and badge_code = p_code) then
    select points into v_pts from badge_definitions where code = p_code;
    delete from user_badges where user_id = p_user and badge_code = p_code;
    update profiles set points = greatest(0, coalesce(points,0) - coalesce(v_pts,0)) where id = p_user;
  end if;
end; $$;
grant execute on function public.revoke_badge(uuid, text) to authenticated;

-- ── Backstop triggers (drop-if-exists then create) ──
-- Attached only to tables with user_id; must not reference referrer_id.
create or replace function public.trg_eval_badges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.evaluate_badges(new.user_id);
  return new;
end; $$;

drop trigger if exists trg_badges_daily  on public.daily_checkins;
drop trigger if exists trg_badges_attend on public.attendance;
drop trigger if exists trg_badges_weekly on public.weekly_checkins;
drop trigger if exists trg_badges_enroll on public.enrollments;
create trigger trg_badges_daily   after insert or update on public.daily_checkins  for each row execute function public.trg_eval_badges();
create trigger trg_badges_attend  after insert or update on public.attendance      for each row execute function public.trg_eval_badges();
create trigger trg_badges_weekly  after insert            on public.weekly_checkins for each row execute function public.trg_eval_badges();
create trigger trg_badges_enroll  after insert            on public.enrollments     for each row execute function public.trg_eval_badges();

-- ── Realtime (ignore if already added) ──
do $$ begin
  alter publication supabase_realtime add table public.user_badges;
exception when duplicate_object then null; end $$;
