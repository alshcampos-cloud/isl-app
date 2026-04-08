/**
 * Proposal Engine — Generates fix proposals for SLO breaches.
 *
 * For each breached SLO (Critical or High tier), generates a structured
 * Proposal with actionable recommendations, checks for duplicates,
 * and inserts into the agent_proposals table.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SLO } from '../shared/slo-definitions';
import type { SLOKey, SLOTier } from '../shared/slo-definitions';
import type { Proposal } from '../shared/types';
import type { SLOStatusMap, SLOCheckResult } from './slo-checker';
import { Logger } from '../shared/logger';

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

// ── Fix templates keyed by SLO ──────────────────────────────────────

interface FixTemplate {
  title: string;
  suggestedFix: string;
  filesAffected: string[];
  estimatedRisk: 'low' | 'medium' | 'high';
  estimatedEffort: 'small' | 'medium' | 'large';
}

function getFixTemplate(
  sloKey: SLOKey,
  check: SLOCheckResult
): FixTemplate {
  const value = check.sliValue !== null ? check.sliValue.toFixed(1) : 'unknown';

  const templates: Partial<Record<SLOKey, FixTemplate>> = {
    CTA_ROUTING_ACCURACY: {
      title: `CTA routing failures detected (${value}% accuracy)`,
      suggestedFix:
        'Audit all CTA buttons and links for correct route targets. Check React Router paths match expected destinations. Verify no dead-end routes exist after navigation.',
      filesAffected: [
        'src/App.jsx',
        'src/Components/NursingTrack/',
        'src/ProtectedRoute.jsx',
      ],
      estimatedRisk: 'medium',
      estimatedEffort: 'small',
    },
    STRIPE_WEBHOOK_DELIVERY: {
      title: `Stripe webhook delivery failures (${value}% success)`,
      suggestedFix:
        'Check Stripe dashboard for webhook delivery logs. Verify webhook signing secret matches in Edge Function. Ensure create-checkout-session and stripe-webhook Edge Functions are deployed and healthy.',
      filesAffected: [
        'supabase/functions/stripe-webhook/index.ts',
        'supabase/functions/create-checkout-session/index.ts',
      ],
      estimatedRisk: 'high',
      estimatedEffort: 'small',
    },
    AUTH_PROGRESSION: {
      title: `Auth flow traps detected (${value}% success)`,
      suggestedFix:
        'Test full signup-to-session flow. Check email confirmation redirect chain. Verify ProtectedRoute allows expected progression. Look for auth state race conditions on page refresh.',
      filesAffected: [
        'src/ProtectedRoute.jsx',
        'src/App.jsx',
      ],
      estimatedRisk: 'high',
      estimatedEffort: 'medium',
    },
    VERCEL_DEPLOY_SUCCESS: {
      title: `Vercel deploy failures detected (${value}% success)`,
      suggestedFix:
        'Check Vercel deployment logs for build errors. Verify environment variables are set. Check for ESLint/TypeScript errors that fail the build.',
      filesAffected: ['vercel.json', 'vite.config.js', 'package.json'],
      estimatedRisk: 'low',
      estimatedEffort: 'small',
    },
    EDGE_FUNCTION_ERROR_RATE: {
      title: `Edge function error rate elevated (${value}%)`,
      suggestedFix:
        'Check Supabase Edge Function logs for error patterns. Look for timeout issues, missing environment variables, or Anthropic API errors. Verify retry logic is working (3 attempts with backoff).',
      filesAffected: [
        'supabase/functions/ai-feedback/index.ts',
        'supabase/functions/generate-question/index.ts',
      ],
      estimatedRisk: 'medium',
      estimatedEffort: 'medium',
    },
    CLAUDE_API_ERROR_RATE: {
      title: `Claude API error rate elevated (${value}%)`,
      suggestedFix:
        'Check Anthropic status page for outages. Review Edge Function error logs for specific error codes (rate limit, context length, etc.). Verify API key is valid and has sufficient quota.',
      filesAffected: ['supabase/functions/ai-feedback/index.ts'],
      estimatedRisk: 'low',
      estimatedEffort: 'small',
    },
    TIME_TO_FIRST_VALUE: {
      title: `Time-to-first-value too slow (${value}s, target: 180s)`,
      suggestedFix:
        'Analyze onboarding flow for bottlenecks. Check if email confirmation is blocking users. Consider reducing steps before first practice session. Verify Edge Functions respond within acceptable latency.',
      filesAffected: [
        'src/Components/Onboarding/',
        'src/App.jsx',
      ],
      estimatedRisk: 'medium',
      estimatedEffort: 'large',
    },
    FREE_CREDIT_CEILING_HIT: {
      title: `Low credit ceiling engagement (${value}%, target: 30%)`,
      suggestedFix:
        'Review free tier credit limits. Check if users are aware of credit limits. Consider adjusting the ceiling or adding clearer upgrade prompts when credits are low.',
      filesAffected: [
        'src/utils/creditSystem.js',
        'src/Components/Intelligence/TrialBanner.jsx',
      ],
      estimatedRisk: 'low',
      estimatedEffort: 'small',
    },
    D7_RETURN_RATE: {
      title: `D7 return rate below threshold (${value}%, target: 25%)`,
      suggestedFix:
        'Analyze user drop-off points after signup. Consider adding email re-engagement campaigns. Review first-session experience for friction. Check if users complete onboarding successfully.',
      filesAffected: [
        'src/Components/Onboarding/',
      ],
      estimatedRisk: 'low',
      estimatedEffort: 'large',
    },
  };

  return (
    templates[sloKey] ?? {
      title: `SLO breach: ${sloKey} (measured: ${value})`,
      suggestedFix: `Investigate ${sloKey} health events for root cause. Check agent_health_events table for recent failures.`,
      filesAffected: [],
      estimatedRisk: 'medium' as const,
      estimatedEffort: 'medium' as const,
    }
  );
}

function tierToPriority(tier: SLOTier): 'p0' | 'p1' | 'p2' | 'p3' {
  switch (tier) {
    case 'CRITICAL':
      return 'p0';
    case 'HIGH':
      return 'p1';
    case 'MONITOR':
      return 'p2';
    default:
      return 'p3';
  }
}

// ── Duplicate check ─────────────────────────────────────────────────

async function hasPendingProposal(
  supabase: SupabaseClient,
  sloKey: SLOKey
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('agent_proposals')
      .select('id')
      .contains('related_slos', [sloKey])
      .eq('status', 'proposed')
      .limit(1);

    if (error) {
      console.error(`[proposal-engine] Dedup check error: ${error.message}`);
      return false; // Fail open
    }

    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

// ── Main function ───────────────────────────────────────────────────

/**
 * Generate fix proposals for all breached SLOs.
 * Only creates proposals for CRITICAL and HIGH tier breaches.
 * Skips if a pending proposal already exists for that SLO.
 */
export async function generateProposals(
  logger: Logger,
  sloStatus: SLOStatusMap
): Promise<Proposal[]> {
  const breached = (Object.entries(sloStatus) as [SLOKey, SLOCheckResult][]).filter(
    ([, check]) => check.status === 'breached'
  );

  if (breached.length === 0) {
    logger.info('No SLO breaches found, no proposals needed');
    return [];
  }

  logger.info(`Found ${breached.length} SLO breaches, generating proposals`);

  const supabase = getSupabase();
  const createdProposals: Proposal[] = [];

  for (const [sloKey, check] of breached) {
    const slo = SLO[sloKey];

    // Only generate proposals for CRITICAL and HIGH tier
    if (slo.tier !== 'CRITICAL' && slo.tier !== 'HIGH') {
      logger.debug(`Skipping MONITOR-tier SLO: ${sloKey}`);
      continue;
    }

    // Check for existing pending proposal
    const exists = await hasPendingProposal(supabase, sloKey);
    if (exists) {
      logger.debug(`Pending proposal already exists for ${sloKey}, skipping`);
      continue;
    }

    const template = getFixTemplate(sloKey, check);

    const proposal: Omit<Proposal, 'id' | 'created_at'> = {
      agent: 'pm-agent',
      title: template.title,
      description: template.suggestedFix,
      rationale: `SLO ${sloKey} breached: measured ${check.sliValue ?? 'N/A'} against target ${check.target ?? 'N/A'}. Tier: ${slo.tier}. Trend: ${check.trend}. Total checks: ${check.totalChecks}, passed: ${check.passedChecks}.`,
      related_slos: [sloKey],
      estimated_effort: template.estimatedEffort,
      priority: tierToPriority(slo.tier),
      status: 'proposed',
      metadata: {
        sliValue: check.sliValue,
        target: check.target,
        trend: check.trend,
        filesAffected: template.filesAffected,
        estimatedRisk: template.estimatedRisk,
      },
    };

    try {
      const { data, error } = await supabase
        .from('agent_proposals')
        .insert(proposal)
        .select()
        .single();

      if (error) {
        logger.error(`Failed to insert proposal for ${sloKey}`, {
          error: error.message,
        });
        continue;
      }

      createdProposals.push(data as Proposal);
      logger.info(`Proposal created for ${sloKey}: ${template.title}`);
    } catch (err) {
      logger.error(`Proposal insert error for ${sloKey}`, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info(`Proposal engine complete: ${createdProposals.length} proposals created`);

  return createdProposals;
}
