-- ═══════════════════════════════════════════════════════════════
-- Attendance integrity — who may self-mark, and what counts.
-- Run in the Supabase SQL editor (after migration_security_hardening.sql).
-- Idempotent; safe to re-run.
--
-- Rules:
--   • Series recordings: a member may mark herself present by watching a
--     COMPLETED session's recording (self_mark_attendance). This still counts
--     toward her series progress.
--   • Live classes: members cannot mark themselves. Attendance comes only from
--     the Zoom webhook or the instructor.
--   • Counts (referral "7 classes" reward, leaderboard, attendance badges) use
--     VERIFIED attendance only — self-marked rows never count.
--
-- "Verified" = not marked by the member herself: Zoom writes marked_by = null,
-- an instructor writes her own id, a self-mark writes the member's id.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. verified flag, kept in sync by Postgres ─────────────────────────────
alter table public.attendance
  add column if not exists verified boolean
  generated always as (attended and marked_by is distinct from user_id) stored;

create index if not exists attendance_user_verified_idx
  on public.attendance (user_id) where verified;

-- ── 2. No direct client inserts (they could mark any session, incl. future
--       live classes). Members go through the RPC below; staff and the Zoom
--       webhook use their own paths.
drop policy if exists "client self-mark attendance" on public.attendance;

-- ── 3. Self-mark = recordings only, never upgrades to verified ─────────────
create or replace function public.self_mark_attendance(p_session uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.sessions s
    join public.enrollments e on e.challenge_id = s.challenge_id
    where s.id = p_session and e.user_id = auth.uid()
  ) then
    raise exception 'not enrolled in this series';
  end if;

  if not exists (select 1 from public.sessions where id = p_session and completed) then
    raise exception 'live classes are marked by your instructor';
  end if;

  insert into public.attendance (session_id, user_id, attended, marked_by, source)
  values (p_session, auth.uid(), true, auth.uid(), 'recording')
  on conflict (session_id, user_id) do update
    set attended = true, marked_by = excluded.marked_by, source = 'recording'
    -- Never touch a row Zoom or the instructor already confirmed.
    where not public.attendance.verified;
end;
$$;
grant execute on function public.self_mark_attendance(uuid) to authenticated;

-- ── 4. Referral reward counts verified attendance only ─────────────────────
create or replace function public.on_attendance_marked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not new.verified then
    return new;
  end if;

  select count(*) into v_count
  from attendance
  where user_id = new.user_id and verified;

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

-- ── 5. Leaderboard ranks verified attendance ───────────────────────────────
create or replace view public.leaderboard as
select
  e.challenge_id,
  e.user_id,
  p.full_name,
  p.avatar_url,
  count(a.id) filter (where a.verified) as attendance_count
from enrollments e
join profiles p on p.id = e.user_id
left join sessions s on s.challenge_id = e.challenge_id
left join attendance a on a.session_id = s.id and a.user_id = e.user_id
where public.is_enrolled(e.challenge_id)
   or public.is_my_challenge(e.challenge_id)
   or public.get_my_role() = 'admin'
group by e.challenge_id, e.user_id, p.full_name, p.avatar_url;

-- ── 6. Badge metric sessions_attended counts verified attendance ───────────
-- (identical to migration_diet_badges.sql except that one line)
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
    'sessions_attended', (select count(*) from attendance where user_id = p_user and verified),
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

-- Report: referrals that reached 'reward_earned' on self-marked attendance
-- before this fix. Review and reset by hand if needed:
--   update referrals set status = 'active' where id = '<uuid>';
do $$
declare r record;
begin
  for r in
    select rf.id, rf.referred_id,
           count(*) filter (where a.verified) as verified_count
    from referrals rf
    left join attendance a on a.user_id = rf.referred_id
    where rf.status = 'reward_earned'
    group by rf.id, rf.referred_id
    having count(*) filter (where a.verified) < 7
  loop
    raise notice 'REVIEW REFERRAL: % (friend %) has only % verified classes', r.id, r.referred_id, r.verified_count;
  end loop;
end $$;
