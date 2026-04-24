// send-welcome-email/index.ts
//
// Sends the welcome email on signup. Triggered by a Supabase Database Webhook
// (or pg_net trigger) on INSERT into user_profiles.
//
// Routing logic:
//   - If user_profiles.archetype signals nursing (new_grad_rn / nursing / rn)
//     OR raw_user_meta_data.target === 'nursing' → send C1 nursing welcome
//   - Otherwise → send generic A1 general welcome
//
// CRITICAL: This function MUST never cause signup to fail. All delivery errors
// are caught and logged; the function always returns 200 so the webhook does
// not retry forever and does not cascade errors back to the auth flow.
//
// Required env vars:
//   - RESEND_API_KEY      — Resend API key for email delivery
//   - WEBHOOK_SECRET      — optional shared secret; header `x-webhook-secret`
//   - SUPABASE_URL        — set automatically by Supabase
//   - SUPABASE_SERVICE_ROLE_KEY — set automatically by Supabase (used to look
//                          up the auth.users email for the newly inserted
//                          user_profiles row, since user_profiles does not
//                          store email directly)
//
// Created: April 24, 2026 — C1 nursing welcome wire-up (C2–C4 deferred).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const RESEND_API_URL = 'https://api.resend.com/emails'
const FROM_ADDRESS = 'InterviewAnswers.ai <noreply@interviewanswers.ai>'
const FALLBACK_FROM = 'onboarding@resend.dev' // Resend sandbox sender

// ── Email content ────────────────────────────────────────────────────

// C1: Nursing welcome. Copy sourced from
// docs/marketing/GOOGLE_EMAIL_PH_CAMPAIGNS.md "Email C1: Welcome, Nurse"
const C1_NURSING_SUBJECT = 'Your nursing interview prep is ready'
const C1_NURSING_PREHEADER =
  '70+ nurse-specific questions, SBAR drills, and AI coaching'
const C1_NURSING_BODY = `Welcome to the nursing track on InterviewAnswers.ai.

You're in a track built specifically for nurses and nursing-school graduates preparing for their next role.

What's different about the nursing track:
• Clinical scenario questions — panel-style behavioral questions that mirror real hiring manager interviews
• SBAR communication drills — practice the framework interviewers listen for
• Nurse-specific behavioral questions — developed with input from practicing clinicians
• Content grounded in the NCSBN Clinical Judgment Model and published nursing frameworks

We coach how you communicate the clinical experience you already have. We don't generate clinical content from AI — every question is human-reviewed before it reaches you.

Jump in and try your first practice session.`

// A1: General welcome fallback. Copy sourced from
// docs/marketing/GOOGLE_EMAIL_PH_CAMPAIGNS.md "Email A1: Welcome + First Win"
const A1_GENERAL_SUBJECT = 'Your interview prep starts now'
const A1_GENERAL_PREHEADER =
  'Here\'s how to get your first practice session done in 2 minutes'
const A1_GENERAL_BODY = `Welcome to InterviewAnswers.ai.

You just signed up for the tool that lets you practice out loud and get real feedback without wasting real opportunities.

Three places to start:
• AI Mock Interviewer — speaks the question, listens to your answer, asks follow-ups, gives feedback
• Practice Prompter — real-time talking-point guidance while you rehearse
• Practice Mode — self-paced, session-based interview prep

Most people start with "Tell me about yourself" — everyone gets asked it.

Jump in and start your first practice session.`

// ── Helpers ──────────────────────────────────────────────────────────

function wrapInTemplate(
  body: string,
  options: { preheader?: string; ctaUrl?: string; ctaText?: string } = {},
): string {
  const preheader = options.preheader ?? ''
  const ctaHtml = options.ctaUrl
    ? `<p style="text-align:center;margin:24px 0"><a href="${options.ctaUrl}" style="display:inline-block;background:#14b8a6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">${options.ctaText ?? 'Start Practicing'}</a></p>`
    : ''
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>InterviewAnswers.ai</title>
${preheader ? `<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
  <div style="text-align:center;margin-bottom:24px">
    <span style="font-size:18px;font-weight:700;color:#0f172a">InterviewAnswers.ai</span>
  </div>
  <div style="background:white;border-radius:12px;padding:24px 28px;border:1px solid #e2e8f0;color:#0f172a;line-height:1.55;font-size:15px">
    ${body.replace(/\n/g, '<br>')}
    ${ctaHtml}
  </div>
  <p style="font-size:11px;color:#94a3b8;margin-top:24px">
    You are receiving this because you signed up at interviewanswers.ai.<br>
    Reply to this email or contact support@interviewanswers.ai | Koda Labs LLC
  </p>
</div>
</body>
</html>`
}

async function sendEmail(params: {
  to: string
  subject: string
  html: string
  tags?: Array<{ name: string; value: string }>
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.warn('[send-welcome-email] RESEND_API_KEY not set; skipping send')
    return { success: false, error: 'RESEND_API_KEY not set' }
  }

  const from = apiKey.startsWith('re_test') ? FALLBACK_FROM : FROM_ADDRESS

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        reply_to: 'support@interviewanswers.ai',
        tags: params.tags,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error(
        `[send-welcome-email] Resend ${res.status}: ${errBody.slice(0, 200)}`,
      )
      return {
        success: false,
        error: `Resend ${res.status}: ${errBody.slice(0, 200)}`,
      }
    }

    const data = (await res.json()) as { id?: string }
    return { success: true, messageId: data.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[send-welcome-email] fetch failed: ${msg}`)
    return { success: false, error: msg }
  }
}

/**
 * Determine whether this user signed up for the nursing track.
 *
 * Accepts either the user_profiles row (archetype column) or the auth.users
 * raw_user_meta_data.target field, since different signup paths write to
 * different places.
 */
function isNursingSignup(input: {
  archetype?: string | null
  userMetaTarget?: string | null
  onboardingField?: string | null
}): boolean {
  const NURSING_ARCHETYPES = new Set([
    'new_grad_rn',
    'nursing',
    'rn',
    'nurse',
    'experienced_rn',
    'charge_nurse',
  ])
  if (input.archetype && NURSING_ARCHETYPES.has(input.archetype.toLowerCase())) {
    return true
  }
  if (input.userMetaTarget && input.userMetaTarget.toLowerCase() === 'nursing') {
    return true
  }
  if (
    input.onboardingField &&
    /nurs|rn|healthcare/i.test(input.onboardingField)
  ) {
    return true
  }
  return false
}

// ── Main handler ─────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Optional shared-secret check. Supabase Database Webhooks forward custom
  // headers set in the webhook config — use one to prevent open abuse.
  const expectedSecret = Deno.env.get('WEBHOOK_SECRET')
  if (expectedSecret) {
    const provided = req.headers.get('x-webhook-secret')
    if (provided !== expectedSecret) {
      console.warn('[send-welcome-email] rejected: bad webhook secret')
      // Return 200 anyway so the webhook does not retry-loop on misconfig.
      // If someone is probing the endpoint without the secret, they get a
      // no-op. The warn log is the audit trail.
      return new Response(JSON.stringify({ ok: true, skipped: 'auth' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  // Parse payload. Supabase Database Webhooks POST a JSON body shaped like:
  //   { type: 'INSERT', table: 'user_profiles', record: { ... }, old_record: null, schema: 'public' }
  // If this function is called from a pg_net trigger instead, the payload is
  // whatever the trigger built — we accept both shapes defensively.
  let payload: Record<string, unknown> = {}
  try {
    payload = await req.json()
  } catch {
    console.warn('[send-welcome-email] invalid JSON body; no-op')
    return new Response(JSON.stringify({ ok: true, skipped: 'bad_json' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const record =
    (payload.record as Record<string, unknown> | undefined) ??
    (payload as Record<string, unknown>)

  const userId = (record?.id ?? record?.user_id) as string | undefined
  const archetype = (record?.archetype as string | null | undefined) ?? null
  const onboardingField =
    (record?.onboarding_field as string | null | undefined) ?? null

  if (!userId) {
    console.warn('[send-welcome-email] no user id in payload; no-op')
    return new Response(JSON.stringify({ ok: true, skipped: 'no_user_id' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Look up the user's email + user_metadata via service role client.
  // user_profiles does not store email; auth.users does.
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      '[send-welcome-email] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    )
    return new Response(JSON.stringify({ ok: true, skipped: 'no_supabase' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let email: string | null = null
  let userMetaTarget: string | null = null

  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (error) {
      console.warn(
        `[send-welcome-email] admin.getUserById failed: ${error.message}`,
      )
    } else if (data?.user) {
      email = data.user.email ?? null
      const meta = data.user.user_metadata as Record<string, unknown> | null
      const t = meta?.target
      if (typeof t === 'string') userMetaTarget = t
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[send-welcome-email] lookup threw: ${msg}`)
  }

  if (!email) {
    console.warn('[send-welcome-email] no email for user; no-op')
    return new Response(JSON.stringify({ ok: true, skipped: 'no_email' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const nursing = isNursingSignup({
    archetype,
    userMetaTarget,
    onboardingField,
  })

  const subject = nursing ? C1_NURSING_SUBJECT : A1_GENERAL_SUBJECT
  const body = nursing ? C1_NURSING_BODY : A1_GENERAL_BODY
  const preheader = nursing ? C1_NURSING_PREHEADER : A1_GENERAL_PREHEADER
  const ctaText = nursing
    ? 'Start Your First Nursing Practice Session'
    : 'Start Your First Practice Session'
  const ctaUrl = nursing
    ? 'https://www.interviewanswers.ai/?utm_source=lifecycle&utm_medium=email&utm_campaign=c1_nursing_welcome'
    : 'https://www.interviewanswers.ai/?utm_source=lifecycle&utm_medium=email&utm_campaign=a1_general_welcome'

  const html = wrapInTemplate(body, { preheader, ctaUrl, ctaText })

  // Always wrap in try/catch — never surface errors to the caller.
  try {
    const result = await sendEmail({
      to: email,
      subject,
      html,
      tags: [
        { name: 'sequence', value: nursing ? 'c1_nursing_welcome' : 'a1_general_welcome' },
        { name: 'trigger', value: 'user_profiles_insert' },
      ],
    })

    if (!result.success) {
      console.error(
        `[send-welcome-email] delivery failed for ${email}: ${result.error}`,
      )
    } else {
      console.log(
        `[send-welcome-email] sent (${nursing ? 'C1 nursing' : 'A1 general'}) to ${email} id=${result.messageId}`,
      )
    }

    return new Response(
      JSON.stringify({
        ok: true,
        sent: result.success,
        sequence: nursing ? 'c1_nursing_welcome' : 'a1_general_welcome',
        error: result.error ?? null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[send-welcome-email] unexpected error: ${msg}`)
    return new Response(
      JSON.stringify({ ok: true, sent: false, error: msg }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
