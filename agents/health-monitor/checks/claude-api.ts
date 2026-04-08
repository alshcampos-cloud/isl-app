/**
 * Claude API Check — Availability and Latency
 *
 * Sends a minimal test prompt to Anthropic's Haiku model to verify
 * the API is reachable and responsive.
 *
 * SLO: CLAUDE_API_ERROR_RATE (target 0.5%, alert at 2.0%)
 */

import { createLogger } from '../../shared/logger';
import { SLO } from '../../shared/slo-definitions';
import type { CheckResult } from '../../shared/types';

const logger = createLogger('health-monitor');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const TIMEOUT_MS = 15_000;
const LATENCY_WARNING_MS = 10_000;

export async function checkClaudeAPI(): Promise<CheckResult> {
  const start = Date.now();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const duration_ms = Date.now() - start;
    logger.warn('ANTHROPIC_API_KEY not set — skipping Claude API check');

    return {
      agent: 'health-monitor',
      check_name: 'claude_api_availability',
      slo_key: 'CLAUDE_API_ERROR_RATE',
      status: 'degraded',
      measured_value: null,
      message: 'ANTHROPIC_API_KEY not set — check skipped.',
      metadata: { skipped: true, reason: 'missing_api_key' },
      duration_ms,
    };
  }

  try {
    logger.info('Running Claude API availability check');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 5,
        messages: [
          {
            role: 'user',
            content: 'Reply with OK',
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const latency_ms = Date.now() - start;

    if (!response.ok) {
      const body = await response.text();
      logger.error(`Claude API error: ${response.status}`, { body: body.substring(0, 300) });

      return {
        agent: 'health-monitor',
        check_name: 'claude_api_availability',
        slo_key: 'CLAUDE_API_ERROR_RATE',
        status: 'fail',
        measured_value: latency_ms,
        unit: 'ms',
        target_value: SLO.CLAUDE_API_ERROR_RATE.target,
        message: `Claude API returned HTTP ${response.status}`,
        metadata: {
          http_status: response.status,
          latency_ms,
          response_preview: body.substring(0, 200),
        },
        duration_ms: latency_ms,
      };
    }

    // Parse response to verify we got a valid completion
    const data = await response.json();
    const hasContent =
      data.content &&
      Array.isArray(data.content) &&
      data.content.length > 0;

    if (!hasContent) {
      logger.warn('Claude API returned 200 but empty content', { data });

      return {
        agent: 'health-monitor',
        check_name: 'claude_api_availability',
        slo_key: 'CLAUDE_API_ERROR_RATE',
        status: 'degraded',
        measured_value: latency_ms,
        unit: 'ms',
        message: `Claude API returned 200 but with empty content (${latency_ms}ms)`,
        metadata: { latency_ms, empty_response: true },
        duration_ms: latency_ms,
      };
    }

    // Check for high latency
    const isSlowWarning = latency_ms > LATENCY_WARNING_MS;
    const status = isSlowWarning ? 'degraded' : 'pass';

    const message = isSlowWarning
      ? `Claude API responded but latency is high: ${latency_ms}ms (threshold: ${LATENCY_WARNING_MS}ms)`
      : `Claude API healthy. Latency: ${latency_ms}ms`;

    if (isSlowWarning) {
      logger.warn('Claude API high latency', { latency_ms, threshold: LATENCY_WARNING_MS });
    } else {
      logger.info('Claude API check passed', { latency_ms });
    }

    return {
      agent: 'health-monitor',
      check_name: 'claude_api_availability',
      slo_key: 'CLAUDE_API_ERROR_RATE',
      status,
      measured_value: latency_ms,
      unit: 'ms',
      target_value: SLO.CLAUDE_API_ERROR_RATE.target,
      message,
      metadata: {
        latency_ms,
        model: 'claude-3-5-haiku-20241022',
        stop_reason: data.stop_reason,
        usage: data.usage,
      },
      duration_ms: latency_ms,
    };
  } catch (err) {
    const duration_ms = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    const isTimeout = errorMsg.includes('abort');

    logger.error(`Claude API check ${isTimeout ? 'timed out' : 'error'}: ${errorMsg}`);

    return {
      agent: 'health-monitor',
      check_name: 'claude_api_availability',
      slo_key: 'CLAUDE_API_ERROR_RATE',
      status: 'fail',
      measured_value: duration_ms,
      unit: 'ms',
      message: isTimeout
        ? `Claude API timed out after ${TIMEOUT_MS}ms`
        : `Claude API check error: ${errorMsg}`,
      metadata: {
        latency_ms: duration_ms,
        timeout: isTimeout,
        error: errorMsg,
      },
      duration_ms,
    };
  }
}
