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
    const { targetRole, targetCompany, background, interviewType, customPrompt, existingQuestions, jobDescription } = await req.json()

    // Build context from existing questions - analyze RECENT 10 to avoid repetition
    const recentQuestions = existingQuestions?.slice(-10) || []
    const exampleQuestions = recentQuestions
      ?.map((q: any, i: number) => `${i + 1}. "${q.question}"`)
      ?.join('\n') || 'No existing questions yet'

    // Extract themes from existing questions to AVOID them
    const existingThemes = recentQuestions
      .map((q: any) => q.question.toLowerCase())
      .join(' ')

    const contextPrompt = `You are an expert interview coach creating UNIQUE, VARIED questions for emergency management interviews.

CANDIDATE PROFILE:
- Role: ${targetRole}
${targetCompany ? `- Organization: ${targetCompany}` : ''}
- Interview Type: ${interviewType}
${background ? `- Background: ${background}` : ''}
${jobDescription ? `- Job Requirements: ${jobDescription}` : ''}
${customPrompt ? `- Focus Area: ${customPrompt}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: AVOID THESE RECENTLY USED QUESTIONS ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${exampleQuestions}

🚫 BANNED OVERUSED SCENARIOS (DO NOT USE):
${existingThemes.includes('communication') ? '❌ Communication system failures\n' : ''}${existingThemes.includes('multiple') && existingThemes.includes('agenc') ? '❌ Coordinating multiple agencies\n' : ''}${existingThemes.includes('resource') ? '❌ Limited resources scenarios\n' : ''}${existingThemes.includes('conflict') && existingThemes.includes('stakeholder') ? '❌ Conflicting stakeholder priorities\n' : ''}${existingThemes.includes('budget') ? '❌ Budget constraint situations\n' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FRESH SCENARIO IDEAS (Pick ONE that's NOT above):
- Cascade failures: Multiple systems fail simultaneously (power + water + transit)
- Cultural barriers: Language/cultural challenges in diverse communities during crisis
- Technology failures: GPS/mapping systems down during evacuations
- Psychological support: Coordinating mental health services post-incident
- Ethical dilemmas: Choosing who gets limited medical supplies
- Media crisis: Managing press during active emergency operations
- Staff burnout: Team exhaustion during prolonged multi-day incident
- Supply chain: Critical equipment delayed/unavailable
- Legal conflicts: Jurisdictional disputes between agencies
- Data overload: Information management when systems overwhelmed
- Community resistance: Public non-compliance with evacuation orders
- Volunteer management: Untrained helpers creating safety risks
- Environmental hazards: Secondary disasters (flood after earthquake)
- VIP/political pressure: Elected officials demanding special treatment
- Accessibility: Supporting disabled/elderly populations in emergencies

🎯 VARY THE QUESTION TYPE (rotate these):
1. "Tell me about a time when..." (past experience)
2. "How would you handle..." (hypothetical scenario)
3. "What's your approach to..." (process explanation)
4. "Describe a situation where..." (specific story)
5. "Walk me through..." (step-by-step breakdown)
6. "If you had to choose between... and..." (trade-off decision)
7. "What would you do if..." (contingency planning)

📐 SPECIFICITY REQUIREMENT:
❌ BAD (too vague): "Tell me about managing a crisis"
✅ GOOD (specific): "Describe how you'd coordinate a hospital evacuation during a wildfire when half your ambulances are unavailable and roads are blocked"

🎲 RANDOMIZATION: Pick a DIFFERENT scenario each time, not just rewording!

Generate ONE interview question that:
- Is COMPLETELY DIFFERENT from questions above (different scenario, not just rewording)
- Uses a fresh scenario from the suggestions (or create your own unique one)
- Asks in a DIFFERENT question format than recent ones
- Is 1-2 sentences maximum
- Is concrete and specific to emergency management
- Encourages STAR method storytelling

Return ONLY the question - no preamble, no explanation, no quotes.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        temperature: 1.0,
        messages: [{ role: 'user', content: contextPrompt }]
      })
    })

    const data = await response.json()
    const question = data.content[0].text.trim()
    
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