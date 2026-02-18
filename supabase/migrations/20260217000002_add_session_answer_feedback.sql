-- ============================================================
-- MIGRATION: Add user_answer + ai_feedback to nursing_practice_sessions
-- InterviewAnswers.AI — Session History Enhancement
-- ============================================================
--
-- PURPOSE: Persist the user's answer text and AI feedback text
-- alongside the existing score data. This enables:
--   1. Users can review past answers and see how they've improved
--   2. Users can re-read AI coaching recommendations
--   3. AI can reference previous feedback for personalized coaching
--
-- SAFE TO RUN: Uses IF NOT EXISTS — idempotent.
-- BACKWARD COMPATIBLE: Both columns are nullable with NULL default.
--   Existing rows are unaffected. Old code that doesn't set these
--   columns will continue to work (inserts NULL).
--
-- ============================================================

ALTER TABLE nursing_practice_sessions
  ADD COLUMN IF NOT EXISTS user_answer TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_feedback TEXT DEFAULT NULL;

COMMENT ON COLUMN nursing_practice_sessions.user_answer IS 'The user''s answer text submitted for this practice session';
COMMENT ON COLUMN nursing_practice_sessions.ai_feedback IS 'The AI coaching feedback returned for this practice session';

-- ============================================================
-- VERIFICATION QUERIES (run after migration to confirm)
-- ============================================================

-- Check columns exist:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'nursing_practice_sessions'
--   AND column_name IN ('user_answer', 'ai_feedback')
-- ORDER BY column_name;
--
-- Expected: 2 rows

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
-- ALTER TABLE nursing_practice_sessions
--   DROP COLUMN IF EXISTS user_answer,
--   DROP COLUMN IF EXISTS ai_feedback;
