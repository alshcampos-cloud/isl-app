-- ============================================================
-- IAI AGENT SYSTEM — Database Tables
-- Phase 1: Health Monitor + PM Agent
-- ============================================================
-- These tables are WRITE targets for agents only.
-- Agents READ from IAI production tables but NEVER write to them.

-- ── Agent Health Events ─────────────────────────────────────
-- Every SLO check result from the Health Monitor
CREATE TABLE IF NOT EXISTS public.agent_health_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  check_name text NOT NULL,
  slo_key text NOT NULL,
  sli_value numeric,
  slo_target numeric,
  slo_unit text,
  status text NOT NULL CHECK (status IN ('pass', 'fail', 'error', 'skip')),
  tier text NOT NULL CHECK (tier IN ('CRITICAL', 'HIGH', 'MONITOR')),
  latency_ms int,
  details jsonb DEFAULT '{}',
  error_message text
);

CREATE INDEX idx_health_events_created ON public.agent_health_events (created_at DESC);
CREATE INDEX idx_health_events_check ON public.agent_health_events (check_name, created_at DESC);
CREATE INDEX idx_health_events_status ON public.agent_health_events (status, tier, created_at DESC);

ALTER TABLE public.agent_health_events ENABLE ROW LEVEL SECURITY;

-- ── Agent Alerts ────────────────────────────────────────────
-- Every alert fired by Health Monitor
CREATE TABLE IF NOT EXISTS public.agent_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MONITOR')),
  title text NOT NULL,
  message text,
  slo_key text,
  sli_value numeric,
  slo_target numeric,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by text,
  notification_sent boolean DEFAULT false,
  notification_channel text,
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX idx_alerts_unresolved ON public.agent_alerts (resolved, severity, created_at DESC);
CREATE INDEX idx_alerts_created ON public.agent_alerts (created_at DESC);

ALTER TABLE public.agent_alerts ENABLE ROW LEVEL SECURITY;

-- ── Agent Test Runs ─────────────────────────────────────────
-- Every test suite execution from the Tester Agent
CREATE TABLE IF NOT EXISTS public.agent_test_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  deploy_version text,
  deploy_commit text,
  trigger_type text CHECK (trigger_type IN ('deploy', 'manual', 'scheduled')),
  total_tests int DEFAULT 0,
  passed int DEFAULT 0,
  failed int DEFAULT 0,
  skipped int DEFAULT 0,
  duration_ms int,
  overall_status text CHECK (overall_status IN ('pass', 'fail', 'error')),
  test_results jsonb DEFAULT '[]',
  error_message text
);

CREATE INDEX idx_test_runs_created ON public.agent_test_runs (created_at DESC);
CREATE INDEX idx_test_runs_status ON public.agent_test_runs (overall_status, created_at DESC);

ALTER TABLE public.agent_test_runs ENABLE ROW LEVEL SECURITY;

-- ── Agent PM Reports ────────────────────────────────────────
-- Weekly digest JSON from PM Agent
CREATE TABLE IF NOT EXISTS public.agent_pm_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  report_type text NOT NULL CHECK (report_type IN ('weekly', 'alert-triggered', 'manual')),
  period_start timestamptz,
  period_end timestamptz,
  summary text,
  slo_status jsonb DEFAULT '{}',
  okr_progress jsonb DEFAULT '{}',
  alerts_fired int DEFAULT 0,
  proposals_created int DEFAULT 0,
  key_metrics jsonb DEFAULT '{}',
  full_report jsonb DEFAULT '{}',
  delivered boolean DEFAULT false,
  delivered_at timestamptz
);

CREATE INDEX idx_pm_reports_created ON public.agent_pm_reports (created_at DESC);

ALTER TABLE public.agent_pm_reports ENABLE ROW LEVEL SECURITY;

-- ── Agent Proposals ─────────────────────────────────────────
-- Fix proposals from PM Agent, awaiting Lucas approval
CREATE TABLE IF NOT EXISTS public.agent_proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  title text NOT NULL,
  context text NOT NULL,
  slo_breached text,
  severity text NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MONITOR')),
  suggested_fix text NOT NULL,
  files_affected text[] DEFAULT '{}',
  estimated_risk text CHECK (estimated_risk IN ('LOW', 'MEDIUM', 'HIGH')),
  reviewed_at timestamptz,
  reviewed_by text,
  rejection_reason text,
  implementation_notes text
);

CREATE INDEX idx_proposals_status ON public.agent_proposals (status, created_at DESC);

ALTER TABLE public.agent_proposals ENABLE ROW LEVEL SECURITY;

-- ── Agent Logs ──────────────────────────────────────────────
-- Structured log entries from all agents
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  agent text NOT NULL,
  level text NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  duration_ms int,
  session_id text
);

CREATE INDEX idx_agent_logs_created ON public.agent_logs (created_at DESC);
CREATE INDEX idx_agent_logs_agent ON public.agent_logs (agent, level, created_at DESC);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ────────────────────────────────────────────
-- Service role gets full access (agents use service role key)
-- No user-facing access to agent tables

DO $$ BEGIN
  CREATE POLICY "service_role_full_agent_health" ON public.agent_health_events FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role_full_agent_alerts" ON public.agent_alerts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role_full_agent_tests" ON public.agent_test_runs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role_full_agent_reports" ON public.agent_pm_reports FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role_full_agent_proposals" ON public.agent_proposals FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "service_role_full_agent_logs" ON public.agent_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Auto-prune old logs (keep 30 days) ──────────────────────
CREATE OR REPLACE FUNCTION public.prune_agent_logs()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.agent_logs WHERE created_at < now() - interval '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prune_agent_logs ON public.agent_logs;
CREATE TRIGGER trigger_prune_agent_logs
  AFTER INSERT ON public.agent_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.prune_agent_logs();
