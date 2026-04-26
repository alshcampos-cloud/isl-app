// marketing-agent/index.ts
// Marketing Agent — Supabase Edge Function runtime (Phase 2)
//
// BACKGROUND:
// Per Battle Scar #22 and agents/LESSONS_AUDIT.md, Vercel serverless can't
// bundle code from /agents/ (cross-directory TS imports don't resolve). Phase 1
// solved this by duplicating the Health Monitor logic as a Deno Edge Function
// at supabase/functions/scheduled-health-check/. Phase 2 follows the same pattern:
// the canonical modules live at agents/marketing-agent/*.ts (the reference
// implementation that Coder-2's Node orchestrator uses); this file is the Deno
// twin that Supabase pg_cron calls directly.
//
// Why inline everything: Deno Edge Functions can't import from /agents/ at all.
// So the system prompt, task prompt builder, targeting templates, channel
// multipliers, and ROI helpers are all embedded below. If you change any of
// these, mirror the change in both places (see comment markers // MIRROR:).
//
// Runtime model:
//   pg_cron → POST /functions/v1/marketing-agent?mode=<mode>
//   → reads marketing_knowledge_versions
//   → optionally calls callAnthropic from ../_shared/anthropic.ts
//   → writes to marketing_content / marketing_campaigns / marketing_reports / agent_proposals
//   → returns { mode, status, durationMs, data, error, timestamp }
//
// Feature flagged behind Deno.env.get('ENABLE_MARKETING_AGENT') === 'true'.
// Per Battle Scar #3: NEVER use raw fetch to Anthropic. ALWAYS callAnthropic.
// Per Battle Scar #8: NEVER charge usage before success (this agent doesn't
// charge at all, but the pattern is upheld).
//
// Created: April 11, 2026 overnight Phase 2 build.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAnthropic, AnthropicError } from '../_shared/anthropic.ts';

// ── CORS ────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-health-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// ── Types (MIRROR: agents/marketing-agent/types.ts) ────────────────

type MarketingChannel =
  | 'meta'
  | 'tiktok_ads'
  | 'apple_search_ads'
  | 'reddit_ads'
  | 'google_ads'
  | 'influencer'
  | 'newsletter'
  | 'podcast'
  | 'email'
  | 'sms'
  | 'organic'
  | 'other';

type CampaignStatus =
  | 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'killed';

type ContentType =
  | 'ad_copy' | 'email' | 'sms' | 'social_post' | 'landing_headline'
  | 'tiktok_script' | 'reddit_comment' | 'linkedin_post' | 'podcast_script'
  | 'press_pitch' | 'influencer_brief' | 'meta_ad_variant' | 'other';

type AudienceSegment =
  | 'new_grad_rn' | 'experienced_rn' | 'icu_nurse' | 'ed_nurse'
  | 'med_surg_nurse' | 'travel_nurse' | 'career_changer_tech'
  | 'career_changer_general' | 'anxious_career_changer_cara'
  | 'returning_to_work' | 'new_grad_general' | 'other';

type MarketingAgentMode =
  | 'weekly-plan' | 'content-burst' | 'campaign-draft' | 'opportunistic-scan';

interface MarketingMetricRow {
  date: string;
  channel: MarketingChannel;
  spend_usd?: number;
  signups?: number;
  paying_users?: number;
}

// ── SLO & channel multipliers (MIRROR: agents/shared/slo-definitions.ts) ──

// SLO.MARKETING_BLENDED_CAC.target — single source of truth in the Node world.
// Inlined here because Deno can't import from /agents/.
const BASE_MAX_CAC_USD = 7.11; // 3:1 LTV:CAC against base LTV $21.34
const MARKETING_PAID_CONVERSION_RATE_TARGET = 0.15; // 15% signup→paid

// MIRROR: agents/marketing-agent/channel-planner.ts → CHANNEL_MULTIPLIERS
const CHANNEL_MULTIPLIERS: Record<MarketingChannel, number> = {
  meta: 1.0,
  tiktok_ads: 1.0,
  apple_search_ads: 1.0,
  reddit_ads: 1.0,
  google_ads: 1.0,
  influencer: 2.11,
  newsletter: 1.41,
  podcast: 1.69,
  email: 0.28,
  sms: 0.21,
  organic: 0,
  other: 1.0,
};

const DEFAULT_MAX_CAC_USD: Record<MarketingChannel, number> = Object.fromEntries(
  (Object.entries(CHANNEL_MULTIPLIERS) as Array<[MarketingChannel, number]>).map(
    ([ch, mult]) => [ch, Math.round(BASE_MAX_CAC_USD * mult * 100) / 100],
  ),
) as Record<MarketingChannel, number>;

// ── ROI helpers (MIRROR: agents/marketing-agent/roi-calculator.ts) ──

const PRICING = {
  general_30d_pass_usd: 14.99,
  nursing_30d_pass_usd: 19.99,
  annual_pass_usd: 99.99,
} as const;

function getLTV(scenario: 'pessimistic' | 'base' | 'optimistic' = 'base'): number {
  return { pessimistic: 9.74, base: 21.34, optimistic: 26.25 }[scenario];
}

function getMaxCAC(ratio = 3, scenario: 'pessimistic' | 'base' | 'optimistic' = 'base'): number {
  return getLTV(scenario) / ratio;
}

function forecastCampaign(input: {
  spend_usd: number;
  channel_conversion_rate: number;
  channel_cpc_usd: number;
}): {
  expected_clicks: number;
  expected_signups: number;
  expected_paying_users: number;
  expected_net_revenue_usd: number;
  expected_roas: number;
  expected_cac_usd: number;
  notes: string[];
} {
  const landing_conversion = 0.15;
  const expected_clicks = Math.floor(input.spend_usd / Math.max(input.channel_cpc_usd, 0.01));
  const expected_signups = Math.floor(expected_clicks * landing_conversion);
  const expected_paying_users = Math.floor(expected_signups * input.channel_conversion_rate);
  const blendedContribution = getLTV('base');
  const expected_net_revenue = expected_paying_users * blendedContribution;
  const expected_roas =
    input.spend_usd > 0 ? Math.round((expected_net_revenue / input.spend_usd) * 100) / 100 : 0;
  const expected_cac =
    expected_paying_users > 0 ? input.spend_usd / expected_paying_users : 0;

  const notes: string[] = [];
  if (expected_paying_users < 3) {
    notes.push('Forecast: <3 paying users. Budget may be below signal threshold.');
  }
  if (expected_cac > getMaxCAC(3, 'base')) {
    notes.push(
      `Forecast CAC $${expected_cac.toFixed(2)} exceeds 3:1 max $${getMaxCAC(3, 'base').toFixed(2)}.`,
    );
  }
  return {
    expected_clicks,
    expected_signups,
    expected_paying_users,
    expected_net_revenue_usd: Math.round(expected_net_revenue * 100) / 100,
    expected_roas,
    expected_cac_usd: Math.round(expected_cac * 100) / 100,
    notes,
  };
}

// ── Prompts (MIRROR: agents/marketing-agent/prompt-templates.ts) ───

const SYSTEM_PROMPT = `You are the Marketing Agent for InterviewAnswers.ai, an AI-powered interview
preparation app with a specialized nursing track. You generate marketing copy
that respects the brand voice, compliance rules, and walled-garden clinical
content boundary.

## Product facts (current as of April 2026)

- **Name:** InterviewAnswers.ai (web) + NurseInterviewPro.ai (nursing landing page, funnels into same app)
- **Pricing:** $14.99 general 30-day pass; $19.99 nursing 30-day pass; $99.99 annual all-access
- **Platforms:** iOS (App Store review), web (live at https://www.interviewanswers.ai)
- **Built by:** Alsh Campos (healthcare professional, USC MS Emergency Management, bilingual)
- **Clinical advisor:** MPH BSN RN, Emergency Department at a major health system
- **Features:**
  - AI Mock Interviewer (voice, listens, transcribes, asks follow-ups, coaches)
  - Live Prompter (real-time talking-point overlay)
  - STAR Method Coach (Situation-Task-Action-Result framework)
  - Practice Mode (self-paced drilling)
  - Nursing SBAR Drill (70+ clinically reviewed questions across 8 specialties)

## Audiences (pick ONE per generation unless told otherwise)

- **Anxious Career-Changer Cara** — 24-34, has interview in <2 weeks, will pay $15-30 once
- **New-Grad RN** — 21-26, BSN in hand, first real RN job, respects clinical review credential
- **Experienced RN specialty changer** — 28-45, confident clinically, nervous about framing
- **Returning-to-Work Rachel** — 32-48, post-caregiving gap, highest willingness to pay

## Brand voice (absolute)

- Professional, nurse-respectful, never condescending
- "Built with a practicing ED RN" — lead with this credibility for nursing audiences
- Concrete and specific beats vague and aspirational
- Real stories over marketing speak
- Banned phrase: "you just need more experience"
- Never use: "Great answer", "Good job", "Nice start", "Overall", "Be more specific"

## Walled garden clinical rules (ABSOLUTE)

- Never invent drug doses, clinical protocols, or medical facts
- Never claim the app is a clinical reference or NCLEX prep
- Always redirect clinical questions to UpToDate or facility protocols
- The AI coaches COMMUNICATION. Humans provide CLINICAL content.

## Compliance

- FTC endorsement disclosures for influencer partnerships (#ad #sponsored)
- No medical advice claims
- State board of nursing rules vary — don't claim board-approved

## Formatting rules

Return valid JSON. No markdown code fences around the JSON. No preamble.
If the task asks for N variants, return:
  { "variants": [ { "variant_name": "A", "title": "...", "body": "...", "rationale": "..." }, ... ] }

Before returning, verify: brand voice OK, walled garden OK, real facts, concrete not vague.`;

const AUDIENCE_LABEL: Record<AudienceSegment, string> = {
  new_grad_rn: 'new-grad registered nurses (BSN in hand, first RN job)',
  experienced_rn: 'experienced registered nurses (3+ years, specialty transitioning)',
  icu_nurse: 'ICU / critical care nurses',
  ed_nurse: 'emergency department nurses',
  med_surg_nurse: 'medical-surgical nurses',
  travel_nurse: 'travel nurses',
  career_changer_tech: 'mid-career tech professionals switching specialties',
  career_changer_general: 'career changers across industries',
  anxious_career_changer_cara: '"Anxious Career-Changer Cara" — 24-34, interview <2 weeks',
  returning_to_work: '"Returning to Work Rachel" — 32-48, post-caregiving gap',
  new_grad_general: 'new grads across non-nursing fields',
  other: 'general job seekers',
};

const CONTENT_TYPE_DESCRIPTIONS: Record<ContentType, string> = {
  ad_copy: 'paid ad copy',
  email: 'marketing email',
  sms: 'marketing SMS message',
  social_post: 'organic social media post',
  landing_headline: 'landing page hero headline + subheadline',
  tiktok_script: 'TikTok video script',
  reddit_comment: 'Reddit helpful comment (value-first, no links)',
  linkedin_post: 'LinkedIn post',
  podcast_script: 'podcast sponsor read',
  press_pitch: 'press pitch email to a journalist',
  influencer_brief: 'influencer partnership brief',
  meta_ad_variant: 'Meta ad variant (text + headline + description)',
  other: 'marketing asset',
};

const CONTENT_TYPE_RULES: Record<ContentType, string> = {
  ad_copy: '- Headline: max 40 chars\n- Primary text: max 125 chars\n- Description: max 30 chars\n- Concrete benefit, not feature',
  meta_ad_variant: '- Primary text: max 125 chars\n- Headline: max 27 chars\n- One benefit + one proof point\n- CTA from Meta allowed set',
  email: '- Subject: max 40 chars\n- Body: max 200 words, one CTA\n- CAN-SPAM compliant\n- No emojis in subject',
  sms: '- Max 160 chars\n- First 40 chars include "InterviewAnswers"\n- Include "Reply STOP to opt out"',
  social_post: '- Lead with hook in first 5-8 words\n- Concrete story > abstract claim\n- LinkedIn ≤3 hashtags, IG 5-10',
  landing_headline: '- Headline max 10 words\n- Subheadline max 20 words\n- No corporate jargon',
  tiktok_script: '- Hook 0-3s pattern-interrupt\n- Setup 3-10s\n- Payoff 10-30s\n- CTA 30-60s\n- 15-60 sec vertical',
  reddit_comment: '- Value-first 90/10\n- No links\n- Conversational 100-300 words\n- Disclose affiliation if needed',
  linkedin_post: '- Hook in first 2 lines\n- 600-1200 chars\n- End with question\n- Max 3 hashtags',
  podcast_script: '- 60-sec conversational read\n- One benefit, one feature, one CTA with promo code',
  press_pitch: '- Subject ≤50 chars newsy\n- Body ≤150 words\n- Lead with timing hook',
  influencer_brief: '- Deliverables, timeline, fee, FTC disclosure, approval workflow',
  other: '- Concrete, specific, short\n- Real product facts\n- Clear CTA',
};

function buildTaskPrompt(input: {
  contentType: ContentType;
  channel?: MarketingChannel;
  audienceSegment?: AudienceSegment;
  count?: number;
  brief?: string;
  knowledgeContext?: string;
}): string {
  const count = input.count ?? 5;
  const audience = input.audienceSegment
    ? AUDIENCE_LABEL[input.audienceSegment]
    : 'the primary target audience';
  const channelLabel = input.channel ?? 'multi-channel';
  const desc = CONTENT_TYPE_DESCRIPTIONS[input.contentType];
  const rules = CONTENT_TYPE_RULES[input.contentType];

  return `## Task

Generate ${count} variant(s) of ${desc} targeting ${audience} for ${channelLabel}.

${input.brief ? `### Human brief\n${input.brief}\n` : ''}

${input.knowledgeContext ? `### Relevant knowledge base context\n${input.knowledgeContext}\n` : ''}

### Format rules
${rules}

### Output schema

Return JSON with this exact shape:

{
  "variants": [
    {
      "variant_name": "A",
      "title": "Short internal label",
      "body": "The actual content",
      "audience_segment": "${input.audienceSegment ?? 'other'}",
      "rationale": "1 sentence: why this variant works"
    }
  ]
}

Do not wrap the JSON in code fences. Return only the JSON object.`;
}

// ── Targeting templates (MIRROR: agents/marketing-agent/geofence-planner.ts) ──

interface TargetingTemplate {
  id: string;
  strategy: string;
  name: string;
  description: string;
  audience: AudienceSegment;
  recommended_channels: MarketingChannel[];
  expected_cac_usd: { min: number; max: number };
  expected_daily_reach: { min: number; max: number };
  min_daily_budget_usd: number;
  compliance_notes: string;
  recommended_hook: string;
}

const TARGETING_TEMPLATES: TargetingTemplate[] = [
  {
    id: 'nursing_school_graduation_windows',
    strategy: 'geofence_event',
    name: 'Nursing School Graduation Geofence — April to June',
    description: 'Fence 3-mile radius around 25 largest US BSN programs during Apr 15–Jun 15 graduation windows.',
    audience: 'new_grad_rn',
    recommended_channels: ['meta', 'tiktok_ads'],
    expected_cac_usd: { min: 4, max: 12 },
    expected_daily_reach: { min: 4000, max: 25000 },
    min_daily_budget_usd: 20,
    compliance_notes: 'Metro-level only. CCPA opt-out. Sponsored disclosure.',
    recommended_hook: '"You graduate in 6 weeks. First RN interview next month. Here is the SBAR question every hiring manager asks."',
  },
  {
    id: 'nclex_test_centers',
    strategy: 'geofence',
    name: 'Pearson VUE NCLEX Test Center Geofence',
    description: 'Fence 2-mile radius around Pearson VUE NCLEX-RN centers. Post-test candidates are peak urgency.',
    audience: 'new_grad_rn',
    recommended_channels: ['meta', 'tiktok_ads', 'apple_search_ads'],
    expected_cac_usd: { min: 3, max: 9 },
    expected_daily_reach: { min: 2000, max: 8000 },
    min_daily_budget_usd: 15,
    compliance_notes: 'Public testing facilities only. Do not fence homes/workplaces.',
    recommended_hook: '"NCLEX done. Now the interview. Clinician-reviewed question bank — free to try."',
  },
  {
    id: 'nursing_career_fair_days',
    strategy: 'geofence_event',
    name: 'Nursing Career Fair Geofence',
    description: 'Fence career fair venues during event dates. 24-48 hour windows.',
    audience: 'new_grad_rn',
    recommended_channels: ['meta', 'tiktok_ads'],
    expected_cac_usd: { min: 3, max: 8 },
    expected_daily_reach: { min: 500, max: 3000 },
    min_daily_budget_usd: 15,
    compliance_notes: 'Public venues, short fence windows.',
    recommended_hook: '"Career fair this week? Walk in with answers, not anxiety. 60-second rehearsal free."',
  },
  {
    id: 'hospital_new_grad_residency_programs',
    strategy: 'geofence',
    name: 'Hospital New-Grad Residency Geofence',
    description: 'Fence 5-mile radius around hospitals with New Grad RN Residency programs.',
    audience: 'new_grad_rn',
    recommended_channels: ['meta'],
    expected_cac_usd: { min: 5, max: 14 },
    expected_daily_reach: { min: 1500, max: 6000 },
    min_daily_budget_usd: 18,
    compliance_notes: 'Metro-level, not building-level.',
    recommended_hook: '"Applied to [Hospital] new-grad residency? Ace the behavioral round. Built with a practicing ED RN."',
  },
  {
    id: 'lookalike_paying_nurse_users',
    strategy: 'lookalike',
    name: 'Lookalike of Paying Nursing Users (1-3%)',
    description: 'With ≥100 paying nursing users as seed, build 1-3% lookalike on Meta + TikTok.',
    audience: 'new_grad_rn',
    recommended_channels: ['meta', 'tiktok_ads'],
    expected_cac_usd: { min: 2, max: 7 },
    expected_daily_reach: { min: 10000, max: 60000 },
    min_daily_budget_usd: 25,
    compliance_notes: 'Hashed email custom audience. GDPR/CCPA compliant.',
    recommended_hook: 'Reuse creative that converted seed users.',
  },
  {
    id: 'lookalike_annual_pass_buyers',
    strategy: 'lookalike',
    name: 'Lookalike of Annual Pass Buyers',
    description: '1% lookalike seeded on $99 annual buyers. Highest-LTV match.',
    audience: 'other',
    recommended_channels: ['meta'],
    expected_cac_usd: { min: 6, max: 18 },
    expected_daily_reach: { min: 5000, max: 25000 },
    min_daily_budget_usd: 30,
    compliance_notes: 'Needs ≥50 annual buyers seed.',
    recommended_hook: '"$99 once, unlimited practice for a year."',
  },
  {
    id: 'retarget_landing_page_bounced',
    strategy: 'retarget',
    name: 'Retarget Landing Page Bouncers (48h)',
    description: 'Retarget 48h landing bouncers with different creative angle.',
    audience: 'other',
    recommended_channels: ['meta', 'tiktok_ads'],
    expected_cac_usd: { min: 2, max: 6 },
    expected_daily_reach: { min: 500, max: 3000 },
    min_daily_budget_usd: 10,
    compliance_notes: 'Frequency cap ≤3/day.',
    recommended_hook: '"Still thinking about it? Here is what the AI said to a user yesterday..."',
  },
  {
    id: 'retarget_paywall_bouncers',
    strategy: 'retarget',
    name: 'Retarget Paywall Viewers (7d)',
    description: 'Retarget paywall non-converters with soft nudge.',
    audience: 'other',
    recommended_channels: ['meta', 'email', 'sms'],
    expected_cac_usd: { min: 1, max: 4 },
    expected_daily_reach: { min: 200, max: 1500 },
    min_daily_budget_usd: 8,
    compliance_notes: 'SMS only to opted-in users.',
    recommended_hook: '"Saw you looked at Pro yesterday. $14.99 one-time, 30 days unlimited."',
  },
  {
    id: 'interview_day_reminder_sms',
    strategy: 'sms_high_intent',
    name: 'Interview Day SMS Reminder (opt-in)',
    description: 'SMS at 7am on user-set interview date.',
    audience: 'anxious_career_changer_cara',
    recommended_channels: ['sms'],
    expected_cac_usd: { min: 0.5, max: 2 },
    expected_daily_reach: { min: 10, max: 100 },
    min_daily_budget_usd: 2,
    compliance_notes: 'TCPA compliant. Explicit opt-in. Reply STOP.',
    recommended_hook: '"Interview at 10am. One last warm-up — 60 seconds, then walk in calm."',
  },
  {
    id: 'behavioral_email_nclex_pass',
    strategy: 'behavioral_email_segment',
    name: 'NCLEX Pass Email Trigger',
    description: '3-email sequence triggered when user tags "NCLEX just passed" in onboarding.',
    audience: 'new_grad_rn',
    recommended_channels: ['email'],
    expected_cac_usd: { min: 1, max: 3 },
    expected_daily_reach: { min: 5, max: 50 },
    min_daily_budget_usd: 0,
    compliance_notes: 'Verified sender domain. Unsubscribe link.',
    recommended_hook: '"You passed NCLEX. Now the interview. 70+ clinician-reviewed questions."',
  },
  {
    id: 'content_repurposing_long_to_short',
    strategy: 'content_repurposing',
    name: 'One Long-Form → 10 TikToks → 5 Tweets → 3 Reels',
    description: 'Weekly repurpose pipeline from one long-form asset.',
    audience: 'other',
    recommended_channels: ['organic'],
    expected_cac_usd: { min: 0, max: 0 },
    expected_daily_reach: { min: 1000, max: 20000 },
    min_daily_budget_usd: 0,
    compliance_notes: 'Attribute source.',
    recommended_hook: 'Turn a 20-minute clinical co-founder interview into 10 daily-tip TikToks.',
  },
  {
    id: 'programmatic_seo_hospital_interview_pages',
    strategy: 'programmatic_seo',
    name: 'Programmatic SEO: [Hospital] [Specialty] Interview Guide Pages',
    description: '50 hospitals × 8 specialties = 400 long-tail ranking pages.',
    audience: 'new_grad_rn',
    recommended_channels: ['organic'],
    expected_cac_usd: { min: 0, max: 0 },
    expected_daily_reach: { min: 500, max: 5000 },
    min_daily_budget_usd: 0,
    compliance_notes: 'No claim of hospital endorsement. Unique editorial per page.',
    recommended_hook: 'Real interview questions for [Hospital] [Specialty] RN candidates, plus free SBAR drill.',
  },
  {
    id: 'interest_layer_nursing_anxiety',
    strategy: 'interest_layering',
    name: 'Meta Interest Stack: Nursing + Self-Improvement + NCLEX',
    description: 'Layer 3 Meta interest signals to find exact Cara ICP inside nursing audience.',
    audience: 'new_grad_rn',
    recommended_channels: ['meta'],
    expected_cac_usd: { min: 5, max: 13 },
    expected_daily_reach: { min: 3000, max: 15000 },
    min_daily_budget_usd: 20,
    compliance_notes: 'Meta gates some sensitive interests — use proxies.',
    recommended_hook: '"Dry mouth, shaky hands, blank mind. That is a nursing interview. Here is the 60-second drill."',
  },
];

function rankByLeverage(templates: TargetingTemplate[]): TargetingTemplate[] {
  return [...templates].sort((a, b) => {
    const aCac = (a.expected_cac_usd.min + a.expected_cac_usd.max) / 2;
    const bCac = (b.expected_cac_usd.min + b.expected_cac_usd.max) / 2;
    const aReach = (a.expected_daily_reach.min + a.expected_daily_reach.max) / 2;
    const bReach = (b.expected_daily_reach.min + b.expected_daily_reach.max) / 2;
    const aScore = aReach / Math.max(aCac, 1) / Math.max(a.min_daily_budget_usd, 1);
    const bScore = bReach / Math.max(bCac, 1) / Math.max(b.min_daily_budget_usd, 1);
    return bScore - aScore;
  });
}

// ── Utilities ───────────────────────────────────────────────────────

async function logAgentEvent(
  supabase: SupabaseClient,
  level: 'info' | 'warn' | 'error',
  message: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { error } = await supabase.from('agent_logs').insert({
      agent: 'marketing-agent',
      level,
      message,
      details,
    });
    if (error) {
      console.error('[marketing-agent] agent_logs insert failed:', error.message);
    }
  } catch (e) {
    console.error('[marketing-agent] agent_logs insert exception:', e);
  }
}

function extractJson(raw: string): unknown {
  // Strip fences if the model emitted them despite the rule
  let s = raw.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  // Find first { and last } as a fallback
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first === -1 || last === -1 || last < first) {
    throw new Error('No JSON object found in model output');
  }
  const slice = s.slice(first, last + 1);
  return JSON.parse(slice);
}

async function loadKnowledgeContext(
  supabase: SupabaseClient,
  charBudget = 8000,
): Promise<{ context: string; sources: string[]; version: string | null }> {
  try {
    const { data, error } = await supabase
      .from('marketing_knowledge_versions')
      .select('version, file_path, body, active')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[marketing-agent] knowledge load failed:', error.message);
      return { context: '', sources: [], version: null };
    }

    const rows = (data ?? []) as Array<{
      version: string;
      file_path: string;
      body: string;
    }>;
    if (rows.length === 0) {
      return { context: '', sources: [], version: null };
    }

    const perFileCap = Math.floor(charBudget * 0.45);
    const parts: string[] = [];
    const sources: string[] = [];
    let used = 0;
    for (const row of rows) {
      if (used >= charBudget) break;
      const remaining = charBudget - used;
      const slice = (row.body ?? '').slice(0, Math.min(perFileCap, remaining));
      if (!slice) continue;
      parts.push(`### ${row.file_path}\n${slice}`);
      sources.push(row.file_path);
      used += slice.length;
    }
    return {
      context: parts.join('\n\n'),
      sources,
      version: rows[0]?.version ?? null,
    };
  } catch (e) {
    console.error('[marketing-agent] loadKnowledgeContext error:', e);
    return { context: '', sources: [], version: null };
  }
}

// ── Auth ────────────────────────────────────────────────────────────

const FOUNDER_EMAIL = 'alshwenbearcampos@gmail.com';

async function authorize(
  req: Request,
  supabase: SupabaseClient,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  if (!token) {
    return {
      ok: false,
      response: jsonResponse(
        {
          mode: 'unknown',
          status: 'error',
          durationMs: 0,
          data: null,
          error: 'Missing Authorization Bearer token',
          timestamp: new Date().toISOString(),
        },
        401,
      ),
    };
  }

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (serviceKey && token === serviceKey) {
    return { ok: true };
  }

  // Otherwise treat as user JWT, whitelist founder email
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return {
        ok: false,
        response: jsonResponse(
          {
            mode: 'unknown',
            status: 'error',
            durationMs: 0,
            data: null,
            error: 'Invalid token',
            timestamp: new Date().toISOString(),
          },
          401,
        ),
      };
    }
    if ((data.user.email ?? '').toLowerCase() !== FOUNDER_EMAIL) {
      return {
        ok: false,
        response: jsonResponse(
          {
            mode: 'unknown',
            status: 'error',
            durationMs: 0,
            data: null,
            error: 'Not authorized for Marketing Agent',
            timestamp: new Date().toISOString(),
          },
          403,
        ),
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      response: jsonResponse(
        {
          mode: 'unknown',
          status: 'error',
          durationMs: 0,
          data: null,
          error: `Auth error: ${e instanceof Error ? e.message : String(e)}`,
          timestamp: new Date().toISOString(),
        },
        401,
      ),
    };
  }
}

// ── Response helper ─────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildEnvelope(
  mode: MarketingAgentMode | 'unknown',
  status: 'ok' | 'error' | 'disabled',
  startedAt: number,
  data: unknown,
  error: string | null,
) {
  return {
    mode,
    status,
    durationMs: Date.now() - startedAt,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
}

// ── Mode 1: weekly-plan ─────────────────────────────────────────────

async function runWeeklyPlan(
  supabase: SupabaseClient,
): Promise<{ reportId: string | null; proposalIds: string[]; reviews: unknown[] }> {
  const periodDays = 7;
  const minSample = 3;
  const since = new Date(Date.now() - periodDays * 86400 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from('marketing_metrics')
    .select('date, channel, spend_usd, signups, paying_users')
    .gte('date', since);

  if (error) {
    console.error('[marketing-agent] weekly-plan metrics query failed:', error.message);
    await logAgentEvent(supabase, 'error', 'weekly-plan metrics query failed', {
      error: error.message,
    });
    return { reportId: null, proposalIds: [], reviews: [] };
  }

  const rows = (data ?? []) as MarketingMetricRow[];

  const agg = new Map<
    MarketingChannel,
    { spend: number; signups: number; payingUsers: number; rowCount: number }
  >();
  for (const row of rows) {
    const ch = row.channel;
    const cur = agg.get(ch) ?? { spend: 0, signups: 0, payingUsers: 0, rowCount: 0 };
    cur.spend += row.spend_usd ?? 0;
    cur.signups += row.signups ?? 0;
    cur.payingUsers += row.paying_users ?? 0;
    cur.rowCount += 1;
    agg.set(ch, cur);
  }

  const reviews: Array<{
    channel: MarketingChannel;
    spend: number;
    signups: number;
    payingUsers: number;
    blendedCac: number | null;
    targetCac: number;
    cacRatio: number | null;
    action: string;
    reasoning: string;
    suggestedBudgetUsd: number | null;
  }> = [];

  const proposalsToWrite: Array<{
    title: string;
    description: string;
    rationale: string;
    channel: MarketingChannel;
    action: string;
    priority: 'p0' | 'p1' | 'p2';
  }> = [];

  for (const [channel, d] of agg.entries()) {
    const blendedCac = d.payingUsers > 0 ? d.spend / d.payingUsers : null;
    const targetCac = DEFAULT_MAX_CAC_USD[channel] ?? BASE_MAX_CAC_USD;
    const cacRatio = blendedCac !== null && targetCac > 0 ? blendedCac / targetCac : null;

    let action = 'hold';
    let reasoning = '';
    let suggestedBudgetUsd: number | null = null;
    let priority: 'p0' | 'p1' | 'p2' = 'p2';

    if (d.payingUsers < minSample) {
      action = 'insufficient_data';
      reasoning = `Only ${d.payingUsers} paying users over ${periodDays} days — below ${minSample}-user threshold.`;
    } else if (cacRatio === null || blendedCac === null) {
      action = 'insufficient_data';
      reasoning = `Could not compute CAC.`;
    } else if (cacRatio > 1.5) {
      action = 'kill';
      reasoning = `CAC $${blendedCac.toFixed(2)} is ${cacRatio.toFixed(2)}× max $${targetCac.toFixed(2)}. Kill.`;
      suggestedBudgetUsd = 0;
      priority = 'p0';
    } else if (cacRatio > 1.0) {
      action = 'reduce';
      reasoning = `CAC $${blendedCac.toFixed(2)} is ${cacRatio.toFixed(2)}× max $${targetCac.toFixed(2)}. Halve budget.`;
      suggestedBudgetUsd = Math.round((d.spend / periodDays / 2) * 100) / 100;
      priority = 'p1';
    } else if (cacRatio < 0.5) {
      action = 'scale';
      reasoning = `CAC $${blendedCac.toFixed(2)} is ${cacRatio.toFixed(2)}× max $${targetCac.toFixed(2)}. Double budget.`;
      suggestedBudgetUsd = Math.round(((d.spend / periodDays) * 2) * 100) / 100;
      priority = 'p1';
    } else {
      action = 'hold';
      reasoning = `CAC $${blendedCac.toFixed(2)} is ${cacRatio.toFixed(2)}× max $${targetCac.toFixed(2)}. Hold.`;
    }

    reviews.push({
      channel,
      spend: d.spend,
      signups: d.signups,
      payingUsers: d.payingUsers,
      blendedCac,
      targetCac,
      cacRatio,
      action,
      reasoning,
      suggestedBudgetUsd,
    });

    if (action === 'kill' || action === 'reduce' || action === 'scale') {
      const verb = action === 'kill' ? 'Kill' : action === 'reduce' ? 'Reduce' : 'Scale';
      proposalsToWrite.push({
        title: `${verb} ${channel} campaign (${periodDays}d CAC review)`,
        description:
          action === 'kill'
            ? `Pause all ${channel} spend. Reallocate to top performer.`
            : action === 'reduce'
              ? `Cut ${channel} daily budget to ~$${suggestedBudgetUsd?.toFixed(2)} for 7 days.`
              : `Double ${channel} daily budget to ~$${suggestedBudgetUsd?.toFixed(2)} for 7 days.`,
        rationale: reasoning,
        channel,
        action,
        priority,
      });
    }
  }

  // Write proposals
  const proposalIds: string[] = [];
  for (const p of proposalsToWrite) {
    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('agent_proposals')
        .insert({
          agent: 'marketing-agent',
          status: 'pending',
          title: p.title,
          context: p.rationale,
          suggested_fix: p.description,
          severity:
            p.priority === 'p0' ? 'CRITICAL' : p.priority === 'p1' ? 'HIGH' : 'MONITOR',
          files_affected: [],
          estimated_risk: p.action === 'scale' ? 'medium' : 'low',
          metadata: {
            source: 'weekly-plan',
            channel: p.channel,
            action: p.action,
            priority: p.priority,
          },
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error('[marketing-agent] proposal insert error:', insertErr.message);
        continue;
      }
      if (inserted?.id) proposalIds.push(inserted.id as string);
    } catch (e) {
      console.error('[marketing-agent] proposal insert exception:', e);
    }
  }

  // Build the digest markdown
  const lines: string[] = [];
  lines.push(`# Marketing Weekly Digest`);
  lines.push(``);
  lines.push(`_Period: last ${periodDays} days — generated ${new Date().toISOString()}_`);
  lines.push(``);
  lines.push(`## TL;DR`);
  lines.push(`- Channels reviewed: ${reviews.length}`);
  lines.push(`- Proposals written: ${proposalIds.length}`);
  lines.push(
    `- Kills: ${proposalsToWrite.filter((p) => p.action === 'kill').length} / Reductions: ${proposalsToWrite.filter((p) => p.action === 'reduce').length} / Scales: ${proposalsToWrite.filter((p) => p.action === 'scale').length}`,
  );
  lines.push(``);
  lines.push(`## Channel performance`);
  lines.push(``);
  lines.push(`| Channel | Spend | Signups | Paying | CAC | Target | Action |`);
  lines.push(`|---------|-------|---------|--------|-----|--------|--------|`);
  for (const r of reviews) {
    const cac = r.blendedCac !== null ? `$${r.blendedCac.toFixed(2)}` : '—';
    lines.push(
      `| ${r.channel} | $${r.spend.toFixed(2)} | ${r.signups} | ${r.payingUsers} | ${cac} | $${r.targetCac.toFixed(2)} | ${r.action} |`,
    );
  }
  lines.push(``);
  lines.push(`## Proposed rebalance`);
  if (proposalsToWrite.length === 0) {
    lines.push(`_No rebalance proposals this week._`);
  } else {
    for (const p of proposalsToWrite) {
      lines.push(`- **${p.title}** — ${p.description}`);
    }
  }
  const bodyMd = lines.join('\n');

  // Write report
  let reportId: string | null = null;
  try {
    const { data: inserted, error: insertErr } = await supabase
      .from('marketing_reports')
      .insert({
        report_type: 'weekly',
        title: `Marketing Weekly Digest — ${new Date().toISOString().slice(0, 10)}`,
        summary: `Reviewed ${reviews.length} channels; wrote ${proposalIds.length} proposals.`,
        body_md: bodyMd,
        period_from: since,
        period_to: new Date().toISOString().slice(0, 10),
        channel_snapshot: { reviews },
        active_campaign_ids: [],
        email_sent: false,
        metadata: { source: 'marketing-agent edge function' },
      })
      .select('id')
      .single();
    if (insertErr) {
      console.error('[marketing-agent] report insert error:', insertErr.message);
    } else {
      reportId = (inserted?.id as string) ?? null;
    }
  } catch (e) {
    console.error('[marketing-agent] report insert exception:', e);
  }

  // Optional email via Resend — gracefully skip if RESEND_API_KEY missing
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (resendKey && reportId) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Marketing Agent <agent@interviewanswers.ai>',
          to: [FOUNDER_EMAIL],
          subject: `Marketing Weekly Digest — ${new Date().toISOString().slice(0, 10)}`,
          text: bodyMd,
        }),
      });
      if (emailRes.ok) {
        await supabase
          .from('marketing_reports')
          .update({ email_sent: true })
          .eq('id', reportId);
      } else {
        const bodyText = await emailRes.text();
        console.warn('[marketing-agent] resend email failed:', bodyText.slice(0, 200));
        await supabase
          .from('marketing_reports')
          .update({ email_sent: false, email_error: bodyText.slice(0, 500) })
          .eq('id', reportId);
      }
    } catch (e) {
      console.warn('[marketing-agent] resend email exception:', e);
    }
  }

  return { reportId, proposalIds, reviews };
}

// ── Mode 2: content-burst ───────────────────────────────────────────

interface ContentBurstInput {
  contentType: ContentType;
  channel?: MarketingChannel;
  audienceSegment?: AudienceSegment;
  count?: number;
  brief?: string;
}

async function runContentBurst(
  supabase: SupabaseClient,
  input: ContentBurstInput,
): Promise<{ insertedIds: string[]; variantCount: number; version: string | null }> {
  const count = Math.min(Math.max(input.count ?? 5, 1), 10);

  const knowledge = await loadKnowledgeContext(supabase, 8000);

  const taskPrompt = buildTaskPrompt({
    contentType: input.contentType,
    channel: input.channel,
    audienceSegment: input.audienceSegment,
    count,
    brief: input.brief,
    knowledgeContext: knowledge.context || undefined,
  });

  let modelResponse;
  try {
    modelResponse = await callAnthropic({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.8,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: taskPrompt }],
    });
  } catch (err) {
    if (err instanceof AnthropicError) {
      console.error('[marketing-agent] Anthropic call failed:', err.code, err.userMessage);
      await logAgentEvent(supabase, 'error', 'Anthropic call failed in content-burst', {
        code: err.code,
        status: err.status,
      });
    } else {
      console.error('[marketing-agent] unexpected Anthropic error:', err);
    }
    throw err;
  }

  const raw = modelResponse.content?.[0]?.text ?? '';
  let parsed: unknown;
  try {
    parsed = extractJson(raw);
  } catch (e) {
    console.error('[marketing-agent] JSON parse failed:', e);
    await logAgentEvent(supabase, 'error', 'content-burst JSON parse failed', {
      rawSample: raw.slice(0, 300),
    });
    throw new Error('Model returned unparseable JSON');
  }

  const variants = Array.isArray((parsed as { variants?: unknown })?.variants)
    ? ((parsed as { variants: Array<Record<string, unknown>> }).variants)
    : [];

  if (variants.length === 0) {
    throw new Error('Model returned no variants');
  }

  const insertedIds: string[] = [];
  for (const v of variants) {
    const body = typeof v.body === 'string' ? v.body : '';
    if (!body) continue;
    const title = typeof v.title === 'string' ? v.title : null;
    const variant_name = typeof v.variant_name === 'string' ? v.variant_name : null;

    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('marketing_content')
        .insert({
          content_type: input.contentType,
          channel: input.channel ?? null,
          title,
          body,
          variant_name,
          audience_segment: input.audienceSegment ?? null,
          approved: false, // NEVER auto-approve
          generated_by: 'marketing-agent',
          source_prompt: taskPrompt.slice(0, 4000),
          source_version: knowledge.version,
          metadata: {
            source: 'content-burst',
            rationale: typeof v.rationale === 'string' ? v.rationale : undefined,
            knowledge_sources: knowledge.sources,
          },
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error('[marketing-agent] marketing_content insert error:', insertErr.message);
        continue;
      }
      if (inserted?.id) insertedIds.push(inserted.id as string);
    } catch (e) {
      console.error('[marketing-agent] marketing_content insert exception:', e);
    }
  }

  return { insertedIds, variantCount: variants.length, version: knowledge.version };
}

// ── Mode 3: campaign-draft ──────────────────────────────────────────

interface CampaignDraftInput {
  name: string;
  channel: MarketingChannel;
  budgetUsd: number;
  startDate: string;
  endDate: string;
  audienceSegment: AudienceSegment;
  brief?: string;
}

async function runCampaignDraft(
  supabase: SupabaseClient,
  input: CampaignDraftInput,
): Promise<{ campaignId: string | null; forecast: unknown }> {
  // Channel assumptions — rough defaults. Production version will pull from metrics.
  const channelCpc: Record<MarketingChannel, number> = {
    meta: 1.2,
    tiktok_ads: 0.9,
    apple_search_ads: 1.5,
    reddit_ads: 0.8,
    google_ads: 2.0,
    influencer: 0,
    newsletter: 0,
    podcast: 0,
    email: 0,
    sms: 0,
    organic: 0,
    other: 1.0,
  };

  const cpc = channelCpc[input.channel] || 1.0;
  const forecast = forecastCampaign({
    spend_usd: input.budgetUsd,
    channel_conversion_rate: MARKETING_PAID_CONVERSION_RATE_TARGET,
    channel_cpc_usd: cpc,
  });

  let campaignId: string | null = null;
  try {
    const { data: inserted, error: insertErr } = await supabase
      .from('marketing_campaigns')
      .insert({
        name: input.name,
        channel: input.channel,
        status: 'draft' as CampaignStatus,
        budget_usd: input.budgetUsd,
        spent_usd: 0,
        start_date: input.startDate,
        end_date: input.endDate,
        targeting: {
          audience_segment: input.audienceSegment,
          brief: input.brief ?? null,
        },
        creative_ids: [],
        expected_cac_usd: forecast.expected_cac_usd,
        expected_roas: forecast.expected_roas,
        impressions: 0,
        clicks: 0,
        signups: 0,
        paying_users: 0,
        net_revenue_usd: 0,
        notes: input.brief ?? null,
        metadata: {
          source: 'campaign-draft',
          forecast_notes: forecast.notes,
          cpc_assumption: cpc,
        },
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error('[marketing-agent] campaign insert error:', insertErr.message);
    } else {
      campaignId = (inserted?.id as string) ?? null;
    }
  } catch (e) {
    console.error('[marketing-agent] campaign insert exception:', e);
  }

  return { campaignId, forecast };
}

// ── Mode 4: opportunistic-scan ──────────────────────────────────────

async function runOpportunisticScan(
  supabase: SupabaseClient,
): Promise<{ proposalIds: string[]; top: unknown[] }> {
  const ranked = rankByLeverage(TARGETING_TEMPLATES).slice(0, 5);
  const proposalIds: string[] = [];

  for (const t of ranked) {
    const avgCac = (t.expected_cac_usd.min + t.expected_cac_usd.max) / 2;
    const title = `Targeting template: ${t.name}`;
    const description =
      `Strategy: ${t.strategy}\n\n` +
      `Audience: ${t.audience}\n` +
      `Channels: ${t.recommended_channels.join(', ')}\n` +
      `Min daily budget: $${t.min_daily_budget_usd}\n` +
      `Expected CAC: $${t.expected_cac_usd.min}-$${t.expected_cac_usd.max}\n` +
      `Expected daily reach: ${t.expected_daily_reach.min}-${t.expected_daily_reach.max}\n\n` +
      `Hook: "${t.recommended_hook}"\n\n` +
      `Compliance: ${t.compliance_notes}`;
    const rationale = `Expected CAC $${avgCac.toFixed(2)} — ${
      avgCac < BASE_MAX_CAC_USD ? 'passes' : 'marginal on'
    } 3:1 LTV:CAC at base LTV $21.34.`;

    try {
      // Dedup: skip if an unresolved proposal with this title exists in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
      const { count } = await supabase
        .from('agent_proposals')
        .select('id', { count: 'exact', head: true })
        .eq('title', title)
        .eq('agent', 'marketing-agent')
        .gte('created_at', sevenDaysAgo);

      if (count && count > 0) {
        console.log(`[marketing-agent] skip duplicate proposal: ${title}`);
        continue;
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('agent_proposals')
        .insert({
          agent: 'marketing-agent',
          status: 'pending',
          title,
          context: rationale,
          suggested_fix: description,
          severity: 'MONITOR',
          files_affected: [],
          estimated_risk: 'low',
          metadata: {
            source: 'opportunistic-scan',
            template_id: t.id,
            strategy: t.strategy,
            audience: t.audience,
            recommended_channels: t.recommended_channels,
          },
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error('[marketing-agent] opportunistic proposal insert error:', insertErr.message);
        continue;
      }
      if (inserted?.id) proposalIds.push(inserted.id as string);
    } catch (e) {
      console.error('[marketing-agent] opportunistic proposal exception:', e);
    }
  }

  return {
    proposalIds,
    top: ranked.map((t) => ({
      id: t.id,
      name: t.name,
      strategy: t.strategy,
      avg_cac: (t.expected_cac_usd.min + t.expected_cac_usd.max) / 2,
    })),
  };
}

// ── Main handler ────────────────────────────────────────────────────

serve(async (req: Request) => {
  const startedAt = Date.now();

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Feature flag
  if (Deno.env.get('ENABLE_MARKETING_AGENT') !== 'true') {
    return jsonResponse(
      buildEnvelope(
        'unknown',
        'disabled',
        startedAt,
        null,
        'Marketing Agent behind feature flag ENABLE_MARKETING_AGENT',
      ),
      200,
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(
      buildEnvelope('unknown', 'error', startedAt, null, 'Supabase env vars missing'),
      500,
    );
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Auth
  const authResult = await authorize(req, supabase);
  if (!authResult.ok) return authResult.response;

  // Parse mode from query string OR body
  const url = new URL(req.url);
  let mode = (url.searchParams.get('mode') ?? '') as MarketingAgentMode;
  let body: Record<string, unknown> = {};
  if (req.method === 'POST') {
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text) as Record<string, unknown>;
        if (!mode && typeof body.mode === 'string') mode = body.mode as MarketingAgentMode;
      }
    } catch {
      // ignore parse failures — mode may still be in query
    }
  }

  if (!mode) {
    return jsonResponse(
      buildEnvelope(
        'unknown',
        'error',
        startedAt,
        null,
        'Missing mode. Provide ?mode=weekly-plan|content-burst|campaign-draft|opportunistic-scan',
      ),
      400,
    );
  }

  console.log(`[marketing-agent] mode=${mode} starting`);

  try {
    switch (mode) {
      case 'weekly-plan': {
        const result = await runWeeklyPlan(supabase);
        console.log(
          `[marketing-agent] weekly-plan done: reviews=${result.reviews.length} proposals=${result.proposalIds.length} reportId=${result.reportId}`,
        );
        return jsonResponse(buildEnvelope(mode, 'ok', startedAt, result, null), 200);
      }

      case 'content-burst': {
        const cb = (body.contentBurst ?? body) as Record<string, unknown>;
        const contentType = (cb.contentType ?? cb.content_type ?? url.searchParams.get('content_type')) as ContentType;
        if (!contentType) {
          return jsonResponse(
            buildEnvelope(
              mode,
              'error',
              startedAt,
              null,
              'content-burst requires contentType in JSON body or ?content_type= query',
            ),
            400,
          );
        }
        const input: ContentBurstInput = {
          contentType,
          channel: (cb.channel ?? url.searchParams.get('channel') ?? undefined) as
            | MarketingChannel
            | undefined,
          audienceSegment: (cb.audienceSegment ??
            cb.audience_segment ??
            url.searchParams.get('audience_segment') ??
            undefined) as AudienceSegment | undefined,
          count: typeof cb.count === 'number'
            ? cb.count
            : Number(url.searchParams.get('count') ?? 5),
          brief: (cb.brief ?? url.searchParams.get('brief') ?? undefined) as string | undefined,
        };

        try {
          const result = await runContentBurst(supabase, input);
          console.log(
            `[marketing-agent] content-burst done: inserted=${result.insertedIds.length}/${result.variantCount}`,
          );
          return jsonResponse(buildEnvelope(mode, 'ok', startedAt, result, null), 200);
        } catch (err) {
          if (err instanceof AnthropicError) {
            return jsonResponse(
              buildEnvelope(mode, 'error', startedAt, null, `${err.code}: ${err.userMessage}`),
              err.retryable ? (err.status === 429 ? 429 : 503) : err.status,
            );
          }
          throw err;
        }
      }

      case 'campaign-draft': {
        const cd = (body.campaignDraft ?? body) as Record<string, unknown>;
        const name = cd.name as string | undefined;
        const channel = cd.channel as MarketingChannel | undefined;
        const budgetUsd = typeof cd.budgetUsd === 'number'
          ? cd.budgetUsd
          : Number(cd.budget_usd ?? 0);
        const startDate = (cd.startDate ?? cd.start_date) as string | undefined;
        const endDate = (cd.endDate ?? cd.end_date) as string | undefined;
        const audienceSegment = (cd.audienceSegment ?? cd.audience_segment) as
          | AudienceSegment
          | undefined;

        if (!name || !channel || !budgetUsd || !startDate || !endDate || !audienceSegment) {
          return jsonResponse(
            buildEnvelope(
              mode,
              'error',
              startedAt,
              null,
              'campaign-draft requires name, channel, budgetUsd, startDate, endDate, audienceSegment',
            ),
            400,
          );
        }

        const result = await runCampaignDraft(supabase, {
          name,
          channel,
          budgetUsd,
          startDate,
          endDate,
          audienceSegment,
          brief: cd.brief as string | undefined,
        });
        console.log(`[marketing-agent] campaign-draft done: campaignId=${result.campaignId}`);
        return jsonResponse(buildEnvelope(mode, 'ok', startedAt, result, null), 200);
      }

      case 'opportunistic-scan': {
        const result = await runOpportunisticScan(supabase);
        console.log(
          `[marketing-agent] opportunistic-scan done: proposals=${result.proposalIds.length}`,
        );
        return jsonResponse(buildEnvelope(mode, 'ok', startedAt, result, null), 200);
      }

      default:
        return jsonResponse(
          buildEnvelope('unknown', 'error', startedAt, null, `Unknown mode: ${mode}`),
          400,
        );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[marketing-agent] mode=${mode} failed:`, msg);
    await logAgentEvent(supabase, 'error', `mode ${mode} failed`, { error: msg });
    return jsonResponse(buildEnvelope(mode, 'error', startedAt, null, msg), 500);
  }
});
