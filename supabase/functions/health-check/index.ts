// health-check/index.ts
// Lightweight health monitoring endpoint for InterviewAnswers.ai
// Protected by HEALTH_CHECK_KEY — do not expose publicly without auth.
//
// Usage: GET /health-check  (with header x-health-key: <secret>)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-health-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface CheckResult {
  status: 'ok' | 'error'
  latency_ms?: number
  configured?: boolean
  model?: string
  error?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: Record<string, CheckResult>
  metrics: Record<string, number | null>
}

// ── Helpers ──────────────────────────────────────────────────────────

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now()
  const result = await fn()
  return { result, ms: Math.round(performance.now() - start) }
}

// ── Individual checks ────────────────────────────────────────────────

async function checkDatabase(supabase: ReturnType<typeof createClient>): Promise<CheckResult> {
  try {
    const { result, ms } = await timed(async () => {
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
    const { result, ms } = await timed(async () => {
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

// ── Metrics ──────────────────────────────────────────────────────────

async function gatherMetrics(
  supabase: ReturnType<typeof createClient>,
): Promise<Record<string, number | null>> {
  const metrics: Record<string, number | null> = {
    total_users: null,
    active_24h: null,
    sessions_today: null,
    api_errors_24h: null,
  }

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  try {
    // Total users from user_profiles
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
    metrics.total_users = totalUsers ?? 0
  } catch { /* swallow — non-critical */ }

  try {
    // Active users in last 24h — users who have usage_tracking entries
    const { count: active24h } = await supabase
      .from('usage_tracking')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_used', twentyFourHoursAgo)
    metrics.active_24h = active24h ?? 0
  } catch { /* swallow */ }

  try {
    // Practice sessions today — count rows in practice_sessions created today
    const { count: sessionsToday } = await supabase
      .from('practice_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart)
    metrics.sessions_today = sessionsToday ?? 0
  } catch { /* swallow */ }

  // api_errors_24h: no dedicated error log table exists yet, report null
  metrics.api_errors_24h = null

  return metrics
}

// ── Main handler ─────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Auth check
  const healthKey = Deno.env.get('HEALTH_CHECK_KEY')
  const providedKey = req.headers.get('x-health-key')

  if (!healthKey || providedKey !== healthKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Supabase admin client (service role — bypasses RLS for counts)
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Run checks in parallel
  const [database, anthropic] = await Promise.all([
    checkDatabase(supabase),
    checkAnthropic(),
  ])
  const tts = checkTTS()
  const stripe = checkStripe()

  const checks: Record<string, CheckResult> = { database, anthropic, tts, stripe }

  // Gather metrics (best-effort, won't fail the whole response)
  const metrics = await gatherMetrics(supabase)

  // Determine overall status
  const criticalChecks = [checks.database, checks.anthropic]
  const allChecks = Object.values(checks)
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  if (criticalChecks.some((c) => c.status === 'error')) {
    overallStatus = 'unhealthy'
  } else if (allChecks.some((c) => c.status === 'error')) {
    overallStatus = 'degraded'
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks,
    metrics,
  }

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
