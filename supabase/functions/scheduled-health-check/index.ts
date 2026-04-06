// scheduled-health-check/index.ts
// Automated health monitoring for InterviewAnswers.ai
//
// Designed to be called every 15 minutes by:
//   - Supabase pg_cron / pg_net
//   - An external cron service (e.g., cron-job.org, GitHub Actions)
//   - Manual invocation for debugging
//
// Auth: requires x-health-key header matching HEALTH_CHECK_KEY env var.
//
// What it does:
//   1. Runs infrastructure checks (DB, Anthropic, TTS config, Stripe config)
//   2. Gathers usage metrics
//   3. Detects anomalies (error rate, session drought, slow queries, slow API)
//   4. Logs result to health_check_history
//   5. Creates system_notifications for any ALERT or WARNING conditions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Types ───────────────────────────────────────────────────────────

interface CheckResult {
  status: 'ok' | 'error'
  latency_ms?: number
  configured?: boolean
  model?: string
  error?: string
}

interface AnomalyResult {
  severity: 'warning' | 'alert'
  title: string
  message: string
}

interface HealthCheckRun {
  overall_status: string
  database_ok: boolean
  anthropic_ok: boolean
  tts_ok: boolean
  stripe_ok: boolean
  total_users: number | null
  active_24h: number | null
  sessions_today: number | null
  errors_24h: number | null
  details: Record<string, unknown>
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-health-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// ── Helpers ─────────────────────────────────────────────────────────

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now()
  const result = await fn()
  return { result, ms: Math.round(performance.now() - start) }
}

/** Pacific time business hours: 7 AM - 10 PM PT (UTC-7 / UTC-8) */
function isBusinessHours(): boolean {
  const now = new Date()
  // Approximate PT as UTC-7 (PDT). Close enough for alerting purposes.
  const ptHour = (now.getUTCHours() - 7 + 24) % 24
  return ptHour >= 7 && ptHour < 22
}

// ── Infrastructure Checks ───────────────────────────────────────────

async function checkDatabase(
  supabase: ReturnType<typeof createClient>,
): Promise<CheckResult> {
  try {
    const { result: _, ms } = await timed(async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
      if (error) throw error
      return data
    })
    return { status: 'ok', latency_ms: ms }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { status: 'error', error: msg }
  }
}

async function checkAnthropic(): Promise<CheckResult> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return { status: 'error', error: 'ANTHROPIC_API_KEY not set' }
  }

  const model = 'claude-haiku-4-5-20251001'
  try {
    const { result: _, ms } = await timed(async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Reply with only the word OK.' }],
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Anthropic ${res.status}: ${body.slice(0, 200)}`)
      }
      return await res.json()
    })
    return { status: 'ok', model, latency_ms: ms }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { status: 'error', model, error: msg }
  }
}

function checkTTS(): CheckResult {
  const key = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY')
  return {
    status: key ? 'ok' : 'error',
    configured: !!key,
    ...(key ? {} : { error: 'GCP_SERVICE_ACCOUNT_KEY not set' }),
  }
}

function checkStripe(): CheckResult {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const bothSet = !!secret && !!stripeKey
  return {
    status: bothSet ? 'ok' : 'error',
    configured: bothSet,
    ...(bothSet ? {} : { error: 'Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY' }),
  }
}

// ── Metrics Gathering ───────────────────────────────────────────────

async function gatherMetrics(
  supabase: ReturnType<typeof createClient>,
): Promise<{
  total_users: number | null
  active_24h: number | null
  sessions_today: number | null
  errors_24h: number | null
  sessions_last_6h: number | null
  error_rate_1h: number | null
}> {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString()

  const metrics = {
    total_users: null as number | null,
    active_24h: null as number | null,
    sessions_today: null as number | null,
    errors_24h: null as number | null,
    sessions_last_6h: null as number | null,
    error_rate_1h: null as number | null,
  }

  // Total users
  try {
    const { count } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
    metrics.total_users = count ?? 0
  } catch { /* non-critical */ }

  // Active users in last 24h
  try {
    const { count } = await supabase
      .from('usage_tracking')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_used', twentyFourHoursAgo)
    metrics.active_24h = count ?? 0
  } catch { /* non-critical */ }

  // Practice sessions today
  try {
    const { count } = await supabase
      .from('practice_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart)
    metrics.sessions_today = count ?? 0
  } catch { /* non-critical */ }

  // Practice sessions in last 6 hours (for drought detection)
  try {
    const { count } = await supabase
      .from('practice_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sixHoursAgo)
    metrics.sessions_last_6h = count ?? 0
  } catch { /* non-critical */ }

  // Error rate in last hour — uses api_error_log table if it exists
  try {
    const { count: errorCount } = await supabase
      .from('api_error_log')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo)

    const { count: totalCalls } = await supabase
      .from('usage_tracking')
      .select('id', { count: 'exact', head: true })
      .gte('last_used', oneHourAgo)

    if (errorCount !== null && totalCalls !== null && totalCalls > 0) {
      metrics.error_rate_1h = Math.round((errorCount / totalCalls) * 100)
      metrics.errors_24h = errorCount // approximate
    }
  } catch {
    // api_error_log table may not exist yet — that is fine
    metrics.error_rate_1h = null
    metrics.errors_24h = null
  }

  return metrics
}

// ── Anomaly Detection ───────────────────────────────────────────────

function detectAnomalies(
  checks: Record<string, CheckResult>,
  metrics: Awaited<ReturnType<typeof gatherMetrics>>,
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = []

  // 1. API error rate > 10% in last hour
  if (metrics.error_rate_1h !== null && metrics.error_rate_1h > 10) {
    anomalies.push({
      severity: 'alert',
      title: 'High API error rate',
      message: `API error rate is ${metrics.error_rate_1h}% in the last hour (threshold: 10%). Investigate Edge Function logs immediately.`,
    })
  }

  // 2. Zero practice sessions in last 6 hours during business hours
  if (
    isBusinessHours() &&
    metrics.sessions_last_6h !== null &&
    metrics.sessions_last_6h === 0 &&
    metrics.total_users !== null &&
    metrics.total_users > 10 // Only alert if we actually have users
  ) {
    anomalies.push({
      severity: 'warning',
      title: 'No practice sessions in 6 hours',
      message: `Zero practice sessions recorded in the last 6 hours during business hours. This may indicate the app is unreachable or a critical flow is broken.`,
    })
  }

  // 3. Database query latency > 5 seconds
  if (
    checks.database?.latency_ms !== undefined &&
    checks.database.latency_ms > 5000
  ) {
    anomalies.push({
      severity: 'alert',
      title: 'Database latency critical',
      message: `Database health check query took ${checks.database.latency_ms}ms (threshold: 5000ms). Possible connection pool exhaustion or heavy query load.`,
    })
  }

  // 4. Anthropic API latency > 10 seconds
  if (
    checks.anthropic?.latency_ms !== undefined &&
    checks.anthropic.latency_ms > 10000
  ) {
    anomalies.push({
      severity: 'warning',
      title: 'Anthropic API slow',
      message: `Anthropic health check took ${checks.anthropic.latency_ms}ms (threshold: 10000ms). Users may experience timeouts during practice sessions.`,
    })
  }

  // 5. Critical service down
  if (checks.database?.status === 'error') {
    anomalies.push({
      severity: 'alert',
      title: 'Database unreachable',
      message: `Database check failed: ${checks.database.error ?? 'Unknown error'}. The app is likely non-functional.`,
    })
  }

  if (checks.anthropic?.status === 'error') {
    anomalies.push({
      severity: 'alert',
      title: 'Anthropic API unreachable',
      message: `Anthropic API check failed: ${checks.anthropic.error ?? 'Unknown error'}. AI features are offline.`,
    })
  }

  return anomalies
}

// ── Persistence ─────────────────────────────────────────────────────

async function logHealthCheck(
  supabase: ReturnType<typeof createClient>,
  run: HealthCheckRun,
): Promise<void> {
  try {
    const { error } = await supabase.from('health_check_history').insert({
      overall_status: run.overall_status,
      database_ok: run.database_ok,
      anthropic_ok: run.anthropic_ok,
      tts_ok: run.tts_ok,
      stripe_ok: run.stripe_ok,
      total_users: run.total_users,
      active_24h: run.active_24h,
      sessions_today: run.sessions_today,
      errors_24h: run.errors_24h,
      details: run.details,
    })
    if (error) {
      console.error('[health-check] Failed to log history:', error.message)
    }
  } catch (e) {
    console.error('[health-check] Failed to log history:', e)
  }
}

async function createNotifications(
  supabase: ReturnType<typeof createClient>,
  anomalies: AnomalyResult[],
): Promise<void> {
  if (anomalies.length === 0) return

  for (const anomaly of anomalies) {
    try {
      // Deduplication: skip if an unresolved notification with the same title
      // was created in the last 60 minutes. Prevents alert storms.
      const oneHourAgo = new Date(
        Date.now() - 60 * 60 * 1000,
      ).toISOString()

      const { count } = await supabase
        .from('system_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('title', anomaly.title)
        .eq('resolved', false)
        .gte('created_at', oneHourAgo)

      if (count && count > 0) {
        console.log(
          `[health-check] Skipping duplicate notification: "${anomaly.title}" (unresolved within last hour)`,
        )
        continue
      }

      const { error } = await supabase.from('system_notifications').insert({
        severity: anomaly.severity,
        title: anomaly.title,
        message: anomaly.message,
      })

      if (error) {
        console.error(
          `[health-check] Failed to create notification "${anomaly.title}":`,
          error.message,
        )
      } else {
        console.warn(
          `[health-check] NOTIFICATION CREATED [${anomaly.severity.toUpperCase()}]: ${anomaly.title}`,
        )
      }
    } catch (e) {
      console.error('[health-check] Notification insert error:', e)
    }
  }
}

// ── Main Handler ────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Auth check — same key as the regular health-check function
  const healthKey = Deno.env.get('HEALTH_CHECK_KEY')
  const providedKey = req.headers.get('x-health-key')

  if (!healthKey || providedKey !== healthKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('[health-check] Scheduled health check started')

  // ── 1. Run infrastructure checks in parallel ──
  const [database, anthropic] = await Promise.all([
    checkDatabase(supabase),
    checkAnthropic(),
  ])
  const tts = checkTTS()
  const stripe = checkStripe()

  const checks: Record<string, CheckResult> = { database, anthropic, tts, stripe }

  // ── 2. Gather metrics ──
  const metrics = await gatherMetrics(supabase)

  // ── 3. Determine overall status ──
  const criticalChecks = [checks.database, checks.anthropic]
  const allChecks = Object.values(checks)
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  if (criticalChecks.some((c) => c.status === 'error')) {
    overallStatus = 'unhealthy'
  } else if (allChecks.some((c) => c.status === 'error')) {
    overallStatus = 'degraded'
  }

  // ── 4. Detect anomalies ──
  const anomalies = detectAnomalies(checks, metrics)

  // ── 5. Log to health_check_history ──
  const run: HealthCheckRun = {
    overall_status: overallStatus,
    database_ok: checks.database.status === 'ok',
    anthropic_ok: checks.anthropic.status === 'ok',
    tts_ok: checks.tts.status === 'ok',
    stripe_ok: checks.stripe.status === 'ok',
    total_users: metrics.total_users,
    active_24h: metrics.active_24h,
    sessions_today: metrics.sessions_today,
    errors_24h: metrics.errors_24h,
    details: {
      checks,
      metrics,
      anomalies,
      business_hours: isBusinessHours(),
    },
  }

  await logHealthCheck(supabase, run)

  // ── 6. Create notifications for anomalies ──
  await createNotifications(supabase, anomalies)

  // ── 7. Build response ──
  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks,
    metrics,
    anomalies,
    notifications_created: anomalies.length,
    business_hours: isBusinessHours(),
  }

  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200

  console.log(
    `[health-check] Completed: ${overallStatus} | anomalies: ${anomalies.length} | db: ${database.latency_ms ?? 'ERR'}ms | anthropic: ${anthropic.latency_ms ?? 'ERR'}ms`,
  )

  return new Response(JSON.stringify(response, null, 2), {
    status: httpStatus,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
