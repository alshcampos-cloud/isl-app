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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionText, userAnswer, expectedBullets, mode, userContext, conversationHistory, exchangeCount, question, conversation, answer, systemPrompt, userMessage, nursingFeature, selfEfficacyData } = await req.json()
    
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
    
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Anonymous users (Phase 2 onboarding) — allow 1 practice session, skip usage tracking
    const isAnonymous = user.is_anonymous === true

    // Beta tester whitelist - add your user IDs here
    const BETA_TESTERS = [
      user.id, // You're automatically included for testing
      '10a259e0-be83-4e28-95c0-76d881cdb764', // Erin
    ]
    const isBetaTester = BETA_TESTERS.includes(user.id)

    if (!isBetaTester && !isAnonymous) {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const { count } = await supabaseClient
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString())
      
      const sessionLimit = 25 // TODO: Get from user's subscription tier
      
      if (count && count >= sessionLimit) {
        return new Response(
          JSON.stringify({ error: 'Monthly session limit reached. Upgrade to Pro for more sessions!' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Use Haiku for Practice Mode (fast + cheap), Sonnet for AI Interviewer and Answer Assistant (detailed)
    const model = mode === 'practice' || mode === 'generate-bullets' 
      ? 'claude-3-5-haiku-20241022' 
      : 'claude-sonnet-4-20250514'

    // Build the prompt based on mode
    let promptContent = '';
    let maxTokens = 1024;

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
      };

      const dbColumn = nursingFeatureMap[nursingFeature];

      // Only enforce credits for tracked features (not AI Coach which is Pro-gated at UI level)
      if (dbColumn && !isBetaTester) {
        // Check if user is Pro
        const { data: profile } = await supabaseClient
          .from('user_profiles')
          .select('tier')
          .eq('user_id', user.id)
          .maybeSingle();

        const isPro = profile?.tier === 'pro';

        if (!isPro) {
          // Check beta_testers table
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

            // Limits: nursing_practice=5, nursing_mock=3, nursing_sbar=3
            const featureLimits: Record<string, number> = {
              'nursing_practice': 5,
              'nursing_mock': 3,
              'nursing_sbar': 3,
            };
            const limit = featureLimits[dbColumn] || 5;

            if (currentUsage >= limit) {
              return new Response(
                JSON.stringify({ error: 'Monthly credit limit reached. Upgrade to Pro for unlimited access!' }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }
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

      // Call Anthropic with system prompt as system parameter (not in messages)
      const nursingResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: maxTokens,
          system: systemPrompt || '',
          messages,
        })
      });

      const nursingData = await nursingResponse.json();
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
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})