-- ============================================================
-- NURSING TRACK — Migration: All Tables
-- InterviewAnswers.AI — NurseInterviewPro Track
-- ============================================================
-- Created: 2026-02-10  |  Phase 6  |  Branch: feature/nursing-track
--
-- INSTRUCTIONS:
--   1. Review this file completely before running.
--   2. Run in Supabase SQL Editor or via supabase db push.
--   3. After tables exist, run the seed file: 20260210_nursing_track_seed.sql
--   4. This migration is REVERSIBLE — see DROP section at bottom.
--
-- TABLES:
--   nursing_specialties          — Reference data (9 specialties incl. 'general')
--   clinical_frameworks          — Reference data (5 frameworks)
--   nursing_questions            — Curated content library (walled garden)
--   nursing_user_profiles        — User specialty + preferences
--   nursing_practice_sessions    — Per-question session records (all modes)
--   nursing_flashcard_progress   — Per-question flashcard mastery status
--
-- DATA SHAPE SOURCE: nursingSessionStore.js createXxxSession() functions
-- ============================================================

-- ============================================================
-- 1. NURSING SPECIALTIES (reference/lookup)
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_specialties (
  id TEXT PRIMARY KEY,                -- 'ed', 'icu', 'or', 'ld', 'peds', 'psych', 'medsurg', 'travel'
  name TEXT NOT NULL,                 -- 'Emergency Department'
  short_name TEXT NOT NULL,           -- 'ED'
  description TEXT,
  icon TEXT,                          -- Emoji
  color TEXT,                         -- Tailwind gradient class: 'from-red-500 to-orange-500'
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed specialties (matches NURSING_SPECIALTIES in nursingQuestions.js)
-- 'general' is used for questions that apply to ALL specialties (FK target for seed data)
INSERT INTO nursing_specialties (id, name, short_name, description, icon, color, display_order) VALUES
  ('general', 'General Nursing',            'General',  'Questions applicable to all nursing specialties',                               '🩺', 'from-slate-500 to-gray-500',    0),
  ('ed',      'Emergency Department',       'ED',       'Fast-paced triage, trauma, and acute care',                                    '🚨', 'from-red-500 to-orange-500',    1),
  ('icu',     'Intensive Care Unit',         'ICU',      'Critical care, ventilator management, hemodynamic monitoring',                  '🫀', 'from-blue-600 to-cyan-500',     2),
  ('or',      'Operating Room',              'OR',       'Perioperative care, surgical procedures, sterile technique',                    '🔬', 'from-green-600 to-emerald-500', 3),
  ('ld',      'Labor & Delivery',            'L&D',      'Obstetric care, fetal monitoring, postpartum support',                          '👶', 'from-pink-500 to-rose-400',     4),
  ('peds',    'Pediatrics',                  'Peds',     'Child-specific assessment, family-centered care, developmental milestones',     '🧸', 'from-yellow-500 to-amber-400',  5),
  ('psych',   'Psych / Behavioral Health',   'Psych',    'Therapeutic communication, crisis intervention, de-escalation',                 '🧠', 'from-purple-600 to-violet-500', 6),
  ('medsurg', 'Med-Surg',                    'Med-Surg', 'General medical-surgical nursing, high patient ratios, diverse conditions',     '🏥', 'from-sky-600 to-blue-500',      7),
  ('travel',  'Travel Nursing',              'Travel',   'Adaptability, quick onboarding, multi-facility experience',                     '✈️', 'from-teal-500 to-cyan-400',     8)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. CLINICAL FRAMEWORKS (reference/lookup)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinical_frameworks (
  id TEXT PRIMARY KEY,                -- 'NCSBN_CJM', 'SBAR', etc.
  name TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,
  url TEXT,                           -- Optional link to source
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO clinical_frameworks (id, name, description, source, url) VALUES
  ('NCSBN_CJM',       'NCSBN Clinical Judgment Model',   'Recognize cues → Analyze cues → Prioritize hypotheses → Generate solutions → Take action → Evaluate outcomes', 'National Council of State Boards of Nursing',          'https://www.nclex.com/clinical-judgment-measurement-model.page'),
  ('SBAR',            'SBAR Communication',               'Situation → Background → Assessment → Recommendation',                                                         'Institute for Healthcare Improvement',                   'https://www.ihi.org/resources/Pages/Tools/SBARToolkit.aspx'),
  ('NURSING_PROCESS', 'Nursing Process (ADPIE)',           'Assessment → Diagnosis → Planning → Implementation → Evaluation',                                               'American Nurses Association',                            'https://www.nursingworld.org/'),
  ('MASLOWS',         'Maslow''s Hierarchy of Needs',     'Physiological → Safety → Love/Belonging → Esteem → Self-Actualization',                                         'Public domain — applied to patient prioritization in nursing', NULL),
  ('ABC',             'ABC Prioritization',                'Airway → Breathing → Circulation',                                                                              'American Heart Association / Emergency Nurses Association', 'https://www.heart.org/')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 3. NURSING QUESTIONS (curated content library)
-- ============================================================
-- question_code is the JS-side ID (e.g. 'ng_1', 'ned_1').
-- The app's local nursingQuestions.js uses question_code as the primary key.
-- This table adds a UUID PK for Supabase, with question_code as a UNIQUE lookup.
--
-- response_framework: 'sbar' (clinical scenarios) or 'star' (behavioral)
-- This field drives which scoring rubric the AI uses.
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_code TEXT UNIQUE NOT NULL,   -- Maps to JS 'id' field: 'ng_1', 'ned_1', etc.

  -- Core question data
  question_text TEXT NOT NULL,
  category TEXT NOT NULL,               -- 'Behavioral', 'Clinical Judgment', 'Communication', 'Motivation', 'Technical'
  priority TEXT DEFAULT 'Medium',       -- 'High', 'Medium', 'Low'

  -- Nursing-specific fields
  specialty_id TEXT REFERENCES nursing_specialties(id),  -- NULL or 'general' = all specialties
  difficulty TEXT DEFAULT 'intermediate',                  -- 'beginner', 'intermediate', 'advanced'
  response_framework TEXT NOT NULL DEFAULT 'star',         -- 'sbar' or 'star' — drives AI scoring rubric
  clinical_framework_id TEXT REFERENCES clinical_frameworks(id),  -- NULL = no specific framework

  -- Coaching support arrays
  keywords TEXT[] DEFAULT '{}',
  bullets TEXT[] DEFAULT '{}',
  follow_ups TEXT[] DEFAULT '{}',

  -- Clinical content metadata (walled garden — non-negotiable)
  author TEXT NOT NULL DEFAULT 'InterviewAnswers.AI Content Team',
  reviewer TEXT,
  clinical_framework_source TEXT,       -- Published source citation
  review_date TIMESTAMPTZ,
  content_status TEXT DEFAULT 'draft' CHECK (content_status IN ('placeholder', 'draft', 'reviewed', 'approved')),

  -- Housekeeping
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nq_specialty ON nursing_questions(specialty_id);
CREATE INDEX IF NOT EXISTS idx_nq_category ON nursing_questions(category);
CREATE INDEX IF NOT EXISTS idx_nq_status ON nursing_questions(content_status);
CREATE INDEX IF NOT EXISTS idx_nq_difficulty ON nursing_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_nq_response_framework ON nursing_questions(response_framework);
CREATE INDEX IF NOT EXISTS idx_nq_question_code ON nursing_questions(question_code);


-- ============================================================
-- 4. NURSING USER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_specialty_id TEXT REFERENCES nursing_specialties(id),
  experience_level TEXT DEFAULT 'new_grad',       -- 'new_grad', 'early_career', 'experienced', 'travel'
  target_role TEXT,                                -- 'Staff Nurse', 'Charge Nurse', 'NP', etc.
  preferred_difficulty TEXT DEFAULT 'intermediate',

  -- Aggregate tracking (updated by app on session insert)
  total_sessions INT DEFAULT 0,
  total_questions_practiced INT DEFAULT 0,
  last_session_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 5. NURSING PRACTICE SESSIONS (per-question records)
-- ============================================================
-- This matches the ACTUAL data shape from nursingSessionStore.js:
--   createMockInterviewSession / createPracticeSession / createSBARDrillSession
--
-- Each row = ONE question answered in ONE mode.
-- NOT a session-level aggregate — that's computed client-side via aggregation helpers.
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty_id TEXT REFERENCES nursing_specialties(id),

  -- Session type: matches nursingSessionStore mode field
  mode TEXT NOT NULL CHECK (mode IN ('mock-interview', 'practice', 'sbar-drill', 'ai-coach')),

  -- Question reference (nullable for ai-coach which has no specific question)
  question_code TEXT,                   -- Maps to nursing_questions.question_code or nursingQuestions.js id
  question_text TEXT,                   -- Denormalized for fast reads
  category TEXT,
  response_framework TEXT,              -- 'sbar' or 'star'

  -- Scoring (1-5 scale for mock-interview and practice modes)
  score SMALLINT CHECK (score IS NULL OR (score >= 1 AND score <= 5)),

  -- SBAR component scores (1-10 each, only for sbar-drill mode)
  sbar_scores JSONB,                    -- { "situation": 8, "background": 7, "assessment": 6, "recommendation": 9 }

  -- AI Coach specific (only for ai-coach mode)
  message_count INT,                    -- Number of messages exchanged
  topics_discussed TEXT[],              -- Brief list of topics

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()  -- When this record was created (= session timestamp)
);

CREATE INDEX IF NOT EXISTS idx_nps_user ON nursing_practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_nps_user_mode ON nursing_practice_sessions(user_id, mode);
CREATE INDEX IF NOT EXISTS idx_nps_user_created ON nursing_practice_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_question ON nursing_practice_sessions(question_code);
CREATE INDEX IF NOT EXISTS idx_nps_specialty ON nursing_practice_sessions(specialty_id);


-- ============================================================
-- 6. NURSING FLASHCARD PROGRESS
-- ============================================================
-- Tracks per-question mastery status for the Flashcards mode.
-- Status: 'got-it' or 'need-practice' — matches cardStatus in NursingFlashcards.jsx.
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_flashcard_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_code TEXT NOT NULL,          -- Maps to nursingQuestions.js id

  status TEXT NOT NULL CHECK (status IN ('got-it', 'need-practice')),

  -- Track when status was last changed
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- One status per user per question
  UNIQUE(user_id, question_code)
);

CREATE INDEX IF NOT EXISTS idx_nfp_user ON nursing_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_nfp_user_status ON nursing_flashcard_progress(user_id, status);


-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Reference tables: readable by all authenticated users
ALTER TABLE nursing_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nursing specialties readable by authenticated"
  ON nursing_specialties FOR SELECT TO authenticated USING (true);

ALTER TABLE clinical_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinical frameworks readable by authenticated"
  ON clinical_frameworks FOR SELECT TO authenticated USING (true);

-- Questions: readable by authenticated users (only active + approved in production;
-- during dev/draft phase, show all active questions regardless of status)
ALTER TABLE nursing_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nursing questions readable by authenticated"
  ON nursing_questions FOR SELECT TO authenticated
  USING (is_active = true);

-- User profiles: own data only
ALTER TABLE nursing_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nursing profile"
  ON nursing_user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nursing profile"
  ON nursing_user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nursing profile"
  ON nursing_user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Practice sessions: own data only
ALTER TABLE nursing_practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nursing sessions"
  ON nursing_practice_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nursing sessions"
  ON nursing_practice_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Flashcard progress: own data only
ALTER TABLE nursing_flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcard progress"
  ON nursing_flashcard_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcard progress"
  ON nursing_flashcard_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcard progress"
  ON nursing_flashcard_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- 8. HELPER VIEW (questions with joined framework/specialty data)
-- ============================================================
CREATE OR REPLACE VIEW nursing_questions_full AS
SELECT
  nq.id,
  nq.question_code,
  nq.question_text,
  nq.category,
  nq.priority,
  nq.specialty_id,
  nq.difficulty,
  nq.response_framework,
  nq.clinical_framework_id,
  nq.keywords,
  nq.bullets,
  nq.follow_ups,
  nq.author,
  nq.reviewer,
  nq.clinical_framework_source,
  nq.review_date,
  nq.content_status,
  nq.is_active,
  nq.created_at,
  nq.updated_at,
  ns.name AS specialty_name,
  ns.short_name AS specialty_short_name,
  ns.icon AS specialty_icon,
  cf.name AS framework_name,
  cf.description AS framework_description,
  cf.source AS framework_source
FROM nursing_questions nq
LEFT JOIN nursing_specialties ns ON nq.specialty_id = ns.id
LEFT JOIN clinical_frameworks cf ON nq.clinical_framework_id = cf.id
WHERE nq.is_active = true;


-- ============================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_nursing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nursing_specialties_updated_at
  BEFORE UPDATE ON nursing_specialties
  FOR EACH ROW EXECUTE FUNCTION update_nursing_updated_at();

CREATE TRIGGER trg_nursing_questions_updated_at
  BEFORE UPDATE ON nursing_questions
  FOR EACH ROW EXECUTE FUNCTION update_nursing_updated_at();

CREATE TRIGGER trg_nursing_user_profiles_updated_at
  BEFORE UPDATE ON nursing_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_nursing_updated_at();

CREATE TRIGGER trg_nursing_flashcard_progress_updated_at
  BEFORE UPDATE ON nursing_flashcard_progress
  FOR EACH ROW EXECUTE FUNCTION update_nursing_updated_at();


-- ============================================================
-- ROLLBACK (Battle Scar #14 — migration must be reversible)
-- Run this block to undo the entire migration.
-- Order respects foreign key dependencies.
-- ============================================================
-- DROP VIEW IF EXISTS nursing_questions_full;
-- DROP TABLE IF EXISTS nursing_flashcard_progress;
-- DROP TABLE IF EXISTS nursing_practice_sessions;
-- DROP TABLE IF EXISTS nursing_user_profiles;
-- DROP TABLE IF EXISTS nursing_questions;
-- DROP TABLE IF EXISTS clinical_frameworks;
-- DROP TABLE IF EXISTS nursing_specialties;
-- DROP FUNCTION IF EXISTS update_nursing_updated_at();
