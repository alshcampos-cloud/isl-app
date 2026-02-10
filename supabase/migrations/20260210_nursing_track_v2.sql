-- ============================================================
-- NURSING TRACK — Migration V2: Schema Updates for Phase 9 (Offer Coach)
-- InterviewAnswers.AI — NurseInterviewPro Track
-- ============================================================
-- Created: 2026-02-10  |  Phase 6  |  Branch: feature/nursing-track
--
-- DEPENDS ON: 20260210_nursing_track_tables.sql (must run first)
--
-- CHANGES:
--   1. Expand nursing_practice_sessions.mode CHECK to include
--      'offer-coach' and 'confidence-builder'
--   2. Add extra_scores JSONB column for non-SBAR scoring
--      (negotiation 5-dimension scores, future analytics)
--
-- WHY SEPARATE FILE:
--   The v1 migration may already be applied to production.
--   This file is additive — safe to run on top of v1.
--   Battle Scar #14: Rollback section at bottom.
-- ============================================================


-- ============================================================
-- 1. EXPAND MODE CHECK CONSTRAINT
-- ============================================================
-- The v1 migration defined:
--   CHECK (mode IN ('mock-interview', 'practice', 'sbar-drill', 'ai-coach'))
--
-- Phase 8 added Confidence Builder and Phase 9 added Offer Coach.
-- Both need to persist session records.
--
-- PostgreSQL requires DROP + ADD for CHECK constraint changes.
-- ============================================================

-- Drop the existing constraint (name may vary — Supabase auto-names it)
-- Try the explicit name first, then fall back to the generated name pattern.
DO $$
BEGIN
  -- Attempt to drop by the most likely generated name
  ALTER TABLE nursing_practice_sessions
    DROP CONSTRAINT IF EXISTS nursing_practice_sessions_mode_check;
EXCEPTION
  WHEN undefined_object THEN
    -- Constraint doesn't exist by that name — that's OK, we'll create it fresh
    NULL;
END $$;

-- Re-create with expanded mode list
ALTER TABLE nursing_practice_sessions
  ADD CONSTRAINT nursing_practice_sessions_mode_check
  CHECK (mode IN ('mock-interview', 'practice', 'sbar-drill', 'ai-coach', 'offer-coach', 'confidence-builder'));


-- ============================================================
-- 2. ADD extra_scores COLUMN
-- ============================================================
-- Stores non-SBAR scoring data as JSONB.
-- Offer Coach uses 5 dimensions: confidence, professionalism,
-- specificity, value_framing, completeness (each 1-5).
-- Kept separate from sbar_scores for clarity and cleaner analytics queries.
--
-- Example value for offer-coach:
-- {
--   "confidence": 4,
--   "professionalism": 5,
--   "specificity": 3,
--   "value_framing": 4,
--   "completeness": 4,
--   "scenario_id": "neg-base-salary",
--   "scenario_category": "base-salary"
-- }
-- ============================================================

ALTER TABLE nursing_practice_sessions
  ADD COLUMN IF NOT EXISTS extra_scores JSONB;

-- Index for analytics queries on extra_scores (GIN for JSONB containment)
CREATE INDEX IF NOT EXISTS idx_nps_extra_scores
  ON nursing_practice_sessions USING GIN (extra_scores)
  WHERE extra_scores IS NOT NULL;


-- ============================================================
-- ROLLBACK (Battle Scar #14 — reversible)
-- ============================================================
-- To undo this migration:
--
-- ALTER TABLE nursing_practice_sessions DROP COLUMN IF EXISTS extra_scores;
-- ALTER TABLE nursing_practice_sessions DROP CONSTRAINT IF EXISTS nursing_practice_sessions_mode_check;
-- ALTER TABLE nursing_practice_sessions ADD CONSTRAINT nursing_practice_sessions_mode_check
--   CHECK (mode IN ('mock-interview', 'practice', 'sbar-drill', 'ai-coach'));
-- ============================================================
