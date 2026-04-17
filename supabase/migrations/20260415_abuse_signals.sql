-- Abuse prevention: track device fingerprints and email hashes across account deletions
CREATE TABLE IF NOT EXISTS public.abuse_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint_hash text NOT NULL,
  email_hash text NOT NULL,
  email_domain text NOT NULL,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_abuse_signals_fingerprint ON public.abuse_signals(fingerprint_hash);
CREATE INDEX idx_abuse_signals_email_hash ON public.abuse_signals(email_hash);

ALTER TABLE public.abuse_signals ENABLE ROW LEVEL SECURITY;

-- Add abuse flag to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS abuse_reduced_tier boolean DEFAULT false;

-- RPC: Check for abuse signals before signup
CREATE OR REPLACE FUNCTION public.check_signup_abuse(p_fingerprint text, p_email_hash text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  match_count int;
BEGIN
  SELECT COUNT(*) INTO match_count FROM abuse_signals
  WHERE (fingerprint_hash = p_fingerprint OR email_hash = p_email_hash)
    AND deleted_at IS NOT NULL
    AND deleted_at > now() - interval '30 days';

  RETURN json_build_object(
    'allowed', true,
    'reduced_tier', match_count > 0,
    'reason', CASE WHEN match_count > 0 THEN 'recent_deletion_detected' ELSE null END
  );
END; $$;

GRANT EXECUTE ON FUNCTION public.check_signup_abuse(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_signup_abuse(text, text) TO anon;

-- RPC: Record signup signal
CREATE OR REPLACE FUNCTION public.record_signup_signal(p_fingerprint text, p_email_hash text, p_email_domain text, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO abuse_signals (fingerprint_hash, email_hash, email_domain, user_id)
  VALUES (p_fingerprint, p_email_hash, p_email_domain, p_user_id);
END; $$;

GRANT EXECUTE ON FUNCTION public.record_signup_signal(text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_signup_signal(text, text, text, uuid) TO anon;
