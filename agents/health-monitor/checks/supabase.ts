/**
 * Supabase Check — Edge Function Error Rate + Database Connectivity
 *
 * Queries api_error_log and api_metrics tables to calculate the
 * Edge Function error rate over the last hour.
 *
 * SLO: EDGE_FUNCTION_ERROR_RATE (target 0.5%, alert at 2.0%)
 */

import { createClient } from '@supabase/supabase-js';
import { createLogger } from '../../shared/logger';
import { SLO, isSLOBreached } from '../../shared/slo-definitions';
import type { CheckResult } from '../../shared/types';

const logger = createLogger('health-monitor');

const SUPABASE_URL = 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Check basic database connectivity with a lightweight query.
 */
async function checkDbConnectivity(): Promise<{
  connected: boolean;
  latency_ms: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const supabase = getSupabase();

    // Use a lightweight RPC or a simple table query
    // SELECT 1 equivalent via Supabase — query a known table with limit 1
    const { error } = await supabase
      .from('agent_logs')
      .select('id')
      .limit(1);

    const latency_ms = Date.now() - start;

    if (error) {
      return { connected: false, latency_ms, error: error.message };
    }

    return { connected: true, latency_ms };
  } catch (err) {
    const latency_ms = Date.now() - start;
    return {
      connected: false,
      latency_ms,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Calculate edge function error rate over the last hour.
 */
async function checkErrorRate(): Promise<{
  errorCount: number;
  totalCount: number;
  errorRate: number;
  queryError?: string;
}> {
  try {
    const supabase = getSupabase();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Count errors in the last hour
    const { count: errorCount, error: errorErr } = await supabase
      .from('api_error_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo);

    if (errorErr) {
      logger.warn(`Error querying api_error_log: ${errorErr.message}`);
      return {
        errorCount: 0,
        totalCount: 0,
        errorRate: 0,
        queryError: errorErr.message,
      };
    }

    // Count total calls in the last hour
    const { count: totalCount, error: metricsErr } = await supabase
      .from('api_metrics')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo);

    if (metricsErr) {
      logger.warn(`Error querying api_metrics: ${metricsErr.message}`);
      return {
        errorCount: errorCount ?? 0,
        totalCount: 0,
        errorRate: 0,
        queryError: metricsErr.message,
      };
    }

    const errors = errorCount ?? 0;
    const total = totalCount ?? 0;

    // Avoid division by zero — if no calls, error rate is 0
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    return { errorCount: errors, totalCount: total, errorRate };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      errorCount: 0,
      totalCount: 0,
      errorRate: 0,
      queryError: msg,
    };
  }
}

export async function checkSupabase(): Promise<CheckResult> {
  const start = Date.now();

  try {
    logger.info('Running Supabase health check (Edge Function error rate + DB connectivity)');

    // Run both checks in parallel
    const [dbResult, errorRateResult] = await Promise.all([
      checkDbConnectivity(),
      checkErrorRate(),
    ]);

    const duration_ms = Date.now() - start;

    // DB connectivity failure is critical
    if (!dbResult.connected) {
      logger.error('Database connectivity check FAILED', { error: dbResult.error });

      return {
        agent: 'health-monitor',
        check_name: 'edge_function_error_rate',
        slo_key: 'EDGE_FUNCTION_ERROR_RATE',
        status: 'fail',
        measured_value: null,
        message: `Database connectivity failed: ${dbResult.error}`,
        metadata: {
          db_connected: false,
          db_latency_ms: dbResult.latency_ms,
          db_error: dbResult.error,
        },
        duration_ms,
      };
    }

    // Check if error rate breaches SLO
    const breached = isSLOBreached('EDGE_FUNCTION_ERROR_RATE', errorRateResult.errorRate);

    const message = errorRateResult.queryError
      ? `Error rate check had query issues: ${errorRateResult.queryError}. DB connectivity OK (${dbResult.latency_ms}ms).`
      : breached
        ? `Edge Function error rate ${errorRateResult.errorRate.toFixed(2)}% exceeds threshold ${SLO.EDGE_FUNCTION_ERROR_RATE.alertAt}%. ${errorRateResult.errorCount} errors / ${errorRateResult.totalCount} total calls in last hour.`
        : `Edge Function error rate ${errorRateResult.errorRate.toFixed(2)}% is healthy. ${errorRateResult.errorCount} errors / ${errorRateResult.totalCount} total calls in last hour. DB latency ${dbResult.latency_ms}ms.`;

    if (breached) {
      logger.error('Edge Function error rate SLO breached', {
        errorRate: errorRateResult.errorRate,
        threshold: SLO.EDGE_FUNCTION_ERROR_RATE.alertAt,
      });
    } else {
      logger.info('Supabase check passed', {
        errorRate: errorRateResult.errorRate,
        dbLatency: dbResult.latency_ms,
      });
    }

    return {
      agent: 'health-monitor',
      check_name: 'edge_function_error_rate',
      slo_key: 'EDGE_FUNCTION_ERROR_RATE',
      status: breached ? 'fail' : errorRateResult.queryError ? 'degraded' : 'pass',
      measured_value: errorRateResult.errorRate,
      unit: '%',
      target_value: SLO.EDGE_FUNCTION_ERROR_RATE.target,
      message,
      metadata: {
        db_connected: true,
        db_latency_ms: dbResult.latency_ms,
        error_count: errorRateResult.errorCount,
        total_count: errorRateResult.totalCount,
        error_rate: errorRateResult.errorRate,
        window: SLO.EDGE_FUNCTION_ERROR_RATE.window,
        query_error: errorRateResult.queryError,
      },
      duration_ms,
    };
  } catch (err) {
    const duration_ms = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);

    logger.error(`Supabase check error: ${errorMsg}`);

    return {
      agent: 'health-monitor',
      check_name: 'edge_function_error_rate',
      slo_key: 'EDGE_FUNCTION_ERROR_RATE',
      status: 'error',
      measured_value: null,
      message: `Supabase check threw an error: ${errorMsg}`,
      duration_ms,
    };
  }
}
