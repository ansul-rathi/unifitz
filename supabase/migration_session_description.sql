-- Run once on an existing DB. Safe + idempotent. No data loss.
alter table public.sessions add column if not exists description text;
-- Class type (Zumba / Yoga / Meditation / Strength / Weight) for the type icon.
alter table public.sessions add column if not exists category text;
