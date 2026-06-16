-- ═══════════════════════════════════════════════════════════════
-- UniFit — Complete Supabase migration
-- Paste this whole file into the Supabase SQL Editor and run it.
-- Includes: enums, tables, view, functions, triggers, RLS policies,
-- storage buckets + storage policies, realtime publication.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────
-- 1. ENUMS
-- ───────────────────────────────
create type user_role as enum ('admin', 'teacher', 'client');
create type challenge_status as enum ('upcoming', 'active', 'completed');
create type session_type as enum ('live', 'recording');
create type referral_status as enum ('signed_up', 'active', 'reward_earned');
create type badge_type as enum ('first_kg', 'streak_7', 'streak_30', 'challenge_finisher', 'super_referrer');

-- ───────────────────────────────
-- 2. TABLES
-- ───────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role user_role not null default 'client',
  avatar_url text,
  referral_code text unique,
  referred_by uuid references public.profiles(id),
  age int,
  gender text,
  height_cm numeric,
  starting_weight_kg numeric,
  target_weight_kg numeric,
  activity_level text,
  fitness_goal text,
  onboarding_complete boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_days int not null default 30,
  is_free boolean not null default true,
  teacher_id uuid references public.profiles(id),
  batch_name text,
  start_date date,
  status challenge_status not null default 'upcoming',
  poster_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  day_number int not null,
  title text not null,
  description text,
  category text,
  session_type session_type not null default 'live',
  zoom_link text,
  recording_link text,
  poster_url text,
  scheduled_at timestamptz,
  duration_minutes int default 60,
  is_live_next boolean not null default false,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null default current_date,
  attended_session boolean not null default false,
  water_glasses int not null default 0 check (water_glasses between 0 and 8),
  sleep_hours numeric,
  created_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create table public.weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid references public.challenges(id) on delete set null,
  week_number int not null,
  weight_kg numeric,
  waist_in numeric,
  hips_in numeric,
  chest_in numeric,
  energy_level int check (energy_level between 1 and 5),
  workout_days int,
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  attended boolean not null default true,
  marked_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade,
  status referral_status not null default 'signed_up',
  reward_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (referrer_id, referred_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_type badge_type not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_type)
);

-- ───────────────────────────────
-- 3. HELPER FUNCTIONS
-- ───────────────────────────────

-- Role lookup used inside RLS policies. SECURITY DEFINER bypasses RLS on
-- profiles, avoiding infinite recursion when profiles policies call it.
create or replace function public.get_my_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- True if the current (teacher) user teaches the given challenge.
create or replace function public.is_my_challenge(p_challenge uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.challenges
    where id = p_challenge and teacher_id = auth.uid()
  );
$$;

-- True if the current user is enrolled in the given challenge.
create or replace function public.is_enrolled(p_challenge uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.enrollments
    where challenge_id = p_challenge and user_id = auth.uid()
  );
$$;

-- Consecutive daily check-in streak ending today (or yesterday, so the
-- streak isn't lost before today's check-in).
create or replace function public.current_streak(p_user uuid)
returns int
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_streak int := 0;
  v_day date;
begin
  -- Anchor on today if checked in today, else yesterday.
  if exists (select 1 from daily_checkins where user_id = p_user and checkin_date = current_date) then
    v_day := current_date;
  elsif exists (select 1 from daily_checkins where user_id = p_user and checkin_date = current_date - 1) then
    v_day := current_date - 1;
  else
    return 0;
  end if;

  while exists (select 1 from daily_checkins where user_id = p_user and checkin_date = v_day) loop
    v_streak := v_streak + 1;
    v_day := v_day - 1;
  end loop;

  return v_streak;
end;
$$;

-- ───────────────────────────────
-- 4. SIGNUP TRIGGER
-- profile row + referral code + referral row from signup metadata
-- ───────────────────────────────
create or replace function public.on_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_code text;
  v_ref_code text;
  v_referrer uuid;
begin
  v_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));

  -- Unique referral code: first name + 4 digits, retry on collision.
  loop
    v_code := upper(regexp_replace(split_part(v_name, ' ', 1), '[^a-zA-Z]', '', 'g'))
              || lpad(floor(random() * 10000)::int::text, 4, '0');
    exit when not exists (select 1 from profiles where referral_code = v_code);
  end loop;

  v_ref_code := new.raw_user_meta_data ->> 'referral_code';
  if v_ref_code is not null and v_ref_code <> '' then
    select id into v_referrer from profiles where referral_code = upper(v_ref_code);
  end if;

  insert into profiles (id, full_name, phone, referral_code, referred_by)
  values (new.id, v_name, new.raw_user_meta_data ->> 'phone', v_code, v_referrer);

  if v_referrer is not null then
    insert into referrals (referrer_id, referred_id, status)
    values (v_referrer, new.id, 'signed_up')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.on_auth_user_created();

-- ───────────────────────────────
-- 5. REFERRAL DAY-7 TRIGGER + BADGES
-- Attendance insert advances referral status and awards streak badges.
-- ───────────────────────────────
create or replace function public.on_attendance_marked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not new.attended then
    return new;
  end if;

  select count(*) into v_count
  from attendance
  where user_id = new.user_id and attended;

  -- Referred user becomes 'active' on first attendance, 'reward_earned' at 7.
  if v_count >= 7 then
    update referrals set status = 'reward_earned'
    where referred_id = new.user_id and status <> 'reward_earned';
  elsif v_count >= 1 then
    update referrals set status = 'active'
    where referred_id = new.user_id and status = 'signed_up';
  end if;

  -- Super Referrer badge at 3 reward_earned referrals.
  insert into badges (user_id, badge_type)
  select r.referrer_id, 'super_referrer'
  from referrals r
  where r.referred_id = new.user_id
    and (select count(*) from referrals rr
         where rr.referrer_id = r.referrer_id and rr.status = 'reward_earned') >= 3
  on conflict do nothing;

  return new;
end;
$$;

create trigger trg_on_attendance_marked
after insert or update on public.attendance
for each row execute function public.on_attendance_marked();

-- Streak badges on daily check-in.
create or replace function public.on_daily_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_streak int;
begin
  v_streak := public.current_streak(new.user_id);
  if v_streak >= 7 then
    insert into badges (user_id, badge_type) values (new.user_id, 'streak_7') on conflict do nothing;
  end if;
  if v_streak >= 30 then
    insert into badges (user_id, badge_type) values (new.user_id, 'streak_30') on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger trg_on_daily_checkin
after insert or update on public.daily_checkins
for each row execute function public.on_daily_checkin();

-- First-kg badge on weekly check-in.
create or replace function public.on_weekly_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start numeric;
begin
  select starting_weight_kg into v_start from profiles where id = new.user_id;
  if v_start is not null and new.weight_kg is not null and v_start - new.weight_kg >= 1 then
    insert into badges (user_id, badge_type) values (new.user_id, 'first_kg') on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger trg_on_weekly_checkin
after insert on public.weekly_checkins
for each row execute function public.on_weekly_checkin();

-- ───────────────────────────────
-- 6. LEADERBOARD VIEW
-- Names + attendance counts of batch-mates without exposing profiles.
-- security_invoker = off (default): view runs as owner, but we gate rows
-- to challenges the caller can see via is_enrolled / role checks.
-- ───────────────────────────────
create or replace view public.leaderboard as
select
  e.challenge_id,
  e.user_id,
  p.full_name,
  p.avatar_url,
  count(a.id) filter (where a.attended) as attendance_count
from enrollments e
join profiles p on p.id = e.user_id
left join sessions s on s.challenge_id = e.challenge_id
left join attendance a on a.session_id = s.id and a.user_id = e.user_id
where public.is_enrolled(e.challenge_id)
   or public.is_my_challenge(e.challenge_id)
   or public.get_my_role() = 'admin'
group by e.challenge_id, e.user_id, p.full_name, p.avatar_url;

-- ───────────────────────────────
-- 7. ROW LEVEL SECURITY
-- ───────────────────────────────
alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.weekly_checkins enable row level security;
alter table public.attendance enable row level security;
alter table public.referrals enable row level security;
alter table public.announcements enable row level security;
alter table public.badges enable row level security;

-- profiles
create policy "own profile read" on public.profiles
  for select using (id = auth.uid());
create policy "own profile update" on public.profiles
  for update using (id = auth.uid());
create policy "teacher reads students" on public.profiles
  for select using (
    get_my_role() = 'teacher' and exists (
      select 1 from enrollments e
      join challenges c on c.id = e.challenge_id
      where e.user_id = profiles.id and c.teacher_id = auth.uid()
    )
  );
create policy "admin full profiles" on public.profiles
  for all using (get_my_role() = 'admin');
-- Referral code validation at signup needs anon read of code+name only.
-- Exposed via RPC below instead of a table policy (safer).

-- challenges: everyone logged-in can browse (landing/join lists), admin writes,
-- teacher updates own.
create policy "challenges readable" on public.challenges
  for select using (is_published = true or get_my_role() = 'admin');
create policy "admin writes challenges" on public.challenges
  for all using (get_my_role() = 'admin');
create policy "teacher updates own challenge" on public.challenges
  for update using (teacher_id = auth.uid());

-- sessions: enrolled clients read; teacher manages own; admin all.
create policy "enrolled read sessions" on public.sessions
  for select using (
    is_enrolled(challenge_id) or is_my_challenge(challenge_id) or get_my_role() = 'admin'
  );
create policy "teacher inserts sessions" on public.sessions
  for insert with check (is_my_challenge(challenge_id) or get_my_role() = 'admin');
create policy "teacher updates sessions" on public.sessions
  for update using (is_my_challenge(challenge_id) or get_my_role() = 'admin');
create policy "admin deletes sessions" on public.sessions
  for delete using (get_my_role() = 'admin');

-- enrollments
create policy "own enrollments read" on public.enrollments
  for select using (
    user_id = auth.uid() or is_my_challenge(challenge_id) or get_my_role() = 'admin'
  );
create policy "self enroll" on public.enrollments
  for insert with check (user_id = auth.uid());
create policy "admin manages enrollments" on public.enrollments
  for all using (get_my_role() = 'admin');

-- daily_checkins: owner only (admin read for export).
create policy "own daily checkins" on public.daily_checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin reads daily checkins" on public.daily_checkins
  for select using (get_my_role() = 'admin');

-- weekly_checkins: owner all; teacher reads students'; admin reads all.
create policy "own weekly checkins" on public.weekly_checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "teacher reads student weeklies" on public.weekly_checkins
  for select using (
    get_my_role() = 'teacher' and exists (
      select 1 from enrollments e
      join challenges c on c.id = e.challenge_id
      where e.user_id = weekly_checkins.user_id and c.teacher_id = auth.uid()
    )
  );
create policy "admin reads weekly checkins" on public.weekly_checkins
  for select using (get_my_role() = 'admin');

-- attendance: user reads own; teacher writes for own challenge; admin all.
create policy "own attendance read" on public.attendance
  for select using (user_id = auth.uid());
create policy "teacher manages attendance" on public.attendance
  for all using (
    exists (select 1 from sessions s where s.id = attendance.session_id and is_my_challenge(s.challenge_id))
    or get_my_role() = 'admin'
  );
-- client self-marks own attendance by joining the live session — only for a
-- session of a challenge they're enrolled in, and only for themselves.
create policy "client self-mark attendance" on public.attendance
  for insert with check (
    user_id = auth.uid()
    and marked_by = auth.uid()
    and exists (
      select 1 from sessions s
      join enrollments e on e.challenge_id = s.challenge_id
      where s.id = attendance.session_id and e.user_id = auth.uid()
    )
  );

-- referrals: involved users read; admin all (approve rewards).
create policy "own referrals read" on public.referrals
  for select using (referrer_id = auth.uid() or referred_id = auth.uid());
create policy "admin manages referrals" on public.referrals
  for all using (get_my_role() = 'admin');

-- announcements: enrolled read; teacher posts to own challenge; admin all.
create policy "enrolled read announcements" on public.announcements
  for select using (
    is_enrolled(challenge_id) or is_my_challenge(challenge_id) or get_my_role() = 'admin'
  );
create policy "teacher posts announcements" on public.announcements
  for insert with check (is_my_challenge(challenge_id) or get_my_role() = 'admin');
create policy "teacher deletes own announcements" on public.announcements
  for delete using (teacher_id = auth.uid() or get_my_role() = 'admin');

-- badges: owner reads; system triggers write (security definer bypasses RLS);
-- admin reads all.
create policy "own badges read" on public.badges
  for select using (user_id = auth.uid() or get_my_role() = 'admin');

-- ───────────────────────────────
-- 8. RPCs for the app
-- ───────────────────────────────

-- Live referral-code validation on the signup form (anon-safe: returns
-- only the first name, nothing else).
create or replace function public.validate_referral_code(p_code text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select split_part(full_name, ' ', 1) from profiles where referral_code = upper(p_code);
$$;
grant execute on function public.validate_referral_code(text) to anon, authenticated;

-- Top referrers this month (name + reward count), for the mini leaderboard.
create or replace function public.top_referrers()
returns table (full_name text, rewards bigint)
language sql
security definer
set search_path = public
stable
as $$
  select p.full_name, count(*) as rewards
  from referrals r
  join profiles p on p.id = r.referrer_id
  where r.status = 'reward_earned'
    and r.created_at >= date_trunc('month', now())
  group by p.full_name
  order by rewards desc
  limit 5;
$$;
grant execute on function public.top_referrers() to authenticated;

-- ───────────────────────────────
-- 9. STORAGE BUCKETS + POLICIES
-- ───────────────────────────────
insert into storage.buckets (id, name, public) values ('posters', 'posters', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- posters: public read, teacher/admin write.
create policy "posters public read" on storage.objects
  for select using (bucket_id = 'posters');
create policy "posters staff write" on storage.objects
  for insert with check (bucket_id = 'posters' and public.get_my_role() in ('teacher', 'admin'));
create policy "posters staff update" on storage.objects
  for update using (bucket_id = 'posters' and public.get_my_role() in ('teacher', 'admin'));
create policy "posters staff delete" on storage.objects
  for delete using (bucket_id = 'posters' and public.get_my_role() in ('teacher', 'admin'));

-- progress-photos: path convention "<user_id>/<filename>". Owner writes;
-- owner, their teacher, and admin read.
create policy "progress photos owner write" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "progress photos read" on storage.objects
  for select using (
    bucket_id = 'progress-photos' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.get_my_role() = 'admin'
      or (
        public.get_my_role() = 'teacher' and exists (
          select 1 from public.enrollments e
          join public.challenges c on c.id = e.challenge_id
          where e.user_id::text = (storage.foldername(name))[1]
            and c.teacher_id = auth.uid()
        )
      )
    )
  );
create policy "progress photos owner delete" on storage.objects
  for delete using (
    bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ───────────────────────────────
-- 10. REALTIME
-- announcements + sessions stream to clients.
-- ───────────────────────────────
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.sessions;

-- ═══════════════════════════════════════════════════════════════
-- 11. ZOOM AUTOMATION
-- Meetings, per-participant join/leave tracking, recordings.
-- Edge Functions write here with the service role (bypass RLS).
-- ═══════════════════════════════════════════════════════════════

-- Extend sessions with Zoom meeting + recording fields.
alter table public.sessions
  add column if not exists zoom_meeting_id   text,
  add column if not exists zoom_join_url     text,
  add column if not exists zoom_start_url    text,   -- host only — never sent to clients
  add column if not exists zoom_meeting_uuid text,
  add column if not exists recording_status  text not null default 'none',  -- 'none' | 'available'
  add column if not exists recording_password text;
-- recording_link already exists on sessions.

-- Extend attendance with Zoom-derived presence math.
alter table public.attendance
  add column if not exists attended_minutes int,
  add column if not exists session_minutes  int,
  add column if not exists attendance_pct    numeric,
  add column if not exists source           text not null default 'manual';  -- 'zoom' | 'manual'

-- Every join/leave segment. A student may join/leave many times —
-- one row per segment, SUM total_minutes per user when computing %.
create table if not exists public.session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,  -- null until matched
  zoom_participant_name  text,
  zoom_participant_email text,
  zoom_participant_uuid  text,
  join_time  timestamptz,
  leave_time timestamptz,
  total_minutes int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_session_participants_session on public.session_participants(session_id);
create index if not exists idx_session_participants_uuid on public.session_participants(zoom_participant_uuid);

alter table public.session_participants enable row level security;

-- Clients read their own matched rows; teachers read rows for their
-- challenges (incl. unmatched, for reconciliation); admin all.
-- Writes happen only via Edge Functions (service role) or teacher reconcile.
create policy "own participants read" on public.session_participants
  for select using (user_id = auth.uid());
create policy "teacher reads participants" on public.session_participants
  for select using (
    exists (select 1 from sessions s where s.id = session_participants.session_id and is_my_challenge(s.challenge_id))
    or get_my_role() = 'admin'
  );
-- Teacher/admin can reconcile unmatched participants (set user_id) for own challenges.
create policy "teacher reconciles participants" on public.session_participants
  for update using (
    exists (select 1 from sessions s where s.id = session_participants.session_id and is_my_challenge(s.challenge_id))
    or get_my_role() = 'admin'
  );

alter publication supabase_realtime add table public.session_participants;

-- ═══════════════════════════════════════════════════════════════
-- 12. DIET PLAN
-- Per-user metrics, preferences, AI-generated plans, recipe library,
-- and a key/value app_settings table for global toggles.
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists bmi numeric,
  add column if not exists tdee numeric,
  add column if not exists calorie_target int,
  add column if not exists updated_metrics_at timestamptz,
  add column if not exists points int not null default 0;

create table if not exists public.diet_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  diet_type text not null default 'veg',          -- veg | non-veg | eggetarian | vegan
  allergies_or_dislikes text,
  meals_per_day int not null default 3,
  updated_at timestamptz not null default now()
);

create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan jsonb not null,                            -- 7-day structure: days[]->meals[]
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
  calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
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

create policy "own diet prefs" on public.diet_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own diet plans" on public.diet_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin reads diet plans" on public.diet_plans
  for select using (get_my_role() = 'admin');

create policy "recipes readable" on public.recipes
  for select using (auth.role() = 'authenticated');
create policy "staff writes recipes" on public.recipes
  for all using (get_my_role() in ('teacher', 'admin')) with check (get_my_role() in ('teacher', 'admin'));

create policy "settings readable" on public.app_settings
  for select using (auth.role() = 'authenticated');
create policy "admin writes settings" on public.app_settings
  for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- ═══════════════════════════════════════════════════════════════
-- 13. BADGES
-- Definitions + per-user awards + a Postgres rules engine.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.badge_definitions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  category text not null,
  tier text not null,                              -- bronze|silver|gold|platinum|diamond
  points int not null default 0,
  icon text not null default 'Award',              -- lucide icon name
  award_type text not null default 'auto',         -- auto | manual | hybrid
  rule jsonb,                                       -- {"metric":"sessions_attended","gte":25}
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_code text not null references public.badge_definitions(code) on delete cascade,
  earned_at timestamptz not null default now(),
  awarded_by uuid references public.profiles(id),  -- null for auto
  source text not null default 'auto',             -- auto | manual
  note text,
  unique (user_id, badge_code)
);
create index if not exists idx_user_badges_user on public.user_badges(user_id);

alter table public.badge_definitions enable row level security;
alter table public.user_badges enable row level security;

create policy "defs readable" on public.badge_definitions
  for select using (auth.role() = 'authenticated');
create policy "admin writes defs" on public.badge_definitions
  for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

create policy "own badges read" on public.user_badges
  for select using (
    user_id = auth.uid()
    or get_my_role() = 'admin'
    or (get_my_role() = 'teacher' and exists (
      select 1 from enrollments e join challenges c on c.id = e.challenge_id
      where e.user_id = user_badges.user_id and c.teacher_id = auth.uid()
    ))
  );
-- Teacher/admin grant manual badges; auto awards come via the SECURITY DEFINER engine.
create policy "staff grants badges" on public.user_badges
  for insert with check (get_my_role() in ('teacher', 'admin'));
create policy "admin manages badges" on public.user_badges
  for all using (get_my_role() = 'admin');

-- ── Metrics: one place both the engine and nudges read from ──
create or replace function public.user_metrics(p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
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

  -- inches: starting baseline (lowest week) vs latest
  select (coalesce(waist_in,0)+coalesce(hips_in,0)+coalesce(chest_in,0)) into v_start_in
  from weekly_checkins where user_id = p_user and waist_in is not null order by week_number asc limit 1;
  select (coalesce(waist_in,0)+coalesce(hips_in,0)+coalesce(chest_in,0)) into v_latest_in
  from weekly_checkins where user_id = p_user and waist_in is not null order by week_number desc limit 1;

  if v_height is not null and v_height > 0 then
    if v_start is not null then v_start_bmi := v_start / ((v_height/100)^2); end if;
    if v_latest is not null then v_latest_bmi := v_latest / ((v_height/100)^2); end if;
  end if;
  -- improved = current BMI dropped a category band
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
end;
$$;

-- ── Rules engine: award any satisfied auto/hybrid badge, bump points ──
create or replace function public.evaluate_badges(p_user uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := coalesce(p_user, auth.uid());
  m jsonb;
  b record;
  v_metric text; v_gte numeric; v_val numeric;
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

  return newly;  -- array of newly-earned badge codes (for confetti)
end;
$$;
grant execute on function public.evaluate_badges(uuid) to authenticated;
grant execute on function public.user_metrics(uuid) to authenticated;

-- ── "You're close!" — nearest unearned countable badges ──
create or replace function public.nearest_badges(p_user uuid default null)
returns table (code text, name text, tier text, icon text, metric text, current numeric, threshold numeric, remaining numeric)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_user uuid := coalesce(p_user, auth.uid());
  m jsonb;
begin
  if v_user is null then return; end if;
  m := public.user_metrics(v_user);
  return query
  select d.code, d.name, d.tier, d.icon,
         d.rule ->> 'metric',
         coalesce((m ->> (d.rule ->> 'metric'))::numeric, 0),
         (d.rule ->> 'gte')::numeric,
         (d.rule ->> 'gte')::numeric - coalesce((m ->> (d.rule ->> 'metric'))::numeric, 0)
  from badge_definitions d
  where d.is_active and d.award_type in ('auto','hybrid') and d.rule is not null
    and d.code not in (select badge_code from user_badges where user_id = v_user)
    and coalesce((m ->> (d.rule ->> 'metric'))::numeric, 0) < (d.rule ->> 'gte')::numeric
  order by ((d.rule ->> 'gte')::numeric - coalesce((m ->> (d.rule ->> 'metric'))::numeric, 0)) asc
  limit 2;
end;
$$;
grant execute on function public.nearest_badges(uuid) to authenticated;

-- ── Manual award (teacher/admin) — inserts badge + bumps points atomically ──
create or replace function public.award_manual_badge(p_user uuid, p_code text, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pts int;
begin
  if get_my_role() not in ('teacher','admin') then
    raise exception 'not allowed';
  end if;
  -- Teachers may grant only manual/hybrid badges; admins anything.
  if get_my_role() = 'teacher' and not exists (
    select 1 from badge_definitions where code = p_code and award_type in ('manual','hybrid')
  ) then
    raise exception 'teachers can grant manual badges only';
  end if;

  insert into user_badges (user_id, badge_code, source, awarded_by, note)
  values (p_user, p_code, 'manual', auth.uid(), p_note)
  on conflict (user_id, badge_code) do nothing;
  if not found then return false; end if;

  select points into v_pts from badge_definitions where code = p_code;
  update profiles set points = coalesce(points,0) + coalesce(v_pts,0) where id = p_user;
  return true;
end;
$$;
grant execute on function public.award_manual_badge(uuid, text, text) to authenticated;

-- Admin: revoke a badge + subtract its points.
create or replace function public.revoke_badge(p_user uuid, p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_pts int;
begin
  if get_my_role() <> 'admin' then raise exception 'admin only'; end if;
  if exists (select 1 from user_badges where user_id = p_user and badge_code = p_code) then
    select points into v_pts from badge_definitions where code = p_code;
    delete from user_badges where user_id = p_user and badge_code = p_code;
    update profiles set points = greatest(0, coalesce(points,0) - coalesce(v_pts,0)) where id = p_user;
  end if;
end;
$$;
grant execute on function public.revoke_badge(uuid, text) to authenticated;

-- ── Backstop triggers: re-evaluate after relevant writes ──
create or replace function public.trg_eval_badges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.evaluate_badges(
    coalesce(new.user_id, case when tg_table_name = 'referrals' then new.referrer_id end)
  );
  return new;
end;
$$;

create trigger trg_badges_daily   after insert or update on public.daily_checkins  for each row execute function public.trg_eval_badges();
create trigger trg_badges_attend  after insert or update on public.attendance      for each row execute function public.trg_eval_badges();
create trigger trg_badges_weekly  after insert            on public.weekly_checkins for each row execute function public.trg_eval_badges();
create trigger trg_badges_enroll  after insert            on public.enrollments     for each row execute function public.trg_eval_badges();

alter publication supabase_realtime add table public.user_badges;
