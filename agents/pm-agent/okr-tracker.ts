/**
 * OKR Tracker — Queries IAI data and computes OKR Key Result values.
 *
 * Connects to Supabase with service role key to pull data from
 * agent_health_events, usage_tracking, user_profiles, practice_sessions,
 * nursing_practice_sessions, and api_metrics.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SLOKey } from '../shared/slo-definitions';
import { Logger } from '../shared/logger';

// ── Types ───────────────────────────────────────────────────────────

export type KRStatus = 'on_track' | 'at_risk' | 'behind' | 'no_data';

export interface KeyResultValue {
  krId: string;
  objective: string;
  description: string;
  currentValue: number | null;
  target: number | string;
  status: KRStatus;
  percentComplete: number | null;
  metadata?: Record<string, unknown>;
}

export type OKRMap = Record<string, KeyResultValue>;

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

// ── Helper: safe query wrapper ──────────────────────────────────────

async function safeQuery<T>(
  logger: Logger,
  label: string,
  fn: () => Promise<T>
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    logger.warn(`OKR query failed: ${label}`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

function noDataResult(
  krId: string,
  objective: string,
  description: string,
  target: number | string
): KeyResultValue {
  return {
    krId,
    objective,
    description,
    currentValue: null,
    target,
    status: 'no_data',
    percentComplete: null,
  };
}

function computeStatus(
  current: number | null,
  target: number,
  higherIsBetter: boolean
): { status: KRStatus; percentComplete: number | null } {
  if (current === null) return { status: 'no_data', percentComplete: null };

  const pct = higherIsBetter
    ? Math.min((current / target) * 100, 100)
    : target === 0
      ? current === 0
        ? 100
        : 0
      : Math.min(((target - current + target) / target) * 100, 100);

  // For simpler reasoning, just use the ratio
  const percentComplete = Math.round(
    higherIsBetter
      ? Math.min((current / target) * 100, 100)
      : current <= target
        ? 100
        : Math.max(0, (1 - (current - target) / target) * 100)
  );

  if (percentComplete >= 80) return { status: 'on_track', percentComplete };
  if (percentComplete >= 50) return { status: 'at_risk', percentComplete };
  return { status: 'behind', percentComplete };
}

// ── KR Computation Functions ────────────────────────────────────────

async function kr1_1_ctaRoutingAccuracy(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_1_1',
    objective: 'Fix the Conversion Funnel',
    description: 'CTA routing accuracy',
    target: 100,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('status')
      .eq('slo_key', 'CTA_ROUTING_ACCURACY');

    if (error || !data || data.length === 0) return null;

    const passed = data.filter((e: any) => e.status === 'pass').length;
    return (passed / data.length) * 100;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, kr.target);

  const { status, percentComplete } = computeStatus(result, kr.target, true);
  return { ...kr, currentValue: Math.round(result * 10) / 10, status, percentComplete };
}

async function kr1_2_zeroAuthTraps(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_1_2',
    objective: 'Fix the Conversion Funnel',
    description: 'Zero auth traps',
    target: 100,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('status')
      .eq('slo_key', 'AUTH_PROGRESSION');

    if (error || !data || data.length === 0) return null;

    const passed = data.filter((e: any) => e.status === 'pass').length;
    return (passed / data.length) * 100;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, kr.target);

  const { status, percentComplete } = computeStatus(result, kr.target, true);
  return { ...kr, currentValue: Math.round(result * 10) / 10, status, percentComplete };
}

async function kr1_3_timeToFirstValue(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_1_3',
    objective: 'Fix the Conversion Funnel',
    description: 'Time-to-first-value < 3 min',
    target: 180,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('measured_value')
      .eq('slo_key', 'TIME_TO_FIRST_VALUE')
      .not('measured_value', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) return null;

    const values = data.map((e: any) => e.measured_value).filter(Boolean);
    if (values.length === 0) return null;
    return values.reduce((s: number, v: number) => s + v, 0) / values.length;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, `${kr.target}s`);

  // For time metrics, lower is better
  const percentComplete =
    result <= kr.target ? 100 : Math.max(0, Math.round((1 - (result - kr.target) / kr.target) * 100));
  const status: KRStatus =
    percentComplete >= 80 ? 'on_track' : percentComplete >= 50 ? 'at_risk' : 'behind';

  return {
    ...kr,
    target: `${kr.target}s`,
    currentValue: Math.round(result),
    status,
    percentComplete,
  };
}

async function kr1_4_firstPaidConversion(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_1_4',
    objective: 'Fix the Conversion Funnel',
    description: 'First paid conversion',
    target: 1,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .neq('tier', 'free');

    if (error) return null;
    return count ?? 0;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, `>= ${kr.target}`);

  const { status, percentComplete } = computeStatus(result, kr.target, true);
  return { ...kr, target: `>= ${kr.target}`, currentValue: result, status, percentComplete };
}

async function kr2_1_d7ReturnRate(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_2_1',
    objective: 'Product-Market Signal',
    description: 'D7 return rate',
    target: 25,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('measured_value')
      .eq('slo_key', 'D7_RETURN_RATE')
      .not('measured_value', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0].measured_value;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, `${kr.target}%`);

  const { status, percentComplete } = computeStatus(result, kr.target, true);
  return { ...kr, target: `${kr.target}%`, currentValue: Math.round(result * 10) / 10, status, percentComplete };
}

async function kr2_2_freeCreditCeiling(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_2_2',
    objective: 'Product-Market Signal',
    description: 'Free users hitting credit ceiling',
    target: 30,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('measured_value')
      .eq('slo_key', 'FREE_CREDIT_CEILING_HIT')
      .not('measured_value', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0].measured_value;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, `${kr.target}%`);

  const { status, percentComplete } = computeStatus(result, kr.target, true);
  return { ...kr, target: `${kr.target}%`, currentValue: Math.round(result * 10) / 10, status, percentComplete };
}

async function kr2_3_nursingVsGeneralEngagement(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_2_3',
    objective: 'Product-Market Signal',
    description: 'Nursing track engagement vs general',
    target: 'tracking',
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [nursing, general] = await Promise.all([
      supabase
        .from('nursing_practice_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo),
      supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo),
    ]);

    if (nursing.error && general.error) return null;

    const nursingCount = nursing.count ?? 0;
    const generalCount = general.count ?? 0;
    const total = nursingCount + generalCount;

    return {
      nursingCount,
      generalCount,
      nursingPct: total > 0 ? (nursingCount / total) * 100 : 0,
    };
  });

  if (result === null) {
    return noDataResult(kr.krId, kr.objective, kr.description, kr.target);
  }

  return {
    ...kr,
    currentValue: Math.round((result as any).nursingPct * 10) / 10,
    status: 'on_track' as KRStatus, // Monitor-only, always on_track
    percentComplete: null,
    metadata: result as Record<string, unknown>,
  };
}

async function kr3_1_claudeApiAvailability(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_3_1',
    objective: 'System Reliability',
    description: 'Claude API availability',
    target: 99.5,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('status')
      .eq('slo_key', 'CLAUDE_API_ERROR_RATE');

    if (error || !data || data.length === 0) return null;

    const passed = data.filter((e: any) => e.status === 'pass').length;
    return (passed / data.length) * 100;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, `${kr.target}%`);

  const { status, percentComplete } = computeStatus(result, kr.target, true);
  return { ...kr, target: `${kr.target}%`, currentValue: Math.round(result * 10) / 10, status, percentComplete };
}

async function kr3_2_stripeWebhookDelivery(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_3_2',
    objective: 'System Reliability',
    description: 'Stripe webhook delivery',
    target: 100,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('status')
      .eq('slo_key', 'STRIPE_WEBHOOK_DELIVERY');

    if (error || !data || data.length === 0) return null;

    const passed = data.filter((e: any) => e.status === 'pass').length;
    return (passed / data.length) * 100;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, `${kr.target}%`);

  const { status, percentComplete } = computeStatus(result, kr.target, true);
  return { ...kr, target: `${kr.target}%`, currentValue: Math.round(result * 10) / 10, status, percentComplete };
}

async function kr3_3_edgeFunctionErrorRate(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_3_3',
    objective: 'System Reliability',
    description: 'Edge function error rate',
    target: 0.5,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('measured_value')
      .eq('slo_key', 'EDGE_FUNCTION_ERROR_RATE')
      .not('measured_value', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) return null;

    const values = data.map((e: any) => e.measured_value);
    return values.reduce((s: number, v: number) => s + v, 0) / values.length;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, `< ${kr.target}%`);

  // Lower is better for error rate
  const percentComplete = result <= kr.target ? 100 : Math.max(0, Math.round((1 - (result - kr.target) / 5) * 100));
  const status: KRStatus =
    percentComplete >= 80 ? 'on_track' : percentComplete >= 50 ? 'at_risk' : 'behind';

  return { ...kr, target: `< ${kr.target}%`, currentValue: Math.round(result * 100) / 100, status, percentComplete };
}

async function kr3_4_vercelDeploySuccess(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_3_4',
    objective: 'System Reliability',
    description: 'Vercel deploy success',
    target: 100,
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const { data, error } = await supabase
      .from('agent_health_events')
      .select('status')
      .eq('slo_key', 'VERCEL_DEPLOY_SUCCESS');

    if (error || !data || data.length === 0) return null;

    const passed = data.filter((e: any) => e.status === 'pass').length;
    return (passed / data.length) * 100;
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, `${kr.target}%`);

  const { status, percentComplete } = computeStatus(result, kr.target, true);
  return { ...kr, target: `${kr.target}%`, currentValue: Math.round(result * 10) / 10, status, percentComplete };
}

async function kr4_1_costToRevenueRatio(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_4_1',
    objective: 'Revenue Trajectory',
    description: 'API cost-to-revenue ratio',
    target: 'tracking',
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('api_metrics')
      .select('cost_usd')
      .gte('created_at', thirtyDaysAgo);

    if (error || !data || data.length === 0) return null;

    const totalCost = data.reduce(
      (s: number, r: any) => s + (r.cost_usd ?? 0),
      0
    );

    return { totalCost, note: 'Revenue data requires Stripe API query' };
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, kr.target);

  return {
    ...kr,
    currentValue: (result as any).totalCost,
    status: 'no_data' as KRStatus, // Need revenue side to compute ratio
    percentComplete: null,
    metadata: result as Record<string, unknown>,
  };
}

async function kr4_2_monthlyChurnRate(
  supabase: SupabaseClient,
  logger: Logger
): Promise<KeyResultValue> {
  const kr = {
    krId: 'KR_4_2',
    objective: 'Revenue Trajectory',
    description: 'Monthly churn rate',
    target: 'tracking',
  };

  const result = await safeQuery(logger, kr.krId, async () => {
    // Check for users who downgraded from paid to free in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count: totalPaid, error: e1 } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .neq('tier', 'free');

    if (e1) return null;

    // Without a tier_change_log, we approximate by counting free users
    // who had a paid tier before. This is a rough proxy.
    return { paidUsers: totalPaid ?? 0, churnRate: null };
  });

  if (result === null) return noDataResult(kr.krId, kr.objective, kr.description, kr.target);

  return {
    ...kr,
    currentValue: (result as any).churnRate,
    status: 'no_data' as KRStatus,
    percentComplete: null,
    metadata: result as Record<string, unknown>,
  };
}

// ── Main function ───────────────────────────────────────────────────

/**
 * Track all OKR Key Results.
 * Returns a map of KR ID -> computed value and status.
 */
export async function trackOKRs(logger: Logger): Promise<OKRMap> {
  logger.info('Starting OKR tracking');

  const supabase = getSupabase();
  const okrMap: OKRMap = {};

  const krFunctions = [
    kr1_1_ctaRoutingAccuracy,
    kr1_2_zeroAuthTraps,
    kr1_3_timeToFirstValue,
    kr1_4_firstPaidConversion,
    kr2_1_d7ReturnRate,
    kr2_2_freeCreditCeiling,
    kr2_3_nursingVsGeneralEngagement,
    kr3_1_claudeApiAvailability,
    kr3_2_stripeWebhookDelivery,
    kr3_3_edgeFunctionErrorRate,
    kr3_4_vercelDeploySuccess,
    kr4_1_costToRevenueRatio,
    kr4_2_monthlyChurnRate,
  ];

  const results = await Promise.allSettled(
    krFunctions.map((fn) => fn(supabase, logger))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      okrMap[result.value.krId] = result.value;
    }
  }

  const tracked = Object.keys(okrMap).length;
  const withData = Object.values(okrMap).filter(
    (kr) => kr.status !== 'no_data'
  ).length;

  logger.info('OKR tracking complete', { tracked, withData });

  return okrMap;
}
