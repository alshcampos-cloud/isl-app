-- Phase 3, Unit 1: Streak Counter
-- D.R.A.F.T. protocol: NEW table. No existing tables modified.
-- RLS pattern matches nursing_user_profiles (auth.uid() = user_id)
-- SAFE TO RE-RUN: All statements are idempotent.

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  freezes_used_this_week INTEGER DEFAULT 0,
  freeze_week_start DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security — users can only see/modify their own streak
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation (DROP IF EXISTS + CREATE)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own streak" ON user_streaks;
  DROP POLICY IF EXISTS "Users can insert own streak" ON user_streaks;
  DROP POLICY IF EXISTS "Users can update own streak" ON user_streaks;
END $$;

CREATE POLICY "Users can view own streak"
  ON user_streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON user_streaks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON user_streaks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at on changes (reuse existing function if available)
DO $$
BEGIN
  -- Drop existing trigger if it exists to make this idempotent
  DROP TRIGGER IF EXISTS trg_user_streaks_updated_at ON user_streaks;

  -- Try to use existing trigger function from nursing track
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_nursing_updated_at') THEN
    CREATE TRIGGER trg_user_streaks_updated_at
      BEFORE UPDATE ON user_streaks
      FOR EACH ROW EXECUTE FUNCTION update_nursing_updated_at();
  ELSE
    -- Create a standalone one if nursing function doesn't exist
    CREATE OR REPLACE FUNCTION update_streaks_updated_at()
    RETURNS TRIGGER AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_user_streaks_updated_at
      BEFORE UPDATE ON user_streaks
      FOR EACH ROW EXECUTE FUNCTION update_streaks_updated_at();
  END IF;
END $$;
