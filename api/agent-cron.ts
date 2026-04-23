// agent-cron.ts — Agent trigger endpoint
// Called by Supabase pg_cron every 15 min or manually
// Query: ?agent=health-monitor or ?agent=pm-agent&mode=weekly

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runHealthMonitor } from '../agents/health-monitor/index';
import { runPMAgent } from '../agents/pm-agent/index';

const CRON_SECRET = process.env.CRON_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const agent = (req.query.agent as string) || 'health-monitor';
  const mode = (req.query.mode as string) || 'scheduled';
  const startTime = Date.now();

  try {
    if (agent === 'health-monitor') {
      const result: any = await runHealthMonitor();
      return res.status(200).json({
        agent: 'health-monitor',
        status: result?.status || 'unknown',
        duration_ms: Date.now() - startTime,
        result,
      });
    }

    if (agent === 'pm-agent') {
      const result: any = await runPMAgent({ mode: mode as 'weekly' | 'alert-triggered' });
      return res.status(200).json({
        agent: 'pm-agent',
        mode,
        status: result?.status || 'unknown',
        duration_ms: Date.now() - startTime,
        result,
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
