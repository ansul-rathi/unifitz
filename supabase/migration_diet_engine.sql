-- ═══════════════════════════════════════════════════════════════
-- UniFit — Fixed dietician Diet Plan engine (NO AI)
-- Tables: diet_plan_template, diet_rules, workout_plan + recipe columns.
-- Quantities scale per person in the app; templates are fixed here.
-- Standalone, idempotent, no data loss. Run after the core migration.
-- ═══════════════════════════════════════════════════════════════

-- Remembered Veg/Non-Veg choice on the profile.
alter table public.profiles add column if not exists diet_type text;

-- Recipe library extensions (base values + plan linkage).
alter table public.recipes
  add column if not exists code text,
  add column if not exists track text,                 -- veg | non-veg | both
  add column if not exists base_calories int,
  add column if not exists base_protein_g numeric,
  add column if not exists tips text;
-- Plain unique index (NULLs are distinct, so legacy recipes with no code are fine).
-- Must NOT be partial — ON CONFLICT (code) can't infer a partial index.
drop index if exists uniq_recipes_code;
create unique index uniq_recipes_code on public.recipes(code);

-- The fixed dietician plan (base = 1650 kcal / 55 kg female reference).
create table if not exists public.diet_plan_template (
  id uuid primary key default gen_random_uuid(),
  meal_slot text not null,        -- early_morning | breakfast | snack1 | snack2 | snack3 | lunch | dinner
  slot_order int not null,
  option_no int not null default 1,
  track text not null,            -- veg | non-veg | both
  time_label text,
  description text not null,
  base_calories int not null,
  base_protein_g numeric not null,
  prep_remarks text,
  recipe_code text,
  scalable boolean not null default true
);

create table if not exists public.diet_rules (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null,
  rule text not null
);

create table if not exists public.workout_plan (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null,
  day_label text not null,
  activity text not null,
  focus text
);

alter table public.diet_plan_template enable row level security;
alter table public.diet_rules enable row level security;
alter table public.workout_plan enable row level security;

do $$ begin
  -- readable by everyone (recipe/PDF pages may be public); admin writes.
  perform 1;
end $$;

drop policy if exists "template readable" on public.diet_plan_template;
create policy "template readable" on public.diet_plan_template for select using (true);
drop policy if exists "admin writes template" on public.diet_plan_template;
create policy "admin writes template" on public.diet_plan_template for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

drop policy if exists "rules readable" on public.diet_rules;
create policy "rules readable" on public.diet_rules for select using (true);
drop policy if exists "admin writes rules" on public.diet_rules;
create policy "admin writes rules" on public.diet_rules for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

drop policy if exists "workout readable" on public.workout_plan;
create policy "workout readable" on public.workout_plan for select using (true);
drop policy if exists "admin writes workout" on public.workout_plan;
create policy "admin writes workout" on public.workout_plan for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- Recipe pages must be publicly readable (PDF links open them logged-out).
drop policy if exists "recipes readable" on public.recipes;
create policy "recipes readable" on public.recipes for select using (true);

-- ── SEED: recipes referenced by the template (placeholder images) ──
insert into public.recipes (code, title, track, category, base_calories, base_protein_g, ingredients, steps, tips, image_url) values
('lemon-water-nuts','Warm Lemon Water + Nuts','both','snack',80,2,'["300-400 ml warm water","Half lemon","4 almonds","2 walnuts"]','["Warm the water","Squeeze in lemon","Eat the soaked nuts alongside"]','Kickstarts metabolism + healthy fats.','https://loremflickr.com/800/450/lemonwater?lock=101'),
('nv-breakfast-eggs','Eggs + Toast + Sweet Potato','non-veg','breakfast',450,26,'["3 boiled eggs or omelette","1 bread/roti","100 g sweet potato","1 guava"]','["Boil or pan-roast eggs with little oil","Boil sweet potato","Plate with fruit"]','Roast on nonstick with minimal oil.','https://loremflickr.com/800/450/eggs,breakfast?lock=102'),
('veg-breakfast-chilla','Besan/Moong Chilla + Paneer','veg','breakfast',490,22,'["2 besan or moong dal chilla","50 g paneer or tofu","Veggies, spices","1 tsp oil"]','["Blend batter","Cook chilla on tawa","Add paneer/tofu filling"]','High-protein veg start.','https://loremflickr.com/800/450/chilla,indianfood?lock=103'),
('nv-breakfast-bhurji','Egg Bhurji + Bread + Curd','non-veg','breakfast',435,26,'["2-3 eggs","Onion, tomato, veggies","1 wholemeal bread","100 g curd"]','["Saute veggies","Scramble eggs in","Serve with bread + curd"]','Add chilli + coriander for flavour.','https://loremflickr.com/800/450/eggbhurji?lock=104'),
('veg-breakfast-poha','Veg Poha / Upma / Oats + Sprouts','veg','breakfast',400,21,'["150 g poha/upma/daliya/oats","30-40 g sprouts","Veggies","1 tsp oil"]','["Saute veggies + sprouts","Add poha/oats","Cook 5 min"]','Sprouts add protein + fibre.','https://loremflickr.com/800/450/poha,indianfood?lock=105'),
('snack-fruit-greentea','Fruit + Green Tea','non-veg','snack',90,1,'["1 apple/orange/pear or roasted chana","Green tea"]','["Brew green tea","Pair with fruit"]','1.5% fat milk after workout if needed.','https://loremflickr.com/800/450/fruit,greentea?lock=106'),
('veg-snack-sweetpotato','Grilled Sweet Potato','veg','snack',92,2,'["100-150 g sweet potato","Salt","Lemon"]','["Grill or boil sweet potato","Season with salt + lemon"]','Great pre/post walk snack.','https://loremflickr.com/800/450/sweetpotato?lock=107'),
('snack-nuts-coffee','Nuts + Black Coffee','non-veg','snack',120,4,'["20 g almonds/roasted seeds","Black coffee or tea"]','["Brew coffee without sugar","Eat nuts alongside"]','No sugar.','https://loremflickr.com/800/450/nuts,coffee?lock=108'),
('veg-snack-nuts-seeds','Tea + Soaked Nuts & Seeds','veg','snack',175,6,'["Handful soaked nuts & seeds","Tea/coffee"]','["Soak nuts overnight","Pair with tea/coffee"]','Healthy fats + protein.','https://loremflickr.com/800/450/nutsseeds?lock=109'),
('snack-greek-yogurt','Greek Yogurt + Berries','non-veg','snack',105,9,'["100 g Greek yogurt","Berries or 20 g roasted seeds"]','["Top yogurt with berries/seeds"]','High protein, low sugar.','https://loremflickr.com/800/450/greekyogurt,berries?lock=110'),
('veg-snack-makhana','Roasted Makhana / Chana','veg','snack',105,9,'["Roasted nuts/lotus seeds/chana","A little jaggery"]','["Dry-roast makhana/chana","Add a little jaggery"]','Crunchy + filling.','https://loremflickr.com/800/450/makhana?lock=111'),
('nv-lunch-chicken-rice','Grilled Chicken + Brown Rice','non-veg','lunch',300,28,'["80 g grilled chicken breast","100 g cooked brown rice","Medium veg"]','["Grill chicken","Cook brown rice","Add sauteed veg"]','Lean protein + complex carbs.','https://loremflickr.com/800/450/chicken,rice?lock=112'),
('veg-lunch-paneer','Salad + Paneer + Chapati','veg','lunch',620,30,'["Raw salad bowl","80-100 g paneer/tofu bhurji","2 chapati","100 g curd (optional)"]','["Make paneer bhurji","Serve with chapati + salad"]','Add curd for extra protein.','https://loremflickr.com/800/450/paneer,indianfood?lock=113'),
('nv-lunch-fish','Grilled Fish + Sweet Potato','non-veg','lunch',375,26,'["80 g grilled fish","100 g sweet potato","1 chapati","50 g veg"]','["Grill fish","Boil sweet potato","Plate with chapati + veg"]','Omega-3 rich.','https://loremflickr.com/800/450/fish,grilled?lock=114'),
('veg-lunch-soya','Soya Chunks Sabji + Chapati','veg','lunch',475,21,'["50 g soya chunks","Tomato gravy","2 chapati","Raw salad"]','["Cook soya in tomato gravy","Serve with chapati + salad"]','Soya = high plant protein.','https://loremflickr.com/800/450/soya,curry?lock=115'),
('nv-dinner-chapati-eggs','Chapati + Sabji + Eggs','non-veg','dinner',325,20,'["1 chapati","Seasonal sabji/dal","2 eggs"]','["Make sabji/dal","Boil or scramble eggs","Serve with chapati"]','Light, early dinner.','https://loremflickr.com/800/450/chapati,dal?lock=116'),
('veg-dinner-sprouts-dal','Sprouts + Dal-Rice + Curd','veg','dinner',375,18,'["Green moong sprouts + veggies","Bowl dal-rice mix","Curd"]','["Steam sprouts with veg","Mix dal + rice","Add curd"]','Easy to digest.','https://loremflickr.com/800/450/sprouts,dal?lock=117'),
('nv-dinner-sproutsalad-fish','Sprout Salad + Grilled Fish','non-veg','dinner',207,19,'["Sprout salad + mixed veg","50-60 g grilled fish"]','["Toss sprout salad","Grill fish","Combine"]','Very light, high protein.','https://loremflickr.com/800/450/saladfish?lock=118'),
('veg-dinner-khichdi','Mix Veg / Millet Khichdi','veg','dinner',340,16,'["Mix veg khichdi OR 50 g oats with veg OR 50 g millet khichdi"]','["Pressure-cook khichdi with veg","Serve warm"]','Comfort + fibre.','https://loremflickr.com/800/450/khichdi?lock=119')
on conflict (code) do update set
  title = excluded.title, track = excluded.track, category = excluded.category,
  base_calories = excluded.base_calories, base_protein_g = excluded.base_protein_g,
  ingredients = excluded.ingredients, steps = excluded.steps, tips = excluded.tips,
  image_url = coalesce(public.recipes.image_url, excluded.image_url);

-- ── SEED: the fixed plan template ──
delete from public.diet_plan_template;
insert into public.diet_plan_template (meal_slot, slot_order, option_no, track, time_label, description, base_calories, base_protein_g, prep_remarks, recipe_code, scalable) values
('early_morning',1,1,'both','After waking up','Warm lemon water + 4 almonds + 2 walnuts',80,2,'300-400 ml water','lemon-water-nuts',false),
('breakfast',2,1,'non-veg','Breakfast','3 boiled eggs/omelette + 1 bread/roti + 100 g sweet potato + 1 guava',450,26,'Roast on nonstick with little oil','nv-breakfast-eggs',true),
('breakfast',2,1,'veg','Breakfast','2 besan/moong dal chilla with 50 g paneer or tofu',490,22,'','veg-breakfast-chilla',true),
('breakfast',2,2,'non-veg','Breakfast (option 2)','2-3 egg bhurji with veggies + 1 wholemeal bread + 100 g curd',435,26,'','nv-breakfast-bhurji',true),
('breakfast',2,2,'veg','Breakfast (option 2)','150 g veg poha/upma/daliya/oats with 30-40 g sprouts',400,21,'','veg-breakfast-poha',true),
('snack1',3,1,'non-veg','Snack 1','1 fruit (apple/orange/pear) or roasted chana + green tea',90,1,'1.5% fat milk after workout','snack-fruit-greentea',true),
('snack1',3,1,'veg','Snack 1','100-150 g grilled sweet potato with salt and lemon',92,2,'','veg-snack-sweetpotato',true),
('snack2',4,1,'non-veg','Snack 2','20 g almonds/roasted seeds/nuts + black coffee or tea',120,4,'Without sugar','snack-nuts-coffee',true),
('snack2',4,1,'veg','Snack 2','Tea/coffee with a handful of soaked nuts & seeds',175,6,'','veg-snack-nuts-seeds',true),
('lunch',5,1,'non-veg','Lunch','Grilled chicken breast 80 g + 100 g cooked brown rice + medium veg',300,28,'','nv-lunch-chicken-rice',true),
('lunch',5,1,'veg','Lunch','Raw salad + 80-100 g paneer/tofu bhurji + 2 chapati (add 100 g curd if needed)',620,30,'','veg-lunch-paneer',true),
('lunch',5,2,'non-veg','Lunch (option 2)','Grilled fish 80 g + sweet potato 100 g + 1 chapati + 50 g veg',375,26,'','nv-lunch-fish',true),
('lunch',5,2,'veg','Lunch (option 2)','Raw salad + chapati with 50 g soya chunks sabji in tomato gravy',475,21,'','veg-lunch-soya',true),
('snack3',6,1,'non-veg','Snack 3','Greek yogurt 100 g + berries or 20 g roasted seeds/lotus seeds',105,9,'','snack-greek-yogurt',true),
('snack3',6,1,'veg','Snack 3','Roasted nuts/lotus seeds/chana with a little jaggery',105,9,'','veg-snack-makhana',true),
('dinner',7,1,'non-veg','Dinner','1 chapati + seasonal sabji/dal + 2 eggs',325,20,'','nv-dinner-chapati-eggs',true),
('dinner',7,1,'veg','Dinner','Green moong sprouts with veggies + one bowl dal-rice mix + curd',375,18,'','veg-dinner-sprouts-dal',true),
('dinner',7,2,'non-veg','Dinner (option 2)','Sprout salad with mixed vegetables + 50-60 g grilled fish',207,19,'','nv-dinner-sproutsalad-fish',true),
('dinner',7,2,'veg','Dinner (option 2)','Mix veg khichdi / 50 g oats with veggies / 50 g millet khichdi',340,16,'','veg-dinner-khichdi',true);

-- ── SEED: rules ──
delete from public.diet_rules;
insert into public.diet_rules (sort_order, rule) values
(1,'Aim for 20-25 g protein in every main meal'),
(2,'Max 20 ml oil per day'),
(3,'15-20 min walk after dinner'),
(4,'Dinner at least 2 hours before bed'),
(5,'~100 steps after breakfast & lunch'),
(6,'5,000-8,000 steps a day'),
(7,'10-12 min breathing exercises for digestion'),
(8,'Half spoon isabgol/psyllium husk in warm water (as advised)');

-- ── SEED: weekly workout ──
delete from public.workout_plan;
insert into public.workout_plan (sort_order, day_label, activity, focus) values
(1,'3 days','Strength Training (full/upper/lower split)','Strength, tone, metabolism'),
(2,'2 days','Yoga','Flexibility, mobility, recovery, posture, joints'),
(3,'Daily','Breathing 10-15 min (pranayama)','Digestion, lung strength, stress'),
(4,'1 day','Cardio/Activity (swim/badminton/Zumba or 10-12k steps or gardening 1 hr)','Heart health, endurance'),
(5,'1 day','Rest / active recovery (8-10k steps)','Recovery');
