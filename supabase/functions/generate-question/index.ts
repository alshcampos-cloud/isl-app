import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { targetRole, targetCompany, background, interviewType, customPrompt, existingQuestions, sessionGeneratedQuestions, jobDescription, keepSimple, maxWords } = await req.json()

    // Build context from existing questions in bank
    const recentQuestions = existingQuestions?.slice(-10) || []
    const exampleQuestions = recentQuestions
      ?.map((q: any, i: number) => `${i + 1}. "${q.question}"`)
      ?.join('\n') || 'No existing questions yet'

    // Build list of questions generated THIS SESSION (for "Try Another" variety)
    const sessionQuestions = sessionGeneratedQuestions?.slice(-5) || []
    const avoidTheseQuestions = sessionQuestions.length > 0
      ? sessionQuestions.map((q: string, i: number) => `${i + 1}. "${q}"`).join('\n')
      : null

    const wordLimit = maxWords || 15;

    const contextPrompt = `You are an expert interview coach creating CLEAR, CONCISE interview questions for ${targetRole}.

CANDIDATE PROFILE:
- Role: ${targetRole}
${targetCompany ? `- Organization: ${targetCompany}` : ''}
- Interview Type: ${interviewType}
${background ? `- Background: ${background}` : ''}
${jobDescription ? `- Job Requirements: ${jobDescription}` : ''}
${customPrompt ? `- Focus Area: ${customPrompt}` : ''}

QUESTIONS IN BANK (for context):
${exampleQuestions}
${avoidTheseQuestions ? `
🚫 JUST GENERATED THIS SESSION - DO NOT REPEAT OR REPHRASE THESE:
${avoidTheseQuestions}

⚠️ CRITICAL: The user clicked "Try Another" - they want a COMPLETELY DIFFERENT topic/skill, NOT a synonym or rephrasing. Ask about a different competency, scenario, or skill area entirely.
` : ''}
🚨 CRITICAL RULES - MUST FOLLOW:
1. ✅ MAXIMUM ${wordLimit} WORDS TOTAL
2. ✅ ONE simple, clear scenario only
3. ✅ NO compound clauses (avoid "when", "and", "while" that add complexity)
4. ✅ Direct, conversational phrasing
5. ✅ Focus on ONE skill or situation

❌ BAD EXAMPLES (TOO COMPLEX - DO NOT COPY THIS STYLE):
- "Walk me through how you would establish coordination between agencies during an earthquake when communication systems are down and you're receiving conflicting information about hospital capacity."
- "Describe a time when you had to manage multiple stakeholders with competing priorities while dealing with limited resources and tight deadlines."

✅ GOOD EXAMPLES (CLEAR & CONCISE - USE THIS STYLE):
- "How do you prioritize during an emergency?"
- "Describe a time you managed conflicting stakeholder demands."
- "What's your approach to resource allocation under pressure?"
- "Tell me about leading a team through organizational change."
- "How would you handle a budget cut mid-project?"
- "Describe managing media during a crisis."
- "What's your process for coordinating evacuations?"
- "Tell me about resolving an interagency conflict."

QUESTION TYPE (vary these):
- "Tell me about a time when..." (past experience)
- "How would you handle..." (hypothetical)
- "What's your approach to..." (process)
- "Describe a situation where..." (story)

Generate ONE interview question that is:
- Completely different from recent questions above
- Under ${wordLimit} words
- One clear, focused scenario
- Relevant to ${targetRole}
- No run-on complexity
- Simple, direct phrasing

Return ONLY the question text - no quotes, no preamble, no explanation.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        temperature: 0.9,
        messages: [{ role: 'user', content: contextPrompt }]
      })
    })

    const data = await response.json()
    let question = data.content[0].text.trim()
    
    // Remove quotes if present
    question = question.replace(/^["']|["']$/g, '');
    
    return new Response(
      JSON.stringify({ question }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
