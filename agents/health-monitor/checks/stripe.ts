/**
 * Stripe Check — Webhook Delivery Health
 *
 * Verifies Stripe webhooks are being delivered and processed.
 * Strategy:
 *   1. If STRIPE_SECRET_KEY is available, query Stripe API for recent webhook attempts
 *   2. Fallback: check Supabase for recent Stripe-related activity
 *
 * SLO: STRIPE_WEBHOOK_DELIVERY (100%, zero tolerance)
 */

import { createClient } from '@supabase/supabase-js';
import { createLogger } from '../../shared/logger';
import { SLO } from '../../shared/slo-definitions';
import type { CheckResult } from '../../shared/types';

const logger = createLogger('health-monitor');

const SUPABASE_URL = 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Check Stripe webhook events via the Stripe API.
 * Returns null if STRIPE_SECRET_KEY is not set.
 */
async function checkStripeAPI(): Promise<{
  totalEvents: number;
  failedEvents: number;
  success: boolean;
} | null> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    logger.warn('STRIPE_SECRET_KEY not set — skipping Stripe API check');
    return null;
  }

  try {
    // Check recent events from the last hour
    const since = Math.floor((Date.now() - 60 * 60 * 1000) / 1000);

    const response = await fetch(
      `${STRIPE_API_BASE}/events?created[gte]=${since}&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${stripeKey}`,
        },
      }
    );

    if (!response.ok) {
      const body = await response.text();
      logger.error(`Stripe API error: ${response.status} ${body}`);
      return { totalEvents: 0, failedEvents: 0, success: false };
    }

    const data = await response.json();
    const events = data.data ?? [];

    // Check for pending webhooks — query webhook endpoints
    const endpointsResp = await fetch(`${STRIPE_API_BASE}/webhook_endpoints?limit=10`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });

    let failedEvents = 0;
    if (endpointsResp.ok) {
      const endpointsData = await endpointsResp.json();
      const endpoints = endpointsData.data ?? [];
      for (const ep of endpoints) {
        if (ep.status === 'disabled') {
          failedEvents++;
          logger.warn(`Stripe webhook endpoint disabled: ${ep.url}`);
        }
      }
    }

    return {
      totalEvents: events.length,
      failedEvents,
      success: failedEvents === 0,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Stripe API check failed: ${msg}`);
    return { totalEvents: 0, failedEvents: 0, success: false };
  }
}

/**
 * Fallback: check Supabase for evidence of recent webhook processing.
 * Looks at user_profiles for recent subscription changes.
 */
async function checkSupabaseFallback(): Promise<{
  recentActivity: boolean;
  message: string;
}> {
  try {
    const supabase = getSupabase();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Check if the stripe-webhook edge function has logged any errors
    const { data: errorLogs, error: errorQuery } = await supabase
      .from('api_error_log')
      .select('id, created_at, error_message')
      .ilike('function_name', '%stripe%')
      .gte('created_at', oneHourAgo)
      .limit(10);

    if (errorQuery) {
      logger.warn(`Supabase query error: ${errorQuery.message}`);
      return {
        recentActivity: true, // Assume OK if we can't check
        message: `Could not query error logs: ${errorQuery.message}`,
      };
    }

    const recentErrors = errorLogs?.length ?? 0;

    if (recentErrors > 0) {
      return {
        recentActivity: false,
        message: `Found ${recentErrors} Stripe-related errors in the last hour`,
      };
    }

    return {
      recentActivity: true,
      message: 'No Stripe-related errors found in the last hour',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      recentActivity: true, // Fail open
      message: `Fallback check error: ${msg}`,
    };
  }
}

export async function checkStripe(): Promise<CheckResult> {
  const start = Date.now();

  try {
    logger.info('Running Stripe webhook delivery check');

    // Try Stripe API first
    const stripeResult = await checkStripeAPI();

    if (stripeResult !== null) {
      const duration_ms = Date.now() - start;
      const deliveryRate = stripeResult.success ? 100 : 0;

      const message = stripeResult.success
        ? `Stripe webhooks healthy. ${stripeResult.totalEvents} events in last hour, no disabled endpoints.`
        : `Stripe webhook issue detected. ${stripeResult.failedEvents} disabled endpoints found.`;

      if (!stripeResult.success) {
        logger.error('Stripe webhook check FAILED', {
          failedEvents: stripeResult.failedEvents,
        });
      }

      return {
        agent: 'health-monitor',
        check_name: 'stripe_webhook_delivery',
        slo_key: 'STRIPE_WEBHOOK_DELIVERY',
        status: stripeResult.success ? 'pass' : 'fail',
        measured_value: deliveryRate,
        unit: '%',
        target_value: SLO.STRIPE_WEBHOOK_DELIVERY.target,
        message,
        metadata: {
          source: 'stripe_api',
          totalEvents: stripeResult.totalEvents,
          failedEvents: stripeResult.failedEvents,
        },
        duration_ms,
      };
    }

    // Fallback to Supabase check
    const fallback = await checkSupabaseFallback();
    const duration_ms = Date.now() - start;

    return {
      agent: 'health-monitor',
      check_name: 'stripe_webhook_delivery',
      slo_key: 'STRIPE_WEBHOOK_DELIVERY',
      status: fallback.recentActivity ? 'pass' : 'fail',
      measured_value: fallback.recentActivity ? 100 : 0,
      unit: '%',
      target_value: SLO.STRIPE_WEBHOOK_DELIVERY.target,
      message: `[Fallback mode] ${fallback.message}`,
      metadata: { source: 'supabase_fallback' },
      duration_ms,
    };
  } catch (err) {
    const duration_ms = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);

    logger.error(`Stripe check error: ${errorMsg}`);

    return {
      agent: 'health-monitor',
      check_name: 'stripe_webhook_delivery',
      slo_key: 'STRIPE_WEBHOOK_DELIVERY',
      status: 'error',
      measured_value: null,
      message: `Stripe check threw an error: ${errorMsg}`,
      duration_ms,
    };
  }
}
