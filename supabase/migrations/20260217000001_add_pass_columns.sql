-- ============================================================
-- MIGRATION: Product Separation — Pass Columns + AI Coach Credit Pool
-- InterviewAnswers.AI — P2: Separate Nursing & General Products
-- ============================================================
--
-- PURPOSE: Support the new pricing model:
--   - Nursing 30-Day Pass ($19.99)
--   - General 30-Day Pass ($14.99)
--   - Annual All-Access ($149.99/year)
--
-- CHANGES:
--   1. Add pass expiry columns to user_profiles (nursing + general)
--   2. Add pass_type tracking column
--   3. Add nursing_coach credit column to usage_tracking (AI Coach session cap)
--
-- SAFE TO RUN: Uses IF NOT EXISTS — idempotent.
--
-- HOW TO APPLY:
--   1. Go to Supabase Dashboard > SQL Editor
--   2. Paste this entire file
--   3. Click "Run"
--   4. Verify with queries at bottom
--
-- ============================================================

-- ============================================================
-- 1. Pass expiry columns on user_profiles
-- ============================================================
-- These columns track when each product's access expires.
-- NULL = no active pass (user is on free tier for that product).
-- A timestamp in the future = active pass.
-- A timestamp in the past = expired pass (user reverts to free tier).

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS nursing_pass_expires TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS general_pass_expires TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pass_type TEXT DEFAULT NULL;

COMMENT ON COLUMN user_profiles.nursing_pass_expires IS 'When nursing 30-day pass expires (NULL = no active pass, past = expired)';
COMMENT ON COLUMN user_profiles.general_pass_expires IS 'When general 30-day pass expires (NULL = no active pass, past = expired)';
COMMENT ON COLUMN user_profiles.pass_type IS 'Last purchased pass type: nursing_30day, general_30day, annual_all_access';

-- Index for efficient expiry checks
CREATE INDEX IF NOT EXISTS idx_user_profiles_nursing_pass_expires
  ON user_profiles(nursing_pass_expires)
  WHERE nursing_pass_expires IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_general_pass_expires
  ON user_profiles(general_pass_expires)
  WHERE general_pass_expires IS NOT NULL;

-- ============================================================
-- 2. AI Coach credit column on usage_tracking
-- ============================================================
-- The AI Coach was previously Pro-gated with no per-session tracking.
-- Now pass holders get 20 sessions/month to prevent cost blow-up.

ALTER TABLE usage_tracking
  ADD COLUMN IF NOT EXISTS nursing_coach INTEGER DEFAULT 0;

COMMENT ON COLUMN usage_tracking.nursing_coach IS 'AI Coach sessions used this month (pass holders: 20/month cap)';

-- ============================================================
-- VERIFICATION QUERIES (run after migration to confirm)
-- ============================================================

-- Check user_profiles columns:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'user_profiles'
--   AND column_name IN ('nursing_pass_expires', 'general_pass_expires', 'pass_type')
-- ORDER BY column_name;
--
-- Expected: 3 rows

-- Check usage_tracking column:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'usage_tracking'
--   AND column_name = 'nursing_coach';
--
-- Expected: 1 row

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
-- ALTER TABLE user_profiles
--   DROP COLUMN IF EXISTS nursing_pass_expires,
--   DROP COLUMN IF EXISTS general_pass_expires,
--   DROP COLUMN IF EXISTS pass_type;
--
-- ALTER TABLE usage_tracking
--   DROP COLUMN IF EXISTS nursing_coach;

-- ============================================================
-- NEW CREDIT LIMITS REFERENCE (matches updated creditSystem.js)
-- ============================================================
--
-- | Feature          | DB Column         | Free  | Nursing Pass | Annual    | Beta      |
-- |------------------|-------------------|-------|-------------|-----------|-----------|
-- | Quick Practice   | nursing_practice  | 3/mo  | Unlimited   | Unlimited | Unlimited |
-- | Mock Interview   | nursing_mock      | 1/mo  | Unlimited   | Unlimited | Unlimited |
-- | SBAR Drill       | nursing_sbar      | 2/mo  | Unlimited   | Unlimited | Unlimited |
-- | AI Coach         | nursing_coach     | 0     | 20/mo       | 20/mo     | Unlimited |
-- | Flashcards       | (Free forever — no credits)                                     |
-- | Command Center   | (Free forever — no credits)                                     |
-- | Confidence Build | (Profile/Evidence free, AI Brief = 1 credit from nursing_coach) |
-- | Offer Negotiation| (Pass-only — uses nursing_coach pool)                           |
-- | Resources        | (Free forever — no credits)                                     |
