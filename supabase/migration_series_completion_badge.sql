-- migration_series_completion_badge.sql
-- M7 of the Series overhaul: a completion badge for finishing your FIRST series,
-- plus a naming sweep so badge cards say "Series" (matching the renamed feature).
-- Reuses the existing rules engine + `challenges_completed` metric — no function
-- changes, so zero blast radius. Idempotent. Run in the Supabase SQL editor.

-- 1) New auto badge: awarded on your first completed series. Fills the gap
--    between "Series Joiner" (enroll) and "Double Trouble" (2 completed).
insert into public.badge_definitions
  (code, name, description, category, tier, points, icon, award_type, rule, sort_order)
values
  ('first_series', 'Series Finisher', 'Complete your first series', 'Series', 'silver', 30, 'Trophy', 'auto', '{"metric":"challenges_completed","gte":1}', 34)
on conflict (code) do update set
  name = excluded.name, description = excluded.description, category = excluded.category,
  tier = excluded.tier, points = excluded.points, icon = excluded.icon,
  award_type = excluded.award_type, rule = excluded.rule, sort_order = excluded.sort_order;

-- 2) Naming sweep: user-facing "Challenge" → "Series" on the existing badges,
--    including the category (it drives the filter chip in the Badges page).
update public.badge_definitions
  set category = 'Series'
  where category = 'Challenge';

update public.badge_definitions set name = 'Series Joiner',   description = 'Enroll in your first series' where code = 'challenge_joiner';
update public.badge_definitions set description = 'Complete a 21-day series' where code = 'finisher_21';
update public.badge_definitions set description = 'Complete a 30-day series' where code = 'finisher_30';
update public.badge_definitions set description = 'Complete 2 series'        where code = 'double_trouble';
update public.badge_definitions set description = 'Complete 3+ series'       where code = 'veteran';

-- Existing enrolled-in-completed-series users get the new badge on their next
-- badge evaluation (client calls evaluate_badges on load); no backfill needed.
