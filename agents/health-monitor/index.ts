/**
 * Health Monitor Agent — Main Orchestrator
 *
 * Runs all 5 health checks in parallel, records results to
 * agent_health_events, fires alerts on SLO breaches, and
 * returns the overall system health status.
 *
 * Checks:
 *   1. Funnel (CTA routing accuracy) — CRITICAL
 *   2. Stripe (webhook delivery) — CRITICAL
 *   3. Supabase (Edge Function error rate + DB) — HIGH
 *   4. Vercel (deployment status) — CRITICAL
 *   5. Claude API (availability + latency) — HIGH
 */

import { createClient } from '@supabase/supabase-js';
import { createLogger } from '../shared/logger';
import { sendAlert } from '../shared/alert';
import { SLO, isSLOBreached } from '../shared/slo-definitions';
import type { CheckResult, AlertSeverity } from '../shared/types';

import { checkFunnel } from './checks/funnel';
import { checkStripe } from './checks/stripe';
import { checkSupabase } from './checks/supabase';
import { checkVercel } from './checks/vercel';
import { checkClaudeAPI } from './checks/claude-api';

// ── Constants ────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';

type OverallStatus = 'healthy' | 'degraded' | 'unhealthy';

interface HealthMonitorResult {
  status: OverallStatus;
  checks: CheckResult[];
  alerts_fired: number;
  duration_ms: number;
  session_id: string;
}

// ── Supabase client ─────────────────────────────────────────────────

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Helpers ──────────────────────────────────────────────────────────

function generateSessionId(): string {
  return `hm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function mapCheckToAlertSeverity(result: CheckResult): AlertSeverity | null {
  if (result.status === 'pass') return null;

  // CRITICAL SLOs get critical alerts on any failure
  const sloKey = result.slo_key;
  if (sloKey) {
    const slo = SLO[sloKey];
    if (slo?.tier === 'CRITICAL' && result.status === 'fail') {
      return 'critical';
    }
    if (slo?.tier === 'HIGH' && result.status === 'fail') {
      return 'high';
    }
  }

  // Degraded status gets medium severity
  if (result.status === 'degraded') return 'medium';

  // Error status (check itself crashed) gets high
  if (result.status === 'error') return 'high';

  return null;
}

function determineOverallStatus(results: CheckResult[]): OverallStatus {
  const hasFail = results.some((r) => r.status === 'fail');
  const hasError = results.some((r) => r.status === 'error');
  const hasDegraded = results.some((r) => r.status === 'degraded');

  if (hasFail || hasError) return 'unhealthy';
  if (hasDegraded) return 'degraded';
  return 'healthy';
}

// ── Record check results to Supabase ────────────────────────────────

async function writeCheckResults(
  results: CheckResult[],
  sessionId: string
): Promise<void> {
  try {
    const supabase = getSupabase();

    const rows = results.map((r) => ({
      ...r,
      session_id: sessionId,
    }));

    const { error } = await supabase
      .from('agent_health_events')
      .insert(rows);

    if (error) {
      console.error(`[health-monitor] Failed to write check results: ${error.message}`);
    }
  } catch (err) {
    console.error(
      `[health-monitor] Error writing check results: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

// ── Fire alerts for breached checks ─────────────────────────────────

async function fireAlerts(
  results: CheckResult[],
  logger: ReturnType<typeof createLogger>
): Promise<number> {
  let alertCount = 0;

  for (const result of results) {
    const severity = mapCheckToAlertSeverity(result);
    if (!severity) continue;

    try {
      const alert = await sendAlert({
        agent: 'health-monitor',
        severity,
        slo_key: result.slo_key,
        title: `${result.check_name} — ${result.status.toUpperCase()}`,
        message: result.message,
        measured_value: result.measured_value,
        threshold_value: result.target_value,
        metadata: result.metadata,
      });

      if (alert) {
        alertCount++;
        logger.warn(`Alert fired: ${result.check_name} (${severity})`, {
          check: result.check_name,
          severity,
        });
      }
      // null means deduplicated — not counted
    } catch (err) {
      logger.error(
        `Failed to fire alert for ${result.check_name}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  return alertCount;
}

// ── Safely run a check (never throws) ───────────────────────────────

async function safeRunCheck(
  name: string,
  fn: () => Promise<CheckResult>,
  logger: ReturnType<typeof createLogger>
): Promise<CheckResult> {
  try {
    return await fn();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error(`Check "${name}" threw an unhandled error: ${errorMsg}`);

    return {
      agent: 'health-monitor',
      check_name: name,
      status: 'error',
      measured_value: null,
      message: `Unhandled error: ${errorMsg}`,
    };
  }
}

// ── Main entry point ────────────────────────────────────────────────

export async function runHealthMonitor(): Promise<HealthMonitorResult> {
  const start = Date.now();
  const sessionId = generateSessionId();

  const logger = createLogger('health-monitor', sessionId);
  logger.info('Health monitor run starting', { session_id: sessionId });

  // Run all 5 checks in parallel — Promise.allSettled ensures no single
  // failure blocks the others
  const settledResults = await Promise.allSettled([
    safeRunCheck('cta_routing_accuracy', checkFunnel, logger),
    safeRunCheck('stripe_webhook_delivery', checkStripe, logger),
    safeRunCheck('edge_function_error_rate', checkSupabase, logger),
    safeRunCheck('vercel_deploy_status', checkVercel, logger),
    safeRunCheck('claude_api_availability', checkClaudeAPI, logger),
  ]);

  // Extract results — safeRunCheck already catches errors,
  // but handle rejected promises defensively
  const results: CheckResult[] = settledResults.map((settled, idx) => {
    if (settled.status === 'fulfilled') {
      return settled.value;
    }

    // This should never happen (safeRunCheck catches), but be safe
    const names = [
      'cta_routing_accuracy',
      'stripe_webhook_delivery',
      'edge_function_error_rate',
      'vercel_deploy_status',
      'claude_api_availability',
    ];

    return {
      agent: 'health-monitor' as const,
      check_name: names[idx],
      status: 'error' as const,
      measured_value: null,
      message: `Promise rejected: ${settled.reason}`,
    };
  });

  // Stamp session IDs
  results.forEach((r) => {
    r.session_id = sessionId;
  });

  // Determine overall status
  const overallStatus = determineOverallStatus(results);

  // Write results to Supabase (fire and forget for speed, but await for reliability)
  await writeCheckResults(results, sessionId);

  // Fire alerts for any failing checks
  const alertsFired = await fireAlerts(results, logger);

  const duration_ms = Date.now() - start;

  // Log the full run summary
  const passCt = results.filter((r) => r.status === 'pass').length;
  const failCt = results.filter((r) => r.status === 'fail').length;
  const degradedCt = results.filter((r) => r.status === 'degraded').length;
  const errorCt = results.filter((r) => r.status === 'error').length;

  logger.info(
    `Health monitor run complete: ${overallStatus.toUpperCase()} — ${passCt} pass, ${failCt} fail, ${degradedCt} degraded, ${errorCt} error. ${alertsFired} alerts fired.`,
    {
      overall_status: overallStatus,
      pass: passCt,
      fail: failCt,
      degraded: degradedCt,
      error: errorCt,
      alerts_fired: alertsFired,
      session_id: sessionId,
    },
    duration_ms
  );

  return {
    status: overallStatus,
    checks: results,
    alerts_fired: alertsFired,
    duration_ms,
    session_id: sessionId,
  };
}

// ── CLI entry point ─────────────────────────────────────────────────

if (require.main === module || process.argv[1]?.includes('health-monitor')) {
  runHealthMonitor()
    .then((result) => {
      console.log(
        `\nHealth Monitor: ${result.status.toUpperCase()} (${result.duration_ms}ms, ${result.alerts_fired} alerts)`
      );
      process.exit(result.status === 'unhealthy' ? 1 : 0);
    })
    .catch((err) => {
      console.error('Health monitor crashed:', err);
      process.exit(2);
    });
}
