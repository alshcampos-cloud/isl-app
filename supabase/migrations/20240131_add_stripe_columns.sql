-- Migration: Add Stripe subscription columns to user_profiles
-- Run this in your Supabase SQL Editor

-- Add Stripe-related columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_id
ON user_profiles(subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id
ON user_profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status
ON user_profiles(subscription_status);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.subscription_id IS 'Stripe subscription ID (sub_xxx)';
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe customer ID (cus_xxx)';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Subscription status: active, past_due, canceled, inactive';

-- Ensure updated_at column exists
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
