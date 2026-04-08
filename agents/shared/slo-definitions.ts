/**
 * SLO Definitions — Single Source of Truth
 *
 * All Service Level Objectives for InterviewAnswers.ai.
 * Based on Google SRE model: define targets, measure, alert, iterate.
 *
 * Tiers:
 *   CRITICAL — 100% target, zero tolerance. Breach = immediate alert.
 *   HIGH     — Has an alert threshold. Breach triggers investigation.
 *   MONITOR  — Observe and trend. No automated alerting yet.
 */

export type SLOTier = 'CRITICAL' | 'HIGH' | 'MONITOR';
export type SLODirection = 'above' | 'below';

export interface SLODefinition {
  /** Target value (null = no target yet, observe only) */
  target: number | null;
  /** Unit of measurement */
  unit: '%' | 'sec' | 'ms' | 'count';
  /** Value at which to fire an alert (CRITICAL SLOs alert on any miss) */
  alertAt?: number;
  /** Zero-tolerance override for CRITICAL SLOs */
  tolerance?: number;
  /** Severity tier */
  tier: SLOTier;
  /** Rolling window for rate-based SLOs */
  window?: string;
  /**
   * Which direction is bad?
   *   'above'  — metric rising past alertAt is bad (default for error rates)
   *   'below'  — metric dropping below alertAt is bad (engagement, return rates)
   */
  direction?: SLODirection;
}

export type SLOKey = keyof typeof SLO;

export const SLO = {
  // ── CRITICAL (zero tolerance) ──────────────────────────────────────
  CTA_ROUTING_ACCURACY: {
    target: 100,
    unit: '%',
    tolerance: 0,
    tier: 'CRITICAL',
  },
  STRIPE_WEBHOOK_DELIVERY: {
    target: 100,
    unit: '%',
    tolerance: 0,
    tier: 'CRITICAL',
  },
  AUTH_PROGRESSION: {
    target: 100,
    unit: '%',
    tolerance: 0,
    tier: 'CRITICAL',
  },
  VERCEL_DEPLOY_SUCCESS: {
    target: 100,
    unit: '%',
    tolerance: 0,
    tier: 'CRITICAL',
  },

  // ── HIGH (has alert threshold) ─────────────────────────────────────
  EDGE_FUNCTION_ERROR_RATE: {
    target: 0.5,
    unit: '%',
    alertAt: 2.0,
    tier: 'HIGH',
    window: '1h',
  },
  CLAUDE_API_ERROR_RATE: {
    target: 0.5,
    unit: '%',
    alertAt: 2.0,
    tier: 'HIGH',
    window: '1h',
  },
  TIME_TO_FIRST_VALUE: {
    target: 180,
    unit: 'sec',
    alertAt: 300,
    tier: 'HIGH',
  },
  FREE_CREDIT_CEILING_HIT: {
    target: 30,
    unit: '%',
    alertAt: 10,
    tier: 'HIGH',
    direction: 'below',
  },
  D7_RETURN_RATE: {
    target: 25,
    unit: '%',
    alertAt: 10,
    tier: 'HIGH',
    direction: 'below',
  },

  // ── MONITOR (observe, no alerts yet) ───────────────────────────────
  D1_RETURN_RATE: {
    target: 50,
    unit: '%',
    tier: 'MONITOR',
  },
  MOBILE_DESKTOP_SPLIT: {
    target: null,
    unit: '%',
    tier: 'MONITOR',
  },
  NURSING_TRACK_ENGAGEMENT: {
    target: null,
    unit: '%',
    tier: 'MONITOR',
  },
} as const satisfies Record<string, SLODefinition>;

// ── Helper functions ─────────────────────────────────────────────────

/** Get an SLO definition by key. Throws if key is invalid. */
export function getSLO(key: SLOKey): SLODefinition {
  const slo = SLO[key];
  if (!slo) {
    throw new Error(`Unknown SLO key: ${key}`);
  }
  return slo;
}

/** Returns all SLO keys for a given tier. */
export function getSLOsByTier(tier: SLOTier): SLOKey[] {
  return (Object.keys(SLO) as SLOKey[]).filter((k) => SLO[k].tier === tier);
}

/**
 * Check whether a measured value breaches the SLO.
 * Returns true if the SLO is violated.
 */
export function isSLOBreached(key: SLOKey, measured: number): boolean {
  const slo = getSLO(key);

  // CRITICAL SLOs: any deviation from target is a breach
  if (slo.tier === 'CRITICAL' && slo.target !== null) {
    return measured !== slo.target;
  }

  // MONITOR SLOs with no target: never breach
  if (slo.target === null) {
    return false;
  }

  const threshold = slo.alertAt ?? slo.target;
  const direction = slo.direction ?? 'above';

  if (direction === 'below') {
    // Bad when metric drops below threshold
    return measured < threshold;
  }
  // Bad when metric rises above threshold
  return measured > threshold;
}

/** All valid SLO keys as an array. */
export const SLO_KEYS = Object.keys(SLO) as SLOKey[];
