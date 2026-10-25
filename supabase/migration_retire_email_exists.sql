-- ═══════════════════════════════════════════════════════════════
-- U-40: retire the email_exists account-enumeration oracle.
-- Run ONLY AFTER the new frontend is deployed (its Auth page no longer calls
-- this function). Running it earlier breaks login on the old build.
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════
drop function if exists public.email_exists(text);
