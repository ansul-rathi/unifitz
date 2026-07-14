-- migration_reconcile_audit.sql
-- M2 of the Series overhaul: audit trail for manual attendance reconciliation.
-- When a teacher manually matches an unmatched Zoom participant to a UniFit
-- user, record who did it and when.
--
-- Self-sufficient: also creates the Zoom tracking tables/columns if this
-- database never ran the Zoom block of migration.sql (fixes
-- `relation "public.session_participants" does not exist`).
-- Idempotent + non-destructive. Run in the Supabase SQL editor.

-- ── 0) Zoom prerequisites (no-ops where they already exist) ─────────────────
alter table public.sessions
  add column if not exists zoom_meeting_id    text,
  add column if not exists zoom_join_url      text,
  add column if not exists zoom_start_url     text,   -- host only — never sent to clients
  add column if not exists zoom_meeting_uuid  text,
  add column if not exists recording_status   text not null default 'none',  -- 'none' | 'processing' | 'available'
  add column if not exists recording_password text,
  add column if not exists started            boolean not null default false; -- set by zoom-webhook meeting.started

alter table public.attendance
  add column if not exists attended_minutes int,
  add column if not exists session_minutes  int,
  add column if not exists attendance_pct   numeric,
  add column if not exists source           text not null default 'manual';  -- 'zoom' | 'manual' | 'recording'

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

-- Clients read their own matched rows; teachers read rows for their series
-- (incl. unmatched, for reconciliation); admin all. Writes happen only via
-- Edge Functions (service role) or the teacher reconcile below.
drop policy if exists "own participants read" on public.session_participants;
create policy "own participants read" on public.session_participants
  for select using (user_id = auth.uid());

drop policy if exists "teacher reads participants" on public.session_participants;
create policy "teacher reads participants" on public.session_participants
  for select using (
    exists (select 1 from sessions s where s.id = session_participants.session_id and is_my_challenge(s.challenge_id))
    or get_my_role() = 'admin'
  );

drop policy if exists "teacher reconciles participants" on public.session_participants;
create policy "teacher reconciles participants" on public.session_participants
  for update using (
    exists (select 1 from sessions s where s.id = session_participants.session_id and is_my_challenge(s.challenge_id))
    or get_my_role() = 'admin'
  );

-- Realtime publication (errors if already added — swallow that one case).
do $$
begin
  alter publication supabase_realtime add table public.session_participants;
exception when duplicate_object then
  null;
end $$;

-- ── 1) The actual M2 change: reconcile audit columns ────────────────────────
alter table public.session_participants
  add column if not exists matched_by uuid references public.profiles(id),
  add column if not exists matched_at timestamptz;
