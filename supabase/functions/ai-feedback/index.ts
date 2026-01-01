import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionText, userAnswer, expectedBullets, mode, userContext, conversationHistory, exchangeCount, question, conversation, answer } = await req.json()
    
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

    // Beta tester whitelist - add your user IDs here
    const BETA_TESTERS = [
      user.id, // You're automatically included for testing
      '10a259e0-be83-4e28-95c0-76d881cdb764', // Erin
    ]
    const isBetaTester = BETA_TESTERS.includes(user.id)

    if (!isBetaTester) {
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

Response format:
{
  "continue_conversation": true/false,
  "follow_up_question": "Your follow-up question here" (only if continue_conversation is true),
  "overall": <score 1-10> (only if continue_conversation is false),
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "specific_improvements": ["improvement1", "improvement2"],
  "ideal_answer": "Example of strong answer",
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

Response format (JSON only):
{
  "overall": <score 1-10>,
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "specific_improvements": ["improvement1", "improvement2"],
  "ideal_answer": "Example of strong complete answer",
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