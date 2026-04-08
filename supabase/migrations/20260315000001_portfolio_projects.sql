-- Portfolio cloud sync: stores user portfolio projects for cross-device access.
-- Mirrors localStorage 'isl_portfolio' structure.
-- Pattern: nursing_saved_answers (upsert on UNIQUE constraint, RLS per user).

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,

  -- Core data
  title TEXT NOT NULL DEFAULT '',
  role TEXT DEFAULT '',
  timeframe TEXT DEFAULT '',
  raw_content TEXT DEFAULT '',

  -- AI-analyzed fields
  ai_summary TEXT DEFAULT '',
  key_skills TEXT[] DEFAULT '{}',
  interview_angles TEXT[] DEFAULT '{}',
  star_story TEXT DEFAULT '',
  questions_this_answers JSONB DEFAULT '[]',
  rewritten_bullets TEXT[] DEFAULT '{}',
  walk_through_notes TEXT DEFAULT '',

  -- Metadata
  is_analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT portfolio_projects_user_project_unique UNIQUE (user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_user ON portfolio_projects(user_id);

-- RLS
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own portfolio"
  ON portfolio_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio"
  ON portfolio_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
  ON portfolio_projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio"
  ON portfolio_projects FOR DELETE
  USING (auth.uid() = user_id);
