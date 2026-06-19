-- ============================================================================
-- Content Engine v2 — Phase 1 Database Migrations
-- ============================================================================
-- Apply via: supabase db push --linked
--   OR fallback per Battle Scar #43: supabase db query --linked --file <this>
--
-- Target schema: supabase/migrations/20260524000001_content_engine_v2_phase1.sql
-- Rename the file to match supabase migrations naming convention before applying.
--
-- Idempotent: uses IF NOT EXISTS / DROP IF EXISTS for safe re-runs.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extend blog_posts table with content-engine-v2 columns
-- ---------------------------------------------------------------------------

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_alt_text TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_variant TEXT,
  ADD COLUMN IF NOT EXISTS primary_citation_id TEXT,
  ADD COLUMN IF NOT EXISTS cluster TEXT,
  ADD COLUMN IF NOT EXISTS unique_element TEXT,
  ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS legal_review_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_review_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_review_notes TEXT;

-- Constraint: an article flagged for legal review cannot publish until approved
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_legal_review_gate;
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_legal_review_gate
  CHECK (
    legal_review_required = false
    OR legal_review_approved_at IS NOT NULL
    OR published_at IS NULL
  );

-- Index for citation rotation lookup (last 4 articles' primary_citation_id)
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_citation
  ON blog_posts (published_at DESC, primary_citation_id)
  WHERE published_at IS NOT NULL;

-- Index for cluster-based queries (cannibalization checks, cluster siblings)
CREATE INDEX IF NOT EXISTS idx_blog_posts_cluster
  ON blog_posts (cluster, published_at DESC);

-- Constraint: primary_citation_id must match CIT-NNN format (if not null)
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_primary_citation_id_format;
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_primary_citation_id_format
  CHECK (primary_citation_id IS NULL OR primary_citation_id ~ '^CIT-[0-9]{3,4}$');

-- ---------------------------------------------------------------------------
-- 2. failed_generations table (error logging / dead-letter)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS failed_generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id        TEXT NOT NULL,
  step            TEXT NOT NULL,                  -- e.g., 'claude_text_gen', 'dalle_image_gen', 'supabase_insert'
  error_message   TEXT NOT NULL,
  error_code      TEXT,                            -- HTTP status or model error code if known
  retry_count     INTEGER NOT NULL DEFAULT 0,
  request_context JSONB DEFAULT '{}'::jsonb,       -- model name, prompt hash, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_failed_generations_brief
  ON failed_generations (brief_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_failed_generations_step_recent
  ON failed_generations (step, created_at DESC);

-- RLS: only service role can read/write failed_generations
ALTER TABLE failed_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access_failed_generations" ON failed_generations;
CREATE POLICY "service_role_full_access_failed_generations"
  ON failed_generations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3. rejected_drafts table (editorial-pass rejection log)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rejected_drafts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id          TEXT NOT NULL,
  draft_body        TEXT NOT NULL,                 -- full article text for system-prompt-improvement review
  rejection_reasons TEXT[] NOT NULL DEFAULT '{}',  -- categories from BRAND_FACTS / strategy doc Section 8
  rejection_notes   TEXT,                          -- free-text from Jacob
  rejected_by       TEXT NOT NULL,                 -- 'jacob' for now, future: actual user IDs
  rejected_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  draft_metadata    JSONB DEFAULT '{}'::jsonb      -- citation, cluster, image_url, etc. at time of rejection
);

CREATE INDEX IF NOT EXISTS idx_rejected_drafts_brief
  ON rejected_drafts (brief_id, rejected_at DESC);

CREATE INDEX IF NOT EXISTS idx_rejected_drafts_reasons
  ON rejected_drafts USING gin (rejection_reasons);

ALTER TABLE rejected_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access_rejected_drafts" ON rejected_drafts;
CREATE POLICY "service_role_full_access_rejected_drafts"
  ON rejected_drafts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 4. brief_rejections_summary view (for the 3-strike auto-delete logic)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW brief_rejections_summary AS
SELECT
  brief_id,
  COUNT(*) AS rejection_count,
  MAX(rejected_at) AS last_rejected_at,
  array_agg(DISTINCT unnest_reasons) AS distinct_reasons
FROM rejected_drafts,
     LATERAL unnest(rejection_reasons) AS unnest_reasons
GROUP BY brief_id;

-- ---------------------------------------------------------------------------
-- 5. content_engine_config table (Supabase-synced BRAND_FACTS + CITATION_LIBRARY)
-- ---------------------------------------------------------------------------
-- Per strategy doc decision: agent reads BRAND_FACTS.md + CITATION_LIBRARY.md
-- from a Supabase table that's synced from the repo on every push to main.
-- This table is the destination of that sync.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS content_engine_config (
  key         TEXT PRIMARY KEY,                    -- 'brand_facts' or 'citation_library' or 'image_prompt_template'
  content     TEXT NOT NULL,                       -- full markdown content
  version     TEXT NOT NULL,                       -- semver string from doc frontmatter
  source_path TEXT NOT NULL,                       -- 'docs/content_engine/BRAND_FACTS.md' etc.
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  git_sha     TEXT                                 -- commit SHA the content came from
);

ALTER TABLE content_engine_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access_content_engine_config" ON content_engine_config;
CREATE POLICY "service_role_full_access_content_engine_config"
  ON content_engine_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon role can READ (for the publishing endpoint to verify byline/schema decisions)
DROP POLICY IF EXISTS "anon_read_content_engine_config" ON content_engine_config;
CREATE POLICY "anon_read_content_engine_config"
  ON content_engine_config
  FOR SELECT
  TO anon
  USING (true);

-- ---------------------------------------------------------------------------
-- 6. Constraint enforcement on blog_posts.cluster
-- ---------------------------------------------------------------------------
-- Cluster must match one of the canonical 7 from CONTENT_ENGINE_V2_STRATEGY.md
-- Section 7. Prevents typos and orphan clusters that break cluster routing.
-- ---------------------------------------------------------------------------

ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_cluster_canonical;
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_cluster_canonical
  CHECK (cluster IS NULL OR cluster IN (
    'star-method',
    'tell-me-about-yourself',
    'behavioral-interview',
    'mock-interview-practice',
    'ethics',
    'interview-anxiety',
    'industry-specific'
  ));

-- ---------------------------------------------------------------------------
-- VERIFICATION QUERIES (run after migration to confirm)
-- ---------------------------------------------------------------------------
-- Confirm new columns exist:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'blog_posts'
--     AND column_name IN ('hero_image_url', 'linkedin_variant', 'primary_citation_id',
--                          'cluster', 'unique_element', 'internal_links');
--
-- Confirm new tables exist:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN ('failed_generations', 'rejected_drafts', 'content_engine_config');
--
-- Confirm constraints active:
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'blog_posts'::regclass
--     AND conname IN ('blog_posts_primary_citation_id_format', 'blog_posts_cluster_canonical');
-- ---------------------------------------------------------------------------
