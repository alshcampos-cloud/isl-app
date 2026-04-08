/**
 * Report Builder — Assembles the weekly digest from SLO + OKR data.
 *
 * Produces both a structured PMReport object and a formatted HTML email.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { PMReport } from '../shared/types';
import type { SLOKey } from '../shared/slo-definitions';
import { SLO } from '../shared/slo-definitions';
import type { SLOStatusMap, SLOCheckResult } from './slo-checker';
import type { OKRMap, KeyResultValue } from './okr-tracker';
import { Logger } from '../shared/logger';

// ── Types ───────────────────────────────────────────────────────────

export interface ReportInput {
  sloStatus: SLOStatusMap;
  okrProgress: OKRMap;
  periodFrom: string;
  periodTo: string;
}

export interface ReportOutput {
  report: PMReport;
  emailHtml: string;
  emailSubject: string;
}

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

function statusIcon(status: string): string {
  switch (status) {
    case 'met':
    case 'on_track':
    case 'pass':
      return '&#9989;'; // green check
    case 'breached':
    case 'behind':
    case 'fail':
      return '&#10060;'; // red X
    case 'at_risk':
      return '&#9888;&#65039;'; // warning
    case 'no_data':
      return '&#9898;'; // white circle
    default:
      return '&#9898;';
  }
}

function trendArrow(trend: string): string {
  switch (trend) {
    case 'improving':
      return '&#8593;'; // up arrow
    case 'declining':
      return '&#8595;'; // down arrow
    case 'stable':
      return '&#8594;'; // right arrow
    default:
      return '&mdash;';
  }
}

function progressBar(pct: number | null, width: number = 20): string {
  if (pct === null) return '[no data]';
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return `[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${pct}%`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function overallStatus(sloStatus: SLOStatusMap): string {
  const statuses = Object.values(sloStatus);
  const breached = statuses.filter((s) => s.status === 'breached').length;
  const atRisk = statuses.filter((s) => s.status === 'at_risk').length;

  if (breached > 0) return 'BREACHES DETECTED';
  if (atRisk > 0) return 'AT RISK';
  return 'ALL CLEAR';
}

// ── Alert & Proposal counts ─────────────────────────────────────────

async function getAlertCounts(
  from: string,
  to: string
): Promise<Record<string, number>> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('agent_alerts')
      .select('severity')
      .gte('created_at', from)
      .lte('created_at', to);

    if (error || !data) return {};

    const counts: Record<string, number> = {};
    for (const row of data) {
      const sev = (row as any).severity ?? 'unknown';
      counts[sev] = (counts[sev] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

async function getPendingProposals(): Promise<
  Array<{ title: string; priority: string }>
> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('agent_proposals')
      .select('title, priority')
      .eq('status', 'proposed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data) return [];
    return data as Array<{ title: string; priority: string }>;
  } catch {
    return [];
  }
}

async function getKeyMetrics(
  from: string,
  to: string
): Promise<Record<string, number | null>> {
  try {
    const supabase = getSupabase();

    const [usersResult, sessionsResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', from)
        .lte('created_at', to),
    ]);

    return {
      totalUsers: usersResult.count ?? null,
      sessionsThisPeriod: sessionsResult.count ?? null,
    };
  } catch {
    return { totalUsers: null, sessionsThisPeriod: null };
  }
}

// ── Report Builder ──────────────────────────────────────────────────

/**
 * Build the weekly digest report from SLO and OKR data.
 */
export async function buildReport(
  logger: Logger,
  input: ReportInput
): Promise<ReportOutput> {
  const { sloStatus, okrProgress, periodFrom, periodTo } = input;

  logger.info('Building weekly report', { periodFrom, periodTo });

  // Fetch supplementary data
  const [alertCounts, pendingProposals, keyMetrics] = await Promise.all([
    getAlertCounts(periodFrom, periodTo),
    getPendingProposals(),
    getKeyMetrics(periodFrom, periodTo),
  ]);

  const status = overallStatus(sloStatus);
  const dateRange = `${formatDate(periodFrom)} - ${formatDate(periodTo)}`;

  // ── Build email HTML ────────────────────────────────────────────

  const emailSubject = `IAI Weekly Digest -- ${formatDate(periodTo)} -- ${status}`;

  // Section 1: SLO Status
  const sloRows = (Object.entries(sloStatus) as [SLOKey, SLOCheckResult][])
    .map(([key, check]) => {
      const value =
        check.sliValue !== null ? `${check.sliValue}${SLO[key].unit}` : 'N/A';
      const target =
        check.target !== null ? `${check.target}${SLO[key].unit}` : 'Monitor';
      return `
        <tr>
          <td style="padding: 6px 12px;">${key.replace(/_/g, ' ')}</td>
          <td style="padding: 6px 12px; text-align: center;">${statusIcon(check.status)} ${check.status}</td>
          <td style="padding: 6px 12px; text-align: center;">${value}</td>
          <td style="padding: 6px 12px; text-align: center;">${target}</td>
          <td style="padding: 6px 12px; text-align: center;">${trendArrow(check.trend)}</td>
        </tr>`;
    })
    .join('');

  // Section 2: OKR Progress (grouped by objective)
  const objectives = new Map<string, KeyResultValue[]>();
  for (const kr of Object.values(okrProgress)) {
    const existing = objectives.get(kr.objective) ?? [];
    existing.push(kr);
    objectives.set(kr.objective, existing);
  }

  let okrHtml = '';
  for (const [objective, krs] of objectives) {
    const krRows = krs
      .map((kr) => {
        const pctText =
          kr.percentComplete !== null ? `${kr.percentComplete}%` : 'N/A';
        return `
          <tr>
            <td style="padding: 4px 12px;">${kr.krId}</td>
            <td style="padding: 4px 12px;">${kr.description}</td>
            <td style="padding: 4px 12px; text-align: center;">${statusIcon(kr.status)} ${kr.status}</td>
            <td style="padding: 4px 12px; text-align: center;">${kr.currentValue ?? 'N/A'}</td>
            <td style="padding: 4px 12px; text-align: center;">${kr.target}</td>
            <td style="padding: 4px 12px; text-align: center;">${pctText}</td>
          </tr>`;
      })
      .join('');

    okrHtml += `
      <h4 style="margin: 16px 0 8px; color: #374151;">${objective}</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="background: #f3f4f6;">
          <th style="padding: 4px 12px; text-align: left;">KR</th>
          <th style="padding: 4px 12px; text-align: left;">Description</th>
          <th style="padding: 4px 12px;">Status</th>
          <th style="padding: 4px 12px;">Current</th>
          <th style="padding: 4px 12px;">Target</th>
          <th style="padding: 4px 12px;">Progress</th>
        </tr>
        ${krRows}
      </table>`;
  }

  // Section 3: Alerts
  const totalAlerts = Object.values(alertCounts).reduce((s, n) => s + n, 0);
  const alertLines = Object.entries(alertCounts)
    .map(([sev, count]) => `<li>${sev}: ${count}</li>`)
    .join('');

  // Section 4: Proposals
  const proposalLines = pendingProposals
    .map((p) => `<li>[${p.priority}] ${p.title}</li>`)
    .join('');

  // Section 5: Key Metrics
  const metricsLines = Object.entries(keyMetrics)
    .map(([k, v]) => `<li>${k.replace(/([A-Z])/g, ' $1').trim()}: ${v ?? 'N/A'}</li>`)
    .join('');

  const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 700px; margin: 0 auto; color: #1f2937;">
  <div style="background: ${status === 'ALL CLEAR' ? '#10b981' : status === 'AT RISK' ? '#f59e0b' : '#ef4444'}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">IAI Weekly Digest</h1>
    <p style="margin: 4px 0 0; opacity: 0.9;">${dateRange} &mdash; ${status}</p>
  </div>

  <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">

    <!-- Section 1: SLO Status -->
    <h3 style="margin-top: 0; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
      1. SLO Status
    </h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr style="background: #f3f4f6;">
        <th style="padding: 6px 12px; text-align: left;">SLO</th>
        <th style="padding: 6px 12px;">Status</th>
        <th style="padding: 6px 12px;">Value</th>
        <th style="padding: 6px 12px;">Target</th>
        <th style="padding: 6px 12px;">Trend</th>
      </tr>
      ${sloRows}
    </table>

    <!-- Section 2: OKR Progress -->
    <h3 style="margin-top: 24px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
      2. OKR Progress
    </h3>
    ${okrHtml || '<p style="color: #6b7280;">No OKR data available yet.</p>'}

    <!-- Section 3: Alerts This Week -->
    <h3 style="margin-top: 24px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
      3. Alerts This Week (${totalAlerts} total)
    </h3>
    ${totalAlerts > 0 ? `<ul style="margin: 8px 0;">${alertLines}</ul>` : '<p style="color: #6b7280;">No alerts this period.</p>'}

    <!-- Section 4: Proposals Pending -->
    <h3 style="margin-top: 24px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
      4. Proposals Pending (${pendingProposals.length})
    </h3>
    ${pendingProposals.length > 0 ? `<ul style="margin: 8px 0;">${proposalLines}</ul>` : '<p style="color: #6b7280;">No pending proposals.</p>'}

    <!-- Section 5: Key Metrics -->
    <h3 style="margin-top: 24px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
      5. Key Metrics
    </h3>
    <ul style="margin: 8px 0;">${metricsLines}</ul>

  </div>

  <div style="padding: 12px 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
      IAI PM Agent &mdash; Generated ${new Date().toISOString()} &mdash; InterviewAnswers.ai
    </p>
  </div>
</div>`.trim();

  // ── Build structured PMReport ───────────────────────────────────

  const sloSnapshot: Record<string, { status: string; measured: number | null }> = {};
  for (const [key, check] of Object.entries(sloStatus)) {
    sloSnapshot[key] = { status: check.status, measured: check.sliValue };
  }

  const breachedSLOs = Object.entries(sloStatus)
    .filter(([, v]) => v.status === 'breached')
    .map(([k]) => k);

  const summary = [
    `Period: ${dateRange}`,
    `Overall: ${status}`,
    breachedSLOs.length > 0
      ? `Breached SLOs: ${breachedSLOs.join(', ')}`
      : 'No SLO breaches',
    `Alerts: ${totalAlerts}`,
    `Pending proposals: ${pendingProposals.length}`,
  ].join(' | ');

  const report: PMReport = {
    agent: 'pm-agent',
    report_type: 'weekly',
    title: `Weekly Digest - ${formatDate(periodTo)}`,
    body: emailHtml,
    summary,
    period: { from: periodFrom, to: periodTo },
    slo_snapshot: sloSnapshot as any,
    email_sent: false,
    metadata: {
      alertCounts,
      pendingProposalCount: pendingProposals.length,
      keyMetrics,
      okrSummary: Object.fromEntries(
        Object.entries(okrProgress).map(([k, v]) => [k, v.status])
      ),
    },
  };

  logger.info('Report built', { status, breachedSLOs: breachedSLOs.length });

  return { report, emailHtml, emailSubject };
}
