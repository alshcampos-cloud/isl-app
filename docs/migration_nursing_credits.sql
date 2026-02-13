-- ============================================================
-- MIGRATION: Add Nursing Credit Columns to usage_tracking
-- InterviewAnswers.AI — Nursing Track Billing
-- ============================================================
--
-- PURPOSE: The nursing track uses SEPARATE credit pools from the
--          main app's features. Without these columns, credit
--          increments fail silently (Supabase returns null, app
--          continues working but credits don't persist).
--
-- CONTEXT: creditSystem.js already references these 3 keys in
--          TIER_LIMITS, featureNameToDb(), and getUsageStats().
--          This migration makes the DB match the app code.
--
-- SAFE TO RUN: Uses IF NOT EXISTS — idempotent, won't break
--              if columns already exist.
--
-- HOW TO APPLY:
--   1. Go to Supabase Dashboard → SQL Editor
--   2. Paste this entire file
--   3. Click "Run"
--   4. Verify with: SELECT column_name FROM information_schema.columns
--      WHERE table_name = 'usage_tracking' AND column_name LIKE 'nursing_%';
--
-- ============================================================

-- Add 3 new columns for nursing credit pools
-- Default 0 = new billing period starts with zero usage (matches initializeUsageTracking())
ALTER TABLE usage_tracking
  ADD COLUMN IF NOT EXISTS nursing_practice integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nursing_mock integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nursing_sbar integer DEFAULT 0;

-- ============================================================
-- VERIFICATION QUERY (run after migration to confirm)
-- ============================================================
-- Expected: 3 rows (nursing_practice, nursing_mock, nursing_sbar)
--
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'usage_tracking'
--   AND column_name LIKE 'nursing_%'
-- ORDER BY column_name;

-- ============================================================
-- ROLLBACK (if needed — removes the columns entirely)
-- ============================================================
-- ALTER TABLE usage_tracking
--   DROP COLUMN IF EXISTS nursing_practice,
--   DROP COLUMN IF EXISTS nursing_mock,
--   DROP COLUMN IF EXISTS nursing_sbar;

-- ============================================================
-- CREDIT LIMITS REFERENCE (matches creditSystem.js TIER_LIMITS)
-- ============================================================
--
-- | Feature          | DB Column         | Free  | Pro       | Beta      |
-- |------------------|-------------------|-------|-----------|-----------|
-- | Quick Practice   | nursing_practice  | 5/mo  | Unlimited | Unlimited |
-- | Mock Interview   | nursing_mock      | 3/mo  | Unlimited | Unlimited |
-- | SBAR Drill       | nursing_sbar      | 3/mo  | Unlimited | Unlimited |
-- | AI Coach         | (Pro-gated, no column needed — blocked in UI) |
-- | Confidence Build | (Pro-gated, no column needed — blocked in UI) |
-- | Offer Negotiation| (Pro-gated, no column needed — blocked in UI) |
-- | Flashcards       | (Free forever — no credits)                   |
-- | Command Center   | (Free forever — no credits)                   |
-- | Resources        | (Free forever — no credits)                   |
--
-- NOTE: Pro-gated features are blocked at the component level in
--       NursingTrackApp.jsx (ProGateScreen) — they never reach
--       the credit system at all. No DB columns needed.
