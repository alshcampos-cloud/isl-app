-- ============================================================
-- NURSING TRACK — Database Schema Design
-- InterviewAnswers.AI — Clinical Content Library
-- ============================================================
-- ⚠️ This is a DESIGN DOCUMENT, not a migration.
-- Review before applying to Supabase.
-- ============================================================

-- ============================================================
-- 1. NURSING SPECIALTIES (lookup table)
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_specialties (
  id TEXT PRIMARY KEY,                -- 'ed', 'icu', 'or', 'ld', etc.
  name TEXT NOT NULL,                 -- 'Emergency Department'
  short_name TEXT NOT NULL,           -- 'ED'
  description TEXT,
  icon TEXT,                          -- emoji or icon name
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data
INSERT INTO nursing_specialties (id, name, short_name, description, icon, display_order) VALUES
  ('ed',      'Emergency Department',      'ED',       'Fast-paced triage, trauma, and acute care',                          '🚨', 1),
  ('icu',     'Intensive Care Unit',        'ICU',      'Critical care, ventilator management, hemodynamic monitoring',       '🫀', 2),
  ('or',      'Operating Room',             'OR',       'Perioperative care, surgical procedures, sterile technique',         '🔬', 3),
  ('ld',      'Labor & Delivery',           'L&D',      'Obstetric care, fetal monitoring, postpartum support',              '👶', 4),
  ('peds',    'Pediatrics',                 'Peds',     'Child-specific assessment, family-centered care',                   '🧸', 5),
  ('psych',   'Psych / Behavioral Health',  'Psych',    'Therapeutic communication, crisis intervention, de-escalation',     '🧠', 6),
  ('medsurg', 'Med-Surg',                   'Med-Surg', 'General medical-surgical nursing, high patient ratios',             '🏥', 7),
  ('travel',  'Travel Nursing',             'Travel',   'Adaptability, quick onboarding, multi-facility experience',         '✈️', 8);


-- ============================================================
-- 2. CLINICAL FRAMEWORKS (lookup table)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinical_frameworks (
  id TEXT PRIMARY KEY,                -- 'NCSBN_CJM', 'SBAR', etc.
  name TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,               -- Publishing body / organization
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO clinical_frameworks (id, name, description, source) VALUES
  ('NCSBN_CJM',       'NCSBN Clinical Judgment Model',  'Recognize cues → Analyze cues → Prioritize hypotheses → Generate solutions → Take action → Evaluate outcomes', 'National Council of State Boards of Nursing'),
  ('SBAR',            'SBAR Communication',              'Situation → Background → Assessment → Recommendation',                                                         'Institute for Healthcare Improvement'),
  ('NURSING_PROCESS', 'Nursing Process (ADPIE)',          'Assessment → Diagnosis → Planning → Implementation → Evaluation',                                               'American Nurses Association'),
  ('MASLOWS',         'Maslow''s Hierarchy of Needs',    'Physiological → Safety → Love/Belonging → Esteem → Self-Actualization',                                         'Applied to patient prioritization'),
  ('ABC',             'ABC Prioritization',               'Airway → Breathing → Circulation',                                                                              'Emergency Nurses Association / AHA');


-- ============================================================
-- 3. NURSING QUESTIONS (the content library)
-- ⚠️ WALLED GARDEN: All content must be human-validated
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Core question data (mirrors ISL question structure)
  question_text TEXT NOT NULL,
  category TEXT NOT NULL,             -- 'Behavioral', 'Clinical Judgment', 'Communication', 'Motivation'
  priority TEXT DEFAULT 'Medium',     -- 'High', 'Medium', 'Low'

  -- Nursing-specific fields
  specialty_id TEXT REFERENCES nursing_specialties(id),  -- NULL = general (all specialties)
  difficulty TEXT DEFAULT 'intermediate',                  -- 'beginner', 'intermediate', 'advanced'
  clinical_framework_id TEXT REFERENCES clinical_frameworks(id),

  -- STAR coaching support
  keywords TEXT[] DEFAULT '{}',       -- Keywords for matching in Live Prompter
  bullets TEXT[] DEFAULT '{}',        -- STAR framework bullet points
  follow_ups TEXT[] DEFAULT '{}',     -- Follow-up questions

  -- ⚠️ CLINICAL CONTENT METADATA (non-negotiable)
  author TEXT NOT NULL,               -- Who wrote this question
  reviewer TEXT,                      -- Who reviewed/approved it
  clinical_framework_source TEXT,     -- Published source citation
  review_date TIMESTAMPTZ,           -- When it was last reviewed
  content_status TEXT DEFAULT 'draft' CHECK (content_status IN ('placeholder', 'draft', 'reviewed', 'approved')),

  -- Housekeeping
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast specialty filtering
CREATE INDEX idx_nursing_questions_specialty ON nursing_questions(specialty_id);
CREATE INDEX idx_nursing_questions_category ON nursing_questions(category);
CREATE INDEX idx_nursing_questions_status ON nursing_questions(content_status);
CREATE INDEX idx_nursing_questions_difficulty ON nursing_questions(difficulty);


-- ============================================================
-- 4. USER NURSING PROFILE
-- Tracks which specialty a user is targeting + preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_specialty_id TEXT REFERENCES nursing_specialties(id),
  experience_level TEXT DEFAULT 'new_grad',   -- 'new_grad', 'early_career', 'experienced', 'travel'
  target_role TEXT,                            -- 'Staff Nurse', 'Charge Nurse', 'NP', etc.

  -- Preferences
  preferred_difficulty TEXT DEFAULT 'intermediate',

  -- Tracking
  total_sessions INT DEFAULT 0,
  total_questions_practiced INT DEFAULT 0,
  last_session_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 5. NURSING PRACTICE SESSIONS
-- Records of individual practice sessions for analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS nursing_practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty_id TEXT REFERENCES nursing_specialties(id),

  session_type TEXT NOT NULL,           -- 'mock-interview', 'practice', 'sbar-drill', 'behavioral'
  questions_attempted INT DEFAULT 0,
  questions_completed INT DEFAULT 0,

  -- AI feedback summary (communication coaching only)
  avg_star_score DECIMAL(3,1),          -- 0-10 STAR structure score
  avg_specificity_score DECIMAL(3,1),   -- 0-10 specificity score
  avg_communication_score DECIMAL(3,1), -- 0-10 overall communication score

  session_duration_seconds INT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user session history
CREATE INDEX idx_nursing_sessions_user ON nursing_practice_sessions(user_id);
CREATE INDEX idx_nursing_sessions_specialty ON nursing_practice_sessions(specialty_id);


-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Users can only see their own data
-- ============================================================

-- Enable RLS
ALTER TABLE nursing_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursing_practice_sessions ENABLE ROW LEVEL SECURITY;

-- nursing_questions: readable by all authenticated users (content is shared)
ALTER TABLE nursing_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nursing questions are readable by authenticated users"
  ON nursing_questions FOR SELECT
  TO authenticated
  USING (is_active = true AND content_status = 'approved');

-- nursing_user_profiles: users can only see/modify their own
CREATE POLICY "Users can view their own nursing profile"
  ON nursing_user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nursing profile"
  ON nursing_user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nursing profile"
  ON nursing_user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- nursing_practice_sessions: users can only see/create their own
CREATE POLICY "Users can view their own nursing sessions"
  ON nursing_practice_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nursing sessions"
  ON nursing_practice_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 7. HELPER VIEWS
-- ============================================================

-- View: Questions with framework details (for the app to consume)
CREATE OR REPLACE VIEW nursing_questions_full AS
SELECT
  nq.*,
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
-- 8. UPDATED_AT TRIGGER (reuse pattern from existing schema)
-- ============================================================
CREATE OR REPLACE FUNCTION update_nursing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nursing_questions_updated_at
  BEFORE UPDATE ON nursing_questions
  FOR EACH ROW EXECUTE FUNCTION update_nursing_updated_at();

CREATE TRIGGER nursing_user_profiles_updated_at
  BEFORE UPDATE ON nursing_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_nursing_updated_at();
