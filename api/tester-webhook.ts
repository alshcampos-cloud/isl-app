/**
 * tester-webhook.ts — Vercel Deploy Webhook Endpoint
 *
 * Receives a webhook from Vercel when a new deployment completes.
 * Activates the Tester Agent to run the full critical path test suite.
 *
 * Setup: Configure in Vercel Project Settings > Git > Deploy Hooks
 * Or use Vercel's deployment webhook: https://vercel.com/docs/webhooks
 *
 * Phase 2 — Tester Agent is scaffolded but not fully built yet.
 * This endpoint receives the webhook and logs it for Phase 2 activation.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const WEBHOOK_SECRET = process.env.TESTER_WEBHOOK_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: verify webhook signature
  // Vercel deploy webhooks don't have a standard signature mechanism,
  // but we can use a shared secret in the URL or header
  const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
  if (WEBHOOK_SECRET && providedSecret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body || {};
  const deploymentId = body.payload?.deployment?.id || body.deployment?.id || 'unknown';
  const deploymentUrl = body.payload?.deployment?.url || body.deployment?.url || '';
  const deploymentState = body.payload?.deployment?.state || body.type || 'unknown';

  console.log(`[tester-webhook] Deploy event: ${deploymentState} | ID: ${deploymentId}`);

  // Only run tests on successful deployments
  if (deploymentState !== 'deployment.succeeded' && deploymentState !== 'ready') {
    return res.status(200).json({
      received: true,
      action: 'skipped',
      reason: `Deploy state is ${deploymentState}, not ready/succeeded`,
    });
  }

  try {
    // Phase 2: Activate Tester Agent
    // For now, log the event to agent_test_runs as a placeholder
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    await supabase.from('agent_test_runs').insert({
      deploy_version: deploymentId,
      deploy_commit: body.payload?.deployment?.meta?.githubCommitSha || null,
      trigger_type: 'deploy',
      total_tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      overall_status: 'pass', // placeholder until Tester Agent is built
      test_results: [{ note: 'Tester Agent Phase 2 — webhook received, tests not yet implemented' }],
    });

    await supabase.from('agent_logs').insert({
      agent: 'tester-agent',
      level: 'info',
      message: `Deploy webhook received for ${deploymentId}`,
      metadata: { deploymentId, deploymentUrl, deploymentState },
    });

    return res.status(200).json({
      received: true,
      action: 'logged',
      deploymentId,
      note: 'Tester Agent Phase 2 — webhook logged, full test suite coming soon',
    });
  } catch (error: any) {
    console.error('[tester-webhook] Error:', error.message);
    return res.status(500).json({
      received: true,
      action: 'error',
      error: error.message,
    });
  }
}
