-- Migration: Add archetype columns to user_profiles
-- Required for ArchetypeCTA and ArchetypeOnboarding components
-- Run on production: 2026-02-16

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS archetype TEXT,
ADD COLUMN IF NOT EXISTS onboarding_field TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('archetype', 'onboarding_field', 'onboarding_completed_at');
