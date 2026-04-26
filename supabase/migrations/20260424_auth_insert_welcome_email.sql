-- Migration: AFTER INSERT trigger on user_profiles to fire welcome email
--
-- Posts the new user_profiles row to the `send-welcome-email` Edge Function
-- via the pg_net extension. The Edge Function classifies the signup as
-- nursing (C1) vs general (A1) and sends the matching welcome email.
--
-- Design notes:
--   * URL and webhook secret are HARDCODED in the trigger function rather
--     than stored as `app.settings.*` GUCs because Supabase's hosted
--     Postgres does not allow non-superusers to run `ALTER DATABASE postgres
--     SET ...`. The project URL is public anyway (project ref is in the
--     subdomain). The webhook secret is shared with the Edge Function via
--     its `WEBHOOK_SECRET` env var; if you rotate one, rotate the other.
--   * We trigger on user_profiles INSERT (not auth.users INSERT) because
--     the archetype column lives on user_profiles, and onboarding populates
--     it right after signup. If the archetype is still null at insert time,
--     the Edge Function falls back to auth.users.raw_user_meta_data.target.
--   * The trigger is intentionally fire-and-forget: pg_net.http_post is
--     async, and the Edge Function itself is bulletproof — no delivery
--     failure can cascade back to the transaction that inserted the profile.
--
-- Created: April 24, 2026 — C1 nursing welcome wire-up (C2-C4 deferred).
-- Applied to production: April 25, 2026 via Supabase SQL Editor (v2 with
-- hardcoded URL/secret after permission denied on ALTER DATABASE).

-- ── Enable pg_net (idempotent) ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── Trigger function ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_send_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT := 'https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/send-welcome-email';
  -- Webhook secret matches the Edge Function's WEBHOOK_SECRET env var.
  -- If you rotate one, rotate the other.
  v_secret TEXT := 'bcf9f6a1ea0658f59da4d2f4f7188002a348eee8c11ed8a452581d40aef242f2';
  v_payload JSONB;
  v_headers JSONB;
BEGIN
  -- Build payload in the shape the Edge Function expects. Mirrors the
  -- Supabase Database Webhook envelope so the function can be wired via
  -- either path (pg_net trigger OR dashboard-configured webhook).
  v_payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'user_profiles',
    'schema', 'public',
    'record', to_jsonb(NEW),
    'old_record', NULL
  );

  v_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-webhook-secret', v_secret
  );

  -- Fire the async HTTP POST. pg_net swallows its own errors into the
  -- net._http_response log — it should never raise in the trigger path.
  -- Belt-and-suspenders: wrap in BEGIN/EXCEPTION so even if pg_net itself
  -- errors (e.g., extension disabled mid-flight), signup never fails.
  BEGIN
    PERFORM net.http_post(
      url := v_url,
      body := v_payload,
      headers := v_headers,
      timeout_milliseconds := 5000
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'trigger_send_welcome_email: pg_net.http_post failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- ── Install trigger ─────────────────────────────────────────────────────
-- Drop-and-recreate for idempotency.
DROP TRIGGER IF EXISTS user_profiles_welcome_email ON public.user_profiles;

CREATE TRIGGER user_profiles_welcome_email
AFTER INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_send_welcome_email();

-- ── Verification ────────────────────────────────────────────────────────
-- Confirm trigger is installed:
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'user_profiles_welcome_email';
