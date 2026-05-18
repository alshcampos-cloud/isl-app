-- IAI Content Pipeline: Blog Posts table
-- D.R.A.F.T. protocol: NEW table. No existing tables modified.
-- SAFE TO RE-RUN: All statements are idempotent.
--
-- Access model:
--   Anon / authenticated users  -> SELECT published posts only (RLS policy below)
--   Service role key            -> bypasses RLS; used by writing agent and Koda Ops queue
--
-- Requires service role key to run. Alsh runs this once on approval.

CREATE TABLE IF NOT EXISTS blog_posts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  slug             TEXT        NOT NULL,
  body             TEXT        NOT NULL,
  meta_description TEXT,
  keywords         TEXT[],
  status           TEXT        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'approved', 'published', 'rejected')),
  source_brief     JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at     TIMESTAMPTZ,
  reviewed_by      TEXT,
  review_note      TEXT
);

-- Unique slug (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blog_posts_slug_key'
      AND conrelid = 'blog_posts'::regclass
  ) THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS blog_posts_status_idx
  ON blog_posts (status);

CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx
  ON blog_posts (published_at DESC)
  WHERE status = 'published';

-- Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
END $$;

-- Anon and authenticated users can read published posts.
-- All writes require the service role key — no public write policy exists.
CREATE POLICY "Public can read published posts"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
