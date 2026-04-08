/**
 * dashboard-data.ts — Dashboard Data API
 *
 * Serves aggregated agent data to the admin dashboard.
 * Authenticated via Supabase auth token — only whitelisted users can access.
 *
 * Endpoints (via query param):
 *   ?view=health     — Latest health check results
 *   ?view=slo        — SLO status summary
 *   ?view=okr        — OKR progress
 *   ?view=alerts     — Recent alerts
 *   ?view=proposals  — Pending proposals
 *   ?view=metrics    — API usage metrics
 *   ?view=overview   — Everything (default)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ALLOWED_EMAILS = ['alshwenbearcampos@gmail.com'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check — verify the user is whitelisted
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No auth token provided' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');

    // Verify user token
    const userSupabase = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || '');
    const { data: { user }, error: authError } = await userSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user || !ALLOWED_EMAILS.includes(user.email || '')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Use service role for data queries
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const view = (req.query.view as string) || 'overview';
    const data: Record<string, any> = {};

    // Health — latest check results
    if (view === 'health' || view === 'overview') {
      const { data: healthEvents } = await supabase
        .from('agent_health_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      data.health = healthEvents || [];
    }

    // Alerts — recent alerts
    if (view === 'alerts' || view === 'overview') {
      const { data: alerts } = await supabase
        .from('agent_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      data.alerts = alerts || [];

      // Unresolved count
      const { count } = await supabase
        .from('agent_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);
      data.unresolvedAlerts = count || 0;
    }

    // Proposals — pending proposals
    if (view === 'proposals' || view === 'overview') {
      const { data: proposals } = await supabase
        .from('agent_proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      data.proposals = proposals || [];

      const { count } = await supabase
        .from('agent_proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      data.pendingProposals = count || 0;
    }

    // Metrics — API usage
    if (view === 'metrics' || view === 'overview') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: metrics } = await supabase
        .from('api_metrics')
        .select('*')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(100);
      data.metrics = metrics || [];

      // Aggregate cost
      const totalCost = (metrics || []).reduce((sum: number, m: any) =>
        sum + (parseFloat(m.estimated_cost) || 0), 0
      );
      data.totalCost24h = Math.round(totalCost * 1000000) / 1000000;
    }

    // PM Reports — latest reports
    if (view === 'overview') {
      const { data: reports } = await supabase
        .from('agent_pm_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      data.reports = reports || [];
    }

    // Test Runs — latest test results
    if (view === 'overview') {
      const { data: testRuns } = await supabase
        .from('agent_test_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      data.testRuns = testRuns || [];
    }

    return res.status(200).json({
      view,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error: any) {
    console.error('[dashboard-data] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
