// ISL - Default Interview Questions
// Auto-loaded for new users to enable instant Live Prompter functionality

export const DEFAULT_QUESTIONS = [
  // ========== BEHAVIORAL QUESTIONS ==========
  {
    id: 'default_1',
    question: "Tell me about yourself",
    category: "Behavioral",
    priority: "High",
    isDefault: true,
    keywords: [
      "tell me about yourself",
      "introduce yourself",
      "walk me through your background",
      "tell me about your experience",
      "walk through your resume",
      "give me your elevator pitch",
      "so tell me about you",
      "tell us about yourself"
    ],
    bullets: [
      "Current role: [Your title] at [Company] doing [key responsibility]",
      "Relevant experience: [2-3 past roles or key achievements]",
      "Why I'm here: [What excites you about THIS opportunity]",
      "What I bring: [1-2 unique strengths that match the job]"
    ],
    narrative: "I'm currently a [TITLE] at [COMPANY], where I [KEY RESPONSIBILITY]. Before this, I [RELEVANT PAST EXPERIENCE]. What really excites me about this opportunity is [CONNECTION TO THIS ROLE]. I believe my experience in [STRENGTH 1] and [STRENGTH 2] would let me contribute to [TEAM/COMPANY GOAL] from day one.",
    followUps: [
      "What made you choose your current field?",
      "What's been your biggest career achievement so far?"
    ]
  },

  {
    id: 'default_2',
    question: "Why are you interested in this role?",
    category: "Behavioral",
    priority: "High",
    isDefault: true,
    keywords: [
      "why are you interested",
      "why this role",
      "why this position",
      "why did you apply",
      "what interests you about this job",
      "why do you want this job",
      "what attracted you to this role",
      "why are you applying"
    ],
    bullets: [
      "Mission alignment: [How company's mission connects to your values]",
      "Growth opportunity: [Specific skills you'll develop or impact you'll make]",
      "Team/culture fit: [What you've learned about the team that excites you]",
      "Perfect timing: [Why now is the right time in your career]"
    ],
    narrative: "I'm really excited about this role for three reasons. First, [COMPANY]'s mission to [MISSION] aligns perfectly with my belief that [YOUR VALUES]. Second, the opportunity to [SPECIFIC RESPONSIBILITY] would let me grow in [SKILL AREA] while making a direct impact on [OUTCOME]. Finally, everything I've learned about the team's approach to [TEAM QUALITY] tells me this is where I can do my best work.",
    followUps: [
      "What do you know about our company?",
      "What would you want to accomplish in your first 90 days?"
    ]
  },

  {
    id: 'default_3',
    question: "What are your greatest strengths?",
    category: "Behavioral",
    priority: "High",
    isDefault: true,
    keywords: [
      "what are your strengths",
      "greatest strengths",
      "what are you good at",
      "what do you excel at",
      "your top strengths",
      "what makes you strong",
      "what are your best qualities",
      "tell me your strengths"
    ],
    bullets: [
      "Strength 1: [Specific skill] - Example: [One-sentence proof]",
      "Strength 2: [Complementary skill] - Example: [One-sentence proof]",
      "Strength 3: [Unique differentiator] - Example: [One-sentence proof]",
      "Connection: How these directly help in this role"
    ],
    narrative: "My greatest strengths are [STRENGTH 1], [STRENGTH 2], and [STRENGTH 3]. For example, my [STRENGTH 1] helped me [SPECIFIC ACHIEVEMENT]. My [STRENGTH 2] means I consistently [POSITIVE OUTCOME]. And my [STRENGTH 3] has allowed me to [UNIQUE VALUE]. I know these would directly contribute to [THIS ROLE'S KEY CHALLENGE].",
    followUps: [
      "Can you give me a specific example of that strength in action?",
      "How would your colleagues describe your strengths?"
    ]
  },

  {
    id: 'default_4',
    question: "Describe a challenge you overcame",
    category: "Behavioral",
    priority: "High",
    isDefault: true,
    keywords: [
      "describe a challenge",
      "tell me about a challenge",
      "a time you overcame",
      "difficult situation",
      "tell me about an obstacle",
      "time you faced a problem",
      "challenging situation you handled",
      "biggest challenge"
    ],
    bullets: [
      "Situation: [Context - what was the challenge?]",
      "Task: [Your specific responsibility]",
      "Action: [Concrete steps you took - be specific]",
      "Result: [Measurable outcome + what you learned]"
    ],
    narrative: "At [COMPANY], I faced [SPECIFIC CHALLENGE]. I was responsible for [YOUR ROLE IN IT]. I tackled this by [ACTION 1], [ACTION 2], and [ACTION 3]. As a result, [MEASURABLE OUTCOME]. More importantly, I learned [KEY LESSON] which I've applied to [SUBSEQUENT SITUATION].",
    followUps: [
      "What would you do differently if you faced that situation again?",
      "How did that experience change your approach to similar challenges?"
    ]
  },

  {
    id: 'default_5',
    question: "Tell me about a time you worked in a team",
    category: "Behavioral",
    priority: "Medium",
    isDefault: true,
    keywords: [
      "time you worked in a team",
      "tell me about teamwork",
      "describe a team project",
      "working with a team",
      "team collaboration",
      "time you collaborated",
      "group project",
      "team experience"
    ],
    bullets: [
      "Project context: [What the team was working on]",
      "Your role: [Specific contribution - not just 'team member']",
      "Collaboration approach: [How you worked with others]",
      "Team outcome: [Success metrics + your impact]"
    ],
    narrative: "I worked on a team project where we [PROJECT GOAL]. My role was [SPECIFIC RESPONSIBILITY]. To ensure success, I [YOUR COLLABORATIVE ACTIONS] and made sure to [TEAM SUPPORT BEHAVIOR]. Together, we achieved [OUTCOME WITH METRICS], and I specifically contributed [YOUR MEASURABLE IMPACT].",
    followUps: [
      "How do you handle conflict within a team?",
      "What's your preferred role in team settings?"
    ]
  },

  {
    id: 'default_6',
    question: "Where do you see yourself in 5 years?",
    category: "Behavioral",
    priority: "Medium",
    isDefault: true,
    keywords: [
      "where do you see yourself",
      "5 years from now",
      "five years",
      "future career goals",
      "long term goals",
      "career aspirations",
      "where do you want to be",
      "future plans"
    ],
    bullets: [
      "Growth in this role: [Skills you want to master here]",
      "Broader impact: [How you want to expand your contribution]",
      "Industry evolution: [Where you see the field going]",
      "Company connection: [How this role fits your trajectory]"
    ],
    narrative: "In five years, I see myself having deepened my expertise in [SKILL AREA] and taken on [INCREASED RESPONSIBILITY]. I'm excited about where [INDUSTRY] is heading with [TREND], and I want to be at the forefront of that. This role is the perfect foundation because [CONNECTION TO CURRENT ROLE], and I could see myself growing into [LOGICAL NEXT STEP AT THIS COMPANY].",
    followUps: [
      "What skills do you want to develop?",
      "How does this role fit into your career plan?"
    ]
  },

  // ========== ROLE-SPECIFIC QUESTIONS ==========
  {
    id: 'default_7',
    question: "Walk me through your relevant experience",
    category: "Experience",
    priority: "High",
    isDefault: true,
    keywords: [
      "walk me through your experience",
      "tell me about your experience",
      "your background in",
      "experience in this field",
      "relevant experience",
      "what experience do you have",
      "describe your background"
    ],
    bullets: [
      "Most relevant role: [Job title + key achievement]",
      "Transferable skills: [What directly applies to this job]",
      "Growth trajectory: [How each role built on the last]",
      "Why I'm ready: [Proof you can handle this role]"
    ],
    narrative: "My most relevant experience comes from my time as [TITLE] at [COMPANY], where I [KEY ACHIEVEMENT]. Before that, I developed foundational skills in [AREA] at [PREVIOUS ROLE]. Each role has built on the last, and now I have [X YEARS] of experience specifically in [RELEVANT AREA]. I'm confident I can apply this experience immediately to [CHALLENGE IN THIS ROLE].",
    followUps: [
      "What was your biggest accomplishment in that role?",
      "How did you measure success in that position?"
    ]
  },

  {
    id: 'default_8',
    question: "What's your management/leadership style?",
    category: "Leadership",
    priority: "Medium",
    isDefault: true,
    keywords: [
      "management style",
      "leadership style",
      "how do you manage",
      "how do you lead",
      "describe your leadership",
      "what kind of manager are you",
      "your approach to managing",
      "leadership approach"
    ],
    bullets: [
      "Core philosophy: [Your fundamental belief about leading people]",
      "Day-to-day approach: [How you interact with direct reports]",
      "Development focus: [How you help people grow]",
      "Example: [Specific situation where your style led to success]"
    ],
    narrative: "My leadership style centers on [CORE PRINCIPLE]. Day to day, that means I [SPECIFIC BEHAVIORS]. I believe in [DEVELOPMENT APPROACH] because I've seen how it [POSITIVE OUTCOME]. For example, when I managed [PERSON/TEAM], I [SPECIFIC ACTION] which resulted in [MEASURABLE IMPROVEMENT]. I adapt my approach based on each person's needs while maintaining [CONSISTENT VALUE].",
    followUps: [
      "How do you handle underperformance?",
      "Give me an example of developing someone on your team"
    ]
  },

  {
    id: 'default_9',
    question: "How do you handle stress and pressure?",
    category: "Behavioral",
    priority: "Medium",
    isDefault: true,
    keywords: [
      "how do you handle stress",
      "dealing with pressure",
      "working under pressure",
      "how do you manage stress",
      "stressful situations",
      "handling tight deadlines",
      "high pressure situations",
      "cope with stress"
    ],
    bullets: [
      "Prevention: [How you stay organized to minimize stress]",
      "In the moment: [Your coping strategies during high-pressure times]",
      "Recovery: [How you recharge after intense periods]",
      "Example: [Specific high-pressure situation you handled well]"
    ],
    narrative: "I handle stress by staying proactive and organized. I [PREVENTION STRATEGY] which helps me avoid most high-pressure situations. When deadlines do get tight, I [STRESS MANAGEMENT TECHNIQUE] and focus on [PRIORITIZATION APPROACH]. For example, during [SPECIFIC STRESSFUL SITUATION], I [WHAT YOU DID] and successfully [OUTCOME]. I also make sure to [RECOVERY METHOD] to stay sustainable long-term.",
    followUps: [
      "Tell me about the most stressful project you've managed",
      "How do you prioritize when everything is urgent?"
    ]
  },

  // ========== CLOSING QUESTIONS ==========
  {
    id: 'default_10',
    question: "Why are you leaving your current role?",
    category: "Transition",
    priority: "High",
    isDefault: true,
    keywords: [
      "why are you leaving",
      "why leaving your current job",
      "why are you looking to leave",
      "what makes you want to leave",
      "reason for leaving",
      "why change jobs",
      "why move on",
      "looking to make a change"
    ],
    bullets: [
      "Positive framing: [What you're moving TOWARD, not running FROM]",
      "Growth reason: [Specific opportunity this role offers]",
      "Gratitude: [What you've gained from current role]",
      "Readiness: [Why now is the right time]"
    ],
    narrative: "I've really valued my time at [CURRENT COMPANY] where I've [WHAT YOU'VE ACCOMPLISHED]. At this point in my career, I'm looking for [SPECIFIC GROWTH OPPORTUNITY] that I can find here at [NEW COMPANY]. The role you're offering provides [SPECIFIC THING CURRENT ROLE LACKS], and I'm excited to take on that challenge. The timing feels right because [COMPLETION OF PROJECT/NATURAL TRANSITION POINT].",
    followUps: [
      "What would make you stay at your current company?",
      "How did you start looking for new opportunities?"
    ]
  },

  {
    id: 'default_11',
    question: "What questions do you have for me?",
    category: "Closing",
    priority: "High",
    isDefault: true,
    keywords: [
      "questions for me",
      "questions for us",
      "what questions do you have",
      "any questions",
      "questions about the role",
      "anything you want to ask",
      "want to ask us anything",
      "do you have questions"
    ],
    bullets: [
      "Ask about the role: 'What does success look like in the first 90 days?'",
      "Ask about the team: 'How would you describe the team culture?'",
      "Ask about growth: 'What opportunities for development exist?'",
      "Ask about them: 'What do you enjoy most about working here?'"
    ],
    narrative: "Yes, I have a few questions. First, what does success look like in the first 90 days for this role? Second, can you tell me about the team I'd be working with and how you'd describe the collaboration style? Third, what opportunities exist for professional development and growth? And finally, what do YOU personally enjoy most about working here?",
    followUps: []
  },

  {
    id: 'default_12',
    question: "What are your salary expectations?",
    category: "Compensation",
    priority: "Medium",
    isDefault: true,
    keywords: [
      "salary expectations",
      "what are you looking for salary",
      "compensation expectations",
      "expected salary",
      "salary range",
      "what do you expect to make",
      "salary requirements",
      "how much are you looking for"
    ],
    bullets: [
      "Research: [Mention you've researched market rates]",
      "Range: [Give a reasonable range based on role/location]",
      "Flexibility: [Express openness to full package discussion]",
      "Priority: [Emphasize fit over just salary]"
    ],
    narrative: "Based on my research of similar roles in [LOCATION/INDUSTRY] with my level of experience, I'm seeing a range of [LOWER BOUND] to [UPPER BOUND]. I'm targeting something in that range, though I'm very open to discussing the full compensation package including [BENEFITS/EQUITY/OTHER]. Most important to me is finding the right fit where I can [MAKE IMPACT], and I'm confident we can find a number that works for both of us.",
    followUps: [
      "What's the budget for this role?",
      "Are you flexible on that number?"
    ]
  }
];

// Utility function to add default questions to a new user's question bank
export const initializeDefaultQuestions = async (userId, supabase) => {
  try {
    const questionsToInsert = DEFAULT_QUESTIONS.map(q => ({
      user_id: userId,
      question: q.question,
      category: q.category,
      priority: q.priority,
      keywords: q.keywords,
      bullets: q.bullets,
      narrative: q.narrative,
      follow_ups: q.followUps,
      is_default: true,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (error) {
      console.error('Error inserting default questions:', error);
      return { success: false, error };
    }

    console.log(`✅ Initialized ${DEFAULT_QUESTIONS.length} default questions for user ${userId}`);
    return { success: true, data };
  } catch (err) {
    console.error('Exception initializing default questions:', err);
    return { success: false, error: err };
  }
};