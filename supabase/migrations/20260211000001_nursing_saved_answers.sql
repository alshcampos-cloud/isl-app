-- Nursing Track: Saved Answers
-- Allows users to save their best answer for each question in the Question Bank.
-- UNIQUE(user_id, question_code) enables upsert pattern.

CREATE TABLE IF NOT EXISTS nursing_saved_answers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_code TEXT NOT NULL,
  answer_text  TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint for upsert
ALTER TABLE nursing_saved_answers
  ADD CONSTRAINT nursing_saved_answers_user_question_unique
  UNIQUE (user_id, question_code);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_nursing_saved_answers_user
  ON nursing_saved_answers(user_id);

-- RLS
ALTER TABLE nursing_saved_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved answers"
  ON nursing_saved_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved answers"
  ON nursing_saved_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved answers"
  ON nursing_saved_answers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
