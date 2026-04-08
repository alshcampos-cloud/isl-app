/**
 * agent-cron.ts — Vercel Cron Endpoint
 *
 * Triggers Health Monitor every 15 minutes and PM Agent weekly.
 *
 * Vercel cron config (in vercel.json):
 * {
 *   "crons": [
 *     { "path": "/api/agent-cron", "schedule": "*/15 * * * *" }
 *   ]
 * }
 *
 * Query params:
 *   ?agent=health-monitor  (default, runs on every cron tick)
 *   ?agent=pm-agent (with mode=weekly, runs Monday 8am PT only)
 *   ?agent=pm-agent (with mode=alert, triggered by health monitor breach)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Auth: Vercel cron sends CRON_SECRET header
const CRON_SECRET = process.env.CRON_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a legitimate cron call
  const authHeader = req.headers.authorization;
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const agent = (req.query.agent as string) || 'health-monitor';
  const mode = (req.query.mode as string) || 'scheduled';
  const startTime = Date.now();

  try {
    if (agent === 'health-monitor') {
      // Dynamic import to keep cold starts fast
      const { runHealthMonitor } = await import('../agents/health-monitor/index');
      const result = await runHealthMonitor();

      return res.status(200).json({
        agent: 'health-monitor',
        status: result.status,
        duration_ms: Date.now() - startTime,
        checks: result.details,
      });
    }

    if (agent === 'pm-agent') {
      const { runPMAgent } = await import('../agents/pm-agent/index');
      const result = await runPMAgent({ mode: mode as 'weekly' | 'alert-triggered' });

      return res.status(200).json({
        agent: 'pm-agent',
        mode,
        status: result.status,
        duration_ms: Date.now() - startTime,
        summary: result.summary,
      });
    }

    return res.status(400).json({ error: `Unknown agent: ${agent}` });
  } catch (error: any) {
    console.error(`[agent-cron] ${agent} failed:`, error.message);
    return res.status(500).json({
      agent,
      status: 'error',
      error: error.message,
      duration_ms: Date.now() - startTime,
    });
  }
}
