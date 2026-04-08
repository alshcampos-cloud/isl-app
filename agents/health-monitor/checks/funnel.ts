/**
 * Funnel Check — CTA Routing Accuracy
 *
 * ZERO TOLERANCE: Every critical page must return HTTP 200.
 * If any page fails, fire a CRITICAL alert immediately.
 *
 * SLO: CTA_ROUTING_ACCURACY (100%, zero tolerance)
 */

import { createLogger } from '../../shared/logger';
import { SLO, isSLOBreached } from '../../shared/slo-definitions';
import type { CheckResult } from '../../shared/types';

const logger = createLogger('health-monitor');

const CRITICAL_PAGES = [
  { name: 'onboarding', url: 'https://www.interviewanswers.ai/onboarding' },
  { name: 'app', url: 'https://www.interviewanswers.ai/app' },
  { name: 'login', url: 'https://www.interviewanswers.ai/login' },
];

const TIMEOUT_MS = 10_000;

interface PageResult {
  name: string;
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
  latency_ms: number;
}

async function checkPage(page: { name: string; url: string }): Promise<PageResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(page.url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);
    const latency_ms = Date.now() - start;

    return {
      name: page.name,
      url: page.url,
      status: response.status,
      ok: response.status === 200,
      latency_ms,
    };
  } catch (err) {
    const latency_ms = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      name: page.name,
      url: page.url,
      status: null,
      ok: false,
      error: errorMsg,
      latency_ms,
    };
  }
}

export async function checkFunnel(): Promise<CheckResult> {
  const start = Date.now();

  try {
    logger.info('Running funnel check (CTA routing accuracy)');

    const results = await Promise.all(CRITICAL_PAGES.map(checkPage));

    const passCount = results.filter((r) => r.ok).length;
    const totalCount = results.length;
    const accuracy = (passCount / totalCount) * 100;
    const allPassed = passCount === totalCount;

    const failedPages = results.filter((r) => !r.ok);
    const duration_ms = Date.now() - start;

    const failedDetails = failedPages.map(
      (p) => `${p.name} (status=${p.status ?? 'N/A'}, error=${p.error ?? 'none'})`
    );

    const message = allPassed
      ? `All ${totalCount} critical pages returned HTTP 200`
      : `${failedPages.length}/${totalCount} pages failed: ${failedDetails.join('; ')}`;

    if (!allPassed) {
      logger.error('Funnel check FAILED', {
        failedPages: failedDetails,
        accuracy,
      });
    } else {
      logger.info('Funnel check passed', { accuracy, duration_ms });
    }

    return {
      agent: 'health-monitor',
      check_name: 'cta_routing_accuracy',
      slo_key: 'CTA_ROUTING_ACCURACY',
      status: allPassed ? 'pass' : 'fail',
      measured_value: accuracy,
      unit: '%',
      target_value: SLO.CTA_ROUTING_ACCURACY.target,
      message,
      metadata: {
        pages: results.map((r) => ({
          name: r.name,
          status: r.status,
          ok: r.ok,
          latency_ms: r.latency_ms,
          error: r.error,
        })),
      },
      duration_ms,
    };
  } catch (err) {
    const duration_ms = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);

    logger.error(`Funnel check error: ${errorMsg}`);

    return {
      agent: 'health-monitor',
      check_name: 'cta_routing_accuracy',
      slo_key: 'CTA_ROUTING_ACCURACY',
      status: 'error',
      measured_value: null,
      message: `Funnel check threw an error: ${errorMsg}`,
      duration_ms,
    };
  }
}
