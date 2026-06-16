-- ═══════════════════════════════════════════════════════════════
-- UniFit — Landing page backend (STANDALONE, idempotent, safe to re-run)
-- leads, reviews, testimonials + RLS + 6 seeded testimonials.
-- Public (anonymous) can INSERT leads/reviews; cannot read others' rows.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  goal text,
  consent boolean not null default false,
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating int not null check (rating between 1 and 5),
  text text,
  status text not null default 'pending',  -- pending | approved
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  result text,
  quote text,
  photo_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.leads enable row level security;
alter table public.reviews enable row level security;
alter table public.testimonials enable row level security;

-- leads: anyone may submit; only admin can read.
drop policy if exists "anon submit lead" on public.leads;
create policy "anon submit lead" on public.leads
  for insert to anon, authenticated with check (true);
drop policy if exists "admin reads leads" on public.leads;
create policy "admin reads leads" on public.leads
  for select using (get_my_role() = 'admin');
drop policy if exists "admin manages leads" on public.leads;
create policy "admin manages leads" on public.leads
  for all using (get_my_role() = 'admin');

-- reviews: anyone may submit (forced pending); public sees only approved; admin moderates.
drop policy if exists "anon submit review" on public.reviews;
create policy "anon submit review" on public.reviews
  for insert to anon, authenticated with check (status = 'pending');
drop policy if exists "public reads approved reviews" on public.reviews;
create policy "public reads approved reviews" on public.reviews
  for select using (status = 'approved' or get_my_role() = 'admin');
drop policy if exists "admin manages reviews" on public.reviews;
create policy "admin manages reviews" on public.reviews
  for all using (get_my_role() = 'admin');

-- testimonials: public reads active; admin writes.
drop policy if exists "public reads testimonials" on public.testimonials;
create policy "public reads testimonials" on public.testimonials
  for select using (is_active or get_my_role() = 'admin');
drop policy if exists "admin manages testimonials" on public.testimonials;
create policy "admin manages testimonials" on public.testimonials
  for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- Seed 6 testimonials (only if table empty).
insert into public.testimonials (name, location, result, quote, sort_order, is_active)
select * from (values
  ('Kavita Sharma', 'Jaipur', 'Lost 9 kg in 8 months', 'My trainer adjusted every move for me — I finally look forward to working out.', 1, true),
  ('Neeta Pillai', 'Bangalore', 'Back pain gone, thyroid improved', 'The morning batch fits before my kids wake up. One hour a day that''s fully mine.', 2, true),
  ('Anjali Mehta', 'New Jersey, USA', 'Down 2 dress sizes', 'It feels like a class with friends, not a video I watch alone.', 3, true),
  ('Sneha Kulkarni', 'Jaipur', 'Lost 4 kg & 3 inches in 30 days', 'The 30-day challenge kept me consistent — the leaderboard made it fun.', 4, true),
  ('Pooja Reddy', 'Hyderabad', 'Stronger and more energetic', 'No equipment, no gym, just my mat at home. Easiest habit I''ve ever kept.', 5, true),
  ('Meera Joshi', 'Jaipur', 'First workout routine in 10 years', 'Women-only, supportive, and the trainers know my name. I never feel judged.', 6, true)
) as t(name, location, result, quote, sort_order, is_active)
where not exists (select 1 from public.testimonials);
