-- ============================================================
-- Phase 2B: Onboarding Funnel Tracking + Archetype Activation
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Create onboarding_events table
-- Lightweight event tracking for onboarding funnel analytics
CREATE TABLE IF NOT EXISTS onboarding_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,              -- random ID from sessionStorage (groups one user's journey)
  user_id uuid REFERENCES auth.users(id), -- null for anonymous, populated after signup
  screen_number smallint NOT NULL,        -- 1-5
  screen_name text NOT NULL,              -- 'archetype_detection', 'breathing', 'practice', 'irs_baseline', 'signup'
  action text NOT NULL,                   -- 'viewed', 'completed', 'skipped', 'started', etc.
  metadata jsonb DEFAULT '{}'::jsonb,     -- flexible payload per event
  time_on_screen_ms integer,              -- how long user spent on this screen (set on screen change)
  created_at timestamptz DEFAULT now()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_onboarding_events_session ON onboarding_events(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_screen ON onboarding_events(screen_number, action);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_created ON onboarding_events(created_at);

-- 2. RLS: Allow anonymous inserts (onboarding happens before signup)
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user (including anonymous) to INSERT
CREATE POLICY "Allow authenticated inserts" ON onboarding_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow service role full access (for analytics queries)
CREATE POLICY "Service role full access" ON onboarding_events
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to read their own events (optional, for debugging)
CREATE POLICY "Users can read own events" ON onboarding_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3. Add archetype + onboarding columns to user_profiles
-- (These may already exist from Phase 2 — IF NOT EXISTS handles that)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'archetype'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN archetype text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_field'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_field text;
  END IF;
END $$;
