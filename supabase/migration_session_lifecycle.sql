-- migration_session_lifecycle.sql
-- Track when a live session actually started, so staff cards can show the full
-- lifecycle: Created → Scheduled (Zoom) → Live → Ended → Recording… → Ready.
-- `started` is set by the zoom-webhook on meeting.started. Idempotent.

alter table public.sessions
  add column if not exists started boolean not null default false;
