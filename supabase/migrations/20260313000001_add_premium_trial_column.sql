-- Add premium_trial_ends column to user_profiles
-- Used for the 24-hour premium trial given to all new signups.
-- When set and in the future, resolveEffectiveTier() returns 'trial' tier
-- which gives full access to all features including HD audio.
-- After 24 hours, the column stays but the timestamp is in the past,
-- so resolveEffectiveTier() falls through to 'free'.

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS premium_trial_ends TIMESTAMPTZ DEFAULT NULL;

-- Index for quick lookups (optional, helps if querying active trials)
CREATE INDEX IF NOT EXISTS idx_user_profiles_premium_trial_ends
ON user_profiles (premium_trial_ends)
WHERE premium_trial_ends IS NOT NULL;
