/**
 * Alert System for the IAI Agent System.
 *
 * - Inserts alerts into the `agent_alerts` Supabase table
 * - Sends email notifications via Resend
 * - Deduplicates: same alert won't fire twice within 60 minutes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AlertPayload } from './types';

// ── Constants ────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';
const RESEND_API_URL = 'https://api.resend.com/emails';
const ALERT_RECIPIENT = 'alshwenbearcampos@gmail.com';
const ALERT_FROM = 'alerts@interviewanswers.ai';
const DEDUP_WINDOW_MS = 60 * 60 * 1000; // 60 minutes

// ── Supabase singleton ───────────────────────────────────────────────

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Cannot initialize alert system.'
    );
  }

  _supabase = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _supabase;
}

// ── Deduplication ────────────────────────────────────────────────────

/**
 * Build a dedup key from the alert payload.
 * If the payload includes an explicit dedup_key, use it.
 * Otherwise, combine agent + slo_key + title.
 */
function buildDedupKey(payload: AlertPayload): string {
  if (payload.dedup_key) return payload.dedup_key;
  return `${payload.agent}:${payload.slo_key ?? 'none'}:${payload.title}`;
}

/**
 * Check whether an alert with this dedup key was already fired
 * within the dedup window (60 minutes).
 * Returns true if a recent duplicate exists (should skip).
 */
async function isDuplicate(dedupKey: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const cutoff = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();

    const { data, error } = await supabase
      .from('agent_alerts')
      .select('id')
      .eq('dedup_key', dedupKey)
      .gte('created_at', cutoff)
      .limit(1);

    if (error) {
      // If dedup check fails, let the alert through (fail open)
      console.error(`[alert] Dedup check failed: ${error.message}`);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error(
      `[alert] Dedup check error: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
}

// ── Email via Resend ─────────────────────────────────────────────────

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

/**
 * Send an email via the Resend API.
 * Returns true on success, false on failure.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('[alert] RESEND_API_KEY is not set. Cannot send email.');
    return false;
  }

  // Use test sender if no custom domain is verified
  const from = resendApiKey.startsWith('re_test')
    ? 'onboarding@resend.dev'
    : ALERT_FROM;

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.body,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `[alert] Resend API error (${response.status}): ${errorBody}`
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      `[alert] Email send failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
}

// ── Alert formatting ─────────────────────────────────────────────────

function formatAlertEmail(payload: AlertPayload): { subject: string; body: string } {
  const severityEmoji: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
  };

  const emoji = severityEmoji[payload.severity] ?? '⚪';
  const subject = `${emoji} [${payload.severity.toUpperCase()}] ${payload.title}`;

  const measuredLine =
    payload.measured_value !== undefined && payload.measured_value !== null
      ? `<p><strong>Measured:</strong> ${payload.measured_value}</p>`
      : '';

  const thresholdLine =
    payload.threshold_value !== undefined && payload.threshold_value !== null
      ? `<p><strong>Threshold:</strong> ${payload.threshold_value}</p>`
      : '';

  const sloLine = payload.slo_key
    ? `<p><strong>SLO:</strong> ${payload.slo_key}</p>`
    : '';

  const metadataBlock =
    payload.metadata && Object.keys(payload.metadata).length > 0
      ? `<pre>${JSON.stringify(payload.metadata, null, 2)}</pre>`
      : '';

  const body = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px;">
      <h2 style="color: ${payload.severity === 'critical' ? '#dc2626' : '#f59e0b'};">
        ${emoji} ${payload.title}
      </h2>
      <p><strong>Agent:</strong> ${payload.agent}</p>
      <p><strong>Severity:</strong> ${payload.severity.toUpperCase()}</p>
      ${sloLine}
      ${measuredLine}
      ${thresholdLine}
      <p><strong>Message:</strong></p>
      <p>${payload.message}</p>
      ${metadataBlock}
      <hr/>
      <p style="color: #9ca3af; font-size: 12px;">
        IAI Agent System &mdash; ${new Date().toISOString()}
      </p>
    </div>
  `.trim();

  return { subject, body };
}

// ── Main alert function ──────────────────────────────────────────────

/**
 * Fire an alert: deduplicate, insert into Supabase, send email.
 *
 * Returns the inserted alert row (or null if deduplicated/failed).
 */
export async function sendAlert(
  payload: AlertPayload
): Promise<AlertPayload | null> {
  const dedupKey = buildDedupKey(payload);

  // 1. Deduplication check
  const duplicate = await isDuplicate(dedupKey);
  if (duplicate) {
    console.log(
      `[alert] Deduplicated (skipped): "${payload.title}" [${dedupKey}]`
    );
    return null;
  }

  // 2. Send email notification
  const { subject, body } = formatAlertEmail(payload);
  const emailSent = await sendEmail({
    to: ALERT_RECIPIENT,
    subject,
    body,
  });

  // 3. Insert into agent_alerts
  const row: AlertPayload = {
    ...payload,
    dedup_key: dedupKey,
    email_sent: emailSent,
    acknowledged: false,
  };

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('agent_alerts')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error(`[alert] Failed to insert alert: ${error.message}`);
      // Email may have sent even if DB insert failed — log that
      if (emailSent) {
        console.warn('[alert] Email was sent but DB insert failed.');
      }
      return null;
    }

    console.log(
      `[alert] Fired: "${payload.title}" (severity=${payload.severity}, email=${emailSent})`
    );
    return data as AlertPayload;
  } catch (err) {
    console.error(
      `[alert] Insert error: ${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  }
}
