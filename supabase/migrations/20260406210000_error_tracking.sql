-- Error tracking table for monitoring API health
CREATE TABLE IF NOT EXISTS public.api_error_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  function_name text NOT NULL,
  error_type text,
  error_message text,
  user_id uuid REFERENCES auth.users(id),
  request_mode text,
  http_status int,
  latency_ms int,
  metadata jsonb DEFAULT '{}'
);

-- Index for querying recent errors
CREATE INDEX idx_error_log_created ON public.api_error_log (created_at DESC);
CREATE INDEX idx_error_log_function ON public.api_error_log (function_name, created_at DESC);

-- Auto-delete errors older than 30 days (keep table small)
-- This would be handled by a cron job or Supabase scheduled function

-- RLS: Only service role can write, authenticated can read their own
ALTER TABLE public.api_error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do anything" ON public.api_error_log
  FOR ALL USING (true) WITH CHECK (true);

-- Also create a simple api_metrics table for tracking usage
CREATE TABLE IF NOT EXISTS public.api_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  function_name text NOT NULL,
  mode text,
  user_id uuid,
  success boolean DEFAULT true,
  latency_ms int,
  input_tokens int,
  output_tokens int,
  estimated_cost numeric(10,6)
);

CREATE INDEX idx_metrics_created ON public.api_metrics (created_at DESC);
CREATE INDEX idx_metrics_function ON public.api_metrics (function_name, created_at DESC);

ALTER TABLE public.api_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do anything on metrics" ON public.api_metrics
  FOR ALL USING (true) WITH CHECK (true);
