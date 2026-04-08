/**
 * PM Agent — Main orchestrator for InterviewAnswers.ai.
 *
 * Two modes:
 *   'weekly'          — Full digest: SLO check, OKR tracking, report, proposals, email
 *   'alert-triggered' — Focused: SLO check (1h window), proposals for breaches, notify
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createLogger, Logger } from '../shared/logger';
import { sendEmail } from '../shared/alert';
import type { AgentResult, PMReport, Proposal } from '../shared/types';
import { checkSLOs } from './slo-checker';
import type { SLOStatusMap } from './slo-checker';
import { trackOKRs } from './okr-tracker';
import type { OKRMap } from './okr-tracker';
import { buildReport } from './report-builder';
import type { ReportOutput } from './report-builder';
import { generateProposals } from './proposal-engine';

// ── Constants ───────────────────────────────────────────────────────

const SUPABASE_URL = 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';
const ALERT_RECIPIENT = 'alshwenbearcampos@gmail.com';

type PMAgentMode = 'weekly' | 'alert-triggered';

interface PMAgentOptions {
  mode: PMAgentMode;
  sessionId?: string;
  dryRun?: boolean;
}

interface PMAgentResult {
  mode: PMAgentMode;
  sloStatus: SLOStatusMap;
  okrProgress?: OKRMap;
  report?: ReportOutput;
  proposals: Proposal[];
  emailSent: boolean;
}

// ── Supabase client ─────────────────────────────────────────────────

function getSupabase(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Save report to Supabase ─────────────────────────────────────────

async function saveReport(
  logger: Logger,
  report: PMReport
): Promise<void> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('agent_pm_reports')
      .insert(report);

    if (error) {
      logger.error('Failed to save PM report', { error: error.message });
    } else {
      logger.info('PM report saved to agent_pm_reports');
    }
  } catch (err) {
    logger.error('Report save error', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ── Weekly Mode ─────────────────────────────────────────────────────

async function runWeekly(
  logger: Logger,
  dryRun: boolean
): Promise<PMAgentResult> {
  logger.info('PM Agent starting in WEEKLY mode');

  // 1. SLO check (last 7 days)
  const sloStatus = await logger.timed('SLO check (7d)', () =>
    checkSLOs(logger, { periodDays: 7 })
  );

  // 2. OKR tracking
  const okrProgress = await logger.timed('OKR tracking', () =>
    trackOKRs(logger)
  );

  // 3. Build report
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const reportOutput = await logger.timed('Report building', () =>
    buildReport(logger, {
      sloStatus,
      okrProgress,
      periodFrom: weekAgo.toISOString(),
      periodTo: now.toISOString(),
    })
  );

  // 4. Generate proposals for breaches
  const proposals = await logger.timed('Proposal generation', () =>
    generateProposals(logger, sloStatus)
  );

  let emailSent = false;

  if (!dryRun) {
    // 5. Send weekly digest email
    emailSent = await logger.timed('Send weekly digest email', () =>
      sendEmail({
        to: ALERT_RECIPIENT,
        subject: reportOutput.emailSubject,
        body: reportOutput.emailHtml,
      })
    );

    // Update report with email status
    reportOutput.report.email_sent = emailSent;

    // 6. Save report to database
    await saveReport(logger, reportOutput.report);
  } else {
    logger.info('DRY RUN: Skipping email send and report save');
  }

  const breachedCount = Object.values(sloStatus).filter(
    (s) => s.status === 'breached'
  ).length;

  logger.info('PM Agent weekly run complete', {
    breachedSLOs: breachedCount,
    proposalsCreated: proposals.length,
    emailSent,
  });

  return {
    mode: 'weekly',
    sloStatus,
    okrProgress,
    report: reportOutput,
    proposals,
    emailSent,
  };
}

// ── Alert-Triggered Mode ────────────────────────────────────────────

async function runAlertTriggered(
  logger: Logger,
  dryRun: boolean
): Promise<PMAgentResult> {
  logger.info('PM Agent starting in ALERT-TRIGGERED mode');

  // 1. SLO check (last 1 hour, expressed as fraction of a day)
  const sloStatus = await logger.timed('SLO check (1h)', () =>
    checkSLOs(logger, { periodDays: 1 / 24 })
  );

  // 2. Generate proposals for breaches
  const proposals = await logger.timed('Proposal generation', () =>
    generateProposals(logger, sloStatus)
  );

  let emailSent = false;

  // 3. If proposals were created, send notification
  if (proposals.length > 0 && !dryRun) {
    const proposalList = proposals
      .map((p) => `<li><strong>[${p.priority}]</strong> ${p.title}</li>`)
      .join('');

    const breachedKeys = Object.entries(sloStatus)
      .filter(([, v]) => v.status === 'breached')
      .map(([k]) => k);

    const emailBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px;">
  <h2 style="color: #ef4444;">SLO Breach Alert - New Proposals</h2>
  <p>${proposals.length} new proposal(s) generated for SLO breaches detected in the last hour.</p>
  <h3>Breached SLOs</h3>
  <ul>${breachedKeys.map((k) => `<li>${k}</li>`).join('')}</ul>
  <h3>Proposals Created</h3>
  <ul>${proposalList}</ul>
  <hr/>
  <p style="color: #9ca3af; font-size: 12px;">
    IAI PM Agent (alert-triggered) &mdash; ${new Date().toISOString()}
  </p>
</div>`.trim();

    emailSent = await logger.timed('Send breach notification email', () =>
      sendEmail({
        to: ALERT_RECIPIENT,
        subject: `[IAI] ${proposals.length} new proposal(s) for SLO breaches`,
        body: emailBody,
      })
    );
  }

  logger.info('PM Agent alert-triggered run complete', {
    proposalsCreated: proposals.length,
    emailSent,
  });

  return {
    mode: 'alert-triggered',
    sloStatus,
    proposals,
    emailSent,
  };
}

// ── Main entry point ────────────────────────────────────────────────

/**
 * Run the PM Agent.
 *
 * @param options.mode - 'weekly' for full digest, 'alert-triggered' for breach focus
 * @param options.sessionId - Optional session ID for log grouping
 * @param options.dryRun - If true, skip email sending and DB writes
 */
export async function runPMAgent(
  options: PMAgentOptions
): Promise<AgentResult<PMAgentResult>> {
  const { mode, sessionId, dryRun = false } = options;
  const logger = createLogger('pm-agent', sessionId);
  const start = Date.now();

  try {
    let result: PMAgentResult;

    switch (mode) {
      case 'weekly':
        result = await runWeekly(logger, dryRun);
        break;
      case 'alert-triggered':
        result = await runAlertTriggered(logger, dryRun);
        break;
      default:
        throw new Error(`Unknown PM Agent mode: ${mode}`);
    }

    const durationMs = Date.now() - start;
    logger.info(`PM Agent finished (${mode})`, { durationMs });

    return {
      success: true,
      data: result,
      duration_ms: durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const errorMessage = err instanceof Error ? err.message : String(err);

    logger.fatal(`PM Agent failed (${mode}): ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
      duration_ms: durationMs,
    };
  }
}

// ── CLI entry point ─────────────────────────────────────────────────

const isDirectRun =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  process.argv[1].includes('pm-agent');

if (isDirectRun) {
  const mode = (process.argv[2] as PMAgentMode) || 'weekly';
  const dryRun = process.argv.includes('--dry-run');

  console.log(`\nRunning PM Agent in ${mode} mode${dryRun ? ' (dry run)' : ''}...\n`);

  runPMAgent({ mode, dryRun })
    .then((result) => {
      if (result.success) {
        console.log('\nPM Agent completed successfully.');
        if (result.data) {
          const d = result.data;
          const breached = Object.values(d.sloStatus).filter(
            (s) => s.status === 'breached'
          ).length;
          console.log(`  Mode: ${d.mode}`);
          console.log(`  Breached SLOs: ${breached}`);
          console.log(`  Proposals created: ${d.proposals.length}`);
          console.log(`  Email sent: ${d.emailSent}`);
          console.log(`  Duration: ${result.duration_ms}ms`);
        }
      } else {
        console.error(`\nPM Agent failed: ${result.error}`);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}
