-- ═══════════════════════════════════════════════════════════════
-- Unifitz — Live Classes (recurring batches)
--
--   A live class is a series (challenges row) with is_recurring = true:
--     • a weekly schedule (days + local time + timezone) and ONE fixed join
--       link reused for every class,
--     • a teacher-picked roster (enrollments, access_type 'live'),
--     • sessions generated on a rolling 14-day calendar (one row per class
--       date, keyed by occurrence_date),
--     • per-session attendance + optional per-student remark (teacher → student),
--     • per-session rating + note (student → teacher only; admins cannot read),
--     • in-app notifications for both sides when a class ends.
--
--   Everything else — sessions/attendance RLS, roster RPCs, the members panel,
--   the auto-complete cron — is reused as-is.
--
-- Standalone, idempotent, additive. Run in the Supabase SQL editor after
-- migration_admin_notifications.sql and migration_auto_complete_sessions.sql
-- (needs pg_cron enabled).
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────
-- 1. SCHEMA
-- ───────────────────────────────

-- Schedule template on the series row. start_date (existing) = first class date.
alter table public.challenges
  add column if not exists is_recurring boolean not null default false,
  add column if not exists recur_days smallint[],          -- ISO weekdays: 1 = Mon … 7 = Sun
  add column if not exists recur_time time,                -- local start time, in recur_tz
  add column if not exists recur_tz text,                  -- IANA zone the schedule is defined in
  add column if not exists recur_until date,               -- last class date; null = open-ended
  add column if not exists recur_duration_min int,
  add column if not exists recur_category text,
  add column if not exists recur_join_link text;           -- one fixed Zoom/Meet link for every class

do $$
begin
  alter table public.challenges add constraint challenges_recurrence_check check (
    not is_recurring or (
      recur_days is not null and cardinality(recur_days) > 0
      and recur_days <@ array[1,2,3,4,5,6,7]::smallint[]
      and recur_time is not null and recur_tz is not null and start_date is not null
      and recur_duration_min between 10 and 240
      and (recur_until is null or recur_until >= start_date)
    )
  );
exception when duplicate_object then null;
end $$;

-- One generated session per class date. Manual series sessions leave it null.
alter table public.sessions
  add column if not exists occurrence_date date,
  add column if not exists is_cancelled boolean not null default false,
  add column if not exists prompted_at timestamptz;        -- end-of-class notifications sent

create unique index if not exists uniq_session_occurrence
  on public.sessions (challenge_id, occurrence_date)
  where occurrence_date is not null;

-- Teacher → student note for one class ("work a bit on squat form").
alter table public.attendance
  add column if not exists remark text;

-- Student → teacher rating for one class. Private to the student and the
-- class's teachers — deliberately NO admin policy.
create table if not exists public.session_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, user_id)
);
create index if not exists idx_session_feedback_session on public.session_feedback(session_id);

alter table public.session_feedback enable row level security;

drop policy if exists "own feedback read" on public.session_feedback;
create policy "own feedback read" on public.session_feedback
  for select using (user_id = auth.uid());
drop policy if exists "teacher reads class feedback" on public.session_feedback;
create policy "teacher reads class feedback" on public.session_feedback
  for select using (
    exists (select 1 from public.sessions s where s.id = session_feedback.session_id and public.is_my_challenge(s.challenge_id))
  );
-- Writes only via submit_session_feedback() below.

-- ── Notifications: the admin feed becomes a per-user inbox too ──
-- recipient_id null  = admin activity feed (unchanged behaviour)
-- recipient_id set   = that user's personal inbox (teacher or student)
alter table public.notifications
  add column if not exists recipient_id uuid references public.profiles(id) on delete cascade,
  add column if not exists link text;                      -- in-app route to open on tap

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'signup', 'enrollment', 'payment',                       -- admin feed
  'class_added', 'class_ended', 'class_rate', 'class_remark', 'class_feedback'  -- inbox
));

create index if not exists idx_notifications_inbox
  on public.notifications(recipient_id, is_read, created_at desc)
  where recipient_id is not null;

drop policy if exists "admin reads notifications" on public.notifications;
create policy "admin reads notifications" on public.notifications
  for select using (recipient_id is null and get_my_role() = 'admin');
drop policy if exists "admin updates notifications" on public.notifications;
create policy "admin updates notifications" on public.notifications
  for update using (recipient_id is null and get_my_role() = 'admin')
  with check (recipient_id is null and get_my_role() = 'admin');
drop policy if exists "own notifications read" on public.notifications;
create policy "own notifications read" on public.notifications
  for select using (recipient_id = auth.uid());
drop policy if exists "own notifications update" on public.notifications;
create policy "own notifications update" on public.notifications
  for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create or replace function public.notify_user(
  p_recipient uuid, p_type text, p_title text, p_actor uuid, p_challenge uuid, p_link text
) returns void
language sql security definer set search_path = public as $$
  insert into public.notifications (recipient_id, type, title, actor_id, challenge_id, link)
  values (p_recipient, p_type, p_title, p_actor, p_challenge, p_link);
$$;

-- ───────────────────────────────
-- 2. VISIBILITY
-- ───────────────────────────────

-- Live classes are private: only their roster, their teachers and admins see
-- them. Normal series keep the published-for-everyone rule.
drop policy if exists "challenges readable" on public.challenges;
create policy "challenges readable" on public.challenges
  for select using (
    get_my_role() = 'admin'
    or (is_published and (not is_recurring or public.is_enrolled(id) or public.is_my_challenge(id)))
  );

-- A live class is free (no price) but never self-joinable — teachers pick the roster.
create or replace function public.is_free_challenge(p_challenge uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.challenges
    where id = p_challenge
      and is_published = true
      and not is_recurring
      and (is_free = true or coalesce(price, 0) = 0)
  );
$$;

-- Attendance roster = active members only (paused/removed members are no
-- longer in the class). Shared by series and live classes.
create or replace function public.series_roster(p_challenge uuid)
returns table (user_id uuid, full_name text, avatar_url text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url
  from public.enrollments e
  join public.profiles p on p.id = e.user_id
  where e.challenge_id = p_challenge
    and e.status = 'active'
    and (public.is_my_challenge(p_challenge) or get_my_role() = 'admin')
  order by p.full_name;
$$;

-- ───────────────────────────────
-- 3. CALENDAR
-- ───────────────────────────────

-- Materialise class dates up to p_horizon_days ahead (in the class's own
-- timezone). Idempotent: existing dates are skipped, so cancellations and
-- edits on generated rows survive. Never back-fills a slot already past.
create or replace function public.generate_class_sessions(p_challenge uuid, p_horizon_days int default 14)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.challenges;
  v_today date;
  v_from date;
  v_to date;
  n int;
begin
  select * into c from public.challenges where id = p_challenge and is_recurring;
  if not found or c.status = 'completed' then return 0; end if;

  v_today := (now() at time zone c.recur_tz)::date;
  v_from := greatest(c.start_date, v_today);
  v_to := v_today + p_horizon_days;
  if c.recur_until is not null then v_to := least(v_to, c.recur_until); end if;
  if v_to < v_from then return 0; end if;

  insert into public.sessions (
    challenge_id, day_number, title, category, session_type,
    zoom_link, scheduled_at, duration_minutes, occurrence_date
  )
  select c.id, 0, c.name, c.recur_category, 'live',
         c.recur_join_link, (d + c.recur_time) at time zone c.recur_tz, c.recur_duration_min, d
  from (select g::date as d from generate_series(v_from, v_to, interval '1 day') g) days
  where extract(isodow from d)::smallint = any(c.recur_days)
    and (d + c.recur_time) at time zone c.recur_tz > now()
  on conflict (challenge_id, occurrence_date) where occurrence_date is not null do nothing;
  get diagnostics n = row_count;

  -- Day N = position in the class calendar.
  if n > 0 then
    update public.sessions s set day_number = r.rn
    from (
      select id, row_number() over (order by occurrence_date) as rn
      from public.sessions where challenge_id = c.id and occurrence_date is not null
    ) r
    where s.id = r.id and s.day_number is distinct from r.rn;
  end if;
  return n;
end;
$$;

-- Create (p_id null) or edit a live class. Teachers own what they create;
-- admins must name the teacher (p_teacher) on create and may reassign later.
-- Schedule edits rebuild the untouched future calendar; the join link, title
-- and category always propagate to future classes.
create or replace function public.save_live_class(
  p_id uuid,
  p_name text,
  p_description text,
  p_category text,
  p_days smallint[],
  p_time time,
  p_tz text,
  p_duration int,
  p_start date,
  p_until date,
  p_join_link text,
  p_teacher uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role user_role := get_my_role();
  v_id uuid := p_id;
  v_teacher uuid;
  v_link text := nullif(btrim(coalesce(p_join_link, '')), '');
  v_old public.challenges;
  v_cancelled date[];
begin
  if v_role is null or v_role not in ('teacher', 'admin') then raise exception 'only teachers and admins can manage live classes'; end if;
  if nullif(btrim(coalesce(p_name, '')), '') is null then raise exception 'class name is required'; end if;
  if v_link is not null and v_link !~* '^https?://' then raise exception 'join link must be an http(s) URL'; end if;
  perform now() at time zone p_tz;  -- raises on an unknown timezone

  if v_id is null then
    v_teacher := case when v_role = 'admin' then p_teacher else auth.uid() end;
    if v_teacher is null or not exists (select 1 from profiles where id = v_teacher and role = 'teacher') then
      raise exception 'choose the teacher for this class';
    end if;

    insert into challenges (
      name, description, is_free, price, teacher_id, start_date, status, is_published, access_type,
      is_recurring, recur_days, recur_time, recur_tz, recur_until, recur_duration_min, recur_category, recur_join_link
    ) values (
      btrim(p_name), nullif(btrim(coalesce(p_description, '')), ''), true, 0, v_teacher, p_start, 'active', true, 'live',
      true, p_days, p_time, p_tz, p_until, p_duration, p_category, v_link
    ) returning id into v_id;
    insert into challenge_teachers (challenge_id, teacher_id) values (v_id, v_teacher) on conflict do nothing;
  else
    select * into v_old from challenges where id = v_id and is_recurring;
    if not found then raise exception 'live class not found'; end if;
    if not (public.is_my_challenge(v_id) or v_role = 'admin') then raise exception 'not your class'; end if;

    update challenges set
      name = btrim(p_name), description = nullif(btrim(coalesce(p_description, '')), ''),
      start_date = p_start, recur_days = p_days, recur_time = p_time, recur_tz = p_tz, recur_until = p_until,
      recur_duration_min = p_duration, recur_category = p_category, recur_join_link = v_link
    where id = v_id;

    if v_role = 'admin' and p_teacher is not null and p_teacher is distinct from v_old.teacher_id then
      update challenges set teacher_id = p_teacher where id = v_id;
      delete from challenge_teachers where challenge_id = v_id;
      insert into challenge_teachers (challenge_id, teacher_id) values (v_id, p_teacher);
    end if;

    -- Schedule changed → drop future classes nobody has touched, keeping the
    -- dates the teacher cancelled so they stay cancelled after regeneration.
    if (v_old.recur_days, v_old.recur_time, v_old.recur_tz, v_old.recur_duration_min, v_old.start_date, v_old.recur_until)
       is distinct from (p_days, p_time, p_tz, p_duration, p_start, p_until) then
      select array_agg(occurrence_date) into v_cancelled
      from sessions where challenge_id = v_id and is_cancelled and scheduled_at > now();

      delete from sessions s
      where s.challenge_id = v_id and s.occurrence_date is not null
        and s.scheduled_at > now() and not s.started
        and not exists (select 1 from attendance a where a.session_id = s.id);
    end if;

    update sessions set zoom_link = v_link, title = btrim(p_name), category = p_category
    where challenge_id = v_id and occurrence_date is not null and scheduled_at > now();
  end if;

  perform public.generate_class_sessions(v_id);

  if v_cancelled is not null then
    update sessions set is_cancelled = true
    where challenge_id = v_id and occurrence_date = any(v_cancelled);
  end if;
  return v_id;
end;
$$;
grant execute on function public.save_live_class(uuid, text, text, text, smallint[], time, text, int, date, date, text, uuid) to authenticated;

-- End a class: no more classes after today; untouched future dates removed.
create or replace function public.end_live_class(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from challenges where id = p_id and is_recurring) then raise exception 'live class not found'; end if;
  if not (public.is_my_challenge(p_id) or get_my_role() = 'admin') then raise exception 'not your class'; end if;

  update challenges set status = 'completed',
    recur_until = greatest(start_date, (now() at time zone recur_tz)::date)
  where id = p_id;

  delete from sessions s
  where s.challenge_id = p_id and s.occurrence_date is not null
    and s.scheduled_at > now() and not s.started
    and not exists (select 1 from attendance a where a.session_id = s.id);
end;
$$;
grant execute on function public.end_live_class(uuid) to authenticated;

-- ───────────────────────────────
-- 4. ROSTER
-- ───────────────────────────────

-- Students a teacher may add: those they referred/created, or who are in any
-- of their classes. Admins may add any client. Name + avatar only (no PII).
create or replace function public.live_class_candidates(p_challenge uuid)
returns table (user_id uuid, full_name text, avatar_url text, is_member boolean)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url,
         exists (select 1 from enrollments m where m.user_id = p.id and m.challenge_id = p_challenge and m.status = 'active')
  from profiles p
  where p.role = 'client'
    and (public.is_my_challenge(p_challenge) or get_my_role() = 'admin')
    and (
      get_my_role() = 'admin'
      or p.referred_by = auth.uid()
      or exists (select 1 from enrollments e where e.user_id = p.id and public.is_my_challenge(e.challenge_id))
    )
  order by p.full_name;
$$;
grant execute on function public.live_class_candidates(uuid) to authenticated;

-- Replace the roster with exactly p_users: add/reactivate the chosen students,
-- mark everyone else 'removed' (history — attendance, remarks — is kept).
create or replace function public.set_live_class_roster(p_challenge uuid, p_users uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_users uuid[] := coalesce(p_users, '{}');
begin
  select name into v_name from challenges where id = p_challenge and is_recurring;
  if v_name is null then raise exception 'live class not found'; end if;
  if not (public.is_my_challenge(p_challenge) or get_my_role() = 'admin') then raise exception 'not your class'; end if;
  if exists (
    select 1 from unnest(v_users) u
    where u not in (select c.user_id from public.live_class_candidates(p_challenge) c)
  ) then
    raise exception 'one or more students can''t be added to this class';
  end if;

  with added as (
    insert into enrollments (user_id, challenge_id, access_type, status, status_changed_at, status_changed_by)
    select u, p_challenge, 'live', 'active', now(), auth.uid() from unnest(v_users) u
    on conflict (user_id, challenge_id) do update
      set status = 'active', access_type = 'live', status_changed_at = now(), status_changed_by = auth.uid()
      where enrollments.status <> 'active'
    returning user_id
  )
  insert into notifications (recipient_id, type, title, actor_id, challenge_id, link)
  select user_id, 'class_added', 'You''ve been added to ' || v_name, auth.uid(), p_challenge, '/app/live/' || p_challenge
  from added;

  update enrollments
     set status = 'removed', status_changed_at = now(), status_changed_by = auth.uid()
   where challenge_id = p_challenge and status = 'active' and user_id <> all(v_users);
end;
$$;
grant execute on function public.set_live_class_roster(uuid, uuid[]) to authenticated;

-- ───────────────────────────────
-- 5. FEEDBACK + REMARKS
-- ───────────────────────────────

-- Student rates a class that has started. Re-submitting edits the rating;
-- the teachers are notified on the first rating only.
create or replace function public.submit_session_feedback(p_session uuid, p_rating int, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  v_first boolean;
  v_name text;
begin
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'rating must be 1–5'; end if;

  select ses.id, ses.challenge_id, ses.title into s
  from sessions ses
  join challenges c on c.id = ses.challenge_id and c.is_recurring
  join enrollments e on e.challenge_id = ses.challenge_id and e.user_id = auth.uid() and e.status = 'active'
  where ses.id = p_session and not ses.is_cancelled and ses.scheduled_at <= now();
  if not found then raise exception 'you can rate a class once it has started'; end if;

  v_first := not exists (select 1 from session_feedback where session_id = p_session and user_id = auth.uid());

  insert into session_feedback (session_id, user_id, rating, note)
  values (p_session, auth.uid(), p_rating, nullif(btrim(coalesce(p_note, '')), ''))
  on conflict (session_id, user_id) do update
    set rating = excluded.rating, note = excluded.note, updated_at = now();

  if v_first then
    select coalesce(nullif(split_part(full_name, ' ', 1), ''), 'A student') into v_name from profiles where id = auth.uid();
    insert into notifications (recipient_id, type, title, actor_id, challenge_id, link)
    select ct.teacher_id, 'class_feedback',
           v_name || ' rated ' || s.title || ' ' || repeat('★', p_rating),
           auth.uid(), s.challenge_id, '/teacher/live/' || s.challenge_id || '?session=' || s.id
    from challenge_teachers ct where ct.challenge_id = s.challenge_id;
  end if;
end;
$$;
grant execute on function public.submit_session_feedback(uuid, int, text) to authenticated;

-- Tell the student when their teacher leaves (or changes) a remark.
create or replace function public.on_attendance_remark_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_challenge uuid;
begin
  if nullif(btrim(coalesce(new.remark, '')), '') is null then return new; end if;
  if tg_op = 'UPDATE' and new.remark is not distinct from old.remark then return new; end if;

  select title, challenge_id into v_title, v_challenge from sessions where id = new.session_id;
  perform notify_user(new.user_id, 'class_remark', 'Your trainer left a note on ' || coalesce(v_title, 'your class'),
                      auth.uid(), v_challenge, '/app/live/' || v_challenge);
  return new;
end;
$$;
drop trigger if exists trg_attendance_remark_notify on public.attendance;
create trigger trg_attendance_remark_notify
after insert or update of remark on public.attendance
for each row execute function public.on_attendance_remark_notify();

-- ───────────────────────────────
-- 6. SCHEDULER
-- ───────────────────────────────

-- Every 10 min: keep each class's calendar 14 days ahead, and when a class
-- ends ask its teachers to mark attendance and its students to rate it.
-- Classes that ended more than a day ago are never prompted (no backlog spam).
create or replace function public.live_class_tick()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.generate_class_sessions(id) from challenges where is_recurring and status <> 'completed';

  with due as (
    update sessions s set prompted_at = now()
    from challenges c
    where c.id = s.challenge_id and c.is_recurring
      and s.prompted_at is null and not s.is_cancelled
      and s.scheduled_at + make_interval(mins => coalesce(s.duration_minutes, 60)) <= now()
      and s.scheduled_at > now() - interval '1 day'
    returning s.id, s.challenge_id, s.title
  ), to_teachers as (
    insert into notifications (recipient_id, type, title, challenge_id, link)
    select ct.teacher_id, 'class_ended', d.title || ' just ended — mark attendance', d.challenge_id,
           '/teacher/live/' || d.challenge_id || '?session=' || d.id
    from due d join challenge_teachers ct on ct.challenge_id = d.challenge_id
  )
  insert into notifications (recipient_id, type, title, challenge_id, link)
  select e.user_id, 'class_rate', 'How was today''s ' || d.title || '? Rate the class', d.challenge_id,
         '/app/live/' || d.challenge_id
  from due d join enrollments e on e.challenge_id = d.challenge_id and e.status = 'active';
end;
$$;

-- Generated classes have no Zoom cloud recording: don't flag them as
-- "recording processing" when they auto-complete, and skip cancelled dates.
-- (Otherwise identical to migration_auto_complete_sessions.sql.)
create or replace function public.auto_complete_past_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.sessions
     set completed = true,
         is_live_next = false,
         recording_status = case
           when recording_link is null and recording_status = 'none' and occurrence_date is null then 'processing'
           else recording_status
         end
   where completed = false
     and not is_cancelled
     and session_type = 'live'
     and scheduled_at is not null
     and scheduled_at + make_interval(mins => coalesce(duration_minutes, 60)) < now();
  get diagnostics n = row_count;
  return n;
end;
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'live-class-tick') then
    perform cron.unschedule('live-class-tick');
  end if;
end $$;

select cron.schedule('live-class-tick', '*/10 * * * *', $$ select public.live_class_tick(); $$);

-- Internal helpers are for triggers / RPCs / cron only — not callable from the
-- API (otherwise any client could write to someone's inbox).
revoke execute on function public.notify_user(uuid, text, text, uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.generate_class_sessions(uuid, int) from public, anon, authenticated;
revoke execute on function public.live_class_tick() from public, anon, authenticated;

-- Calendar for any class that already exists when this runs.
select public.live_class_tick();
