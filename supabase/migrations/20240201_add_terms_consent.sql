-- Add terms consent columns to user_profiles
-- Required for FirstTimeConsent component and App Store compliance

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0';

-- Create index for consent queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_accepted_terms
ON user_profiles(accepted_terms);

-- Comment for documentation
COMMENT ON COLUMN user_profiles.accepted_terms IS 'Whether user accepted Terms of Service and Privacy Policy';
COMMENT ON COLUMN user_profiles.accepted_terms_at IS 'Timestamp when user accepted terms';
COMMENT ON COLUMN user_profiles.terms_version IS 'Version of terms the user accepted';
