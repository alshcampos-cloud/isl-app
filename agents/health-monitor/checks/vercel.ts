/**
 * Vercel Check — Deployment Status
 *
 * Queries the Vercel API for the latest deployment and checks its status.
 * Gracefully skips if VERCEL_TOKEN is not set.
 *
 * SLO: VERCEL_DEPLOY_SUCCESS (100%, zero tolerance)
 */

import { createLogger } from '../../shared/logger';
import { SLO } from '../../shared/slo-definitions';
import type { CheckResult } from '../../shared/types';

const logger = createLogger('health-monitor');

const VERCEL_API_BASE = 'https://api.vercel.com';
const TIMEOUT_MS = 15_000;

interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: string; // READY, ERROR, BUILDING, QUEUED, CANCELED
  created: number;
  readyState?: string;
  meta?: Record<string, unknown>;
}

export async function checkVercel(): Promise<CheckResult> {
  const start = Date.now();

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    const duration_ms = Date.now() - start;
    logger.warn('VERCEL_TOKEN not set — skipping Vercel deployment check');

    return {
      agent: 'health-monitor',
      check_name: 'vercel_deploy_status',
      slo_key: 'VERCEL_DEPLOY_SUCCESS',
      status: 'degraded',
      measured_value: null,
      message: 'VERCEL_TOKEN not set — check skipped. Set the env var to enable deployment monitoring.',
      metadata: { skipped: true, reason: 'missing_token' },
      duration_ms,
    };
  }

  try {
    logger.info('Running Vercel deployment status check');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Build the URL — include teamId if available
    const teamId = process.env.VERCEL_TEAM_ID;
    const params = new URLSearchParams({ limit: '1' });
    if (teamId) params.set('teamId', teamId);

    const response = await fetch(
      `${VERCEL_API_BASE}/v6/deployments?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text();
      const duration_ms = Date.now() - start;

      logger.error(`Vercel API error: ${response.status}`, { body });

      return {
        agent: 'health-monitor',
        check_name: 'vercel_deploy_status',
        slo_key: 'VERCEL_DEPLOY_SUCCESS',
        status: 'error',
        measured_value: null,
        message: `Vercel API returned ${response.status}: ${body.substring(0, 200)}`,
        metadata: { http_status: response.status },
        duration_ms,
      };
    }

    const data = await response.json();
    const deployments: VercelDeployment[] = data.deployments ?? [];

    if (deployments.length === 0) {
      const duration_ms = Date.now() - start;

      return {
        agent: 'health-monitor',
        check_name: 'vercel_deploy_status',
        slo_key: 'VERCEL_DEPLOY_SUCCESS',
        status: 'degraded',
        measured_value: null,
        message: 'No deployments found in Vercel API response',
        metadata: { deployments_count: 0 },
        duration_ms,
      };
    }

    const latest = deployments[0];
    const duration_ms = Date.now() - start;

    const isReady = latest.state === 'READY';
    const isError = latest.state === 'ERROR';
    const isBuilding = latest.state === 'BUILDING' || latest.state === 'QUEUED';

    let status: 'pass' | 'fail' | 'degraded';
    let message: string;

    if (isReady) {
      status = 'pass';
      message = `Latest deployment ${latest.uid} is READY (${latest.url})`;
      logger.info('Vercel deployment check passed', { uid: latest.uid, state: latest.state });
    } else if (isError) {
      status = 'fail';
      message = `Latest deployment ${latest.uid} FAILED with state: ${latest.state}`;
      logger.error('Vercel deployment FAILED', { uid: latest.uid, state: latest.state });
    } else if (isBuilding) {
      status = 'degraded';
      message = `Latest deployment ${latest.uid} is still ${latest.state}`;
      logger.info('Vercel deployment in progress', { uid: latest.uid, state: latest.state });
    } else {
      status = 'degraded';
      message = `Latest deployment ${latest.uid} has unexpected state: ${latest.state}`;
      logger.warn('Vercel deployment unexpected state', { uid: latest.uid, state: latest.state });
    }

    return {
      agent: 'health-monitor',
      check_name: 'vercel_deploy_status',
      slo_key: 'VERCEL_DEPLOY_SUCCESS',
      status,
      measured_value: isReady ? 100 : 0,
      unit: '%',
      target_value: SLO.VERCEL_DEPLOY_SUCCESS.target,
      message,
      metadata: {
        deployment_uid: latest.uid,
        deployment_state: latest.state,
        deployment_url: latest.url,
        deployment_created: new Date(latest.created).toISOString(),
      },
      duration_ms,
    };
  } catch (err) {
    const duration_ms = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);

    logger.error(`Vercel check error: ${errorMsg}`);

    return {
      agent: 'health-monitor',
      check_name: 'vercel_deploy_status',
      slo_key: 'VERCEL_DEPLOY_SUCCESS',
      status: 'error',
      measured_value: null,
      message: `Vercel check threw an error: ${errorMsg}`,
      duration_ms,
    };
  }
}
