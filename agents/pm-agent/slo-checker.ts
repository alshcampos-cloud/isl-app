/**
 * SLO Checker — Reads agent_health_events and compares against SLO definitions.
 *
 * For each SLO key, calculates the SLI value from health check data,
 * compares against the target, and computes a trend vs. the previous period.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SLO, SLO_KEYS, isSLOBreached } from '../shared/slo-definitions';
import type { SLOKey } from '../shared/slo-definitions';
import type { CheckResult } from '../shared/types';
import { Logger } from '../shared/logger';

// ── Types ───────────────────────────────────────────────────────────

export type SLOStatus = 'met' | 'breached' | 'at_risk' | 'no_data';
export type SLOTrend = 'improving' | 'stable' | 'declining' | 'unknown';

export interface SLOCheckResult {
  sliValue: number | null;
  target: number | null;
  status: SLOStatus;
  trend: SLOTrend;
  totalChecks: number;
  passedChecks: number;
}

export type SLOStatusMap = Record<SLOKey, SLOCheckResult>;

// ── Supabase client ─────────────────────────────────────────────────

const SUPABASE_URL = 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';

function getSupabase(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Fetch health events for a given SLO key within a time range.
 */
async function fetchEventsForSLO(
  supabase: SupabaseClient,
  sloKey: SLOKey,
  from: string,
  to: string
): Promise<CheckResult[]> {
  const { data, error } = await supabase
    .from('agent_health_events')
    .select('*')
    .eq('slo_key', sloKey)
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`[slo-checker] Query error for ${sloKey}: ${error.message}`);
    return [];
  }

  return (data ?? []) as CheckResult[];
}

/**
 * Calculate the SLI value from a set of check results.
 * For rate-based SLOs: pass rate = (pass count / total count) * 100
 * For value-based SLOs: average of measured_value
 */
function calculateSLI(events: CheckResult[], sloKey: SLOKey): number | null {
  if (events.length === 0) return null;

  const slo = SLO[sloKey];

  // If the SLO unit is '%', compute a pass rate
  if (slo.unit === '%') {
    const passed = events.filter((e) => e.status === 'pass').length;
    return (passed / events.length) * 100;
  }

  // For 'sec', 'ms', 'count': average the measured values
  const measured = events
    .map((e) => e.measured_value)
    .filter((v): v is number => v !== null && v !== undefined);

  if (measured.length === 0) return null;

  return measured.reduce((sum, v) => sum + v, 0) / measured.length;
}

/**
 * Determine the at_risk zone: within 10% of the alert threshold.
 */
function isAtRisk(sloKey: SLOKey, sliValue: number): boolean {
  const slo = SLO[sloKey];
  if (slo.target === null) return false;

  const threshold = (slo as any).alertAt ?? slo.target;
  const direction = (slo as any).direction ?? 'above';

  if (direction === 'above') {
    // Bad when rising. At risk if above 80% of the threshold distance.
    const margin = threshold * 0.1;
    return sliValue > threshold - margin && sliValue <= threshold;
  } else {
    // Bad when dropping. At risk if within 10% above the threshold.
    const margin = threshold * 0.1;
    return sliValue >= threshold && sliValue < threshold + margin;
  }
}

/**
 * Compute the trend by comparing current SLI to previous period SLI.
 */
function computeTrend(
  currentSLI: number | null,
  previousSLI: number | null,
  sloKey: SLOKey
): SLOTrend {
  if (currentSLI === null || previousSLI === null) return 'unknown';

  const delta = currentSLI - previousSLI;
  const threshold = 1; // 1-unit change considered stable

  if (Math.abs(delta) < threshold) return 'stable';

  const slo = SLO[sloKey];
  const direction = slo.direction ?? 'above';

  if (direction === 'above') {
    // For error rates: lower is better
    return delta < 0 ? 'improving' : 'declining';
  } else {
    // For engagement rates: higher is better
    return delta > 0 ? 'improving' : 'declining';
  }
}

// ── Main function ───────────────────────────────────────────────────

export interface SLOCheckerOptions {
  /** Number of days to look back (default: 7) */
  periodDays?: number;
}

/**
 * Check all SLOs against health event data.
 * Returns a structured map of SLO status for the reporting period.
 */
export async function checkSLOs(
  logger: Logger,
  options: SLOCheckerOptions = {}
): Promise<SLOStatusMap> {
  const periodDays = options.periodDays ?? 7;
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(
    periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000
  );

  const to = now.toISOString();
  const from = periodStart.toISOString();
  const prevFrom = previousPeriodStart.toISOString();
  const prevTo = periodStart.toISOString();

  logger.info('Starting SLO check', { periodDays, from, to });

  const supabase = getSupabase();
  const statusMap = {} as SLOStatusMap;

  for (const sloKey of SLO_KEYS) {
    try {
      // Fetch events for current and previous period
      const [currentEvents, previousEvents] = await Promise.all([
        fetchEventsForSLO(supabase, sloKey, from, to),
        fetchEventsForSLO(supabase, sloKey, prevFrom, prevTo),
      ]);

      const sliValue = calculateSLI(currentEvents, sloKey);
      const previousSLI = calculateSLI(previousEvents, sloKey);
      const slo = SLO[sloKey];

      let status: SLOStatus;
      if (sliValue === null) {
        status = 'no_data';
      } else if (isSLOBreached(sloKey, sliValue)) {
        status = 'breached';
      } else if (isAtRisk(sloKey, sliValue)) {
        status = 'at_risk';
      } else {
        status = 'met';
      }

      const trend = computeTrend(sliValue, previousSLI, sloKey);
      const totalChecks = currentEvents.length;
      const passedChecks = currentEvents.filter((e) => e.status === 'pass').length;

      statusMap[sloKey] = {
        sliValue,
        target: slo.target,
        status,
        trend,
        totalChecks,
        passedChecks,
      };

      if (status === 'breached') {
        logger.warn(`SLO breached: ${sloKey}`, {
          sliValue,
          target: slo.target,
          totalChecks,
        });
      }
    } catch (err) {
      logger.error(`Failed to check SLO: ${sloKey}`, {
        error: err instanceof Error ? err.message : String(err),
      });

      statusMap[sloKey] = {
        sliValue: null,
        target: SLO[sloKey].target,
        status: 'no_data',
        trend: 'unknown',
        totalChecks: 0,
        passedChecks: 0,
      };
    }
  }

  const breachedCount = Object.values(statusMap).filter(
    (s) => s.status === 'breached'
  ).length;
  const metCount = Object.values(statusMap).filter(
    (s) => s.status === 'met'
  ).length;
  const noDataCount = Object.values(statusMap).filter(
    (s) => s.status === 'no_data'
  ).length;

  logger.info('SLO check complete', { breachedCount, metCount, noDataCount });

  return statusMap;
}
