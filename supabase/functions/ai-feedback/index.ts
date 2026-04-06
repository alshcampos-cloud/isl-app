import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Self-Efficacy Feedback Addendum (Huang & Mayer 2020)
 * Generates prompt instructions for all 4 self-efficacy sources.
 * Duplicated from src/utils/selfEfficacyFeedback.js for Deno runtime.
 */
function buildSelfEfficacyAddendum(data: {
  previousScores?: number[];
  streakDays?: number;
  questionsCompleted?: number;
  totalQuestions?: number;
} | undefined): string {
  if (!data) return '';

  const {
    previousScores = [],
    streakDays = 0,
    questionsCompleted = 0,
    totalQuestions = 0,
  } = data;

  const isFirstTime = previousScores.length === 0 && questionsCompleted === 0;
  const hasHistory = previousScores.length > 0;

  let masteryContext = '';
  if (isFirstTime) {
    masteryContext = 'This is the user\'s FIRST practice session. Celebrate that they started — "You just completed your first practice — that\'s the hardest step."';
  } else if (hasHistory) {
    const recentSlice = previousScores.slice(-3);
    const recentAvg = recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length;
    const olderScores = previousScores.slice(0, -3);
    const olderAvg = olderScores.length > 0
      ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length
      : null;

    masteryContext = `User has completed ${questionsCompleted} question(s). `;
    masteryContext += `Their last ${recentSlice.length} score(s) average ${recentAvg.toFixed(1)}.`;
    if (olderAvg !== null) {
      const delta = recentAvg - olderAvg;
      if (delta > 0) {
        masteryContext += ` Their earlier average was ${olderAvg.toFixed(1)} — they have improved by ${delta.toFixed(1)} points.`;
      } else if (delta < 0) {
        masteryContext += ` Their earlier average was ${olderAvg.toFixed(1)}. Encourage them — scores fluctuate and one session doesn't define progress.`;
      } else {
        masteryContext += ` They've been consistent — acknowledge their steady practice.`;
      }
    }
  } else {
    masteryContext = `User has completed ${questionsCompleted} question(s) but no scores are available yet. Acknowledge their continued practice.`;
  }

  let streakContext = '';
  if (streakDays >= 7) {
    streakContext = `User is on a ${streakDays}-day streak. This is exceptional consistency.`;
  } else if (streakDays >= 3) {
    streakContext = `User is on a ${streakDays}-day streak. They're building a solid habit.`;
  } else if (streakDays === 1) {
    streakContext = 'User practiced yesterday too. They\'re starting a streak.';
  }

  let coverageContext = '';
  if (totalQuestions > 0 && questionsCompleted > 0) {
    const pct = Math.round((questionsCompleted / totalQuestions) * 100);
    coverageContext = `They've practiced ${questionsCompleted} of ${totalQuestions} available questions (${pct}% coverage).`;
  }

  return `

SELF-EFFICACY FEEDBACK REQUIREMENTS (MANDATORY — include ALL four in your response):

${masteryContext}
${streakContext}
${coverageContext}

You MUST weave ALL FOUR of the following into your feedback response. Do not create separate labeled sections for them — integrate them naturally into your existing feedback structure:

1. MASTERY ACKNOWLEDGMENT: Reference the user's own progress data above. Compare to their past performance if available. If first time, celebrate starting. Be specific — cite actual numbers when you have them.

2. VICARIOUS REFERENCE: Include ONE brief social-proof statement (non-competitive, encouraging). Examples:
   - "Users who practice at this consistency level typically see their scores climb 15+ points over the next week."
   - "Candidates who drill this type of question tend to feel noticeably more confident in real interviews."

3. VERBAL PERSUASION (growth-mindset): Include ONE specific, credible encouragement tied to something observable in their answer. NEVER generic ("Great job!"). Always reference what they actually did.

4. PHYSIOLOGICAL CHECK: End your feedback with ONE brief state-management prompt. Examples:
   - "Before your next question, take one deep breath — research shows this activates your parasympathetic nervous system and improves recall."
   - "Roll your shoulders back and take a slow exhale before continuing — it resets your focus."

IMPORTANT: These four elements should feel natural and woven into your coaching voice — NOT like a checklist.`;
}

// ============================================================
// Server-side prompt lookup (Change 8 — IP protection)
// Onboarding system prompts moved here from client-side code.
// Previously visible in browser bundle and DevTools Network tab.
// ============================================================
const ONBOARDING_PROMPTS: Record<string, string> = {
  'onboarding-general': `You are a supportive interview coach helping someone practice for the first time.

RULES:
1. Be warm, encouraging, and specific. This is their FIRST practice ever.
2. Start with something genuinely positive about their answer (even if small).
3. Give ONE concrete suggestion for improvement (not three, not five — ONE).
4. End with an encouraging statement about their potential.
5. Keep your response under 120 words — brevity matters.
6. Include a score from 1-10 in this exact format on its own line: [SCORE: X/10]
7. Do NOT use clinical terminology. Keep it simple and accessible.
8. Format your response as SHORT PARAGRAPHS, not bullet lists or JSON. Plain sentences only.

TONE: Think "supportive older sibling who interviews well" — not "professor grading an essay."

CRITICAL PRE-CHECK (do this FIRST before writing anything):
Count the words in the user's answer. If the answer has 3 or fewer words, OR is gibberish/random text (e.g. "test", "asdf", "hello", "idk", "yes"), you MUST score it 1 or 2. No exceptions. Do not be charitable. Do not interpret intent. A 1-3 word answer is NEVER worth more than 2/10.

SCORING GUIDE (BE STRICT — this must be accurate):
- 1-2: 3 or fewer words, random text, gibberish, or completely off-topic (e.g. "test", "asdf", "hello", "I don't know")
- 3-4: Very short or vague — shows minimal effort, no structure
- 5-6: Shows effort but needs structure or more detail
- 7-8: Good foundation with specific examples
- 9: Strong answer with clear STAR structure
- 10: Exceptional — rare for first attempt

IMPORTANT: If the answer is 3 words or fewer, score it 1-2. Period. Do not inflate scores.`,

  'onboarding-nursing': `You are a supportive nursing interview coach helping a nurse practice for the first time.

RULES:
1. Be warm, encouraging, and specific. This is their FIRST practice ever.
2. Start with something genuinely positive about their answer (even if small).
3. Give ONE concrete suggestion for improvement — frame it around the SBAR communication framework (Situation, Background, Assessment, Recommendation) if relevant to their answer.
4. End with an encouraging statement about their potential.
5. Keep your response under 120 words — brevity matters.
6. Include a score from 1-10 in this exact format on its own line: [SCORE: X/10]
7. Coach COMMUNICATION quality only — do NOT evaluate clinical accuracy.
8. If they mention clinical details, acknowledge them but focus your feedback on how clearly they communicated, not whether the clinical content is correct.
9. Format your response as SHORT PARAGRAPHS, not bullet lists or JSON. Plain sentences only.

TONE: Think "supportive charge nurse mentoring a colleague" — warm, professional, specific.

CRITICAL PRE-CHECK (do this FIRST before writing anything):
Count the words in the user's answer. If the answer has 3 or fewer words, OR is gibberish/random text (e.g. "test", "asdf", "hello", "idk", "yes"), you MUST score it 1 or 2. No exceptions. Do not be charitable. Do not interpret intent. A 1-3 word answer is NEVER worth more than 2/10.

SCORING GUIDE (BE STRICT — this must be accurate):
- 1-2: 3 or fewer words, random text, gibberish, or completely off-topic (e.g. "test", "asdf", "hello", "I don't know")
- 3-4: Very short or vague — shows minimal effort, no SBAR elements
- 5-6: Shows effort but needs structure (suggest SBAR framing)
- 7-8: Good foundation, SBAR elements partially present
- 9: Strong answer with clear SBAR structure
- 10: Exceptional — rare for first attempt

IMPORTANT: If the answer is 3 words or fewer, score it 1-2. Period. Do not inflate scores.`,
};

// Admin client for logging — uses service role key to bypass RLS
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

// Cost per token (approximate, USD) — update when pricing changes
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'claude-3-5-haiku-20241022': { input: 0.000001, output: 0.000005 },
  'claude-haiku-4-5-20251001': { input: 0.000001, output: 0.000005 },
  'claude-sonnet-4-20250514':  { input: 0.000003, output: 0.000015 },
}

/** Fire-and-forget: log successful API call metrics */
function logMetrics(params: { functionName: string; mode: string; userId: string; model: string; latencyMs: number; inputTokens?: number; outputTokens?: number }) {
  const costs = TOKEN_COSTS[params.model] || { input: 0.000003, output: 0.000015 };
  const estimatedCost = ((params.inputTokens || 0) * costs.input) + ((params.outputTokens || 0) * costs.output);
  supabaseAdmin.from('api_metrics').insert({
    function_name: params.functionName,
    mode: params.mode,
    user_id: params.userId,
    success: true,
    latency_ms: params.latencyMs,
    input_tokens: params.inputTokens || null,
    output_tokens: params.outputTokens || null,
    estimated_cost: estimatedCost,
  }).then(() => {}).catch(() => {});
}

/** Fire-and-forget: log error to api_error_log */
function logError(params: { functionName: string; errorType?: string; errorMessage: string; userId?: string; mode?: string; httpStatus?: number; latencyMs?: number; metadata?: Record<string, unknown> }) {
  supabaseAdmin.from('api_error_log').insert({
    function_name: params.functionName,
    error_type: params.errorType || 'unknown',
    error_message: params.errorMessage,
    user_id: params.userId || null,
    request_mode: params.mode || null,
    http_status: params.httpStatus || null,
    latency_ms: params.latencyMs || null,
    metadata: params.metadata || {},
  }).then(() => {}).catch(() => {});
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestStart = Date.now();
  let requestMode = 'unknown';
  let userId: string | undefined;

  try {
    const { questionText, userAnswer, expectedBullets, mode, userContext, conversationHistory, exchangeCount, question, conversation, answer, systemPrompt, userMessage, nursingFeature, selfEfficacyData, rushMode, portfolioContext, currentBullets, currentKeywords } = await req.json()
    requestMode = mode || 'unknown';
    
    // Build context section if user provided background info
    let contextSection = '';
    if (userContext?.targetRole || userContext?.targetCompany || userContext?.background) {
      contextSection = `

CANDIDATE CONTEXT (Use this to personalize feedback):
${userContext.targetRole ? `- Interviewing for: ${userContext.targetRole}` : ''}
${userContext.targetCompany ? `- Target Company: ${userContext.targetCompany}` : ''}
${userContext.background ? `- Their Background/Experience:\n${userContext.background}` : ''}

When giving feedback, reference their specific background when relevant. Examples:
- "Given your experience at [their company]..."
- "Your background in [their field] makes this particularly relevant..."
- "Consider drawing from your work with [specific experience]..."
`;
    }

    // Inject portfolio work history if available
    if (userContext?.portfolioSummary) {
      contextSection += `
CANDIDATE'S WORK PORTFOLIO (real projects they've done — reference these when relevant):
${userContext.portfolioSummary}

When giving feedback, cite their specific projects and skills as evidence they can draw on.
`;
    }
    
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    userId = user.id;

    // Anonymous users (Phase 2 onboarding) — allow 1 practice session, skip usage tracking
    const isAnonymous = user.is_anonymous === true

    // Beta tester check — uses beta_testers DB table (not a hardcoded list)
    // Erin's ID kept as hardcoded fallback for safety
    const HARDCODED_BETA = [
      '10a259e0-be83-4e28-95c0-76d881cdb764', // Erin
    ]
    let isBetaTester = HARDCODED_BETA.includes(user.id)
    if (!isBetaTester) {
      const { data: betaRow } = await supabaseClient
        .from('beta_testers')
        .select('unlimited_access')
        .eq('user_id', user.id)
        .maybeSingle()
      if (betaRow?.unlimited_access) isBetaTester = true
    }

    // ── GENERAL FEATURE ENFORCEMENT (tier-aware) ──────────────────
    // Replaces legacy 25-session-per-month flat check with proper tier limits.
    // Nursing features have their own enforcement block further below.
    if (!isBetaTester && !isAnonymous && mode !== 'nursing-coach') {
      // Resolve effective tier from profile (pass expiry, legacy pro, trial)
      const { data: profile } = await supabaseClient
        .from('user_profiles')
        .select('tier, subscription_status, nursing_pass_expires, general_pass_expires, premium_trial_ends')
        .eq('user_id', user.id)
        .maybeSingle()

      const now = new Date()
      const nursingActive = profile?.nursing_pass_expires &&
        new Date(profile.nursing_pass_expires) > now
      const generalActive = profile?.general_pass_expires &&
        new Date(profile.general_pass_expires) > now
      const isLegacyPro = profile?.tier === 'pro' && profile?.subscription_status === 'active'

      // Determine tier for general feature limits (trial removed — free tier is onramp)
      let effectiveTier = 'free'
      if (nursingActive && generalActive) effectiveTier = 'annual'
      else if (generalActive) effectiveTier = 'general_pass'
      else if (nursingActive) effectiveTier = 'nursing_pass'
      else if (isLegacyPro) effectiveTier = 'pro'

      // Free-tier and nursing-pass users get limited general features
      const GENERAL_LIMITS: Record<string, Record<string, number>> = {
        free: { practice: 10, 'ai-interviewer': 3, 'answer-assistant-start': 5, 'answer-assistant-continue': 5, 'confidence-brief': 5, 'portfolio-analysis': 10 },
        nursing_pass: { practice: 10, 'ai-interviewer': 3, 'answer-assistant-start': 5, 'answer-assistant-continue': 5, 'confidence-brief': 5, 'portfolio-analysis': 10 },
      }

      const limits = GENERAL_LIMITS[effectiveTier]
      if (limits && limits[mode] !== undefined) {
        // Map mode to usage_tracking column
        const modeToColumn: Record<string, string> = {
          'practice': 'practice_mode',
          'ai-interviewer': 'ai_interviewer',
          'answer-assistant-start': 'answer_assistant',
          'answer-assistant-continue': 'answer_assistant',
          'confidence-brief': 'answer_assistant',
          'portfolio-analysis': 'answer_assistant',
        }
        const dbCol = modeToColumn[mode]
        if (dbCol) {
          const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
          const { data: usageRow } = await supabaseClient
            .from('usage_tracking')
            .select(dbCol)
            .eq('user_id', user.id)
            .eq('period', currentPeriod)
            .maybeSingle()

          const currentUsage = usageRow?.[dbCol] || 0
          if (currentUsage >= limits[mode]) {
            return new Response(
              JSON.stringify({ error: 'Monthly limit reached. Get a 30-day pass for unlimited access!' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      }
    }

    // Model selection (P2 — all general features on Haiku 4.5):
    //   Haiku 3.5 → generate-bullets only (legacy extraction, cheapest)
    //   Haiku 4.5 → ALL general features: practice, ai-interviewer, answer-assistant, onboarding
    //   Sonnet 4  → confidence-brief (nursing tone matters), nursing-coach handled separately below
    const haikuLegacy = 'claude-3-5-haiku-20241022';
    const haiku45 = 'claude-haiku-4-5-20251001';
    const sonnet4 = 'claude-sonnet-4-20250514';

    let model: string;
    if (mode === 'generate-bullets') {
      model = haikuLegacy;       // Simple extraction — cheapest model sufficient
    } else if (mode === 'upgrade-answer') {
      model = sonnet4;           // Answer Forge needs Sonnet for voice quality + anti-hallucination
    } else if (mode === 'practice' || mode === 'ai-interviewer' || mode === 'answer-assistant-start' || mode === 'answer-assistant-continue' || mode === 'synthesize-star-answer' || mode === 'onboarding-general' || mode === 'onboarding-nursing') {
      model = haiku45;           // All general + onboarding features — Haiku 4.5 (quality at 1/3 Sonnet cost)
    } else {
      model = sonnet4;           // confidence-brief, any future modes needing quality
    }

    // Build the prompt based on mode
    let promptContent = '';
    let maxTokens = 2000;

    if (mode === 'answer-assistant-start') {
      maxTokens = 500;
      promptContent = `You are a supportive interview coach using Motivational Interviewing (MI) principles.

QUESTION: "${question}"

${userContext?.targetRole ? `CANDIDATE'S ROLE: ${userContext.targetRole}` : ''}
${userContext?.targetCompany ? `TARGET COMPANY: ${userContext.targetCompany}` : ''}
${userContext?.background ? `BACKGROUND: ${userContext.background}` : ''}

The candidate needs help developing their answer to this question.

Your job: Ask ONE warm, open-ended question to help them recall a relevant experience.

MI PRINCIPLES:
- Ask about specific experiences they've had
- Use open language: "Tell me about...", "What happened when...", "How did you..."
- One focused question at a time
- Be encouraging and curious, not interrogating
- Make them feel comfortable sharing

Good examples:
- "What's a situation that comes to mind when you think about this?"
- "Tell me about a time you faced something similar - what was going on?"
- "What experiences from your background might relate to this?"

Return ONLY the question - no preamble, warm and conversational.`;

    } else if (mode === 'answer-assistant-continue') {
      maxTokens = 1000;
      promptContent = `You are a supportive interview coach using Motivational Interviewing.

QUESTION: "${question}"

${userContext?.targetRole ? `ROLE: ${userContext.targetRole}` : ''}
${userContext?.targetCompany ? `COMPANY: ${userContext.targetCompany}` : ''}
${userContext?.background ? `BACKGROUND: ${userContext.background}` : ''}

CONVERSATION SO FAR:
${conversation.map(m => `${m.role === 'assistant' ? 'Coach' : 'Candidate'}: ${m.text}`).join('\n')}

Based on what they've shared, do ONE of these:

IF they've shared a good experience with enough detail (situation, actions, results):
- Write: "Great! Here's how I'd structure that into a strong answer:"
- Then provide a complete STAR-formatted answer (150-200 words) based ONLY on what they shared
- Use their actual experiences, don't invent details
- Make it conversational and authentic to their voice

IF they're still vague or missing key details:
- Ask ONE specific follow-up question:
  * "What specifically did YOU do in that situation?" (if actions unclear)
  * "What was the outcome or result?" (if results missing)
  * "What challenges did you face?" (if situation unclear)
  * "How did that turn out?" (if impact missing)

Be warm, encouraging, and patient. Return ONLY your response - no preamble.`;

    } else if (mode === 'generate-bullets') {
      maxTokens = 400;
      promptContent = `Extract 4-5 key bullet points from this interview answer for use as prompter notes.

ANSWER:
${answer}

Requirements:
- 4-5 concise bullet points
- Each bullet is ONE key point or phrase (not full sentences)
- Useful as quick prompts during live interviews
- Focus on memorable details, numbers, or outcomes

Return ONLY the bullets in this format:
- First bullet point
- Second bullet point
- Third bullet point
- Fourth bullet point
- Fifth bullet point (if relevant)`;

    } else if (mode === 'onboarding-general' || mode === 'onboarding-nursing') {
      // Onboarding practice — server-side prompt lookup (Change 8, IP protection)
      // Previously: systemPrompt was sent from client, visible in DevTools.
      // Now: mode identifier maps to server-side prompt. No prompt in request body.
      maxTokens = 1500;
      const serverPrompt = ONBOARDING_PROMPTS[mode];
      promptContent = `${serverPrompt}\n\nUSER REQUEST: ${userMessage}`;

    } else if (mode === 'upgrade-answer') {
      // Answer Forge — upgrade existing answers with portfolio proof
      maxTokens = 3000;
      const questionName = question?.question || questionText || 'the interview question';
      const currentAnswer = answer || userAnswer || '';
      const portfolio = portfolioContext || 'No portfolio data available.';
      const bullets = (currentBullets || []).join('; ');
      const role = userContext?.targetRole || '';
      const company = userContext?.targetCompany || '';
      const bg = userContext?.background || '';
      const otherAnswers = userContext?.otherAnswerSummaries || '';

      // Pick a random structural approach so regenerations are genuinely different
      const approaches = [
        'LEAD WITH YOUR STRONGEST SINGLE STORY. Open with one specific experience in vivid detail, then briefly connect the dots to the rest. Most time on one story.',
        'LEAD WITH THE ACADEMIC FOUNDATION. Your capstone and coursework ARE the proof — open with what you built/analyzed in school, then show how you applied it professionally.',
        'LEAD WITH WHAT YOU DO NOW. Start with Stanford ED today, then explain the path that got you here. Reverse chronological.',
        'LEAD WITH A LESSON. Start with ONE thing you learned the hard way — then show the experiences that taught it.',
        'LEAD WITH THE PORTFOLIO PROJECT MOST RELEVANT TO THIS QUESTION. Go deep on that one project, then briefly mention the rest.',
      ];
      const approach = approaches[Math.floor(Math.random() * approaches.length)];

      promptContent = `You are ghostwriting a spoken interview answer. The candidate will say these words out loud. Your job: upgrade their answer by adding proof from their portfolio.

STEP 0 — QUESTION ANALYSIS (do this BEFORE writing anything):
Read the question carefully. What TYPE of experience is it asking for?
- "How do you prioritize multiple projects?" → needs proof of JUGGLING CONCURRENT REAL WORKSTREAMS, not analyzing options within one assignment
- "Describe a time you led a team" → needs proof of ACTUAL TEAM LEADERSHIP, not solo academic analysis
- "Tell me about a crisis" → needs proof of a REAL HIGH-STAKES SITUATION, not a coursework scenario
- "Walk me through your planning process" → CAN use academic work because the question asks about process/methodology
- "Describe your experience with X" → needs PROFESSIONAL experience first. Academic work can supplement but should not be the lead or the majority.
- "Ensuring compliance" / "managing regulations" → needs proof where REAL STAKES existed (audits, federal oversight, operational consequences), not academic analysis of compliance frameworks
- If the question asks about DOING something in the real world, prioritize professional and personal project experience over coursework
- If the question asks about HOW YOU THINK or your analytical approach, academic work is strong proof
- If the candidate's portfolio has real-world experience that matches, USE IT. Don't default to the most detailed academic project just because it has more keywords.
- CRITICAL: Look at the "Role" field of each project. If it says "MSEM Coursework", "Student", or "Candidate" — that is ACADEMIC work. If it says a job title or company name, that is PROFESSIONAL work. Prioritize accordingly.

STRUCTURAL APPROACH FOR THIS VERSION:
${approach}

QUESTION: "${questionName}"

${currentAnswer ? `THEIR CURRENT ANSWER (reference for facts only — do NOT copy this):\n${currentAnswer}\n\nIMPORTANT: Your upgraded answer must be SUBSTANTIALLY DIFFERENT from this. Use different structure, different lead, different emphasis. Pull in proof they DIDN'T use. If their current answer is all academic, add professional experience. If it's all professional, add academic depth. The whole point is to UPGRADE, not echo.` : 'NO CURRENT ANSWER — write one from portfolio data below. IMPORTANT: First identify which portfolio entries ACTUALLY answer this question based on the question analysis above. Do NOT just pick the most keyword-heavy project.'}

PORTFOLIO (real projects — use as PROOF):
${portfolio}

${role ? `TARGET ROLE: ${role}` : ''}
${company ? `TARGET COMPANY: ${company}` : ''}
${bg ? `BACKGROUND: ${bg}` : ''}

${otherAnswers ? `ANSWERS TO OTHER QUESTIONS (use DIFFERENT proof here):\n${otherAnswers}\n` : ''}

=== HALLUCINATION RULES (ABSOLUTE) ===
- ONLY use facts that appear VERBATIM in their answer or portfolio above
- NEVER add context they didn't state ("while working full-time", "leading a team of X")
- NEVER upgrade verbs ("contributed to" → "led" is FORBIDDEN unless they said "led")
- NEVER adjust timelines. If they worked somewhere DURING an event, don't say it was BECAUSE of it
- Use their EXACT acronyms. "HICS" stays "HICS". Don't change to "ICS"
- When in doubt, UNDERSTATE. Weaker language is always safer than stronger

=== CHRONOLOGY (ABSOLUTE) ===
- Each project has a timeframe. A 2025 project CANNOT be proof for a 2021 story
- Follow-ups: only reference projects from the same era or earlier. Later projects can ONLY appear as "here's how my thinking evolved since"

=== PROJECT TYPES ===
ACADEMIC (capstones, coursework, degree projects):
- Frame honestly: "For my capstone..." / "In my Master's program..."
- Academic work IS substantial proof. A capstone covering 15 cities and 1.9M residents IS impressive
- DO NOT dismiss academics as "foundations" or "where I learned frameworks" — describe what you BUILT and ANALYZED
- Academic projects deserve the same depth and respect as professional work

PROFESSIONAL (jobs, roles):
- Use their exact title, exact responsibilities, exact outcomes from the portfolio

PERSONAL/SIDE PROJECTS (Anti-Silos, InterviewAnswers.ai, Baby Decoder):
- ONLY use when the question asks about innovation, vision, or what sets you apart
- NEVER shoehorn into past work stories

=== VOICE (READ THIS 3 TIMES) ===
You are writing SPEECH, not an essay. The candidate will read this out loud.

BANNED (instant fail if used): "spans", "grounded in", "interconnected", "leveraged", "synthesized", "comprehensive", "actionable", "framework", "through-line", "core competencies", "multi-faceted", "holistic", "robust", "seasoned", "foundational"

REQUIRED STYLE:
- Contractions always: "I've", "that's", "wasn't", "didn't"
- Sentence max: 20 words. If longer, split it.
- Mix short and medium sentences. Never three long sentences in a row.
- NO summary sentences at the end ("What ties it together is..." / "The combination of..." — DELETE these)
- NO thesis statements at the start ("My experience spans..." — start with a SPECIFIC thing instead)
- End with something concrete, not a wrap-up platitude
- Read it out loud in your head. Does it sound like a person at a coffee shop? If it sounds like a cover letter, rewrite it.

=== CRITICAL: LESS IS MORE ===
- Pick the 1-2 STRONGEST projects that answer this question. NOT all 5. Your job is to answer the question well, not showcase the whole portfolio.
- The other projects go in follow-ups. That's their PURPOSE — the interviewer asks more, the candidate has ammo ready.
- A focused answer with 1-2 deep examples beats a scattered answer touching 5 things.

=== OUTPUT ===
- ANSWER: 150-200 words, 60-90 seconds spoken, 2 beats MAX (one main example, one supporting)
- BULLETS: 4-5 short memory triggers (not full sentences — just enough to jog memory mid-interview)
- KEYWORDS: 5-8 phrases an interviewer might say that should trigger this answer
- FOLLOW-UPS: 3-4 questions they'll likely ask next. For each, name the SPECIFIC project + detail to reference. Write it as a note to the candidate: "Use your [project name] — specifically the part about [detail]". Nothing else. No coaching language, no "opens door to", no "demonstrates".

RESPOND WITH ONLY VALID JSON — no text before or after:
{
  "upgradedAnswer": "spoken answer here",
  "bullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "keywords": ["phrase 1", "phrase 2", "phrase 3"],
  "followUps": [
    { "question": "Follow-up question?", "proof": "Use your [Project Name] — specifically [detail]" }
  ]
}`;

    } else if (mode === 'synthesize-star-answer') {
      // General Answer Assistant — synthesize MI conversation into polished STAR answer
      maxTokens = 1500;
      const isRush = rushMode === true;
      const questionName = question?.question || question?.text || questionText || 'the interview question';

      // Build conversation transcript
      const transcript = (conversation || [])
        .map((m: {role: string, text: string}) => `${m.role === 'user' ? 'Candidate' : 'Coach'}: ${m.text}`)
        .join('\n\n');

      promptContent = `Synthesize the candidate's experiences from the conversation below into a polished interview answer for: "${questionName}"

Structure as: Situation → Task → Action → Result (STAR).

RULES:
1. Use ONLY facts and details they actually shared. Do NOT invent anything.
2. Preserve their strongest phrases and natural voice.
3. Fill in reasonable connective tissue between their ideas.
4. Keep it conversational — this should sound like THEM, not a textbook.
5. Include a Result/outcome if they shared one.
6. ${isRush ? '100-200 words' : '150-300 words'}. No bullet points — paragraph form.
7. Return ONLY the synthesized answer — no commentary, no score, no headers, no markdown formatting.

=== CONVERSATION ===
${transcript}

=== SYNTHESIZED ANSWER ===`;

    } else if (mode === 'portfolio-analysis') {
      // Portfolio analysis — structured JSON extraction, uses Haiku 4.5 for speed
      model = haiku45;
      maxTokens = 4000;
      promptContent = `${systemPrompt}\n\nUSER REQUEST: ${userMessage}`;

    } else if (mode === 'confidence-brief') {
      // Nursing Confidence Builder — uses systemPrompt + userMessage from client
      maxTokens = 1500;
      promptContent = `${systemPrompt}\n\nUSER REQUEST: ${userMessage}`;

    } else if (mode === 'nursing-coach') {
      // Nursing Track — AI Coach, Mock Interview, Practice, SBAR Drill, Offer Coach
      // Accepts { systemPrompt, conversationHistory, userMessage, nursingFeature }
      // Uses Anthropic system parameter + multi-turn conversation format
      // nursingPractice needs more tokens for 4-section structured feedback
      maxTokens = nursingFeature === 'nursingPractice' ? 2000 : 1500;

      // ============================================================
      // SERVER-SIDE CREDIT VALIDATION for nursing modes
      // Prevents bypass via DevTools, stale cache, or rapid clicks
      // ============================================================
      // nursingFeature is extracted from the initial req.json() destructuring

      // Map nursing feature names to DB column names
      const nursingFeatureMap: Record<string, string> = {
        'nursingPractice': 'nursing_practice',
        'nursingMock': 'nursing_mock',
        'nursingSbar': 'nursing_sbar',
        'nursingCoach': 'nursing_coach',
        'nursingOfferCoach': 'nursing_coach',   // Offer Coach shares AI Coach pool
        'confidenceBrief': 'nursing_coach',      // Confidence Brief shares AI Coach pool
      };

      const dbColumn = nursingFeatureMap[nursingFeature];

      // Enforce credits for all tracked features (including AI Coach now with session cap)
      if (dbColumn && !isBetaTester) {
        // Check profile including pass expiry columns
        const { data: profile } = await supabaseClient
          .from('user_profiles')
          .select('tier, nursing_pass_expires, general_pass_expires')
          .eq('user_id', user.id)
          .maybeSingle();

        // Determine if user has active nursing access
        const isLegacyPro = profile?.tier === 'pro';
        const hasNursingPass = profile?.nursing_pass_expires &&
          new Date(profile.nursing_pass_expires) > new Date();
        const hasUnlimitedNursing = isLegacyPro || hasNursingPass;

        if (!hasUnlimitedNursing) {
          // Check beta_testers table as final fallback
          const { data: betaRow } = await supabaseClient
            .from('beta_testers')
            .select('unlimited_access')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!betaRow?.unlimited_access) {
            // Get FRESH usage from DB (not cached client state)
            const now = new Date();
            const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            const { data: usageRow } = await supabaseClient
              .from('usage_tracking')
              .select(dbColumn)
              .eq('user_id', user.id)
              .eq('period', currentPeriod)
              .maybeSingle();

            const currentUsage = usageRow?.[dbColumn] || 0;

            // Free tier limits — must match creditSystem.js TIER_LIMITS.free
            const featureLimits: Record<string, number> = {
              'nursing_practice': 3,
              'nursing_mock': 2,
              'nursing_sbar': 2,
              'nursing_coach': 0,     // Free users cannot use AI Coach
            };
            const limit = featureLimits[dbColumn] ?? 0;

            if (currentUsage >= limit) {
              return new Response(
                JSON.stringify({ error: 'Monthly credit limit reached. Get a 30-day pass for unlimited access!' }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }
        // Pass holders: AI Coach is unlimited (no server-side cap needed)
      }

      // Build Anthropic messages array from conversation history
      const messages: Array<{role: string, content: string}> = [];
      if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content || '',
          });
        }
      }
      // Append the current user message
      messages.push({ role: 'user', content: userMessage || '' });

      // Select model: Sonnet 4 for multi-turn (Mock Interview, AI Coach),
      // Haiku 4.5 for single-call (Practice, SBAR, Offer Coach, Confidence Brief)
      // Haiku 4.5 benchmarks match Sonnet 4 on single-call scoring tasks at ~1/3 cost.
      const multiTurnFeatures = ['nursingMock', 'nursingCoach'];
      const nursingModel = multiTurnFeatures.includes(nursingFeature)
        ? 'claude-sonnet-4-20250514'
        : 'claude-haiku-4-5-20251001';

      // Call Anthropic with system prompt as system parameter (not in messages)
      const nursingResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: nursingModel,
          max_tokens: maxTokens,
          system: systemPrompt || '',
          messages,
        })
      });

      const nursingData = await nursingResponse.json();

      // Log metrics for nursing-coach calls
      logMetrics({
        functionName: 'ai-feedback',
        mode: `nursing-coach:${nursingFeature || 'unknown'}`,
        userId: user.id,
        model: nursingModel,
        latencyMs: Date.now() - requestStart,
        inputTokens: nursingData?.usage?.input_tokens,
        outputTokens: nursingData?.usage?.output_tokens,
      });

      if (!nursingResponse.ok || nursingData?.error) {
        logError({
          functionName: 'ai-feedback',
          errorType: 'anthropic_api_error',
          errorMessage: nursingData?.error?.message || `Anthropic returned ${nursingResponse.status}`,
          userId: user.id,
          mode: `nursing-coach:${nursingFeature || 'unknown'}`,
          httpStatus: nursingResponse.status,
          latencyMs: Date.now() - requestStart,
        });
      }

      return new Response(
        JSON.stringify(nursingData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Original practice/ai-interviewer modes
      promptContent = `You are an expert interview coach conducting ${mode === 'ai-interviewer' ? 'an interactive mock interview' : 'a practice session'}.

${contextSection}

INTERVIEW QUESTION: "${questionText}"

${mode === 'ai-interviewer' && conversationHistory && conversationHistory.length > 0 ? `
CONVERSATION SO FAR:
${conversationHistory.map((exchange, idx) => `
Exchange ${idx + 1}:
Q: ${exchange.question}
A: ${exchange.answer}
`).join('\n')}

CURRENT ANSWER:
` : ''}USER'S ANSWER: "${userAnswer}"

${expectedBullets && expectedBullets.length > 0 ? `
EXPECTED KEY POINTS:
${expectedBullets.filter(b => b && b.trim()).map((b, i) => `${i + 1}. ${b}`).join('\n')}
` : ''}

${mode === 'ai-interviewer' ? `
You are conducting an interactive mock interview. This is exchange ${exchangeCount || 1} of 3-4.

IF THIS IS EXCHANGE 1-2 (early in conversation):
- Ask ONE natural follow-up question based on their answer
- Probe deeper into what they mentioned
- Ask them to elaborate on specific actions or decisions
- Keep it conversational and realistic
- DO NOT give feedback yet - save that for the end

IF THIS IS EXCHANGE 3-4 (final exchanges):
- Set "continue_conversation" to false
- Provide comprehensive feedback on ALL their answers

IDEAL ANSWER RULES (CRITICAL — follow exactly):
The "ideal_answer" field must be a CONSOLIDATED version of the user's own answers from all exchanges, restructured into ONE polished response they could deliver in a real interview. Rules:
1. Use ONLY facts, scenarios, details, and context the user actually provided across their exchanges. NEVER add industries, technical terms, compliance frameworks, or specifics they didn't mention.
2. Preserve the user's strongest lines and phrases — if they said something well, keep their wording.
3. Reorganize into clean STAR structure: open with the situation/context, state their role, describe concrete actions, close with measurable results and a lesson learned.
4. Weave the best moments from ALL exchanges into one cohesive answer (in a real interview, they won't get 4 follow-ups to build the story).
5. Tighten wordy sections and sharpen vague ones, but stay faithful to THEIR story.
6. The ideal answer should sound like the user on their best day — not like a generic template.

Response format:
{
  "continue_conversation": true/false,
  "follow_up_question": "Your follow-up question here" (only if continue_conversation is true),
  "overall": <score 1-10> (only if continue_conversation is false),
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "specific_improvements": ["improvement1", "improvement2"],
  "ideal_answer": "Consolidated and coached version of the user's own answers (see IDEAL ANSWER RULES above)",
  "framework_analysis": {
    "situation": "What they said or 'Missing'",
    "task": "What they said or 'Missing'",
    "action": "What they said or 'Missing'",
    "result": "What they said or 'Missing'"
  },
  "points_covered": ["point1", "point2"],
  "points_missed": ["point1", "point2"]
}
` : `
Analyze their answer and provide detailed feedback.

${contextSection ? `
IMPORTANT: Reference their specific background when relevant. For example:
- "Given your experience at [their organization]..."
- "With your background in [their expertise]..."
- "For [target role] interviews..."
` : ''}

IDEAL ANSWER RULES (CRITICAL — follow exactly):
The "ideal_answer" field must be a COACHED version of the user's own answer, restructured into a polished response. Rules:
1. Use ONLY facts, scenarios, details, and context the user actually provided. NEVER add industries, technical terms, compliance frameworks, company names, or specifics they didn't mention.
2. Preserve the user's strongest lines — if they said something well, keep their wording.
3. Restructure into clean STAR format: situation context → their specific role → concrete actions → measurable results.
4. Tighten wordy sections, sharpen vague ones, and add structure — but stay faithful to THEIR story.
5. If their answer was missing key STAR elements, note that in "gaps" but do NOT fabricate those elements in the ideal answer. Instead, include a placeholder like "[Add: specific result or metric from this experience]".
6. The ideal answer should sound like the user on their best day — not like a generic interview template.

Response format (JSON only):
{
  "overall": <score 1-10>,
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "specific_improvements": ["improvement1", "improvement2"],
  "ideal_answer": "Coached version of the user's own answer (see IDEAL ANSWER RULES above)",
  "framework_analysis": {
    "situation": "What they described or 'Missing'",
    "task": "What they described or 'Missing'",
    "action": "What they described or 'Missing'",
    "result": "What they described or 'Missing'"
  },
  "points_covered": ["covered point1", "covered point2"],
  "points_missed": ["missed point1", "missed point2"]
}
`}

Return ONLY valid JSON. No markdown, no explanations.`;

      // Self-efficacy addendum: always for practice, only on final exchange (3+) for ai-interviewer
      const isFinalExchange = mode === 'practice' || (mode === 'ai-interviewer' && (exchangeCount || 1) >= 3);
      if (isFinalExchange) {
        promptContent += buildSelfEfficacyAddendum(selfEfficacyData);
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{
          role: 'user',
          content: promptContent
        }]
      })
    })

    const data = await response.json()

    // Log metrics for general calls
    logMetrics({
      functionName: 'ai-feedback',
      mode: requestMode,
      userId: user.id,
      model,
      latencyMs: Date.now() - requestStart,
      inputTokens: data?.usage?.input_tokens,
      outputTokens: data?.usage?.output_tokens,
    });

    if (!response.ok || data?.error) {
      logError({
        functionName: 'ai-feedback',
        errorType: 'anthropic_api_error',
        errorMessage: data?.error?.message || `Anthropic returned ${response.status}`,
        userId: user.id,
        mode: requestMode,
        httpStatus: response.status,
        latencyMs: Date.now() - requestStart,
      });
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    logError({
      functionName: 'ai-feedback',
      errorType: 'unhandled_exception',
      errorMessage: error.message || String(error),
      userId,
      mode: requestMode,
      httpStatus: 500,
      latencyMs: Date.now() - requestStart,
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})