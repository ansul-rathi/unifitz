# UniFit — Diet Plan + Badges: Claude Code Build Prompt

Copy everything below the line into Claude Code. This extends the existing UniFit React + Supabase app — do not rebuild what exists; add these two sections and wire them into the current client dashboard, schema, and role system.

---

Extend the existing UniFit fitness platform (React + Vite + Tailwind + Supabase, with profiles/role system, challenges, sessions, enrollments, daily_checkins, weekly_checkins, attendance, referrals already built) by adding two new client-facing sections — **Diet Plan** and **Badges** — plus the admin/teacher controls for them. Provide all schema changes as additions to migration.sql, RLS policies for every new table, and seed data.

## SECTION 1 — DIET PLAN

### Gate logic
The Diet Plan tab is gated behind a complete profile. Required fields (already collected at onboarding): age, gender, height_cm, weight (starting_weight_kg), activity_level, fitness_goal.
- If any required field is missing OR onboarding_complete is false → show a locked-state card: "Complete your profile to unlock your free personalized diet plan" with a button that jumps to the missing-fields form. Do not show the plan.
- If complete → compute and display BMI and TDEE, then allow plan generation.

### Calculations (compute once, store on profile)
- BMI = weight_kg / (height_m^2), with category label (Underweight <18.5, Normal 18.5–24.9, Overweight 25–29.9, Obese >=30).
- BMR via Mifflin-St Jeor:
  - Male: 10*weight + 6.25*height_cm - 5*age + 5
  - Female: 10*weight + 6.25*height_cm - 5*age - 161
- TDEE = BMR * activity multiplier (sedentary 1.2, light 1.375, moderate 1.55, active 1.725, very active 1.9).
- Calorie target by goal: lose weight = TDEE - 500, maintain = TDEE, gain muscle = TDEE + 300.
- Macro split (default): protein 30%, carbs 40%, fat 30% — convert to grams.
Show BMI, TDEE, calorie target, and macro grams in a clean "Your Numbers" summary card at the top of the tab.

### Pre-generation preferences (quick, one-time, editable)
Before generating, ask 3 things (store on a diet_preferences record): diet_type (veg / non-veg / eggetarian / vegan), allergies_or_dislikes (free text), meals_per_day (3 / 4 / 5).

### AI plan generation (Gemini API)
- Use the Gemini API (text model) via a Supabase Edge Function `generate-diet-plan` (never call Gemini from the client; key stays server-side as GEMINI_API_KEY secret).
- Prompt Gemini to produce a structured 7-day Indian meal plan hitting the calorie target and macro split, respecting diet_type and allergies, split across meals_per_day. Require JSON output only (no prose/markdown) so it parses cleanly: days[] -> meals[] -> { name, items[], approx_calories, protein_g, carbs_g, fat_g }.
- Parse and render as a clean weekly plan UI (day tabs or accordion; each meal as a card with calories + macros). Show daily totals vs target.

### "One free plan" mechanic
- The first successfully generated plan is saved to diet_plans and is ALWAYS viewable for free.
- Generating a NEW plan or regenerating is the future paywall: show a "Generate new plan" button that, if a free plan already exists, opens a "Premium — coming soon" modal instead of generating. Add an admin toggle `diet_regeneration_enabled` (default false) so you can flip it on later.
- Store generated_count so admin can see usage.

### Recipe library (free now)
- New `recipes` table: title, category (High Protein / Low-Cal / Breakfast / Snacks / Post-Workout / etc.), image_url, ingredients (jsonb array), steps (jsonb array), calories, protein_g, carbs_g, fat_g, is_premium (boolean, default false), created_by.
- Client UI: searchable, category-filterable grid of recipe cards → tap opens full recipe (use a recipe display view with ingredients + steps + macros). All free now; is_premium reserved for later gating.
- Admin/teacher can add/edit recipes. Seed ~12 realistic Indian healthy recipes across categories with macros.
- Optional nicety: a "Recipes that fit your target" filter showing recipes under their per-meal calorie budget.

### Diet schema additions
- profiles: add bmi (numeric), tdee (numeric), calorie_target (int), updated_metrics_at (timestamp).
- diet_preferences: id, user_id (unique), diet_type, allergies_or_dislikes, meals_per_day.
- diet_plans: id, user_id, plan (jsonb — the 7-day structure), calorie_target, generated_count, is_free_plan (boolean), created_at.
- recipes: as above.
- app_settings (key-value) for diet_regeneration_enabled and similar global toggles.
RLS: clients read/write only their own diet_preferences + diet_plans; recipes readable by all authenticated users, writable by teacher/admin; app_settings readable by all, writable by admin only.

## SECTION 2 — BADGES

### Concept
54 seeded badges across 10 categories and 5 rarity tiers (bronze, silver, gold, platinum, diamond), each worth points. Most auto-awarded by a rules engine; some manual (teacher/admin); some hybrid.

### Schema
- `badge_definitions`: id, code (unique slug), name, description, category, tier, points, icon (lucide icon name), award_type ('auto' | 'manual' | 'hybrid'), rule (jsonb — machine-readable threshold, e.g. {"metric":"sessions_attended","gte":25}), is_active.
- `user_badges`: id, user_id, badge_code, earned_at, awarded_by (null for auto, else admin/teacher id), source ('auto' | 'manual'); unique(user_id, badge_code).
- Add `points` (int, default 0) to profiles — increment when a badge is earned.

### Rules engine (Postgres functions, no n8n)
- A SECURITY DEFINER function `evaluate_badges(user_id)` that recomputes the user's current metrics (streak from daily_checkins, sessions_attended from attendance, weight/inches deltas from weekly_checkins vs starting, weekly_forms_count, referrals_earned, challenges_completed, points, etc.) and awards any auto/hybrid badge whose rule is now satisfied and not yet earned (insert into user_badges, bump points, return newly earned badges).
- Call evaluate_badges via trigger or at the end of the relevant write paths: after daily_checkin insert, attendance upsert, weekly_checkin insert, referral status change, enrollment/challenge completion.
- Manual badges are inserted directly by teacher/admin actions, never by the engine.

### Seed these 54 badge_definitions
Getting Started (bronze, auto): welcome_aboard (sign up), all_set (profile+BMI/TDEE complete), first_step (1st session), day3_warrior (3-day streak), week_one (7 days active).
Streaks: on_fire (7-day, silver), unstoppable (14-day, silver), iron_will (30-day, gold), diamond_dedication (60-day, diamond), comeback_kid (return after 3+ missed, silver), perfect_week (all week's sessions, silver).
Attendance: early_bird (5 on-time, bronze), regular (10, silver), dedicated (25, gold), century (50, platinum), legend (100, diamond).
Progress: first_kg (lose 1kg, bronze), inch_loser (lose 1 inch, bronze), five_kg_club (lose 5kg, gold), halfway_hero (50% of goal, silver), goal_crusher (hit target weight, platinum), transformer (before/after photos, silver, hybrid), bmi_mover (improve BMI category, silver).
Engagement: form_filler (1st weekly form, bronze), consistent_reporter (4 forms in a row, gold), feedback_friend (1st feedback, bronze), voice_heard (5 feedbacks, silver), hydration_hero (log water 7 days, bronze), sleep_champ (log sleep 7 days, bronze).
Referral/Community: spread_the_word (1 referral signs up, bronze), influencer (3 successful, gold), super_referrer (5 successful, platinum), mentor (10 successful, diamond), community_star (class shoutout, silver, manual).
Challenge: challenge_joiner (enroll 1st, bronze), finisher_21 (complete 21-day, gold), finisher_30 (complete 30-day, gold), double_trouble (2 challenges, platinum), veteran (3+ challenges, diamond).
Discipline: morning_person (10 morning sessions, silver), weekend_warrior (8 weekend sessions, silver), diet_disciple (generate diet plan, bronze), no_excuses (work out on festival/holiday, silver), consistency_royalty (90% attendance in a month, gold).
Elite: full_transformation (goal+photos+3 challenges, diamond, hybrid), hall_of_fame (top leaderboard full challenge, platinum), perfectionist (100% attendance in a challenge, platinum), marathoner (90-day streak, diamond), points_titan (5000+ points, platinum).
Seasonal: navratri_nine (complete Navratri challenge, gold), new_year (join Jan challenge, silver), anniversary (1 year with UniFit, gold), birthday_burn (work out on birthday, bronze), founding_member (early joiner, diamond, manual).
(Assign sensible points per tier: bronze 10, silver 25, gold 50, platinum 100, diamond 200.)

### Client Badges UI
- Grid of all badges; earned ones full-color with earned date, unearned ones greyed/locked with their requirement shown.
- Filter by category and by earned/locked. Header shows total points, badges earned / total, and current tier breakdown.
- Confetti + a celebratory modal when a new badge is earned (triggered when evaluate_badges returns new ones in the same session).

### "You're close!" nudges (home page)
- A function `nearest_badges(user_id)` returns the 1–2 closest unearned countable badges with progress (current vs threshold).
- On the client Home, show a nudge card: e.g. "2 more sessions → Dedicated 🥇" or "1 kg to go → 5 KG Club!" with a progress bar. Refreshes as data updates.

### Teacher / Admin controls
- Teacher: an "Award badge" action on each of their students — can grant manual/hybrid badges only (community_star, transformer, etc.), with an optional note. Cannot grant auto badges.
- Admin: full badge management screen — edit any badge_definition (name, description, threshold rule, tier, points, active toggle), award or revoke any badge for any user, and view a leaderboard by points. Admin edits to thresholds take effect on the next evaluate_badges run.
RLS: badge_definitions readable by all authenticated, writable by admin; user_badges readable by the owner + their teacher + admin, insertable by admin/teacher (manual) and by the security-definer engine (auto).

## NAV / INTEGRATION
- Add "Diet Plan" and "Badges" to the client bottom-tab (mobile) / sidebar (desktop) nav alongside Home, Challenges, Progress, Refer & Earn, Profile.
- Keep everything fully responsive, same energetic design language, loading/empty/error states, and no localStorage (Supabase + React state only).

## DELIVERABLES
1. migration.sql additions: all new tables, columns, enums, the evaluate_badges + nearest_badges functions, triggers, and RLS policies.
2. Supabase Edge Function `generate-diet-plan` (calls Gemini, returns parsed JSON), deployed notes in README.
3. React: Diet Plan tab (gate + numbers + preferences + AI plan + recipe library), Badges tab (grid + filters + earn modal), home nudge card, teacher award action, admin badge manager.
4. seed.sql: 54 badge_definitions, ~12 recipes, and a couple of demo users with some badges already earned so the UI looks alive.
5. README: GEMINI_API_KEY secret setup and how to flip diet_regeneration_enabled later.
