-- Jacob #2 fix (2026-05-10): add interview_coach column to usage_tracking.
--
-- Server gate at supabase/functions/ai-feedback/index.ts:686 reads
-- `interview_coach` column to enforce free-tier limits on the main-page
-- Interview Coach. Column does not exist in any prior migration → reads
-- as undefined → coerced to 0 → gate at line 694 always passes.
--
-- This migration creates the column with a sensible default. Idempotent
-- via IF NOT EXISTS so re-runs are safe.
--
-- Coupling: this migration MUST land BEFORE the AIInterviewCoach.jsx
-- code-side change ships, otherwise client-side increments target a
-- non-existent column and silently fail (incrementUsage catches errors)
-- → main-page AI Coach effectively uncapped during the gap.

ALTER TABLE usage_tracking
  ADD COLUMN IF NOT EXISTS interview_coach INTEGER DEFAULT 0;

COMMENT ON COLUMN usage_tracking.interview_coach IS
  'Bank STAR Coach (AIInterviewCoach.jsx) sessions used this period. Free tier: 5/mo. Separate from answer_assistant which counts confidence-brief, portfolio-analysis, and Main-Page Interview Coach until the #1+#6 cluster fix lands.';

-- Reload PostgREST schema cache so the new column is immediately visible
-- to the Edge Functions and client supabase-js queries without a restart.
NOTIFY pgrst, 'reload schema';
