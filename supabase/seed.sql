-- ═══════════════════════════════════════════════════════════════
-- UniFit — Demo seed data
-- Run AFTER migration.sql, in the Supabase SQL Editor.
--
-- Demo logins (all passwords: password123)
--   admin   : admin@unifit.in
--   teacher : priya@unifit.in, rahul@unifit.in
--   clients : ananya@unifit.in, kavita@unifit.in, neeta@unifit.in,
--             sneha@unifit.in, pooja@unifit.in, meera@unifit.in,
--             ritu@unifit.in, divya@unifit.in, shalini@unifit.in,
--             anjali@unifit.in
--
-- Dates are relative to current_date, so dashboards look alive
-- whenever you run this (30-Day Challenge is always on Day 12).
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────
-- 1. AUTH USERS (the signup trigger auto-creates profiles + codes)
-- ───────────────────────────────
-- NOTE: token columns must be '' (not NULL) — GoTrue fails to scan NULLs
-- and login dies with "Database error querying schema".
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
  u.email, crypt('password123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name, 'phone', u.phone),
  now(), now(),
  '', '', '', '', '', '', '', ''
from (values
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'admin@unifit.in',   'Vikram Malhotra', '+91 98100 00001'),
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'priya@unifit.in',   'Priya Nair',      '+91 98100 00002'),
  ('b0000000-0000-0000-0000-000000000002'::uuid, 'rahul@unifit.in',   'Rahul Verma',     '+91 98100 00003'),
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'ananya@unifit.in',  'Ananya Iyer',     '+91 98100 00011'),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'kavita@unifit.in',  'Kavita Sharma',   '+91 98100 00012'),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 'neeta@unifit.in',   'Neeta Pillai',    '+91 98100 00013'),
  ('c0000000-0000-0000-0000-000000000004'::uuid, 'sneha@unifit.in',   'Sneha Kulkarni',  '+91 98100 00014'),
  ('c0000000-0000-0000-0000-000000000005'::uuid, 'pooja@unifit.in',   'Pooja Reddy',     '+91 98100 00015'),
  ('c0000000-0000-0000-0000-000000000006'::uuid, 'meera@unifit.in',   'Meera Joshi',     '+91 98100 00016'),
  ('c0000000-0000-0000-0000-000000000007'::uuid, 'ritu@unifit.in',    'Ritu Aggarwal',   '+91 98100 00017'),
  ('c0000000-0000-0000-0000-000000000008'::uuid, 'divya@unifit.in',   'Divya Menon',     '+91 98100 00018'),
  ('c0000000-0000-0000-0000-000000000009'::uuid, 'shalini@unifit.in', 'Shalini Gupta',   '+91 98100 00019'),
  ('c0000000-0000-0000-0000-000000000010'::uuid, 'anjali@unifit.in',  'Anjali Mehta',    '+91 98100 00020')
) as u(id, email, full_name, phone);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email',
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       now(), now(), now()
from auth.users u
where u.email like '%@unifit.in';

-- ───────────────────────────────
-- 2. ROLES, ONBOARDING DATA, FRIENDLY REFERRAL CODES
-- ───────────────────────────────
update public.profiles set role = 'admin',   onboarding_complete = true, referral_code = 'VIKRAM0001'
  where id = 'a0000000-0000-0000-0000-000000000001';
update public.profiles set role = 'teacher', onboarding_complete = true, referral_code = 'PRIYA0001'
  where id = 'b0000000-0000-0000-0000-000000000001';
update public.profiles set role = 'teacher', onboarding_complete = true, referral_code = 'RAHUL0001'
  where id = 'b0000000-0000-0000-0000-000000000002';

update public.profiles p set
  age = v.age, gender = 'female', height_cm = v.h, starting_weight_kg = v.w,
  target_weight_kg = v.tw, activity_level = v.act, fitness_goal = 'lose_weight',
  onboarding_complete = true, referral_code = v.code
from (values
  ('c0000000-0000-0000-0000-000000000001'::uuid, 34, 162, 72.0, 64, 'light',     'ANANYA0001'),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 42, 158, 78.5, 68, 'sedentary', 'KAVITA0001'),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 47, 160, 81.0, 70, 'light',     'NEETA0001'),
  ('c0000000-0000-0000-0000-000000000004'::uuid, 29, 165, 65.0, 58, 'moderate',  'SNEHA0001'),
  ('c0000000-0000-0000-0000-000000000005'::uuid, 38, 156, 70.0, 62, 'light',     'POOJA0001'),
  ('c0000000-0000-0000-0000-000000000006'::uuid, 45, 159, 74.0, 66, 'sedentary', 'MEERA0001'),
  ('c0000000-0000-0000-0000-000000000007'::uuid, 31, 168, 62.0, 58, 'moderate',  'RITU0001'),
  ('c0000000-0000-0000-0000-000000000008'::uuid, 40, 161, 76.0, 67, 'light',     'DIVYA0001'),
  ('c0000000-0000-0000-0000-000000000009'::uuid, 36, 163, 69.0, 61, 'light',     'SHALINI0001'),
  ('c0000000-0000-0000-0000-000000000010'::uuid, 33, 164, 66.0, 60, 'moderate',  'ANJALI0001')
) as v(id, age, h, w, tw, act, code)
where p.id = v.id;

-- Referral relationships (statuses advance automatically when attendance lands)
update public.profiles set referred_by = 'c0000000-0000-0000-0000-000000000001'
  where id in ('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000008');
update public.profiles set referred_by = 'c0000000-0000-0000-0000-000000000003'
  where id = 'c0000000-0000-0000-0000-000000000010';

insert into public.referrals (referrer_id, referred_id, status) values
  ('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'signed_up'),
  ('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'signed_up'),
  ('c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000010', 'signed_up');

-- ───────────────────────────────
-- 3. CHALLENGES
-- 30-Day: started 11 days ago → today is Day 12.
-- 21-Day: starts in 3 days.
-- ───────────────────────────────
insert into public.challenges (id, name, description, duration_days, is_free, teacher_id, batch_name, start_date, status) values
  ('d0000000-0000-0000-0000-000000000001', '30-Day Challenge',
   'Full-body transformation: Zumba, strength and weight training, 6 days a week, live on Zoom.',
   30, true, 'b0000000-0000-0000-0000-000000000001', 'Morning Warriors', current_date - 11, 'active'),
  ('d0000000-0000-0000-0000-000000000002', '21-Day Workout Series',
   'Build the habit: yoga, meditation and light strength, 21 days straight, live on Zoom.',
   21, true, 'b0000000-0000-0000-0000-000000000002', 'Evening Squad', current_date + 3, 'upcoming');

-- ───────────────────────────────
-- 4. SESSIONS
-- 30-Day: Days 1–11 completed recordings, Day 12 pinned live today 7 PM.
-- ───────────────────────────────
insert into public.sessions (challenge_id, day_number, title, session_type, zoom_link, recording_link, scheduled_at, duration_minutes, is_live_next, completed)
select
  'd0000000-0000-0000-0000-000000000001',
  d,
  'Day ' || d || ': ' || (array[
    'Kickoff + Full Body Burn', 'Zumba Cardio Party', 'Core & Abs Blast', 'Lower Body Strength',
    'Yoga Recovery Flow', 'HIIT Express', 'Upper Body Strength', 'Zumba Dance Cardio',
    'Glutes & Legs', 'Meditation + Mobility', 'Full Body Circuit'
  ])[d],
  'recording',
  'https://zoom.us/j/9000000' || lpad(d::text, 2, '0'),
  'https://zoom.us/rec/share/demo-recording-day-' || d,
  (current_date - (11 - d) - 1) + time '19:00',
  60, false, true
from generate_series(1, 11) as d;

insert into public.sessions (id, challenge_id, day_number, title, session_type, zoom_link, scheduled_at, duration_minutes, is_live_next, completed) values
  ('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000001', 12,
   'Day 12: Full Body HIIT', 'live', 'https://zoom.us/j/900000012',
   current_date + time '19:00', 60, true, false);

-- 21-Day: first 3 sessions scheduled.
insert into public.sessions (challenge_id, day_number, title, session_type, zoom_link, scheduled_at, duration_minutes)
select
  'd0000000-0000-0000-0000-000000000002',
  d,
  'Day ' || d || ': ' || (array['Gentle Yoga Foundations', 'Guided Meditation + Stretch', 'Light Strength Basics'])[d],
  'live',
  'https://zoom.us/j/8000000' || lpad(d::text, 2, '0'),
  (current_date + 2 + d) + time '18:00',
  45
from generate_series(1, 3) as d;

-- ───────────────────────────────
-- 5. ENROLLMENTS
-- Clients 1–8 in the 30-Day; clients 4–10 in the 21-Day.
-- ───────────────────────────────
insert into public.enrollments (user_id, challenge_id, joined_at)
select ('c0000000-0000-0000-0000-0000000000' || lpad(n::text, 2, '0'))::uuid,
       'd0000000-0000-0000-0000-000000000001', now() - interval '11 days'
from generate_series(1, 8) as n;

insert into public.enrollments (user_id, challenge_id)
select ('c0000000-0000-0000-0000-0000000000' || lpad(n::text, 2, '0'))::uuid,
       'd0000000-0000-0000-0000-000000000002'
from generate_series(4, 10) as n;

-- ───────────────────────────────
-- 6. ATTENDANCE (Days 1–11 of the 30-Day)
-- Per-client attendance rates; triggers advance referral statuses:
-- Kavita (9 days, referred by Ananya)  → reward_earned
-- Divya  (4 days, referred by Ananya)  → active
-- Anjali (0 days, referred by Neeta)   → stays signed_up
-- ───────────────────────────────
insert into public.attendance (session_id, user_id, attended, marked_by)
select s.id, c.user_id, true, 'b0000000-0000-0000-0000-000000000001'
from public.sessions s
cross join (values
  ('c0000000-0000-0000-0000-000000000001'::uuid, 11),
  ('c0000000-0000-0000-0000-000000000002'::uuid,  9),
  ('c0000000-0000-0000-0000-000000000003'::uuid,  8),
  ('c0000000-0000-0000-0000-000000000004'::uuid,  7),
  ('c0000000-0000-0000-0000-000000000005'::uuid,  5),
  ('c0000000-0000-0000-0000-000000000006'::uuid,  3),
  ('c0000000-0000-0000-0000-000000000007'::uuid,  2),
  ('c0000000-0000-0000-0000-000000000008'::uuid,  4)
) as c(user_id, days_attended)
where s.challenge_id = 'd0000000-0000-0000-0000-000000000001'
  and s.day_number <= c.days_attended;

-- ───────────────────────────────
-- 7. DAILY CHECK-INS (streaks)
-- Ananya, Kavita, Neeta: 11-day streak. Sneha: 6. Pooja: 3.
-- ───────────────────────────────
insert into public.daily_checkins (user_id, checkin_date, attended_session, water_glasses, sleep_hours)
select c.user_id, current_date - offs, true, 4 + (offs % 5), 6 + (offs % 3)
from (values
  ('c0000000-0000-0000-0000-000000000001'::uuid, 10),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 10),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 10),
  ('c0000000-0000-0000-0000-000000000004'::uuid,  5),
  ('c0000000-0000-0000-0000-000000000005'::uuid,  2)
) as c(user_id, span)
cross join lateral generate_series(0, c.span) as offs;

-- ───────────────────────────────
-- 8. WEEKLY CHECK-INS (progress reports)
-- ───────────────────────────────
insert into public.weekly_checkins (user_id, challenge_id, week_number, weight_kg, waist_in, hips_in, chest_in, energy_level, workout_days, notes, created_at) values
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1, 71.2, 33.5, 41.0, 37.0, 3, 5, 'Tough first week but loved Zumba!', now() - interval '5 days'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 2, 70.4, 33.0, 40.5, 36.8, 4, 6, 'Feeling lighter already.', now() - interval '1 day'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 1, 77.9, 36.0, 43.0, 39.0, 2, 4, 'Knees sore, trainer adjusted moves.', now() - interval '5 days'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 2, 77.1, 35.5, 42.5, 38.8, 3, 5, 'Energy improving.', now() - interval '1 day'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 1, 80.6, 37.0, 44.0, 40.0, 3, 5, 'Morning batch fits perfectly.', now() - interval '5 days'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 2, 79.8, 36.5, 43.5, 39.6, 4, 6, 'Back pain almost gone.', now() - interval '1 day'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 1, 64.8, 29.0, 38.0, 34.0, 4, 5, 'Loving HIIT days.', now() - interval '5 days'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 1, 70.1, 32.0, 40.0, 36.0, 2, 3, 'Missed a few sessions, catching up.', now() - interval '5 days'),
  -- Meera: weight flat 2 weeks → red flag demo on the teacher dashboard
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 1, 74.0, 34.0, 42.0, 38.0, 2, 2, 'Struggling to stay regular.', now() - interval '5 days'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 2, 74.2, 34.0, 42.0, 38.0, 2, 2, 'Travel week, missed classes.', now() - interval '1 day');

-- ───────────────────────────────
-- 9. ANNOUNCEMENTS
-- ───────────────────────────────
insert into public.announcements (teacher_id, challenge_id, message, created_at) values
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
   'Day 12 tonight at 7 PM — Full Body HIIT! Keep water and a towel ready. See you live!', now() - interval '2 hours'),
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001',
   'Huge congrats to everyone who finished Week 2 check-ins. Consistency wins!', now() - interval '1 day'),
  ('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002',
   'Evening Squad! We kick off in 3 days — Day 1 is Gentle Yoga Foundations at 6 PM.', now() - interval '5 hours');

-- ───────────────────────────────
-- 10. BADGE DEFINITIONS (54 across 10 categories, 5 tiers)
-- Points: bronze 10, silver 25, gold 50, platinum 100, diamond 200.
-- Auto/hybrid badges carry a machine-readable rule; manual ones don't.
-- ───────────────────────────────
insert into public.badge_definitions (code, name, description, category, tier, points, icon, award_type, rule, sort_order) values
-- Getting Started
('welcome_aboard','Welcome Aboard','Sign up for UniFit','Getting Started','bronze',10,'Hand','auto','{"metric":"signed_up","gte":1}',1),
('all_set','All Set','Complete profile + BMI/TDEE','Getting Started','bronze',10,'BadgeCheck','auto','{"metric":"profile_complete","gte":1}',2),
('first_step','First Step','Attend your first session','Getting Started','bronze',10,'Footprints','auto','{"metric":"sessions_attended","gte":1}',3),
('day3_warrior','3-Day Warrior','Reach a 3-day streak','Getting Started','bronze',10,'Flame','auto','{"metric":"streak","gte":3}',4),
('week_one','Week One','7 days active','Getting Started','bronze',10,'CalendarDays','auto','{"metric":"checkin_days","gte":7}',5),
-- Streaks
('on_fire','On Fire','7-day streak','Streaks','silver',25,'Flame','auto','{"metric":"streak","gte":7}',6),
('unstoppable','Unstoppable','14-day streak','Streaks','silver',25,'Flame','auto','{"metric":"streak","gte":14}',7),
('iron_will','Iron Will','30-day streak','Streaks','gold',50,'Flame','auto','{"metric":"streak","gte":30}',8),
('diamond_dedication','Diamond Dedication','60-day streak','Streaks','diamond',200,'Gem','auto','{"metric":"streak","gte":60}',9),
('comeback_kid','Comeback Kid','Return after 3+ missed sessions','Streaks','silver',25,'Undo2','manual',null,10),
('perfect_week','Perfect Week','Attend every session in a week','Streaks','silver',25,'CalendarCheck','manual',null,11),
-- Attendance
('early_bird','Early Bird','5 sessions attended','Attendance','bronze',10,'Sunrise','auto','{"metric":"sessions_attended","gte":5}',12),
('regular','Regular','10 sessions attended','Attendance','silver',25,'CalendarCheck','auto','{"metric":"sessions_attended","gte":10}',13),
('dedicated','Dedicated','25 sessions attended','Attendance','gold',50,'Medal','auto','{"metric":"sessions_attended","gte":25}',14),
('century','Century','50 sessions attended','Attendance','platinum',100,'Trophy','auto','{"metric":"sessions_attended","gte":50}',15),
('legend','Legend','100 sessions attended','Attendance','diamond',200,'Crown','auto','{"metric":"sessions_attended","gte":100}',16),
-- Progress
('first_kg','First KG','Lose 1 kg','Progress','bronze',10,'TrendingDown','auto','{"metric":"weight_lost","gte":1}',17),
('inch_loser','Inch Loser','Lose 1 inch','Progress','bronze',10,'Ruler','auto','{"metric":"inches_lost","gte":1}',18),
('five_kg_club','5 KG Club','Lose 5 kg','Progress','gold',50,'TrendingDown','auto','{"metric":"weight_lost","gte":5}',19),
('halfway_hero','Halfway Hero','50% of your goal','Progress','silver',25,'Target','auto','{"metric":"goal_progress_pct","gte":50}',20),
('goal_crusher','Goal Crusher','Hit your target weight','Progress','platinum',100,'Target','auto','{"metric":"goal_progress_pct","gte":100}',21),
('transformer','Transformer','Upload before/after photos','Progress','silver',25,'Images','hybrid','{"metric":"progress_photos","gte":2}',22),
('bmi_mover','BMI Mover','Improve your BMI category','Progress','silver',25,'Activity','auto','{"metric":"bmi_improved","gte":1}',23),
-- Engagement
('form_filler','Form Filler','First weekly check-in','Engagement','bronze',10,'ClipboardList','auto','{"metric":"weekly_forms","gte":1}',24),
('consistent_reporter','Consistent Reporter','4 weekly forms','Engagement','gold',50,'ClipboardCheck','auto','{"metric":"weekly_forms","gte":4}',25),
('feedback_friend','Feedback Friend','Give your first feedback','Engagement','bronze',10,'MessageSquare','manual',null,26),
('voice_heard','Voice Heard','5 feedbacks','Engagement','silver',25,'MessagesSquare','manual',null,27),
('hydration_hero','Hydration Hero','Log water 7 days','Engagement','bronze',10,'GlassWater','auto','{"metric":"water_days","gte":7}',28),
('sleep_champ','Sleep Champ','Log sleep 7 days','Engagement','bronze',10,'Moon','auto','{"metric":"sleep_days","gte":7}',29),
-- Referral / Community
('spread_the_word','Spread the Word','1 referral signs up','Referral','bronze',10,'Share2','auto','{"metric":"referrals_signed_up","gte":1}',30),
('influencer','Influencer','3 successful referrals','Referral','gold',50,'Megaphone','auto','{"metric":"referrals_earned","gte":3}',31),
('super_referrer','Super Referrer','5 successful referrals','Referral','platinum',100,'Star','auto','{"metric":"referrals_earned","gte":5}',32),
('mentor','Mentor','10 successful referrals','Referral','diamond',200,'GraduationCap','auto','{"metric":"referrals_earned","gte":10}',33),
('community_star','Community Star','Class shoutout from trainer','Referral','silver',25,'Sparkles','manual',null,34),
-- Challenge
('challenge_joiner','Challenge Joiner','Enroll in your first challenge','Challenge','bronze',10,'Flag','auto','{"metric":"enrollments","gte":1}',35),
('finisher_21','21-Day Finisher','Complete a 21-day challenge','Challenge','gold',50,'Trophy','manual',null,36),
('finisher_30','30-Day Finisher','Complete a 30-day challenge','Challenge','gold',50,'Trophy','manual',null,37),
('double_trouble','Double Trouble','Complete 2 challenges','Challenge','platinum',100,'Layers','auto','{"metric":"challenges_completed","gte":2}',38),
('veteran','Veteran','Complete 3+ challenges','Challenge','diamond',200,'Shield','auto','{"metric":"challenges_completed","gte":3}',39),
-- Discipline
('morning_person','Morning Person','10 morning sessions','Discipline','silver',25,'Sunrise','manual',null,40),
('weekend_warrior','Weekend Warrior','8 weekend sessions','Discipline','silver',25,'Swords','manual',null,41),
('diet_disciple','Diet Disciple','Generate a diet plan','Discipline','bronze',10,'Salad','auto','{"metric":"diet_plans","gte":1}',42),
('no_excuses','No Excuses','Work out on a holiday','Discipline','silver',25,'PartyPopper','manual',null,43),
('consistency_royalty','Consistency Royalty','90% attendance in a month','Discipline','gold',50,'Crown','manual',null,44),
-- Elite
('full_transformation','Full Transformation','Goal + photos + 3 challenges','Elite','diamond',200,'Gem','hybrid',null,45),
('hall_of_fame','Hall of Fame','Top the leaderboard for a full challenge','Elite','platinum',100,'Trophy','manual',null,46),
('perfectionist','Perfectionist','100% attendance in a challenge','Elite','platinum',100,'CheckCircle2','manual',null,47),
('marathoner','Marathoner','90-day streak','Elite','diamond',200,'Flame','auto','{"metric":"streak","gte":90}',48),
('points_titan','Points Titan','5000+ points','Elite','platinum',100,'Zap','auto','{"metric":"points","gte":5000}',49),
-- Seasonal
('navratri_nine','Navratri Nine','Complete the Navratri challenge','Seasonal','gold',50,'Sparkles','manual',null,50),
('new_year','New Year','Join a January challenge','Seasonal','silver',25,'PartyPopper','manual',null,51),
('anniversary','Anniversary','1 year with UniFit','Seasonal','gold',50,'Cake','auto','{"metric":"account_days","gte":365}',52),
('birthday_burn','Birthday Burn','Work out on your birthday','Seasonal','bronze',10,'Cake','manual',null,53),
('founding_member','Founding Member','Early joiner of UniFit','Seasonal','diamond',200,'Gem','manual',null,54);

-- ───────────────────────────────
-- 11. RECIPES (~12 Indian healthy, across categories)
-- ───────────────────────────────
insert into public.recipes (title, category, ingredients, steps, calories, protein_g, carbs_g, fat_g, created_by) values
('Masala Oats', 'Breakfast', '["1 cup rolled oats","1 cup mixed veggies","1 tsp oil","Spices, curry leaves"]', '["Saute veggies in oil","Add oats + 2 cups water","Cook 5 min, season"]', 280, 10, 45, 6, 'a0000000-0000-0000-0000-000000000001'),
('Paneer Bhurji', 'High Protein', '["150g paneer","1 onion","1 tomato","1 tsp oil","Spices"]', '["Saute onion+tomato","Crumble paneer in","Cook 5 min"]', 320, 22, 8, 22, 'a0000000-0000-0000-0000-000000000001'),
('Moong Dal Chilla', 'High Protein', '["1 cup moong dal (soaked)","Green chilli, ginger","Coriander","1 tsp oil"]', '["Blend dal to batter","Pour on tawa","Cook both sides"]', 250, 16, 30, 6, 'a0000000-0000-0000-0000-000000000001'),
('Grilled Chicken Salad', 'High Protein', '["150g chicken breast","Lettuce, cucumber, tomato","Lemon, olive oil"]', '["Grill seasoned chicken","Toss with veggies","Dress with lemon+oil"]', 330, 35, 10, 14, 'b0000000-0000-0000-0000-000000000001'),
('Sprouts Chaat', 'Low-Cal', '["1 cup mixed sprouts","Onion, tomato","Lemon, chaat masala"]', '["Boil sprouts 5 min","Mix with veggies","Add lemon + masala"]', 180, 12, 28, 2, 'a0000000-0000-0000-0000-000000000001'),
('Vegetable Daliya', 'Low-Cal', '["1 cup broken wheat","Mixed veggies","1 tsp ghee","Spices"]', '["Roast daliya","Add veggies + water","Pressure cook 2 whistles"]', 240, 8, 44, 5, 'a0000000-0000-0000-0000-000000000001'),
('Banana Peanut Smoothie', 'Post-Workout', '["1 banana","1 tbsp peanut butter","1 cup milk","Cinnamon"]', '["Blend all till smooth","Serve chilled"]', 310, 14, 38, 12, 'b0000000-0000-0000-0000-000000000002'),
('Egg White Omelette', 'Post-Workout', '["4 egg whites","Spinach, onion","1 tsp oil"]', '["Whisk whites","Pour on pan with veggies","Fold and cook"]', 160, 18, 4, 7, 'b0000000-0000-0000-0000-000000000001'),
('Roasted Makhana', 'Snacks', '["2 cups makhana","1 tsp ghee","Salt, pepper"]', '["Roast makhana in ghee","Season","Cool and store"]', 150, 5, 22, 5, 'a0000000-0000-0000-0000-000000000001'),
('Greek Yogurt Bowl', 'Snacks', '["1 cup greek yogurt","Berries","1 tsp honey","Chia seeds"]', '["Top yogurt with fruit","Drizzle honey + chia"]', 200, 17, 24, 4, 'a0000000-0000-0000-0000-000000000001'),
('Quinoa Veg Pulao', 'Low-Cal', '["1 cup quinoa","Mixed veggies","1 tsp oil","Whole spices"]', '["Saute spices+veggies","Add quinoa + 2 cups water","Cook 15 min"]', 290, 11, 46, 7, 'a0000000-0000-0000-0000-000000000001'),
('Tofu Stir Fry', 'High Protein', '["200g tofu","Bell peppers, broccoli","Soy sauce, garlic","1 tsp oil"]', '["Pan-fry tofu","Add veggies + sauce","Stir fry 5 min"]', 300, 24, 16, 16, 'b0000000-0000-0000-0000-000000000001');

-- Recipe images (keyword placeholders; swap for hosted images anytime).
update public.recipes set image_url = 'https://loremflickr.com/800/450/' || x.kw || '?lock=' || x.lk
from (values
  ('Masala Oats','oats,breakfast',11),('Paneer Bhurji','paneer,indianfood',12),
  ('Moong Dal Chilla','indianpancake,food',13),('Grilled Chicken Salad','chicken,salad',14),
  ('Sprouts Chaat','sprouts,salad',15),('Vegetable Daliya','porridge,vegetables',16),
  ('Banana Peanut Smoothie','smoothie,banana',17),('Egg White Omelette','omelette,eggs',18),
  ('Roasted Makhana','snack,seeds',19),('Greek Yogurt Bowl','yogurt,berries',20),
  ('Quinoa Veg Pulao','quinoa,rice',21),('Tofu Stir Fry','tofu,stirfry',22)
) as x(title, kw, lk)
where public.recipes.title = x.title;

-- ───────────────────────────────
-- 12. DEMO BADGES + POINTS (so the UI looks alive)
-- ───────────────────────────────
insert into public.user_badges (user_id, badge_code, source, earned_at) values
  ('c0000000-0000-0000-0000-000000000001', 'welcome_aboard', 'auto', now() - interval '11 days'),
  ('c0000000-0000-0000-0000-000000000001', 'all_set', 'auto', now() - interval '11 days'),
  ('c0000000-0000-0000-0000-000000000001', 'first_step', 'auto', now() - interval '10 days'),
  ('c0000000-0000-0000-0000-000000000001', 'day3_warrior', 'auto', now() - interval '8 days'),
  ('c0000000-0000-0000-0000-000000000001', 'week_one', 'auto', now() - interval '4 days'),
  ('c0000000-0000-0000-0000-000000000001', 'on_fire', 'auto', now() - interval '4 days'),
  ('c0000000-0000-0000-0000-000000000001', 'early_bird', 'auto', now() - interval '6 days'),
  ('c0000000-0000-0000-0000-000000000001', 'regular', 'auto', now() - interval '2 days'),
  ('c0000000-0000-0000-0000-000000000001', 'first_kg', 'auto', now() - interval '1 day'),
  ('c0000000-0000-0000-0000-000000000001', 'form_filler', 'auto', now() - interval '5 days'),
  ('c0000000-0000-0000-0000-000000000002', 'welcome_aboard', 'auto', now() - interval '11 days'),
  ('c0000000-0000-0000-0000-000000000002', 'all_set', 'auto', now() - interval '11 days'),
  ('c0000000-0000-0000-0000-000000000002', 'first_step', 'auto', now() - interval '9 days'),
  ('c0000000-0000-0000-0000-000000000002', 'community_star', 'manual', now() - interval '3 days');

-- Sync points to the seeded badges.
update public.profiles p set points = coalesce((
  select sum(d.points) from user_badges ub join badge_definitions d on d.code = ub.badge_code
  where ub.user_id = p.id
), 0) where p.role = 'client';
