-- Migration: AFTER INSERT trigger on user_profiles to fire welcome email
--
-- Posts the new user_profiles row to the `send-welcome-email` Edge Function
-- via the pg_net extension. The Edge Function classifies the signup as
-- nursing (C1) vs general (A1) and sends the matching welcome email.
--
-- Design notes:
--   * We trigger on user_profiles INSERT (not auth.users INSERT) because
--     the archetype column lives on user_profiles, and onboarding populates
--     it right after signup. If the archetype is still null at insert time,
--     the Edge Function falls back to auth.users.raw_user_meta_data.target.
--   * The trigger is intentionally fire-and-forget: pg_net.http_post is
--     async, and the Edge Function itself is bulletproof — no delivery
--     failure can cascade back to the transaction that inserted the profile.
--   * If the Edge Function URL or service_role_key settings are not set,
--     the trigger will no-op with a NOTICE rather than raise — signup MUST
--     never fail because of email plumbing.
--
-- Prereqs to apply this migration:
--   1. The `send-welcome-email` Edge Function is deployed
--      (`supabase functions deploy send-welcome-email`).
--   2. The pg_net extension is enabled (Database → Extensions → pg_net in
--      the Supabase dashboard, or `CREATE EXTENSION IF NOT EXISTS pg_net;`).
--   3. Two database-level settings are set via `ALTER DATABASE postgres SET ...`
--      or via the Supabase dashboard (Settings → Database → Custom Postgres
--      Configuration):
--        app.settings.welcome_email_url       → full URL of the Edge Function
--        app.settings.welcome_email_secret    → matches WEBHOOK_SECRET env var
--                                               on the Edge Function (optional
--                                               but recommended)
--      If app.settings.welcome_email_url is null, the trigger no-ops.
--
-- Created: April 24, 2026 — C1 nursing welcome wire-up (C2-C4 deferred).

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
  v_url TEXT;
  v_secret TEXT;
  v_payload JSONB;
  v_headers JSONB;
BEGIN
  -- Pull config. current_setting(..., true) returns NULL instead of
  -- raising if the GUC is not set, so this is safe to call on cold boot.
  BEGIN
    v_url := current_setting('app.settings.welcome_email_url', true);
  EXCEPTION WHEN OTHERS THEN
    v_url := NULL;
  END;

  BEGIN
    v_secret := current_setting('app.settings.welcome_email_secret', true);
  EXCEPTION WHEN OTHERS THEN
    v_secret := NULL;
  END;

  IF v_url IS NULL OR length(trim(v_url)) = 0 THEN
    -- Config missing; no-op. Do NOT raise.
    RAISE NOTICE 'trigger_send_welcome_email: app.settings.welcome_email_url not set; skipping';
    RETURN NEW;
  END IF;

  -- Build payload in the shape the Edge Function expects. We mirror the
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
    'Content-Type', 'application/json'
  );

  IF v_secret IS NOT NULL AND length(trim(v_secret)) > 0 THEN
    v_headers := v_headers || jsonb_build_object('x-webhook-secret', v_secret);
  END IF;

  -- Fire the async HTTP POST. pg_net swallows its own errors into the
  -- net._http_response log — it will never raise in the trigger path.
  BEGIN
    PERFORM net.http_post(
      url := v_url,
      body := v_payload,
      headers := v_headers,
      timeout_milliseconds := 5000
    );
  EXCEPTION WHEN OTHERS THEN
    -- Belt-and-suspenders: if pg_net itself errors (e.g., extension disabled
    -- mid-flight), log and move on. Signup must never fail here.
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

-- ── Usage / configuration notes ─────────────────────────────────────────
-- After applying this migration, set the two app.settings GUCs:
--
--   -- In the Supabase SQL Editor (one-time):
--   ALTER DATABASE postgres
--     SET app.settings.welcome_email_url =
--       'https://<project-ref>.supabase.co/functions/v1/send-welcome-email';
--
--   ALTER DATABASE postgres
--     SET app.settings.welcome_email_secret = '<match WEBHOOK_SECRET on the function>';
--
-- Then reconnect the session (or ask Supabase support to recycle the pooler)
-- so the new GUCs are visible. After that, INSERTs on user_profiles will
-- fire the welcome email asynchronously.
--
-- To TEST without triggering on real user data, run:
--   SELECT public.trigger_send_welcome_email();
-- ...inside a transaction with a hand-built NEW record, or simply insert
-- a test user_profiles row and watch net._http_response for the result.

-- ── Verification ────────────────────────────────────────────────────────
-- Confirm trigger is installed:
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'user_profiles_welcome_email';
