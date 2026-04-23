// ISL - Default Interview Questions
// Full question bank organized by research-backed groups
// Auto-loaded for new users to enable instant Practice Prompter functionality

export const QUESTION_GROUPS = [
  { id: 'first-impressions', label: 'First Impressions', icon: '\u{1F3A4}', description: 'Opening questions that set the tone', defaultOn: true, whyItExists: "Hiring managers use opening questions to evaluate three things simultaneously: whether you can do the job, whether you will fit the team culture, and whether you communicate with clarity under pressure. Research from structured interview rubrics shows these first 2-3 minutes disproportionately shape the interviewer's overall impression, making this the highest-leverage category to practice." },
  { id: 'behavioral', label: 'Behavioral', icon: '\u2B50', description: 'Core STAR stories and past situations', defaultOn: true, whyItExists: "Behavioral interviewing is built on the premise that past behavior is the best predictor of future performance. Companies like Amazon, Google, and McKinsey use structured behavioral rubrics scored on a 1-5 scale assessing specific competencies. Harvard Business Review research confirms that behavioral questions, when scored against predefined criteria, produce more reliable hiring decisions than unstructured conversation." },
  { id: 'situational', label: 'Situational', icon: '\u{1F9E9}', description: 'What would you do if...', defaultOn: true, whyItExists: "Situational questions test judgment and decision-making in realistic scenarios. Unlike behavioral questions that look backward, these reveal how candidates think through problems in real time. Research shows strong situational answers address the core issue, demonstrate analytical thinking, and propose practical solutions while considering consequences. Interviewers write ideal answers in advance and score candidates against them." },
  { id: 'self-awareness', label: 'Self-Awareness', icon: '\u{1F50D}', description: 'Vulnerability, growth, honest reflection', defaultOn: true, whyItExists: "Self-awareness questions assess emotional intelligence, which research consistently links to workplace effectiveness and leadership potential. Hiring managers look for depth, nuance, and appropriate vulnerability. Psychologists note that candidates who pair honest limitations with proactive improvement strategies trigger what is called benevolent trust: the belief that someone is both competent and has good intentions." },
  { id: 'communication', label: 'Communication', icon: '\u{1F4AC}', description: 'Style, difficult conversations, listening', defaultOn: true, whyItExists: "Communication is consistently rated as the top soft skill employers evaluate. These questions assess whether candidates can adapt their message for different audiences, navigate conflict constructively, and listen as effectively as they speak. Collaboration research shows that communication skill touches emotional intelligence, problem-solving, and leadership simultaneously, making it a high-signal evaluation category." },
  { id: 'leadership', label: 'Leadership', icon: '\u{1F451}', description: 'Influence, initiative, tough calls', defaultOn: true, whyItExists: "Leadership questions go beyond management experience to evaluate influence, initiative, and decision-making under uncertainty. Hiring managers report that the best answers demonstrate process over results, showing how candidates think and reason rather than just what they achieved. Authenticity matters more than polish here: interviewers can spot rehearsed answers, and they want to see how you actually lead, not how you describe leadership in theory." },
  { id: 'adaptability', label: 'Adaptability', icon: '\u{1F30A}', description: 'Change, resilience, uncertainty', defaultOn: true, whyItExists: "In a rapidly changing work environment, adaptability has become one of the most sought-after competencies. These questions assess whether candidates can maintain productivity and composure during disruption, learn new skills quickly, and recover from setbacks. Interviewers evaluate not just what happened but how candidates managed their emotional response to change, which predicts long-term resilience." },
  { id: 'curveball', label: 'Curveball', icon: '\u26A1', description: 'Creative, unexpected, personality-revealing', defaultOn: true, whyItExists: "Curveball questions are designed to move candidates off their rehearsed talking points and reveal authentic personality, creativity, and thinking process. Research confirms that interviewers care less about the specific answer and more about how you reach your conclusion. These questions assess real-time problem-solving, composure under the unexpected, and cultural fit in ways that standard behavioral questions cannot." },
  { id: 'values', label: 'Values & Culture', icon: '\u{1F48E}', description: 'Motivation, work style, alignment', defaultOn: false, whyItExists: "Values and culture fit questions have grown in importance as companies recognize that skills can be taught but alignment with organizational values cannot. These questions help interviewers assess intrinsic motivation, work style preferences, and whether a candidate will thrive in or clash with the existing team dynamics. Answers reveal what candidates truly prioritize, which predicts engagement and retention far better than technical assessments." },
  { id: 'drills', label: 'Response Drills', icon: '\u{1F3AF}', description: 'Structured improvisation exercises', defaultOn: false, whyItExists: "Stanford communication professor Matt Abrahams' research shows that having a communication structure dramatically improves spontaneous speaking performance. These drills train specific frameworks (What-So What-Now What, Problem-Solution-Benefit, PREP, ADD) so they become automatic under pressure. The goal is not memorized answers but internalized structures that prevent rambling, freezing, and filler words during real interviews." },
  { id: 'closing', label: 'Closing', icon: '\u{1F4CB}', description: 'Salary, questions for them, next steps', defaultOn: true, whyItExists: "Closing questions evaluate professionalism, negotiation skill, and genuine interest in the role. Research from The Muse and Indeed shows that how candidates handle salary discussions signals market awareness and self-worth. The questions you ask the interviewer are equally evaluative: asking zero questions signals disinterest, while thoughtful questions demonstrate research, curiosity, and strategic thinking about the role." },
];

export const DEFAULT_QUESTIONS = [

  // =====================================================================
  // GROUP 1: FIRST IMPRESSIONS (8 questions)
  // =====================================================================

  {
    id: 'fi_01',
    question: "Tell me about yourself.",
    category: "Behavioral",
    group: "first-impressions",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "tell me about yourself",
      "introduce yourself",
      "walk me through your background",
      "tell me about your experience",
      "give me your elevator pitch",
      "so tell me about you",
      "tell us about yourself"
    ],
    bullets: [
      "Current role: your title and one key responsibility that connects to this job",
      "Career arc: two to three highlights from past roles showing progression",
      "Why you are here: a genuine reason this specific opportunity excites you",
      "What you bring: one or two strengths the interviewer should remember"
    ],
    narrative: "I am currently a [TITLE] at [COMPANY], where I focus on [KEY RESPONSIBILITY]. Before that, I spent [X years] at [PREVIOUS COMPANY] where I [NOTABLE ACHIEVEMENT]. What drew me to this role is [SPECIFIC REASON TIED TO THE COMPANY OR TEAM], and I believe my background in [RELEVANT SKILL] positions me to contribute meaningfully from day one.",
    followUps: [
      "What made you choose this career path?",
      "What has been your biggest career achievement so far?",
      "How would your current manager describe your work?"
    ],
    whyTheyAsk: "Hiring managers evaluate three things simultaneously: can you do the job, will you fit the team, and can you communicate concisely under pressure. This is also an assessment of whether you can distill a complex narrative into a focused 60-90 second pitch. Interviewers report that rambling past two minutes is the most common failure mode.",
    coachingTip: "Use the Past-Present-Future structure: one sentence on your background, one on your current role, and one on why this opportunity excites you. Keep it under 90 seconds. The biggest mistake candidates make is reciting their resume chronologically instead of curating a narrative arc that points toward this specific role.",
    recommendedStructure: "past-present-future"
  },

  {
    id: 'fi_02',
    question: "Why are you interested in this role?",
    category: "Behavioral",
    group: "first-impressions",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "why are you interested",
      "why this role",
      "why this position",
      "why did you apply",
      "what interests you about this job",
      "why do you want this job",
      "what attracted you to this role"
    ],
    bullets: [
      "Mission alignment: how the company's purpose connects to something you care about",
      "Growth opportunity: a specific skill or responsibility this role lets you develop",
      "Team or culture signal: something you learned during research that excited you",
      "Timing: why this move makes sense at this stage of your career"
    ],
    narrative: "Three things stand out to me. First, [COMPANY]'s work in [AREA] aligns with my belief that [YOUR VALUE]. Second, the chance to own [SPECIFIC RESPONSIBILITY] would stretch me in exactly the direction I want to grow. And third, from what I have learned about the team's approach to [QUALITY], this feels like a place where I could do my best work.",
    followUps: [
      "What do you know about our company?",
      "What would you want to accomplish in your first 90 days?",
      "How does this role fit into your long-term plans?"
    ],
    whyTheyAsk: "Interviewers are screening for genuine interest versus mass-applying to any open role. They want evidence that you have researched the company and can articulate a specific connection between your goals and their needs. Generic answers like 'I want to grow' immediately signal low effort.",
    coachingTip: "Mention one specific detail about the company that you could not say about any other employer: a recent product launch, a leadership decision, or a team blog post. This proves research. Then connect it to a personal value or career goal. The formula is: what I know about you + what I care about = why this is the right fit.",
    recommendedStructure: "what-so-now"
  },

  {
    id: 'fi_03',
    question: "What do you know about our company?",
    category: "Behavioral",
    group: "first-impressions",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "what do you know about us",
      "what do you know about our company",
      "what have you learned about us",
      "tell me what you know about this organization",
      "have you researched our company"
    ],
    bullets: [
      "Mission or product: demonstrate you understand what the company does and why",
      "Recent news: mention a product launch, funding round, or strategic move",
      "Culture signal: reference a value, blog post, or interview that resonated with you",
      "Connection: explain why what you learned matters to you personally"
    ],
    narrative: "I have been following [COMPANY] since [WHEN OR WHY]. I know you focus on [CORE PRODUCT OR MISSION], and I was particularly impressed by [RECENT NEWS OR INITIATIVE]. What resonates with me is [VALUE OR APPROACH], because in my own career I have always prioritized [RELATED PERSONAL VALUE].",
    followUps: [
      "What excites you most about where we are headed?",
      "How do you see yourself contributing to that direction?"
    ],
    whyTheyAsk: "This is a preparation test disguised as a question. Interviewers use it to gauge how seriously you are pursuing this specific role versus treating it as one of many applications. Candidates who can reference specific, recent information about the company signal initiative and genuine interest.",
    coachingTip: "Spend 15 minutes before each interview reading the company's recent press releases, blog posts, and LinkedIn updates. Name one fact the interviewer might not expect you to know. Avoid reciting the 'About Us' page; instead, connect a specific company initiative to your own experience or values.",
    recommendedStructure: "what-so-now"
  },

  {
    id: 'fi_04',
    question: "Walk me through your resume.",
    category: "Experience",
    group: "first-impressions",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "walk me through your resume",
      "walk me through your experience",
      "tell me about your background",
      "take me through your career",
      "your background in this field",
      "describe your career progression"
    ],
    bullets: [
      "Start with your earliest relevant role and the skill it built",
      "Move chronologically, highlighting one achievement per role",
      "Show how each step prepared you for the next",
      "Land on why this role is the logical next chapter"
    ],
    narrative: "I started my career at [FIRST COMPANY] where I built a foundation in [SKILL]. From there I moved to [SECOND COMPANY], where I took on [BIGGER RESPONSIBILITY] and achieved [RESULT]. Most recently at [CURRENT COMPANY], I have been responsible for [KEY AREA], which has given me deep experience in [RELEVANT EXPERTISE]. Each step has built toward [THE KIND OF WORK THIS ROLE INVOLVES].",
    followUps: [
      "What was the biggest leap between roles?",
      "Which role taught you the most and why?"
    ],
    whyTheyAsk: "Unlike 'tell me about yourself,' this question asks for a chronological walkthrough. Interviewers evaluate whether you can show intentional career progression rather than random job-hopping. They are listening for the connective tissue between roles: how each experience built toward the next.",
    coachingTip: "Spend 10-15 seconds per role maximum. The structure is: what you did, one achievement, and how it led to the next move. End by connecting your arc to the role you are interviewing for. The most common mistake is giving equal time to every role instead of weighting recent and relevant experience.",
    recommendedStructure: "past-present-future"
  },

  {
    id: 'fi_05',
    question: "Why are you leaving your current position?",
    category: "Transition",
    group: "first-impressions",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "why are you leaving",
      "why leaving your current job",
      "reason for leaving",
      "why change jobs",
      "why move on",
      "looking to make a change",
      "why are you looking"
    ],
    bullets: [
      "Frame positively: talk about what you are moving toward, not running from",
      "Show gratitude: acknowledge what your current role has given you",
      "Name the gap: identify the specific growth opportunity your current role cannot provide",
      "Connect forward: link that gap directly to what this new role offers"
    ],
    narrative: "I have learned a tremendous amount at [CURRENT COMPANY], especially around [SKILL OR AREA]. At this point, I am looking for an opportunity to [SPECIFIC GROWTH AREA] that is not available in my current role. What excites me about this position is that it offers exactly that through [SPECIFIC ASPECT OF THE NEW ROLE].",
    followUps: [
      "What would make you stay at your current company?",
      "Is there anything about your current role you will miss?"
    ],
    whyTheyAsk: "Interviewers are screening for two red flags: whether you badmouth previous employers (signals low professionalism) and whether you are running away from problems rather than toward opportunities (signals potential flight risk). They also assess whether your reason for leaving suggests you will stay long-term in this new role.",
    coachingTip: "Never mention negative reasons first even if they are real. Lead with what you are moving toward, not what you are escaping. The formula is: gratitude for what you learned + the specific gap + how this role fills that gap. If you were laid off, say so honestly and pivot to why this opportunity excites you.",
    recommendedStructure: "past-present-future"
  },

  {
    id: 'fi_06',
    question: "What are you looking for in your next role?",
    category: "Behavioral",
    group: "first-impressions",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "what are you looking for",
      "what do you want in your next role",
      "ideal next position",
      "what matters to you in a role",
      "what are you seeking"
    ],
    bullets: [
      "Type of work: the kind of problems or projects that energize you",
      "Growth dimension: the skills or experiences you want to develop next",
      "Environment: the team dynamics or culture where you do your best work",
      "Impact: the kind of contribution that feels meaningful to you"
    ],
    narrative: "I am looking for a role where I can [TYPE OF WORK YOU WANT TO DO] in an environment that values [CULTURE ELEMENT]. The growth I want next is deeper experience in [SKILL AREA], and I want to be somewhere my work has a direct impact on [MEANINGFUL OUTCOME]. From everything I have seen, this role checks all of those boxes.",
    followUps: [
      "How do you evaluate whether a company is the right fit?",
      "What is the most important factor for you?"
    ],
    whyTheyAsk: "This question tests alignment between your desires and what the role actually offers. If your ideal next role describes a different job entirely, the interviewer knows you will be dissatisfied quickly. They are also assessing self-awareness: do you know what you actually need to thrive, or are you just saying what sounds good?",
    coachingTip: "Research the role description before answering and mirror its language. If the job emphasizes cross-functional collaboration, mention that you thrive when working across teams. Be genuine, but align your honest preferences with the role's actual characteristics. End by explicitly connecting your criteria to this specific opportunity.",
    recommendedStructure: "what-so-now"
  },

  {
    id: 'fi_07',
    question: "How did you hear about this position?",
    category: "Behavioral",
    group: "first-impressions",
    priority: "Low",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "how did you hear about",
      "how did you find this position",
      "what brought you here",
      "how did you learn about this role",
      "who referred you"
    ],
    bullets: [
      "Be specific about the source (referral, LinkedIn, job board, event)",
      "If referred, name the person and what they said that intrigued you",
      "Connect the discovery to genuine interest, not just job-hunting",
      "Show that you chose this company deliberately"
    ],
    narrative: "I found this role through [SOURCE]. What caught my attention was [SPECIFIC DETAIL ABOUT THE POSTING OR CONVERSATION]. I had already been following [COMPANY] because of [REASON], so when I saw this opening, it felt like a natural fit for the direction I want to take my career.",
    followUps: [
      "What specifically in the job description stood out to you?"
    ],
    whyTheyAsk: "This seems like a throwaway question but serves two purposes: tracking recruitment channel effectiveness and gauging how deliberately you chose to apply. Referral candidates tend to be viewed more favorably because someone internal vouched for them. Interviewers also notice whether you treat this as a quick answer or use it to demonstrate genuine interest.",
    coachingTip: "If someone referred you, name them and mention what they specifically said about the team or role. If you found it on a job board, add what made you stop scrolling: a specific phrase in the description, the company's reputation, or a product you admire. Turn a mundane question into a mini-pitch for your genuine interest.",
    recommendedStructure: null
  },

  {
    id: 'fi_08',
    question: "What would you want to accomplish in your first 90 days?",
    category: "Behavioral",
    group: "first-impressions",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "first 90 days",
      "first three months",
      "first few months",
      "how would you start",
      "onboarding plan",
      "what would you do first",
      "how would you ramp up"
    ],
    bullets: [
      "Days 1-30: learn the landscape by meeting people, studying processes, and absorbing context",
      "Days 31-60: identify one or two quick wins that build trust and momentum",
      "Days 61-90: propose a longer-term initiative based on what you have learned",
      "Throughout: ask more questions than you make statements"
    ],
    narrative: "In the first month, I would focus entirely on listening and learning: meeting the team, understanding current processes, and mapping stakeholder relationships. By month two, I would aim to deliver a quick win in [AREA RELEVANT TO ROLE] to build credibility. By the end of 90 days, I would have a clear picture of where I can add the most value and would present a proposal for [LONGER-TERM INITIATIVE].",
    followUps: [
      "What is the biggest challenge you think you would face in the first month?",
      "How do you balance learning with delivering results?"
    ],
    whyTheyAsk: "Interviewers use this to assess strategic thinking, humility, and realistic expectations. Candidates who claim they will transform the department in 30 days signal arrogance. Those who say they will just listen for 90 days signal passivity. The best answers show a progression from learning to contributing, demonstrating both respect for existing context and a bias toward action.",
    coachingTip: "Structure your answer in three phases: learn (month 1), contribute (month 2), propose (month 3). Mention specific people you would meet or processes you would study to show you understand the role's ecosystem. Name one realistic quick win from month two to demonstrate you can deliver while still ramping up.",
    recommendedStructure: "what-so-now"
  },

  // =====================================================================
  // GROUP 2: BEHAVIORAL FOUNDATIONS (8 questions)
  // =====================================================================

  {
    id: 'bh_01',
    question: "Tell me about a time you had a conflict with a coworker. How did you resolve it?",
    category: "Behavioral",
    group: "behavioral",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "conflict with a coworker",
      "disagreement at work",
      "conflict resolution",
      "time you had a conflict",
      "interpersonal conflict",
      "working relationship issue",
      "clash with a colleague"
    ],
    bullets: [
      "Situation: set the scene with the project, the people, and what was at stake",
      "Your role in the conflict: be honest about your part, not just the other person's",
      "Actions you took: describe how you initiated the conversation and sought resolution",
      "Result: explain what changed and what you learned about working through disagreement"
    ],
    narrative: "On a project at [COMPANY], I had a disagreement with a colleague over [ISSUE]. Rather than letting it fester, I asked for a private conversation where I listened to their perspective first. I realized I had been [YOUR CONTRIBUTION TO THE PROBLEM]. We agreed to [RESOLUTION], and the project ultimately [POSITIVE OUTCOME]. That experience taught me the value of addressing friction early rather than working around it.",
    followUps: [
      "What would you do differently if it happened again?",
      "How has that experience changed how you handle disagreements?",
      "What if the other person was not willing to have that conversation?"
    ],
    whyTheyAsk: "Conflict resolution is one of the most evaluated behavioral competencies. Interviewers score candidates on emotional maturity, willingness to take ownership, and whether they address problems directly or avoid them. Amazon's behavioral rubric specifically assesses whether candidates seek to understand the other person's perspective before defending their own position.",
    coachingTip: "Always acknowledge your role in the conflict, even if it was minor. Answers where the other person is entirely wrong and you are entirely right score poorly on self-awareness. Show that you initiated the resolution rather than waiting for someone else to fix it. The result should include both the project outcome and the relationship outcome.",
    recommendedStructure: "star"
  },

  {
    id: 'bh_02',
    question: "Describe a situation where you had to lead a team through a difficult project.",
    category: "Behavioral",
    group: "behavioral",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "lead a team",
      "difficult project",
      "led a team through",
      "managed a challenging project",
      "team leadership",
      "tough project"
    ],
    bullets: [
      "The project: what made it difficult (scope, timeline, team dynamics, ambiguity)",
      "Your leadership approach: how you set direction and kept the team motivated",
      "Key decisions: one or two pivotal choices you made and why",
      "Outcome: measurable results and what the team accomplished together"
    ],
    narrative: "At [COMPANY], I led a team of [SIZE] through [PROJECT] which was challenging because [REASON]. My approach was to [LEADERSHIP STRATEGY], starting with [FIRST ACTION]. When we hit [OBSTACLE], I made the call to [DECISION] because [REASONING]. The team delivered [OUTCOME], and several members told me afterward that [POSITIVE TEAM FEEDBACK].",
    followUps: [
      "What was the hardest part about leading that team?",
      "How did you handle the team member who was struggling the most?",
      "What would you do differently as a leader next time?"
    ],
    whyTheyAsk: "Interviewers evaluate leadership maturity by looking at process over results. They want to see how you set direction, made decisions under pressure, and handled team dynamics, not just what the outcome was. Strong answers show structured thinking and authentic leadership, while weak answers describe results without explaining the reasoning behind key decisions.",
    coachingTip: "Focus on one or two pivotal decisions and explain your reasoning in detail. Interviewers care more about why you chose a particular approach than the outcome itself. Mention how you supported the team member who struggled most, not just the high performers. End with what you learned, not just what you achieved.",
    recommendedStructure: "star"
  },

  {
    id: 'bh_03',
    question: "Give me an example of a time you failed. What did you learn?",
    category: "Behavioral",
    group: "behavioral",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "time you failed",
      "example of failure",
      "biggest failure",
      "tell me about a failure",
      "mistake you made",
      "something that went wrong",
      "setback you experienced"
    ],
    bullets: [
      "The failure: describe what happened without minimizing it",
      "Your responsibility: own your part clearly and specifically",
      "What you did after: the immediate steps you took to address the damage",
      "The lasting lesson: how this failure changed your approach going forward"
    ],
    narrative: "At [COMPANY], I [SPECIFIC FAILURE]. The root cause was [YOUR HONEST ASSESSMENT OF WHAT WENT WRONG]. I took responsibility by [IMMEDIATE ACTIONS], and then I [LONGER-TERM CHANGES]. The biggest lesson was [WHAT YOU LEARNED], and since then I have [HOW YOU APPLY THAT LESSON]. It was a difficult experience, but it genuinely made me better at [SKILL].",
    followUps: [
      "How did your manager react?",
      "Would you take the same risk again knowing the outcome?",
      "How do you distinguish between a failure you could have prevented and one you could not?"
    ],
    whyTheyAsk: "This question evaluates accountability and growth mindset. Interviewers specifically watch for whether you choose a real failure (not a humble brag) and whether you take genuine ownership. The learning component is critical: hiring managers score candidates higher when the behavioral change is specific and lasting, not just a vague 'I learned to communicate better.'",
    coachingTip: "Choose a failure with real stakes, not a disguised success. The answer should make you slightly uncomfortable to tell. Then show the complete arc: what went wrong, what you owned, what you changed, and evidence that the change stuck. Avoid blaming circumstances or other people even partially in your first description of the failure.",
    recommendedStructure: "star"
  },

  {
    id: 'bh_04',
    question: "Tell me about a time you had to work with someone whose personality was very different from yours.",
    category: "Behavioral",
    group: "behavioral",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "different personality",
      "work with someone different",
      "difficult personality",
      "different working style",
      "someone you did not click with",
      "personality clash"
    ],
    bullets: [
      "The difference: name the specific working-style gap without being judgmental",
      "Initial friction: how the difference showed up in practice",
      "Your adaptation: concrete steps you took to bridge the gap",
      "Result: how the working relationship evolved and what you delivered together"
    ],
    narrative: "I worked closely with a colleague at [COMPANY] who was very [DIFFERENT TRAIT] while I tend to be [YOUR TRAIT]. Initially this caused friction around [SPECIFIC SITUATION]. I adjusted by [ADAPTATION STRATEGY], and I also asked them to [WHAT YOU NEEDED]. Over time we developed a rhythm where [HOW YOU WORKED TOGETHER EFFECTIVELY], and our project achieved [RESULT].",
    followUps: [
      "What did you learn about yourself from that experience?",
      "How do you typically adapt to different working styles?"
    ],
    whyTheyAsk: "This evaluates emotional intelligence and adaptability. Interviewers want evidence that you can work productively with people who do not think or operate like you. The key signal they look for is whether you adapted your own style or simply tolerated the other person. Adaptation indicates collaboration maturity; mere tolerance indicates limited growth.",
    coachingTip: "Describe the personality difference neutrally, not as the other person being difficult. Show that you adjusted your own behavior first before expecting them to change. The strongest answers include what you learned about your own working style from the experience, not just how you managed theirs.",
    recommendedStructure: "star"
  },

  {
    id: 'bh_05',
    question: "Describe a situation where you had to prioritize competing demands under a tight deadline.",
    category: "Behavioral",
    group: "behavioral",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "prioritize competing demands",
      "tight deadline",
      "multiple priorities",
      "time management",
      "juggling priorities",
      "everything was urgent",
      "how do you prioritize"
    ],
    bullets: [
      "The competing demands: what was on your plate and what made the deadline tight",
      "Your prioritization framework: how you decided what came first and what could wait",
      "Communication: how you set expectations with stakeholders about trade-offs",
      "Outcome: what you delivered and how stakeholders responded"
    ],
    narrative: "At [COMPANY], I had [NUMBER] competing deliverables due within [TIMEFRAME]. I evaluated each by [CRITERIA: impact, urgency, dependencies] and decided to [PRIORITIZATION DECISION]. I communicated the trade-offs to [STAKEHOLDERS] by [HOW]. I delivered [PRIMARY DELIVERABLE] on time and [SECONDARY DELIVERABLE] within [ADJUSTED TIMELINE]. The key was being transparent about what was realistic rather than overcommitting.",
    followUps: [
      "What did you deprioritize and how did you communicate that?",
      "How do you handle it when your manager says everything is top priority?"
    ],
    whyTheyAsk: "Interviewers assess your prioritization framework and stakeholder communication under pressure. They want to see a systematic approach to deciding what matters most, not just working harder. Candidates who describe doing everything simultaneously score lower than those who made explicit trade-offs and communicated them proactively.",
    coachingTip: "Name the specific criteria you used to prioritize (impact, urgency, reversibility, dependencies). Show that you communicated trade-offs to stakeholders before they became problems, not after. The strongest answers include what you chose not to do and how you managed expectations around it.",
    recommendedStructure: "star"
  },

  {
    id: 'bh_06',
    question: "Tell me about a time you went above and beyond what was expected.",
    category: "Behavioral",
    group: "behavioral",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "above and beyond",
      "exceeded expectations",
      "extra mile",
      "went beyond your role",
      "initiative you took",
      "more than was asked"
    ],
    bullets: [
      "The baseline expectation: what was technically required of you",
      "What you chose to do on top of that and why",
      "The effort involved: be specific about the time, skill, or creativity it took",
      "The impact: how it benefited the team, customer, or project"
    ],
    narrative: "At [COMPANY], I was responsible for [BASELINE TASK]. I noticed that [OPPORTUNITY OR GAP] and decided to [EXTRA EFFORT]. This involved [WHAT IT TOOK], which was outside my normal responsibilities. The result was [MEASURABLE IMPACT], and my manager recognized it by [RECOGNITION]. I did it because [MOTIVATION], not because I was asked.",
    followUps: [
      "How do you decide when something is worth the extra effort?",
      "How do you balance going above and beyond with sustainable work habits?"
    ],
    whyTheyAsk: "This question evaluates intrinsic motivation, initiative, and judgment. Interviewers want to see that you notice opportunities others miss and act on them without being told. Equally important is your judgment about when extra effort is warranted: candidates who describe unsustainable overwork may raise concerns about burnout or boundary issues.",
    coachingTip: "Make the contrast clear between what was expected and what you actually delivered. Quantify the impact with a number if possible. Show that your motivation was genuine (you cared about the outcome) rather than performative (you wanted to be noticed). The best answers demonstrate initiative driven by ownership, not obligation.",
    recommendedStructure: "star"
  },

  {
    id: 'bh_07',
    question: "Give an example of when you had to persuade someone to see things your way.",
    category: "Behavioral",
    group: "behavioral",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "persuade someone",
      "convince someone",
      "influence without authority",
      "get buy-in",
      "change someone's mind",
      "persuasion",
      "seeing things your way"
    ],
    bullets: [
      "The situation: what you wanted to change and why the other person disagreed",
      "Understanding their perspective: how you first sought to understand their position",
      "Your persuasion approach: data, storytelling, finding common ground, or empathy",
      "Outcome: whether they came around and what the result was"
    ],
    narrative: "At [COMPANY], I believed we should [YOUR POSITION], but [PERSON] disagreed because [THEIR REASONING]. Instead of pushing harder, I first made sure I understood their concerns. Then I [PERSUASION APPROACH: presented data, ran a small pilot, connected it to their goals]. Over [TIMEFRAME], they came around because [WHAT CONVINCED THEM], and the result was [OUTCOME].",
    followUps: [
      "What do you do when persuasion does not work?",
      "How do you distinguish between persuading and manipulating?"
    ],
    whyTheyAsk: "This evaluates influence skills, particularly the ability to move people without positional authority. Interviewers score candidates on whether they first sought to understand the other perspective before advocating their own. Pushing harder without listening scores poorly; finding shared goals and using evidence scores highly on behavioral rubrics.",
    coachingTip: "Show that you understood their position before trying to change it. The sequence matters: listen first, then advocate. Name your specific persuasion method (data, pilot project, connecting to their goals, finding common ground). If you ultimately did not convince them, that can still be a strong answer if you show how you handled the outcome gracefully.",
    recommendedStructure: "star"
  },

  {
    id: 'bh_08',
    question: "Tell me about a time you received critical feedback. How did you respond?",
    category: "Behavioral",
    group: "behavioral",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "critical feedback",
      "negative feedback",
      "constructive criticism",
      "tough feedback",
      "feedback you received",
      "how you handle feedback"
    ],
    bullets: [
      "The feedback: what was said and who said it (be specific, not vague)",
      "Your initial reaction: be honest about how it felt in the moment",
      "What you did with it: concrete changes you made based on the feedback",
      "The result: how those changes showed up in your work going forward"
    ],
    narrative: "My manager at [COMPANY] told me that I was [SPECIFIC FEEDBACK]. My initial reaction was [HONEST EMOTION], but after reflecting on it, I realized they were right about [VALID POINT]. I changed my approach by [SPECIFIC ACTIONS], and within [TIMEFRAME] I saw [MEASURABLE IMPROVEMENT]. Now I actively seek out that kind of feedback because I know how much it accelerates growth.",
    followUps: [
      "What is the hardest piece of feedback you have ever received?",
      "How do you distinguish between feedback you should act on and feedback you should disregard?"
    ],
    whyTheyAsk: "This is a coachability test. Interviewers want evidence that you can receive criticism without becoming defensive, extract the valid signal, and translate it into behavioral change. Companies increasingly rank coachability as a top hiring criterion because it predicts long-term growth and team fit.",
    coachingTip: "Be honest about your initial emotional reaction. Saying 'it stung' or 'I was defensive at first' shows authenticity and self-awareness. Then show the complete arc: emotion, reflection, action, result. The most compelling answers end with you now actively seeking the same kind of feedback, which signals a growth mindset rather than grudging compliance.",
    recommendedStructure: "star"
  },

  // =====================================================================
  // GROUP 3: SITUATIONAL PROBLEM-SOLVING (7 questions)
  // =====================================================================

  {
    id: 'si_01',
    question: "What would you do if you disagreed with your manager's decision on a project?",
    category: "Situational",
    group: "situational",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "disagree with your manager",
      "boss makes a bad decision",
      "manager is wrong",
      "push back on your manager",
      "challenge authority",
      "disagree with leadership"
    ],
    bullets: [
      "First step: seek to understand by asking questions about their reasoning",
      "Present your case: share your perspective with data or examples, not just opinions",
      "Commit to the decision: if overruled, commit fully rather than undermining",
      "Circle back: after execution, revisit the outcome together as a learning moment"
    ],
    narrative: "I would start by asking my manager to help me understand the reasoning behind their decision, because there may be context I am missing. If I still disagreed, I would share my perspective respectfully, backed by [DATA OR EVIDENCE]. If they ultimately decided to go a different direction, I would commit fully to executing their plan. After the results were in, I would suggest a quick debrief so we could learn from the outcome together.",
    followUps: [
      "What if your manager's decision could harm the team or the customer?",
      "Tell me about a time you actually did this."
    ],
    whyTheyAsk: "Interviewers evaluate two skills simultaneously: the courage to voice dissent and the maturity to commit once a decision is final. This maps directly to Amazon's 'disagree and commit' leadership principle. Candidates who always agree score low on candor; candidates who never commit after being overruled score low on team orientation.",
    coachingTip: "Show a clear three-step process: understand first, advocate with evidence, then commit fully. The most critical part is the commit step. Make it clear you would execute wholeheartedly even if you disagreed, while still maintaining a professional channel for post-decision feedback. Never say you would go over your manager's head unless safety is at stake.",
    recommendedStructure: "psb"
  },

  {
    id: 'si_02',
    question: "How would you handle a situation where a teammate consistently missed deadlines?",
    category: "Situational",
    group: "situational",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "teammate missed deadlines",
      "colleague not delivering",
      "team member underperforming",
      "coworker missing deadlines",
      "someone not pulling their weight"
    ],
    bullets: [
      "Assumption of good intent: start by understanding what is going on before judging",
      "Private conversation: address it directly and empathetically, not through gossip or escalation",
      "Offer support: ask if there are blockers you can help remove",
      "Escalation path: if the pattern continues after support, involve management appropriately"
    ],
    narrative: "I would first have a private, empathetic conversation to understand what is happening. Maybe they are overloaded, dealing with unclear requirements, or struggling with something personal. I would ask how I can help and whether we can adjust workload or processes. If the pattern continued after support, I would involve our manager, framing it as a team issue rather than blaming the individual.",
    followUps: [
      "What if the person gets defensive when you bring it up?",
      "At what point would you escalate to management?"
    ],
    whyTheyAsk: "This evaluates empathy, direct communication, and judgment about escalation. Interviewers watch for whether you jump to escalation (too aggressive), avoid the conversation entirely (too passive), or find the middle ground of empathetic directness. The assumption of good intent is critical: candidates who immediately assume laziness score poorly on emotional intelligence.",
    coachingTip: "Start with curiosity, not judgment. Ask 'what is going on?' before 'why are you missing deadlines?' Show a clear escalation ladder: private conversation first, offer support second, involve management only after direct efforts have not worked. Frame escalation as a team need, not a personal complaint about the individual.",
    recommendedStructure: "psb"
  },

  {
    id: 'si_03',
    question: "If you were assigned a project in an area you have no experience in, how would you approach it?",
    category: "Situational",
    group: "situational",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "no experience",
      "unfamiliar area",
      "new territory",
      "project outside your expertise",
      "never done this before",
      "learning something new quickly"
    ],
    bullets: [
      "Acknowledge the gap honestly without apologizing for it",
      "Research phase: map out what you need to learn and identify the best sources",
      "Find internal experts: ask for 30 minutes with someone who has done this before",
      "Set early checkpoints: propose progress reviews so the team can course-correct quickly"
    ],
    narrative: "I would be upfront about my learning curve while expressing genuine enthusiasm for the challenge. I would spend the first few days on focused research, identify one or two internal experts to learn from, and set up weekly check-ins with my manager to ensure I am on track. In my experience, approaching unfamiliar work with curiosity and structure leads to faster ramp-up than pretending I already know the answers.",
    followUps: [
      "Tell me about a time you actually had to do this.",
      "How do you balance learning with delivering on a deadline?"
    ],
    whyTheyAsk: "This tests learning agility and intellectual humility, two of the strongest predictors of long-term performance. Interviewers want to see a structured approach to the unknown: how you identify what you need to learn, find resources efficiently, and build in checkpoints. Candidates who claim they can figure anything out without a plan score lower than those with a clear learning strategy.",
    coachingTip: "Show a specific learning methodology, not just enthusiasm. Name the steps: scope what you need to know, identify the 20% that covers 80% of cases, find one or two internal experts, set weekly check-ins. Mention that you would be upfront about your learning curve with stakeholders rather than pretending expertise you do not have.",
    recommendedStructure: "psb"
  },

  {
    id: 'si_04',
    question: "What would you do if you realized you made a significant mistake on a deliverable that already shipped?",
    category: "Situational",
    group: "situational",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "made a mistake",
      "significant error",
      "mistake on a deliverable",
      "error after shipping",
      "something already went out wrong",
      "discovered a mistake"
    ],
    bullets: [
      "Assess the blast radius: understand who is affected and how severely",
      "Communicate immediately: tell your manager and stakeholders before they discover it",
      "Fix it: propose a remediation plan with clear timelines",
      "Prevent recurrence: implement a process change so it cannot happen the same way again"
    ],
    narrative: "The first thing I would do is assess the impact: who is affected and how severely. Then I would immediately tell my manager and relevant stakeholders rather than trying to fix it silently. I would propose a remediation plan with a timeline and take ownership of implementing it. Afterward, I would do a blameless postmortem to identify the process gap that allowed the mistake and put a safeguard in place.",
    followUps: [
      "Have you ever been in this situation? What happened?",
      "How do you balance speed of disclosure with having a solution ready?"
    ],
    whyTheyAsk: "This is an integrity and accountability test. Interviewers specifically listen for whether you disclose proactively (before being caught) or reactively. The speed and transparency of your communication matters more than the fix itself. Candidates who describe silent fixing score significantly lower than those who describe immediate, transparent communication.",
    coachingTip: "Lead with 'I would tell my manager immediately' as your first action. This is the most important signal. Then show a remediation plan and a prevention plan. The blameless postmortem step elevates your answer from damage control to systems thinking. Never describe trying to fix the mistake quietly before anyone notices.",
    recommendedStructure: "psb"
  },

  {
    id: 'si_05',
    question: "How would you handle a situation where two of your priorities directly conflict?",
    category: "Situational",
    group: "situational",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "conflicting priorities",
      "priorities conflict",
      "two important things at once",
      "cannot do both",
      "competing priorities",
      "which would you choose"
    ],
    bullets: [
      "Clarify the conflict: make sure it is genuinely either-or, not just a scheduling challenge",
      "Evaluate impact: which priority has higher stakes for the business and the customer",
      "Communicate the trade-off: bring the conflict to your manager with a recommendation",
      "Execute and document: deliver on the chosen priority and document why the other was deferred"
    ],
    narrative: "I would first confirm the conflict is real and not something that could be resolved with a schedule adjustment or delegation. If it is genuinely either-or, I would evaluate which priority has higher business impact and bring both options to my manager with a clear recommendation. Transparency about trade-offs is more valuable than silently dropping one priority.",
    followUps: [
      "What if your manager says both are equally important?",
      "Give me an example of when you had to make a tough prioritization call."
    ],
    whyTheyAsk: "Interviewers evaluate structured decision-making and communication under resource constraints. They want to see that you have a framework for evaluating trade-offs (not just gut feel) and that you communicate proactively rather than letting a priority quietly slip. This also tests whether you escalate appropriately or try to be a hero by doing everything poorly.",
    coachingTip: "Show your prioritization criteria explicitly: business impact, customer urgency, reversibility, dependencies. Then show that you would bring the conflict and your recommendation to your manager rather than deciding unilaterally. This demonstrates both judgment and organizational awareness. If asked what to do when both are equal, describe how you would propose splitting the work or adjusting timelines.",
    recommendedStructure: "psb"
  },

  {
    id: 'si_06',
    question: "If a client made an unreasonable request, how would you respond?",
    category: "Situational",
    group: "situational",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "unreasonable request",
      "difficult client",
      "client demanding something impossible",
      "pushback from a client",
      "client expectations"
    ],
    bullets: [
      "Listen fully before reacting: understand what they really need beneath the request",
      "Validate their concern: acknowledge the problem they are trying to solve",
      "Offer alternatives: propose what you can do rather than just saying no",
      "Set boundaries clearly: explain constraints honestly without being defensive"
    ],
    narrative: "I would listen carefully to understand what is driving the request, because often the underlying need is different from the surface ask. I would acknowledge their concern, then be honest about what is and is not possible. Most importantly, I would propose an alternative that addresses their real need within our constraints. In my experience, clients respond well to creative problem-solving even when the answer to the original request is no.",
    followUps: [
      "What if the client escalates to your manager?",
      "Tell me about a time you turned a difficult client interaction into a positive outcome."
    ],
    whyTheyAsk: "This tests your ability to balance customer empathy with firm boundaries. Interviewers assess whether you default to people-pleasing (saying yes to everything), confrontation (saying no without alternatives), or the ideal middle ground of creative problem-solving within constraints. The ability to say 'no, but here is what I can do' is a high-value professional skill.",
    coachingTip: "Dig beneath the surface request to find the real need. Often what seems unreasonable becomes reasonable when you understand the underlying problem. Structure your response as: validate their concern, explain the constraint honestly, then offer an alternative. Never just say no without proposing what you can do instead.",
    recommendedStructure: "psb"
  },

  {
    id: 'si_07',
    question: "What would you do if you noticed a colleague behaving unethically?",
    category: "Situational",
    group: "situational",
    priority: "High",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "unethical behavior",
      "colleague doing something wrong",
      "ethical dilemma",
      "report a coworker",
      "integrity issue",
      "something unethical"
    ],
    bullets: [
      "Verify what you observed: make sure you have the facts before acting",
      "Consider the severity: minor misjudgment versus serious violation",
      "For minor issues: have a direct, private conversation first",
      "For serious issues: report through proper channels without delay"
    ],
    narrative: "I would first make sure I was not misinterpreting the situation by gathering facts. If it was a minor lapse in judgment, I would approach the person directly and privately to share what I observed. If it was a serious ethical violation involving harm to people, finances, or safety, I would report it through the appropriate channels regardless of my relationship with the person. Integrity is not negotiable.",
    followUps: [
      "What if the unethical behavior was coming from your manager?",
      "Have you ever faced an ethical dilemma at work?"
    ],
    whyTheyAsk: "This is a character assessment. Interviewers want to see that you have clear ethical boundaries and the courage to act on them, while also showing judgment about proportional response. Candidates who would report a minor misjudgment to HR without a private conversation first seem rigid; candidates who would ignore serious violations to preserve relationships seem unprincipled.",
    coachingTip: "Show a graduated response based on severity: fact-gathering first, then direct conversation for minor issues, and formal reporting for serious violations. The key differentiator in strong answers is that you would act even when it is socially costly, such as reporting a friend or a manager. End with a clear statement of principle that does not waver based on relationships.",
    recommendedStructure: "psb"
  },

  // =====================================================================
  // GROUP 4: SELF-AWARENESS AND VULNERABILITY (8 questions)
  // =====================================================================

  {
    id: 'sa_01',
    question: "Tell me about a time something went really wrong at work. What was your role in it?",
    category: "Behavioral",
    group: "self-awareness",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "something went wrong",
      "what went wrong at work",
      "your role in a failure",
      "tell me about a mistake",
      "things went south",
      "a time something bad happened"
    ],
    bullets: [
      "What went wrong: describe the situation clearly without deflecting",
      "Your honest role: own your contribution to the problem specifically",
      "Your response: what you did once you realized things had gone off track",
      "The lesson: what changed in your approach going forward"
    ],
    narrative: "At [COMPANY], a [PROJECT OR INITIATIVE] went significantly off track when [WHAT HAPPENED]. My role in it was [HONEST ASSESSMENT: I underestimated the timeline, I did not communicate early enough, I missed a warning sign]. Once I recognized the problem, I [CORRECTIVE ACTIONS]. The experience taught me [LASTING LESSON], and I now [SPECIFIC HABIT OR PRACTICE] to prevent similar situations.",
    followUps: [
      "How did your team react?",
      "What would you do differently knowing what you know now?"
    ],
    whyTheyAsk: "This question specifically probes for accountability by asking 'what was your role in it,' making it harder to deflect blame. Interviewers assess whether you take genuine ownership or subtly redirect responsibility. People who describe their contribution to the problem with specificity score significantly higher than those who describe external circumstances.",
    coachingTip: "Name your specific contribution to the problem before anything else. Saying 'I underestimated the timeline by three weeks' is much stronger than 'the timeline was too aggressive.' The more precisely you can identify what you personally did or failed to do, the more credible your self-awareness appears. Follow ownership with corrective action and lasting change.",
    recommendedStructure: "star"
  },

  {
    id: 'sa_02',
    question: "What is the hardest piece of feedback you have ever received? How did it change you?",
    category: "Behavioral",
    group: "self-awareness",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "hardest feedback",
      "toughest feedback",
      "most difficult feedback",
      "feedback that stung",
      "feedback that changed you",
      "critical feedback"
    ],
    bullets: [
      "The feedback itself: share it specifically, not vaguely",
      "Who gave it and the context: why their perspective was credible",
      "How it felt initially: be honest about your emotional reaction",
      "How it changed you: specific behavioral changes you made as a result"
    ],
    narrative: "The hardest feedback I received was from [WHO] who told me [SPECIFIC FEEDBACK]. At first I felt [HONEST REACTION], but when I sat with it, I realized they were pointing to a blind spot around [THE REAL ISSUE]. I made a deliberate effort to [BEHAVIORAL CHANGES], and over the following [TIMEFRAME] I noticed [MEASURABLE IMPROVEMENT]. That feedback was a turning point in how I [SKILL OR APPROACH].",
    followUps: [
      "How do you seek out feedback now?",
      "Is there feedback you chose not to act on? Why?"
    ],
    whyTheyAsk: "Interviewers look for the full emotional arc: honest initial discomfort followed by reflective processing and lasting behavioral change. Candidates who claim feedback never bothers them seem emotionally unaware. Candidates who describe being devastated without showing growth seem fragile. The strongest candidates show both vulnerability and resilience in the same answer.",
    coachingTip: "Share the feedback verbatim if you can remember it. 'My manager told me I was micromanaging my team' is much more credible than 'I got some feedback about my management style.' Admit the emotional sting honestly, then show the work you did to change. The transformation should be specific enough that someone could verify it.",
    recommendedStructure: "star"
  },

  {
    id: 'sa_03',
    question: "What is one thing you are actively working to improve about yourself right now?",
    category: "Behavioral",
    group: "self-awareness",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "working to improve",
      "area of improvement",
      "what are you improving",
      "weakness you are addressing",
      "development area",
      "what is your weakness"
    ],
    bullets: [
      "Name the area specifically: avoid disguised strengths like 'I work too hard'",
      "Why you chose this area: what prompted you to focus on it",
      "What you are doing about it: specific actions, not just awareness",
      "Progress so far: early signs that your efforts are working"
    ],
    narrative: "Right now I am actively working on [SPECIFIC AREA]. I realized it was holding me back when [TRIGGER MOMENT]. To address it, I have been [SPECIFIC ACTIONS: reading, practicing, getting coaching, seeking feedback]. I am starting to see progress in [EARLY SIGNS], though I know it is an ongoing process. I have found that being deliberate about this kind of growth makes me more effective overall.",
    followUps: [
      "What prompted you to start working on that?",
      "How do you measure your progress?"
    ],
    whyTheyAsk: "This is the modern version of 'what is your greatest weakness' and tests the same three qualities: self-awareness, honesty, and growth mindset. Hiring managers report that cliched responses like 'I am a perfectionist' immediately lower a candidate's score. They want a genuine area with genuine effort, demonstrating that you are the kind of person who actively manages their own development.",
    coachingTip: "Choose a real developmental area that is not a core requirement of the role. Pair it with concrete actions you are taking right now, not just awareness. The magic formula: genuine weakness + specific trigger that made you notice it + concrete steps you are taking + evidence of early progress. This shows vulnerability without self-sabotage.",
    recommendedStructure: "prep"
  },

  {
    id: 'sa_04',
    question: "Describe a time you realized you were wrong about something important. What did you do?",
    category: "Behavioral",
    group: "self-awareness",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "you were wrong",
      "changed your mind",
      "wrong about something",
      "realized you were mistaken",
      "had to change course"
    ],
    bullets: [
      "What you believed and why it seemed right at the time",
      "The moment of realization: what evidence or perspective changed your mind",
      "What you did: how you acknowledged the mistake and adjusted course",
      "The takeaway: what this taught you about your own decision-making"
    ],
    narrative: "At [COMPANY], I was convinced that [WHAT YOU BELIEVED] because [REASONING]. When [NEW EVIDENCE OR PERSPECTIVE], I realized my initial assessment was wrong. I acknowledged this to [WHO: my team, my manager, the stakeholder] and we pivoted to [NEW APPROACH]. The result was [OUTCOME]. It reinforced that strong opinions held loosely serve better than rigid certainty.",
    followUps: [
      "How do you create space for being wrong in your decision-making process?",
      "What was the hardest part about admitting you were wrong?"
    ],
    whyTheyAsk: "This tests intellectual humility and the ability to update your thinking when presented with new evidence. Interviewers value candidates who can hold strong opinions while remaining open to being wrong. The willingness to publicly acknowledge a mistake to your team or manager, rather than quietly changing course, is a strong signal of integrity and maturity.",
    coachingTip: "Show that you acknowledged the mistake publicly, not just privately. Saying 'I told my team I was wrong and here is why' is much more powerful than quietly changing direction. Focus on what specifically changed your mind (new data, a different perspective, user feedback) and how you process disconfirming evidence in general.",
    recommendedStructure: "star"
  },

  {
    id: 'sa_05',
    question: "What would your biggest critic say about working with you?",
    category: "Behavioral",
    group: "self-awareness",
    priority: "Medium",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "biggest critic",
      "what would others say",
      "criticism about working with you",
      "what would your detractors say",
      "someone who did not enjoy working with you"
    ],
    bullets: [
      "Name a real criticism, not a compliment in disguise",
      "Explain where it comes from: the behavior or pattern someone would point to",
      "Show awareness: demonstrate you understand why it affects others",
      "Share what you are doing about it: concrete steps, not just acknowledgment"
    ],
    narrative: "My biggest critic would probably say that I [REAL CRITICISM: can be too direct, move too fast for consensus, get impatient with slow processes]. I understand where that comes from because I [SELF-AWARE EXPLANATION]. I have been working on this by [SPECIFIC ADJUSTMENT], and I have gotten feedback that [EVIDENCE OF PROGRESS]. It is something I actively manage rather than pretend does not exist.",
    followUps: [
      "How would your biggest advocate describe you?",
      "Has that criticism ever cost you something professionally?"
    ],
    whyTheyAsk: "This is one of the highest-difficulty self-awareness questions because it requires you to adopt someone else's negative perspective on you. Interviewers use it to assess emotional intelligence, self-knowledge, and honesty. Answers that are actually compliments in disguise (my critic would say I care too much) are immediately transparent and score poorly.",
    coachingTip: "Choose something someone has actually told you, not something you invented for the interview. The more specific and uncomfortable the criticism, the more credible your self-awareness. Show that you understand why this behavior bothers others (impact awareness), not just that it exists. Then show concrete steps you are taking to manage it.",
    recommendedStructure: "prep"
  },

  {
    id: 'sa_06',
    question: "Tell me about a time your ego got in the way. What happened?",
    category: "Behavioral",
    group: "self-awareness",
    priority: "Medium",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "ego got in the way",
      "pride caused a problem",
      "ego hurt your work",
      "stubbornness",
      "refused to back down",
      "let your ego"
    ],
    bullets: [
      "The situation: what were you trying to protect (status, credit, being right)",
      "What happened as a result: the cost of your ego to the project, team, or relationship",
      "The wake-up moment: what made you realize ego was driving your behavior",
      "What changed: how you manage ego now in professional settings"
    ],
    narrative: "At [COMPANY], I [SITUATION WHERE EGO DROVE BEHAVIOR: insisted I was right, did not ask for help when I needed it, took credit that should have been shared]. The result was [NEGATIVE CONSEQUENCE]. The wake-up moment came when [WHAT OPENED YOUR EYES]. Since then, I have been much more intentional about [SPECIFIC CHANGE: asking for help sooner, sharing credit, listening before defending].",
    followUps: [
      "How do you check your ego now in professional settings?",
      "What is the difference between confidence and ego?"
    ],
    whyTheyAsk: "This is arguably the most vulnerable question in the self-awareness category. Interviewers use it to identify candidates with genuine humility versus those who perform humility. Being able to name a specific moment where your ego caused damage shows deep self-knowledge and the kind of maturity that predicts strong teamwork and leadership.",
    coachingTip: "This question requires genuine vulnerability. Choose a real moment where pride, status-seeking, or the need to be right cost you something tangible. The wake-up moment is the most important part: what specifically made you see that ego was driving your behavior? Show that you now have active practices to manage ego, not just awareness that it exists.",
    recommendedStructure: "star"
  },

  {
    id: 'sa_07',
    question: "What professional experience are you least proud of? What did you take from it?",
    category: "Behavioral",
    group: "self-awareness",
    priority: "Medium",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "least proud of",
      "professional regret",
      "not proud of",
      "wish you had done differently",
      "looking back"
    ],
    bullets: [
      "The experience: describe it honestly without over-justifying",
      "Why you are not proud of it: what specifically falls short of your own standards",
      "What you took from it: the lesson that changed your approach",
      "Evidence of growth: how you have demonstrated that lesson since"
    ],
    narrative: "I am least proud of [EXPERIENCE] at [COMPANY]. Looking back, I [WHAT YOU WISH YOU HAD DONE DIFFERENTLY]. The reason I hold myself to a higher standard on this is [YOUR VALUES]. What I took from it was [LESSON], and since then I have [EVIDENCE THAT YOU GREW FROM IT]. I think being honest about these experiences is what drives real professional growth.",
    followUps: [
      "How do you prevent similar situations now?",
      "What standards do you hold yourself to that others might not?"
    ],
    whyTheyAsk: "This evaluates whether you have internal standards that go beyond what your employer requires. Interviewers are looking for evidence that you hold yourself accountable to a personal code of professional conduct, not just organizational rules. Candidates who can name specific experiences they regret and show how they grew from them demonstrate a level of self-awareness that predicts long-term excellence.",
    coachingTip: "Choose something that falls short of your own standards, not just a task failure. The distinction matters: 'I am least proud of how I handled a team member's departure' shows personal values at play, while 'a project was late' is just a work setback. Show that your discomfort comes from violating your own principles, not just from a bad outcome.",
    recommendedStructure: "star"
  },

  {
    id: 'sa_08',
    question: "If I called your last manager right now, what would they say is your biggest area for growth?",
    category: "Behavioral",
    group: "self-awareness",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "last manager",
      "area for growth",
      "what would your manager say",
      "reference check",
      "manager's feedback",
      "development area"
    ],
    bullets: [
      "Name a real area: something that actually came up in reviews or feedback",
      "Show alignment: demonstrate you agree with or at least understand the assessment",
      "Describe your progress: what you have done to address it since that feedback",
      "Be specific: avoid generic answers like 'delegation' without context"
    ],
    narrative: "My last manager would likely say [SPECIFIC GROWTH AREA]. They mentioned it during [CONTEXT: a performance review, a project debrief, an ongoing conversation]. They were right because [WHY IT WAS VALID]. Since then, I have been working on it by [SPECIFIC ACTIONS], and I have seen improvement in [EVIDENCE]. I appreciated their honesty because it gave me a clear target for growth.",
    followUps: [
      "What would they say is your greatest strength?",
      "How do you maintain that growth trajectory without regular feedback?"
    ],
    whyTheyAsk: "The reference to actually calling your manager makes this question feel high-stakes because your answer could be verified. Interviewers use it to test whether your self-assessment matches how others perceive you. A large gap between your claimed growth areas and what a reference would say signals low self-awareness or dishonesty.",
    coachingTip: "Pick something your manager actually said in a real review or conversation, because this could be verified during reference checks. Show alignment by agreeing with their assessment rather than defending against it. The strongest answers demonstrate that you took their feedback seriously enough to create a specific action plan, not just acknowledge it politely.",
    recommendedStructure: "prep"
  },

  // =====================================================================
  // GROUP 5: COMMUNICATION AND RELATIONSHIP BUILDING (7 questions)
  // =====================================================================

  {
    id: 'co_01',
    question: "Tell me about a time you had to explain something complex to someone with no background in the topic.",
    category: "Behavioral",
    group: "communication",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "explain something complex",
      "simplify for someone",
      "non-technical audience",
      "explain to a layperson",
      "make it understandable",
      "break down something complicated"
    ],
    bullets: [
      "The complex topic and who you were explaining it to",
      "How you assessed their baseline understanding before diving in",
      "The technique you used: analogy, visual, stepwise buildup, or simplification",
      "How you knew it landed: their response, questions, or actions afterward"
    ],
    narrative: "At [COMPANY], I needed to explain [COMPLEX TOPIC] to [AUDIENCE: a client, an executive, a cross-functional partner] who had no background in it. I started by asking what they already knew, then used [TECHNIQUE: an analogy comparing it to something familiar, a visual diagram, a three-step summary]. I checked for understanding by [HOW YOU CONFIRMED]. They were able to [ACTION THEY TOOK], which told me the explanation worked.",
    followUps: [
      "How do you adjust when you can tell someone is not following?",
      "What is the most challenging topic you have had to simplify?"
    ],
    whyTheyAsk: "This evaluates whether you can translate expertise into accessibility, which is critical for cross-functional work. Interviewers listen for whether you assessed the audience's baseline first (audience awareness) and whether you verified understanding afterward (communication loop). Simply dumbing things down without checking comprehension scores lower than adapting and confirming.",
    coachingTip: "Show your process, not just the explanation. Start by describing how you assessed what they already knew. Then name the specific technique you used (analogy, visual, three-step buildup). Finally, show how you confirmed it worked: did they ask good follow-up questions, take the right action, or explain it back to you? The verification step is what separates adequate communicators from excellent ones.",
    recommendedStructure: "star"
  },

  {
    id: 'co_02',
    question: "Describe a situation where miscommunication caused a problem. How did you fix it?",
    category: "Behavioral",
    group: "communication",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "miscommunication",
      "communication breakdown",
      "misunderstanding at work",
      "message got lost",
      "communication problem",
      "mixed signals"
    ],
    bullets: [
      "What was miscommunicated and between whom",
      "The consequences: what went wrong as a result",
      "How you identified the root cause of the miscommunication",
      "What you changed to prevent it from happening again"
    ],
    narrative: "At [COMPANY], a miscommunication between [PARTIES] about [TOPIC] resulted in [NEGATIVE CONSEQUENCE]. When I investigated, I found the root cause was [COMMUNICATION GAP: unclear ownership, assumptions about shared understanding, reliance on one channel]. I fixed the immediate issue by [CORRECTIVE ACTION] and then implemented [PROCESS CHANGE: written summaries after meetings, a shared tracker, explicit confirmation protocols] to prevent recurrence.",
    followUps: [
      "What is your approach to ensuring clear communication on your team?",
      "How do you handle it when someone says 'I thought you said...'?"
    ],
    whyTheyAsk: "Interviewers use this to assess whether you treat communication failures as system problems or blame problems. Candidates who identify structural root causes (unclear processes, implicit assumptions, single-channel reliance) demonstrate more sophistication than those who attribute miscommunication to one person's mistake. The prevention step shows whether you think in terms of systems improvement.",
    coachingTip: "Identify the structural root cause, not just the surface miscommunication. 'We assumed everyone read the email' reveals a process gap you can fix. 'John did not listen' is blame. Show both an immediate fix and a longer-term process change. The process change should be concrete and reusable, like written meeting summaries or explicit confirmation protocols.",
    recommendedStructure: "star"
  },

  {
    id: 'co_03',
    question: "Give an example of a time you had to deliver bad news to a stakeholder.",
    category: "Behavioral",
    group: "communication",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "deliver bad news",
      "difficult message",
      "bad news to a stakeholder",
      "tough conversation",
      "had to tell someone something they didn't want to hear"
    ],
    bullets: [
      "The bad news: what it was and who needed to hear it",
      "Your preparation: how you planned the conversation and chose the setting",
      "Your delivery: direct and empathetic, leading with the key point rather than burying it",
      "The aftermath: how the person responded and what happened next"
    ],
    narrative: "At [COMPANY], I had to tell [STAKEHOLDER] that [BAD NEWS]. I prepared by [GATHERING FACTS, PREPARING ALTERNATIVES]. I delivered the news directly, starting with the key point rather than softening with a long preamble. I said something like [DIRECT BUT EMPATHETIC PHRASING]. Their initial reaction was [REACTION], and we worked through it by [NEXT STEPS]. I have found that people respect directness paired with genuine empathy more than sugarcoating.",
    followUps: [
      "How do you prepare for those conversations?",
      "What do you do when the person reacts emotionally?"
    ],
    whyTheyAsk: "This tests courage and emotional intelligence simultaneously. Interviewers evaluate whether you lead with the bad news directly or bury it in qualifications. They also watch for empathy: did you prepare for the person's emotional reaction and have next steps ready? Candidates who avoid the conversation or delegate it upward score poorly on leadership potential.",
    coachingTip: "Lead with the key point in the first sentence. Do not build up with context and qualifiers. Say 'The project will be three weeks late' before explaining why. This shows respect for the stakeholder's time and intelligence. Then immediately follow with your plan to address it. Empathy means acknowledging their frustration, not softening the message until it disappears.",
    recommendedStructure: "star"
  },

  {
    id: 'co_04',
    question: "Tell me about a time you had to build a relationship with someone who was initially resistant.",
    category: "Behavioral",
    group: "communication",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "build a relationship",
      "resistant colleague",
      "someone who did not trust you",
      "earn someone's trust",
      "someone who was difficult to connect with"
    ],
    bullets: [
      "Who the person was and why they were resistant",
      "Your approach: how you invested in understanding their perspective",
      "The turning point: what shifted the dynamic",
      "Where the relationship ended up and what it enabled"
    ],
    narrative: "At [COMPANY], I needed to work closely with [PERSON] who was resistant because [REASON: past negative experience, territorial about their area, skeptical of my role]. Instead of forcing the relationship, I [APPROACH: asked for their expertise, supported their priorities, showed up consistently]. The turning point was when [SPECIFIC MOMENT]. Over time we developed [QUALITY OF RELATIONSHIP], and that trust enabled us to [COLLABORATIVE ACHIEVEMENT].",
    followUps: [
      "What do you do when a relationship just is not working despite your efforts?",
      "How long are you willing to invest before deciding a relationship will not improve?"
    ],
    whyTheyAsk: "This evaluates relationship-building skill and patience. Interviewers look for whether you invested in understanding the root cause of resistance before trying to overcome it. Candidates who force relationships through charm score lower than those who earn trust through consistent, patient action. The turning point in the story reveals your relational intelligence.",
    coachingTip: "Show that you diagnosed why the person was resistant before trying to fix the relationship. Then describe patient, consistent actions over time, not a single grand gesture. The turning point should be a specific moment where trust shifted, not a vague 'over time things got better.' End with what the strong relationship enabled you to accomplish together.",
    recommendedStructure: "star"
  },

  {
    id: 'co_05',
    question: "Describe how you handle giving feedback to someone who is more senior than you.",
    category: "Behavioral",
    group: "communication",
    priority: "Medium",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "feedback to a senior person",
      "managing up",
      "telling your boss",
      "feedback to leadership",
      "speaking up to a senior colleague"
    ],
    bullets: [
      "The situation that required upward feedback",
      "How you framed it: the language, timing, and setting you chose",
      "How you made it about the work, not the person",
      "The response you received and the outcome"
    ],
    narrative: "At [COMPANY], I needed to give feedback to [SENIOR PERSON] about [ISSUE]. I chose to do it [SETTING: privately after a meeting, during a 1-on-1, in writing first]. I framed it as [APPROACH: an observation rather than a judgment, a question rather than an accusation, tied to shared goals]. I said something like [SPECIFIC PHRASING]. They responded with [REACTION], and the result was [OUTCOME]. I think respectful candor strengthens working relationships at any level.",
    followUps: [
      "What if the senior person dismissed your feedback entirely?",
      "How do you decide when it is worth speaking up versus letting it go?"
    ],
    whyTheyAsk: "This tests courage and political intelligence simultaneously. Interviewers want to see that you can speak truth to power without being disrespectful or career-suicidal. They evaluate your framing skills: did you make it about the work rather than the person? Did you choose an appropriate time and setting? Did you offer the feedback as a perspective rather than an accusation?",
    coachingTip: "Three elements make upward feedback land well: timing (private, not in front of others), framing (observation, not judgment), and connecting it to shared goals (not personal preferences). If you can share the specific language you used, do so. Something like 'I noticed X and I am wondering if Y might help us achieve Z' shows the kind of diplomatic precision interviewers value.",
    recommendedStructure: "star"
  },

  {
    id: 'co_06',
    question: "Tell me about a time active listening changed the outcome of a situation.",
    category: "Behavioral",
    group: "communication",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "active listening",
      "really listened",
      "listening skills",
      "hearing someone out",
      "changed the outcome by listening"
    ],
    bullets: [
      "The situation where you needed to listen more than talk",
      "What you heard beneath the surface of what was being said",
      "How that understanding changed your response or approach",
      "The outcome that would have been different if you had not listened"
    ],
    narrative: "During [SITUATION] at [COMPANY], I made a conscious choice to listen rather than jump to solutions. What I heard was [DEEPER INSIGHT: a concern they had not articulated directly, a constraint no one had surfaced, an emotional undercurrent]. Because I caught that, I adjusted my approach to [WHAT YOU DID DIFFERENTLY]. The outcome was [RESULT], which would have gone very differently if I had just pushed my original plan.",
    followUps: [
      "How do you practice active listening?",
      "What signals tell you someone is not being heard?"
    ],
    whyTheyAsk: "Active listening is one of the hardest communication skills to demonstrate in an interview because candidates are naturally focused on talking. This question tests whether you can identify the subtext beneath what people say and use that deeper understanding to change your approach. Interviewers look for the contrast between what would have happened without listening and what actually happened because of it.",
    coachingTip: "The key differentiator is showing what you heard beneath the surface, not just that you listened. Describe the insight you caught that others might have missed: an unspoken concern, a constraint no one had named, or an emotional undercurrent beneath a rational discussion. Then show how that insight changed your approach and the outcome. Without that contrast, the story is just about being polite.",
    recommendedStructure: "star"
  },

  {
    id: 'co_07',
    question: "How do you adjust your communication style for different audiences?",
    category: "Behavioral",
    group: "communication",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "adjust communication style",
      "different audiences",
      "communication approach",
      "tailor your message",
      "adapt how you communicate"
    ],
    bullets: [
      "Your natural communication style and when it works best",
      "How you read an audience: what signals tell you to adjust",
      "Specific adaptations: examples with executives, peers, and cross-functional partners",
      "A time when adjusting your style made a measurable difference"
    ],
    narrative: "My natural style is [YOUR DEFAULT: direct, collaborative, analytical], which works well with [AUDIENCE TYPE]. But I have learned to adapt. With executives, I [ADJUSTMENT: lead with the bottom line, keep it to three minutes]. With technical teams, I [ADJUSTMENT: get into the details, use data]. With clients, I [ADJUSTMENT: start with their goals, use their language]. For example, at [COMPANY] I [SPECIFIC EXAMPLE WHERE ADAPTATION MATTERED].",
    followUps: [
      "What is the most challenging audience you have had to communicate with?",
      "How do you know when your communication style is not landing?"
    ],
    whyTheyAsk: "This evaluates communication range and audience awareness, which are core competencies for cross-functional roles. Interviewers want to see that you can diagnose an audience's needs and adjust in real time, not just operate in one communication mode. The ability to flex between executive-level summaries and technical deep-dives signals professional maturity.",
    coachingTip: "Give three concrete examples of adaptation: one for executives (bottom-line first, three minutes or less), one for technical audiences (detail-oriented, data-driven), and one for non-technical stakeholders (analogies, goal-oriented framing). Include the signals that tell you to adjust: glazed eyes mean simplify, detailed follow-ups mean go deeper, time pressure means prioritize.",
    recommendedStructure: "prep"
  },

  // =====================================================================
  // GROUP 6: LEADERSHIP AND INFLUENCE (7 questions)
  // =====================================================================

  {
    id: 'ld_01',
    question: "Tell me about a time you led a project without formal authority.",
    category: "Leadership",
    group: "leadership",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "led without authority",
      "influence without title",
      "informal leadership",
      "took charge",
      "led as a peer",
      "stepped up to lead"
    ],
    bullets: [
      "The project and why someone needed to step up",
      "How you earned the team's willingness to follow your lead",
      "How you made decisions and aligned people without positional power",
      "The outcome and what you learned about influence"
    ],
    narrative: "At [COMPANY], a [PROJECT] needed someone to drive it forward but no one had been formally assigned. I stepped up by [HOW YOU INITIATED]. To get buy-in without authority, I [INFLUENCE APPROACH: built individual relationships, found shared goals, demonstrated competence early]. I made decisions by [PROCESS: consensus, data-driven proposals, small experiments]. The team delivered [OUTCOME], and the experience taught me that leadership is about earning trust, not having a title.",
    followUps: [
      "How do you handle it when a peer resists your informal leadership?",
      "What is the difference between leading and managing?"
    ],
    whyTheyAsk: "Influence without authority is one of the most valued leadership competencies, especially in organizations with flat hierarchies and cross-functional teams. Interviewers evaluate whether you can motivate and align people who have no obligation to follow you. The methods you use to earn buy-in (competence, relationship, shared vision) reveal your natural leadership style.",
    coachingTip: "Focus on how you earned the team's willingness to follow your lead, not on the project mechanics. Did you build individual relationships first? Did you demonstrate competence early to establish credibility? Did you find shared goals that made your leadership feel like a service to the team? The methods matter more than the outcome here.",
    recommendedStructure: "star"
  },

  {
    id: 'ld_02',
    question: "Describe a decision you made that was unpopular. How did you handle it?",
    category: "Leadership",
    group: "leadership",
    priority: "High",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "unpopular decision",
      "decision people disagreed with",
      "made a tough call",
      "stood by your decision",
      "unpopular choice"
    ],
    bullets: [
      "The decision and what made it the right call despite being unpopular",
      "How you communicated the reasoning to those who disagreed",
      "How you handled pushback and maintained relationships",
      "The long-term outcome and whether the decision was validated"
    ],
    narrative: "At [COMPANY], I decided to [UNPOPULAR DECISION] because [REASONING BASED ON DATA OR PRINCIPLES]. I knew it would be controversial, so I [COMMUNICATION APPROACH: met individually with key stakeholders, shared the data transparently, acknowledged the downsides]. The pushback was [DESCRIPTION], but I maintained the course because [WHY]. Over time, [OUTCOME THAT VALIDATED OR TAUGHT YOU SOMETHING].",
    followUps: [
      "How do you know when to stand firm versus change course based on feedback?",
      "What would you do if the decision turned out to be wrong?"
    ],
    whyTheyAsk: "This tests conviction and communication under opposition. Interviewers want to see that you can make difficult decisions based on principles or data rather than popularity, while still treating dissenting voices with respect. Leaders who avoid unpopular decisions to maintain approval score poorly, as do those who bulldoze through opposition without communication.",
    coachingTip: "Show the reasoning behind your decision clearly so the interviewer can see it was principled, not stubborn. Then describe how you communicated the decision to those who disagreed: did you meet individually, share your reasoning transparently, acknowledge the downsides? The strongest answers show that you maintained the relationships even while maintaining the decision.",
    recommendedStructure: "star"
  },

  {
    id: 'ld_03',
    question: "Give an example of when you mentored or developed someone on your team.",
    category: "Leadership",
    group: "leadership",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "mentored someone",
      "developed a team member",
      "coached someone",
      "helped someone grow",
      "invested in someone's development"
    ],
    bullets: [
      "Who you mentored and what development area you focused on",
      "Your approach: how you balanced support with allowing them to stretch",
      "A specific moment where your mentoring made a visible difference",
      "Where that person is now or what they achieved"
    ],
    narrative: "At [COMPANY], I mentored [PERSON] who was strong in [AREA] but needed development in [GROWTH AREA]. My approach was to [MENTORING STRATEGY: assign stretch projects, provide real-time feedback, share my own mistakes]. A turning point was when [SPECIFIC MOMENT]. Over [TIMEFRAME], they grew from [STARTING POINT] to [ACHIEVEMENT]. Watching their development was one of the most rewarding parts of my role.",
    followUps: [
      "How do you tailor your coaching to different learning styles?",
      "What is the hardest part about developing others?"
    ],
    whyTheyAsk: "This evaluates whether you invest in others' growth or focus solely on your own performance. Hiring managers view people development as a multiplier skill: candidates who develop others create exponential value. They look for specific mentoring techniques and evidence that your investment produced measurable growth in the other person.",
    coachingTip: "Focus on one specific person and their arc of growth, not on general mentoring philosophy. Show your technique: did you assign stretch projects, provide real-time feedback, share your own failures as learning tools? Name a specific turning point where your mentoring visibly changed their performance. End with where that person is now to show lasting impact.",
    recommendedStructure: "star"
  },

  {
    id: 'ld_04',
    question: "Tell me about a time you had to make a decision with incomplete information.",
    category: "Leadership",
    group: "leadership",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "incomplete information",
      "decision under uncertainty",
      "ambiguous situation",
      "not all the facts",
      "had to decide without full picture",
      "decision with missing data"
    ],
    bullets: [
      "The decision and what information was missing",
      "How you gathered what was available and assessed the risk",
      "The framework or principle you used to make the call",
      "The outcome and what you learned about decision-making under uncertainty"
    ],
    narrative: "At [COMPANY], I needed to decide [DECISION] but lacked [MISSING INFORMATION]. I gathered what I could by [RESEARCH APPROACH], then assessed the risk of acting now versus waiting for more data. I used [FRAMEWORK: reversibility, expected value, worst-case scenario] to make the call. The outcome was [RESULT]. What I learned is that waiting for perfect information often costs more than making a good-enough decision and adjusting.",
    followUps: [
      "How do you know when you have enough information to act?",
      "Would you make the same decision again?"
    ],
    whyTheyAsk: "This tests decision-making maturity. Interviewers want to see a framework for operating under uncertainty, not just confidence or risk tolerance. They evaluate whether you distinguished between reversible and irreversible decisions, whether you gathered available information efficiently, and whether you had a principled approach to the unknown rather than just guessing.",
    coachingTip: "Name the specific framework you used to decide: Was the decision reversible? What was the cost of delay versus the cost of being wrong? What was the worst-case scenario and could you recover from it? Showing a structured approach to uncertainty is far more impressive than saying 'I trusted my gut.' End with what you would do the same or differently.",
    recommendedStructure: "star"
  },

  {
    id: 'ld_05',
    question: "Describe a situation where you had to get buy-in from multiple stakeholders with competing interests.",
    category: "Leadership",
    group: "leadership",
    priority: "High",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "get buy-in",
      "multiple stakeholders",
      "competing interests",
      "alignment across teams",
      "stakeholder management",
      "different agendas"
    ],
    bullets: [
      "The initiative and the stakeholders involved",
      "The competing interests: what each party wanted and why they conflicted",
      "Your alignment strategy: how you found common ground or created it",
      "The outcome and how it was received"
    ],
    narrative: "At [COMPANY], I was driving [INITIATIVE] that required buy-in from [STAKEHOLDER A] who wanted [PRIORITY A] and [STAKEHOLDER B] who wanted [PRIORITY B]. I met with each individually to understand their non-negotiables, then found [COMMON GROUND OR CREATIVE COMPROMISE]. I presented a proposal that [HOW IT ADDRESSED BOTH INTERESTS]. It was not a perfect solution for anyone, but it moved us forward, and both parties supported the execution.",
    followUps: [
      "What do you do when stakeholders are truly irreconcilable?",
      "How do you maintain relationships when you cannot give everyone what they want?"
    ],
    whyTheyAsk: "Stakeholder alignment is one of the most valued leadership skills because it predicts whether a candidate can execute complex, cross-functional initiatives. Interviewers evaluate your diagnostic skill (understanding each party's real interests), your creativity (finding common ground where none seemed to exist), and your diplomacy (maintaining relationships even when delivering imperfect compromises).",
    coachingTip: "Show that you met with stakeholders individually to understand their non-negotiables before proposing a solution. The individual meetings are the key insight: you cannot find common ground from a conference room where everyone is posturing. Then show the creative element of your solution: how did you address competing interests in a way that moved everyone forward, even imperfectly?",
    recommendedStructure: "star"
  },

  {
    id: 'ld_06',
    question: "Tell me about a time you identified a problem no one else saw and took initiative to fix it.",
    category: "Leadership",
    group: "leadership",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "identified a problem",
      "took initiative",
      "proactive",
      "saw something others missed",
      "fixed it before it became a crisis",
      "initiative to solve a problem"
    ],
    bullets: [
      "The problem you spotted: what it was and why others had not noticed it",
      "How you validated it was real and not just a hunch",
      "The initiative you took without being asked",
      "The impact: what would have happened if no one had caught it"
    ],
    narrative: "At [COMPANY], I noticed that [PROBLEM] while doing [HOW YOU DISCOVERED IT]. No one else had flagged it because [REASON: it was gradual, it was in a blind spot, it was outside normal reporting]. I validated my concern by [INVESTIGATION], then took the initiative to [ACTIONS] without waiting for assignment. The impact was [RESULT], and if it had gone unaddressed, it likely would have [WHAT WAS PREVENTED].",
    followUps: [
      "How do you prioritize which problems to fix when you see many?",
      "What do you do when you see a problem but it is not in your domain?"
    ],
    whyTheyAsk: "This evaluates proactive problem-solving and organizational awareness. Interviewers want evidence that you scan your environment for issues rather than waiting for them to be assigned. They also evaluate your judgment: did you validate the problem before acting? Did you take appropriate initiative without overstepping? The counterfactual (what would have happened) shows the value of your proactivity.",
    coachingTip: "Show the full arc: discovery, validation, action, impact. The validation step is critical because it shows judgment, not just reactivity. Then describe the counterfactual: what would have happened if no one had caught the problem? This creates a clear contrast that demonstrates the value of your initiative. End with how you balanced taking initiative with respecting existing structures.",
    recommendedStructure: "star"
  },

  {
    id: 'ld_07',
    question: "How do you handle a situation where you disagree with your team's consensus?",
    category: "Leadership",
    group: "leadership",
    priority: "Medium",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "disagree with the team",
      "team consensus",
      "lone dissenter",
      "disagree and commit",
      "go against the group",
      "everyone disagreed with you"
    ],
    bullets: [
      "The situation where you were the lone voice of dissent",
      "How you expressed your disagreement constructively",
      "The outcome: whether the team incorporated your view or you committed to theirs",
      "What you learned about dissent, consensus, and commitment"
    ],
    narrative: "At [COMPANY], my team reached a consensus on [DECISION] that I believed was wrong because [YOUR REASONING]. I voiced my concern by [HOW: presenting data, asking probing questions, proposing an alternative]. The team [RESPONSE: incorporated my feedback and adjusted, or heard me out but stuck with the original plan]. I [COMMITTED FULLY / SAW MY CONCERN VALIDATED], and the experience taught me [LESSON ABOUT PRODUCTIVE DISAGREEMENT].",
    followUps: [
      "How do you commit to a decision you disagree with?",
      "When is dissent valuable versus disruptive?"
    ],
    whyTheyAsk: "This tests whether you can be a constructive dissenter while remaining a committed team member. Interviewers evaluate both sides: Do you have the courage to voice unpopular opinions? And can you commit fully when the team decides differently? Candidates who always go along to get along lack backbone; those who cannot commit after dissenting lack teamwork.",
    coachingTip: "Show both sides of the coin. First, how you voiced your dissent constructively: with data, with questions, or with an alternative proposal. Then, how you handled the outcome: if the team went your way, show humility; if they did not, show genuine commitment to their decision. The phrase 'disagree and commit' comes from Amazon's leadership principles and is exactly what interviewers look for here.",
    recommendedStructure: "star"
  },

  // =====================================================================
  // GROUP 7: ADAPTABILITY AND RESILIENCE (6 questions)
  // =====================================================================

  {
    id: 'ad_01',
    question: "Tell me about a time you had to adapt to a major change at work. How did you handle it?",
    category: "Behavioral",
    group: "adaptability",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "adapt to change",
      "major change at work",
      "organizational change",
      "things changed suddenly",
      "had to adapt",
      "restructuring"
    ],
    bullets: [
      "The change: what happened and how it affected your role or team",
      "Your initial reaction: be honest about how it felt",
      "How you adapted: specific actions you took to move forward productively",
      "The outcome: what the change ultimately made possible"
    ],
    narrative: "At [COMPANY], a major change happened when [DESCRIPTION OF CHANGE]. Initially I felt [HONEST REACTION], but I quickly focused on [CONSTRUCTIVE RESPONSE: understanding the rationale, identifying what I could control, supporting my team]. I adapted by [SPECIFIC ACTIONS], and within [TIMEFRAME] I had [POSITIVE OUTCOME]. Looking back, the change actually enabled [UNEXPECTED BENEFIT].",
    followUps: [
      "How do you help others adapt when they are struggling with change?",
      "What kind of change is hardest for you?"
    ],
    whyTheyAsk: "Interviewers evaluate how you manage both the practical and emotional dimensions of change. They listen for your initial honest reaction (which shows self-awareness) and your adaptation strategy (which shows agency). Candidates who claim change never bothers them seem emotionally unaware; candidates who describe constructive adaptation after honest initial discomfort seem resilient and genuine.",
    coachingTip: "Be honest about your initial reaction. Saying 'it was unsettling at first' is more credible than 'I immediately embraced it.' Then show the pivot: what specific actions did you take to move from reaction to adaptation? Focus on what you could control rather than what you could not. If possible, end with an unexpected benefit that came from the change.",
    recommendedStructure: "star"
  },

  {
    id: 'ad_02',
    question: "Describe a situation where you had to learn something completely new very quickly.",
    category: "Behavioral",
    group: "adaptability",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "learn something new quickly",
      "steep learning curve",
      "had to learn fast",
      "ramped up quickly",
      "new skill quickly",
      "rapid learning"
    ],
    bullets: [
      "What you needed to learn and the urgency driving it",
      "Your learning strategy: how you structured your ramp-up",
      "Who helped you: mentors, resources, or trial and error",
      "How quickly you became effective and the evidence of your competence"
    ],
    narrative: "At [COMPANY], I was thrown into [NEW AREA] with [SHORT TIMELINE] to become effective. I structured my learning by [STRATEGY: breaking it into components, finding the 20 percent that covers 80 percent of use cases, pairing with an expert]. Within [TIMEFRAME], I was able to [EVIDENCE OF COMPETENCE]. The key was being comfortable saying 'I do not know this yet, but here is my plan to get there.'",
    followUps: [
      "How do you stay motivated when the learning curve is steep?",
      "What is the most recent thing you learned from scratch?"
    ],
    whyTheyAsk: "Learning agility is one of the strongest predictors of long-term career success. Interviewers want to see a structured approach to rapid learning, not just enthusiasm or raw intelligence. They evaluate whether you can identify the critical 20% of knowledge that enables 80% effectiveness, find the right resources quickly, and demonstrate competence under time pressure.",
    coachingTip: "Show a specific learning methodology rather than just hard work. Name the strategy: Did you identify the most critical knowledge first? Did you find an expert mentor? Did you set up practice-and-feedback loops? Quantify how quickly you became effective and what that looked like. The most impressive element is often the ability to be effective while still learning.",
    recommendedStructure: "star"
  },

  {
    id: 'ad_03',
    question: "Tell me about a time a project you were working on was suddenly deprioritized or cancelled.",
    category: "Behavioral",
    group: "adaptability",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "project cancelled",
      "deprioritized",
      "project killed",
      "pulled off a project",
      "work was thrown out",
      "priorities shifted"
    ],
    bullets: [
      "The project and how much you had invested in it",
      "Your reaction when you learned it was cancelled or deprioritized",
      "How you redirected your energy productively",
      "What you salvaged: skills learned, relationships built, components reused"
    ],
    narrative: "At [COMPANY], I had spent [TIMEFRAME] working on [PROJECT] when it was [CANCELLED OR DEPRIORITIZED] because [REASON]. It was frustrating because [WHAT YOU HAD INVESTED]. But I channeled that energy into [NEXT THING], and I salvaged [WHAT CARRIED FORWARD: skills, relationships, code, processes]. The experience taught me to invest fully in my work while holding loosely to outcomes I cannot control.",
    followUps: [
      "How do you handle the emotional side of having your work deprioritized?",
      "How do you evaluate whether to push back on a deprioritization decision?"
    ],
    whyTheyAsk: "This evaluates emotional resilience and the ability to separate your identity from your work output. Interviewers look for whether you handle deprioritization maturely (redirecting energy productively) or destructively (sulking, disengaging, or undermining the decision). The ability to salvage value from cancelled work is a bonus indicator of resourcefulness.",
    coachingTip: "Acknowledge the frustration honestly; pretending you did not care about the cancelled work is not credible. Then show the pivot: how quickly you redirected your energy, what you salvaged from the cancelled work (skills, relationships, reusable components), and how you supported the new priority. The takeaway should reflect maturity about what you can and cannot control.",
    recommendedStructure: "star"
  },

  {
    id: 'ad_04',
    question: "Give an example of how you handled a period of significant uncertainty at work.",
    category: "Behavioral",
    group: "adaptability",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "uncertainty at work",
      "ambiguity",
      "unclear direction",
      "not knowing what would happen",
      "period of change",
      "uncertain environment"
    ],
    bullets: [
      "The source of uncertainty and how long it lasted",
      "How you managed your own anxiety and focus during that time",
      "How you provided stability to others if relevant",
      "What you learned about functioning in ambiguity"
    ],
    narrative: "At [COMPANY], we went through a period of [UNCERTAINTY: leadership change, market disruption, organizational restructuring] that lasted [TIMEFRAME]. I managed it by [STRATEGY: focusing on what I could control, maintaining routines, communicating transparently with my team]. I also [PROACTIVE STEP: volunteered for a project, built new skills, supported teammates]. The experience showed me that I can be productive and even creative during uncertainty if I stay anchored to [PRINCIPLE].",
    followUps: [
      "What do you do when you cannot get clarity from leadership?",
      "How do you make decisions when the ground keeps shifting?"
    ],
    whyTheyAsk: "Ambiguity tolerance is increasingly important as organizations face rapid change. Interviewers evaluate whether you shut down in uncertainty or stay productive. They look for coping strategies (focusing on what you can control, maintaining routines) and whether you provide stability for others during uncertain times. Leaders who function well in ambiguity are rare and highly valued.",
    coachingTip: "Describe both your internal management (how you kept yourself focused and productive) and your external impact (how you helped others navigate the uncertainty). Name specific anchoring strategies: focusing on controllable actions, maintaining team routines, or communicating transparently about what you did and did not know. Interviewers value candidates who are honest about not having answers while still moving forward.",
    recommendedStructure: "star"
  },

  {
    id: 'ad_05',
    question: "Tell me about your biggest professional setback. How did you recover?",
    category: "Behavioral",
    group: "adaptability",
    priority: "High",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "biggest setback",
      "professional setback",
      "career setback",
      "bounced back",
      "recovered from",
      "biggest professional challenge"
    ],
    bullets: [
      "The setback: what happened and the impact on your career or confidence",
      "The low point: be honest about how it affected you",
      "The recovery: specific actions you took to rebuild",
      "Where you are now: how the setback ultimately made you stronger"
    ],
    narrative: "My biggest professional setback was [WHAT HAPPENED]. It hit hard because [WHY IT MATTERED TO YOU]. For [TIMEFRAME] I [HONEST LOW POINT]. But I recovered by [SPECIFIC ACTIONS: sought feedback, rebuilt skills, changed approach, found a mentor]. Now, [TIME] later, I can see that the setback led to [UNEXPECTED GROWTH OR OPPORTUNITY]. It taught me that resilience is not about avoiding failure but about how quickly and thoughtfully you respond to it.",
    followUps: [
      "What kept you going during the recovery?",
      "How has that setback shaped the kind of professional you are today?"
    ],
    whyTheyAsk: "This is the ultimate resilience question. Interviewers evaluate the depth of the setback (was it genuinely difficult?), the honesty of your low point (did you struggle or did you claim it never fazed you?), and the quality of your recovery (was it deliberate or accidental?). The best answers show a complete arc from genuine difficulty through intentional rebuilding to lasting growth.",
    coachingTip: "Choose a real setback with genuine consequences, not a minor inconvenience dressed up as adversity. Be honest about the low point; saying 'I questioned whether I was in the right career' is more powerful than 'I was disappointed but moved on quickly.' The recovery actions should be specific and intentional, not just waiting for things to get better. End with what specifically changed in you.",
    recommendedStructure: "star"
  },

  {
    id: 'ad_06',
    question: "Describe a time you thrived outside your comfort zone.",
    category: "Behavioral",
    group: "adaptability",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "outside your comfort zone",
      "uncomfortable situation",
      "stretch assignment",
      "pushed beyond your limits",
      "thrived in a new environment"
    ],
    bullets: [
      "What took you outside your comfort zone and why",
      "What made it uncomfortable: the specific skills or confidence gaps",
      "How you pushed through the discomfort",
      "What you discovered about yourself on the other side"
    ],
    narrative: "At [COMPANY], I [SITUATION OUTSIDE COMFORT ZONE] which was uncomfortable because [SPECIFIC REASON]. I pushed through by [STRATEGY: breaking it into smaller challenges, finding a mentor, committing publicly so I could not back out]. What surprised me was [UNEXPECTED DISCOVERY ABOUT YOURSELF]. I ended up [OUTCOME], and it expanded my definition of what I am capable of.",
    followUps: [
      "How do you decide which opportunities are worth the discomfort?",
      "What is an area you are still uncomfortable in professionally?"
    ],
    whyTheyAsk: "This assesses growth orientation and risk tolerance. Interviewers want to see that you deliberately seek experiences that stretch you rather than staying within safe, familiar territory. They evaluate whether the discomfort was genuine (not a humble brag) and whether the growth was real (not just surviving but actually thriving and discovering something new about yourself).",
    coachingTip: "Name the specific source of discomfort, not just the situation. 'I was uncomfortable because I had never presented to an audience that senior and I was terrified of looking incompetent' is much more powerful than 'I took on a stretch assignment.' Show the strategy you used to push through and the genuine surprise at what you discovered about yourself on the other side.",
    recommendedStructure: "star"
  },

  // =====================================================================
  // GROUP 8: CURVEBALL AND CREATIVE THINKING (8 questions)
  // =====================================================================

  {
    id: 'cb_01',
    question: "If you could have dinner with any three people, living or dead, who would you choose and why?",
    category: "Creative",
    group: "curveball",
    priority: "Low",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "dinner with anyone",
      "three people",
      "living or dead",
      "anyone in history",
      "who would you have dinner with"
    ],
    bullets: [
      "Choose people who reveal something about your values, curiosity, or passions",
      "Explain what you would want to discuss with each person",
      "Show personality and depth, not just name-dropping famous people",
      "Connect at least one choice to something relevant about your professional life"
    ],
    narrative: "I would choose [PERSON 1] because [REASON THAT REVEALS YOUR VALUES], [PERSON 2] because [REASON THAT SHOWS YOUR CURIOSITY], and [PERSON 3] because [REASON THAT SHOWS PERSONALITY]. What I would most want to ask them is [QUESTION THAT SHOWS DEPTH]. I think the conversation between those three would be fascinating because [INSIGHT].",
    followUps: [
      "What would you hope to learn from that dinner?",
      "Who is someone you have actually learned a lot from in real life?"
    ],
    whyTheyAsk: "Curveball questions reveal personality and values that rehearsed answers cannot. Interviewers report that they care less about who you choose and more about why, which reveals what you genuinely value, what makes you curious, and how you think when there is no right answer. Your reasoning process is the real answer.",
    coachingTip: "Avoid choosing three famous people without explaining why. Pick at least one person who reveals something unexpected about you: a lesser-known thinker, a family member, or someone from a completely different field. Explain what specific question you would ask each person. Connect at least one choice to a professional value or lesson that matters to you.",
    recommendedStructure: null
  },

  {
    id: 'cb_02',
    question: "What is the most interesting thing about you that is not on your resume?",
    category: "Creative",
    group: "curveball",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "not on your resume",
      "interesting thing about you",
      "something I would not know from your resume",
      "tell me something unique",
      "what makes you interesting"
    ],
    bullets: [
      "Choose something genuinely interesting, not just a hobby",
      "Explain why it matters to you or what it reveals about your character",
      "If possible, connect it to a professional strength or perspective",
      "Be authentic and let your personality show"
    ],
    narrative: "Something most people do not know about me is that I [INTERESTING FACT OR EXPERIENCE]. It started when [ORIGIN], and it has taught me [LESSON OR SKILL] that actually shows up in my work. For example, [HOW IT CONNECTS TO A PROFESSIONAL QUALITY]. I think it gives me a unique perspective on [RELEVANT AREA].",
    followUps: [
      "How does that shape how you approach your work?",
      "What else do you do outside of work that keeps you energized?"
    ],
    whyTheyAsk: "Interviewers use this to see the whole person beyond the professional facade. They are assessing personality fit, uniqueness, and whether you can connect diverse experiences to professional contexts. Research on hiring shows that memorable candidates who share something authentically personal are more likely to be recalled favorably during post-interview discussions.",
    coachingTip: "Choose something with a genuine story behind it, not just a fact. 'I speak three languages' is less interesting than explaining how growing up translating for your parents taught you to read rooms and adapt communication for different audiences. Connect the personal fact to a professional quality to make it memorable and relevant.",
    recommendedStructure: "add"
  },

  {
    id: 'cb_03',
    question: "Explain something you are passionate about as if I know nothing about it.",
    category: "Creative",
    group: "curveball",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "passionate about",
      "explain to me",
      "as if I know nothing",
      "teach me about",
      "what are you passionate about"
    ],
    bullets: [
      "Choose something you genuinely light up about",
      "Start with why it matters, not technical details",
      "Use simple language and a compelling entry point",
      "Let your enthusiasm show naturally"
    ],
    narrative: "I am passionate about [TOPIC]. The reason it captivates me is [WHY IT MATTERS IN SIMPLE TERMS]. The way I would explain it to a newcomer is [SIMPLE, ENGAGING EXPLANATION]. What makes it endlessly interesting is [WHAT KEEPS YOU ENGAGED]. I think everyone should know about it because [BROADER SIGNIFICANCE].",
    followUps: [
      "How did you first get into that?",
      "What is the biggest misconception people have about it?"
    ],
    whyTheyAsk: "This is a disguised communication assessment. Interviewers evaluate whether you can make a complex topic accessible and engaging for a novice audience. It also reveals your ability to read your listener and adjust. The passion itself matters less than the communication skill: can you teach, simplify, and hold attention?",
    coachingTip: "Start with why it matters before explaining what it is. Lead with the hook: what problem does it solve, what question does it answer, or why should anyone care? Use one clear analogy to make the concept tangible. Let your genuine enthusiasm show rather than performing excitement. The interviewer is evaluating your teaching ability, not the topic itself.",
    recommendedStructure: "what-so-now"
  },

  {
    id: 'cb_04',
    question: "What would you do if you won the lottery tomorrow?",
    category: "Creative",
    group: "curveball",
    priority: "Low",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "won the lottery",
      "unlimited money",
      "what would you do with a million dollars",
      "if money was no object",
      "lottery"
    ],
    bullets: [
      "Show that you would still want to contribute and grow, not just retire",
      "Reveal your values through how you would spend your time and resources",
      "Be genuine: it is okay to mention practical things alongside aspirational ones",
      "Connect something to the kind of work or impact that motivates you"
    ],
    narrative: "First, I would take care of [PRACTICAL PRIORITIES]. But honestly, I would not stop working entirely because [WHY WORK MATTERS TO YOU BEYOND MONEY]. I would probably [WHAT YOU WOULD PURSUE], because what drives me most is [CORE MOTIVATION]. I might also [SOMETHING THAT SHOWS YOUR VALUES]. The work itself is something I genuinely enjoy.",
    followUps: [
      "What does that tell you about what you really value?",
      "Would you still be in this field if money were no object?"
    ],
    whyTheyAsk: "This reveals intrinsic motivation by removing the financial incentive. Interviewers are assessing whether your drive comes from within or is purely transactional. Candidates who would stop working entirely raise retention concerns. Those who would continue contributing, even in a different form, signal genuine engagement with their professional identity.",
    coachingTip: "Be honest about practical things (pay off debt, help family) but spend most of your answer on what you would choose to do with your time. If you would continue working in some form, explain what specifically draws you to the work beyond compensation. This is your chance to articulate intrinsic motivation in the most authentic way possible.",
    recommendedStructure: null
  },

  {
    id: 'cb_05',
    question: "What is the last thing you changed your mind about?",
    category: "Creative",
    group: "curveball",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "changed your mind",
      "changed your opinion",
      "reversed your position",
      "thing you used to believe",
      "evolved your thinking"
    ],
    bullets: [
      "What you previously believed and why it made sense at the time",
      "What caused you to reconsider: new evidence, experience, or perspective",
      "Your updated view and why the change matters",
      "What this says about how you approach learning and growth"
    ],
    narrative: "I recently changed my mind about [TOPIC]. I used to believe [PREVIOUS VIEW] because [REASONING]. What shifted my thinking was [CATALYST: a book, an experience, a conversation, data]. Now I believe [UPDATED VIEW], and the difference matters because [WHY]. I think the ability to change your mind when evidence warrants it is one of the most important professional skills.",
    followUps: [
      "How do you distinguish between being open-minded and being indecisive?",
      "What belief do you hold most strongly?"
    ],
    whyTheyAsk: "This tests intellectual humility and the ability to update beliefs based on new evidence. Interviewers value candidates who hold strong opinions loosely because it predicts better decision-making and teamwork. Candidates who cannot name something they changed their mind about may be seen as rigid or unreflective.",
    coachingTip: "Choose something substantive, not trivial. Changing your mind about a restaurant is not interesting; changing your mind about a management philosophy or a professional approach is. Explain what your old belief was and why it was reasonable at the time, then describe the specific trigger that caused you to reconsider. This shows intellectual honesty rather than weakness.",
    recommendedStructure: "comparison"
  },

  {
    id: 'cb_06',
    question: "If you had to teach a class on any topic, what would it be?",
    category: "Creative",
    group: "curveball",
    priority: "Low",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "teach a class",
      "teach anything",
      "what would you teach",
      "expert on a topic",
      "if you were a professor"
    ],
    bullets: [
      "Choose a topic that reflects genuine expertise or passion",
      "Explain why you are qualified to teach it through experience",
      "Describe what students would walk away knowing",
      "Connect it to a broader insight about your approach to work or life"
    ],
    narrative: "I would teach a class on [TOPIC] because I have spent [YEARS OR CONTEXT] learning it the hard way. The course would focus on [KEY TAKEAWAYS], and students would walk away knowing [PRACTICAL SKILL]. I chose this because [WHY IT MATTERS TO YOU]. Teaching forces you to truly understand something, and this is the subject I understand most deeply.",
    followUps: [
      "What would the first lesson cover?",
      "Who is the best teacher you have ever had and what made them great?"
    ],
    whyTheyAsk: "This reveals what you consider yourself an expert in and what you find worth sharing. Interviewers evaluate the depth of your expertise, your ability to structure knowledge for others, and whether your topic choice reveals something relevant about your professional identity. It also tests communication skill: can you describe a curriculum compellingly in 60 seconds?",
    coachingTip: "Choose something you actually know deeply from experience, not something you find interesting in theory. Describe what students would be able to do after your class, not just what they would know. If possible, connect the teaching topic to a professional strength. The best answers show genuine expertise earned through experience rather than academic interest.",
    recommendedStructure: "psb"
  },

  {
    id: 'cb_07',
    question: "What is a hill you would die on professionally?",
    category: "Creative",
    group: "curveball",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "hill you would die on",
      "strong belief",
      "professional conviction",
      "non-negotiable belief",
      "what do you believe strongly"
    ],
    bullets: [
      "Name a genuine professional conviction, not a safe platitude",
      "Explain why you feel so strongly: what experience or evidence shaped this belief",
      "Acknowledge the counterargument: show you have considered the other side",
      "Describe how this conviction shows up in your daily work"
    ],
    narrative: "My hill is [STRONG PROFESSIONAL BELIEF]. I believe this because [EXPERIENCE OR EVIDENCE]. I know some people argue [COUNTERARGUMENT], and I understand their point, but in my experience [WHY YOUR VIEW HOLDS]. This conviction shows up in my daily work through [SPECIFIC BEHAVIOR]. It is something I would push back on even in a job interview.",
    followUps: [
      "Has that belief ever gotten you in trouble?",
      "What would it take to change your mind on that?"
    ],
    whyTheyAsk: "This reveals professional values and conviction. Interviewers want to see that you have strong, experience-backed opinions while also being able to acknowledge counterarguments. Candidates who choose safe platitudes (teamwork is important) reveal nothing. Those who name a genuine conviction and defend it with evidence show intellectual depth and professional identity.",
    coachingTip: "Choose something you genuinely believe that not everyone agrees with. 'Honest feedback should never wait for a scheduled review' is a hill; 'working hard is important' is a platitude. Back it with specific experience that shaped the belief. Acknowledge the strongest counterargument to show intellectual honesty. Then describe how this conviction shows up in your daily behavior.",
    recommendedStructure: "prep"
  },

  {
    id: 'cb_08',
    question: "If you were an animal, which one would you be and why?",
    category: "Creative",
    group: "curveball",
    priority: "Low",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "if you were an animal",
      "what animal would you be",
      "animal that represents you",
      "spirit animal",
      "describe yourself as an animal"
    ],
    bullets: [
      "Choose an animal whose traits genuinely reflect your working style",
      "Explain the connection to specific professional qualities",
      "Keep it light but meaningful: this is a personality question",
      "Avoid overthinking: the interviewer wants to see how you think on your feet"
    ],
    narrative: "I would be a [ANIMAL] because they are known for [TRAIT 1] and [TRAIT 2], which mirrors how I approach work. Like a [ANIMAL], I tend to [PROFESSIONAL BEHAVIOR]. For example, [BRIEF SPECIFIC EXAMPLE]. Plus, I just genuinely like [SOMETHING LIGHTHEARTED ABOUT THE ANIMAL]. It is a fun question but it actually does capture something real about my style.",
    followUps: [
      "What animal would your coworkers say you are?",
      "What traits of that animal do you not share?"
    ],
    whyTheyAsk: "This is a thinking-on-your-feet test disguised as a fun question. Interviewers are evaluating your composure when caught off guard, your ability to think creatively under pressure, and whether you can draw meaningful connections between unrelated concepts. The specific animal matters far less than the quality of your reasoning.",
    coachingTip: "Do not overthink the animal choice. Pick one quickly and invest your energy in the reasoning. Connect two or three animal traits to genuine professional behaviors with a brief example. Keep the tone light; this is one of the few interview questions where a bit of humor helps. If you add a lighthearted comment about the animal, it shows you are comfortable being yourself.",
    recommendedStructure: "add"
  },

  // =====================================================================
  // GROUP 9: VALUES AND CULTURE FIT (7 questions)
  // =====================================================================

  {
    id: 'vl_01',
    question: "What kind of work environment do you do your best work in?",
    category: "Values",
    group: "values",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "work environment",
      "ideal workplace",
      "best work in",
      "kind of environment",
      "work setting preference",
      "how do you work best"
    ],
    bullets: [
      "Be specific: name the conditions that actually help you perform (not just 'collaborative')",
      "Give evidence: describe a time you thrived in that environment",
      "Show flexibility: acknowledge you can adapt but are most effective in your ideal",
      "Connect to this company: signal awareness of their environment"
    ],
    narrative: "I do my best work in an environment where [SPECIFIC CONDITIONS: I have autonomy with clear goals, the team is direct about feedback, there is a bias toward action]. For example, at [COMPANY] I thrived because [WHY THAT ENVIRONMENT WORKED]. I am adaptable and have succeeded in different settings, but I know I deliver my highest-quality work when [CONDITION]. From what I have learned about your team, it sounds like [CONNECTION].",
    followUps: [
      "What kind of work environment brings out the worst in you?",
      "How do you create the conditions you need when they are not built into the culture?"
    ],
    whyTheyAsk: "This is a mutual fit assessment. Interviewers are checking whether you will thrive in their actual environment or clash with it. The specificity of your answer matters: candidates who say 'collaborative' without detail reveal nothing, while those who describe specific conditions (autonomy with clear goals, direct feedback, bias toward action) allow the interviewer to match against their team culture.",
    coachingTip: "Be specific about conditions, not just adjectives. Instead of 'collaborative,' say 'I do my best work when the team shares information openly and we can debate ideas without it being personal.' Research the company's culture before the interview and connect your preferences to signals you have seen. Show flexibility by acknowledging you can succeed in other environments but are most effective in your ideal one.",
    recommendedStructure: "prep"
  },

  {
    id: 'vl_02',
    question: "What motivates you beyond a paycheck?",
    category: "Values",
    group: "values",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "what motivates you",
      "beyond money",
      "intrinsic motivation",
      "what drives you",
      "why do you work",
      "what gets you up in the morning"
    ],
    bullets: [
      "Name your real intrinsic motivators, not what sounds good",
      "Give evidence: when have you been most energized at work and why",
      "Show that these motivators are present in this role",
      "Be honest: interviewers can tell when motivation answers are rehearsed"
    ],
    narrative: "What genuinely motivates me is [INTRINSIC MOTIVATOR: solving hard problems, seeing my work impact real people, building something from nothing, developing others]. I know this because the times I have been most energized at work were when [SPECIFIC EXAMPLE]. This role appeals to me specifically because [HOW THIS JOB PROVIDES THAT MOTIVATION].",
    followUps: [
      "What demotivates you?",
      "How do you stay motivated during routine or unglamorous work?"
    ],
    whyTheyAsk: "Intrinsic motivation predicts engagement and retention far better than compensation. Interviewers want to identify what genuinely drives you so they can assess whether this role will keep you energized long-term. Generic answers like 'I love learning' do not help; specific motivators tied to real experiences (solving complex problems that affect real users) allow the interviewer to evaluate fit.",
    coachingTip: "Ground your answer in evidence: when were you most energized at work and what was happening? The pattern in those moments reveals your true motivators. Name one or two specific intrinsic drivers and connect them to this particular role. Interviewers can detect rehearsed motivation answers, so genuineness matters more than polish here.",
    recommendedStructure: "prep"
  },

  {
    id: 'vl_03',
    question: "How do you define success in your career?",
    category: "Values",
    group: "values",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "define success",
      "career success",
      "what does success mean to you",
      "how do you measure success",
      "successful career"
    ],
    bullets: [
      "Share your genuine definition, not a corporate platitude",
      "Include both professional and personal dimensions",
      "Show how your definition has evolved over time",
      "Connect it to what you are looking for right now"
    ],
    narrative: "Early in my career, I defined success as [EARLIER DEFINITION: promotions, salary, titles]. Over time it has evolved into [CURRENT DEFINITION: impact, mastery, work-life integration, team development]. Right now, success for me means [SPECIFIC CURRENT VISION]. This role aligns with that because [CONNECTION].",
    followUps: [
      "How has your definition changed over the years?",
      "Where do you see yourself in five years?"
    ],
    whyTheyAsk: "This reveals what you optimize for, which predicts whether you will be satisfied in the role long-term. Interviewers who hear 'rapid promotion' for a role with limited vertical growth know there is a mismatch. Those who hear 'mastery and impact' for a deep individual contributor role see alignment. The evolution of your definition also signals maturity and self-awareness.",
    coachingTip: "Show evolution in your definition to demonstrate growth. Starting with 'early in my career I chased titles, but now I measure success by impact and mastery' is more compelling than a static definition. Be specific about what success looks like right now and connect it directly to this role. Avoid purely altruistic answers that seem performative; honesty about wanting both impact and recognition is refreshing.",
    recommendedStructure: "past-present-future"
  },

  {
    id: 'vl_04',
    question: "Tell me about a company value at your last job that you genuinely believed in. Tell me about one you struggled with.",
    category: "Values",
    group: "values",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "company values",
      "value you believed in",
      "value you struggled with",
      "corporate values",
      "culture alignment"
    ],
    bullets: [
      "Name a real value from a real company, not a generic one",
      "Explain why you believed in it: connect it to your personal values",
      "Name one you struggled with honestly, not one that makes you look good",
      "Show maturity: how you navigated the tension between your values and the company's"
    ],
    narrative: "At [COMPANY], I genuinely believed in their value of [VALUE] because [WHY IT RESONATED]. I lived it by [SPECIFIC BEHAVIOR]. The one I struggled with was [VALUE], because [HONEST REASON]. I navigated that tension by [HOW YOU HANDLED IT: adapted my approach, had conversations with leadership, found my own way to embody the intent]. It taught me that no culture is a perfect fit, and the question is whether the core values align.",
    followUps: [
      "What values are non-negotiable for you in a workplace?",
      "How do you evaluate a company's culture before joining?"
    ],
    whyTheyAsk: "This two-part question is designed to reveal both alignment and honesty. The value you believed in shows what you care about. The value you struggled with shows whether you can be honest about cultural friction and navigate it maturely. Candidates who claim to have loved everything about their last company seem either dishonest or unreflective.",
    coachingTip: "Name real values from a real company, not generic concepts. For the value you struggled with, choose something genuinely difficult, not a value that secretly makes you look good. Show how you navigated the tension rather than simply complaining about it or pretending it did not exist. The maturity is in the navigation, not in the complaint.",
    recommendedStructure: "comparison"
  },

  {
    id: 'vl_05',
    question: "What do you do when your personal values conflict with a company decision?",
    category: "Values",
    group: "values",
    priority: "Medium",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "values conflict",
      "disagree with company",
      "personal values",
      "ethical tension",
      "company decision you disagree with"
    ],
    bullets: [
      "Acknowledge that tension is normal and does not mean the company is wrong",
      "Describe your process: voice concerns through proper channels first",
      "Show where you draw the line: minor disagreements versus ethical violations",
      "Give an example if possible"
    ],
    narrative: "When a company decision conflicts with my values, I first consider whether it is a difference of opinion or a genuine ethical issue. For differences of opinion, I voice my perspective through [APPROPRIATE CHANNELS] and then commit to the decision. For example, at [COMPANY] I [SPECIFIC EXAMPLE]. If it were a true ethical violation, I would [ESCALATION PATH]. I believe you can disagree respectfully while still being a committed team member.",
    followUps: [
      "Where do you draw the line?",
      "Have you ever left a job because of a values conflict?"
    ],
    whyTheyAsk: "This evaluates moral courage and organizational maturity simultaneously. Interviewers want to see that you distinguish between personal preferences (which require flexibility) and ethical principles (which require courage). Candidates who never push back seem compliant; candidates who quit over every disagreement seem rigid. The sweet spot is principled flexibility with clear ethical boundaries.",
    coachingTip: "Show a clear framework with two categories: differences of opinion (voice concern, then commit) and ethical violations (escalate through proper channels). Give an example from each category if possible. The key insight is that you can be a committed team member while maintaining personal integrity. End with a clear statement about where you draw the line and why.",
    recommendedStructure: "comparison"
  },

  {
    id: 'vl_06',
    question: "How do you want your colleagues to describe you?",
    category: "Values",
    group: "values",
    priority: "Low",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "how would colleagues describe you",
      "what would your team say about you",
      "reputation at work",
      "how do you want to be known"
    ],
    bullets: [
      "Choose descriptors that reflect your genuine professional identity",
      "Support each one with a brief example or reason",
      "Include both task-oriented and relationship-oriented qualities",
      "Be honest about the gap between aspiration and reality"
    ],
    narrative: "I would want my colleagues to say three things: that I am [QUALITY 1], [QUALITY 2], and [QUALITY 3]. [QUALITY 1] because I [EVIDENCE]. [QUALITY 2] because I [EVIDENCE]. And [QUALITY 3] because I [EVIDENCE]. I am not perfect at all of these all the time, but they are the standards I hold myself to and the reputation I actively try to build.",
    followUps: [
      "What would they actually say versus what you want them to say?",
      "Which of those qualities is the hardest for you to maintain?"
    ],
    whyTheyAsk: "This reveals your professional identity and self-awareness simultaneously. Interviewers evaluate whether your desired reputation aligns with the team's needs and culture. They also watch for the gap between aspiration and reality: candidates who acknowledge this gap demonstrate genuine self-awareness, while those who present a flawless image seem unreflective or overconfident.",
    coachingTip: "Choose three qualities that include both task performance and relationship dimensions. Support each with a brief piece of evidence. Then add the honest acknowledgment that you are not perfect at all three all the time. This small vulnerability makes the entire answer more credible. If you know the team culture, align at least one quality with what they value most.",
    recommendedStructure: "prep"
  },

  {
    id: 'vl_07',
    question: "What is the most important quality you look for in a manager?",
    category: "Values",
    group: "values",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "quality in a manager",
      "ideal manager",
      "what do you want from a boss",
      "management style preference",
      "what makes a good manager"
    ],
    bullets: [
      "Name one quality that genuinely matters most to you (not a laundry list)",
      "Explain why through personal experience: a manager who had it and one who did not",
      "Show self-awareness about what kind of management helps you do your best work",
      "Signal flexibility: you can work with different styles but thrive with this one"
    ],
    narrative: "The quality I value most in a manager is [QUALITY: direct feedback, trust and autonomy, clear expectations, genuine investment in my growth]. I learned this from working under [GOOD EXAMPLE] who [WHAT THEY DID], and contrasting it with [LESS GOOD EXAMPLE] where [WHAT WAS MISSING]. When I have a manager who provides [QUALITY], I [WHAT YOU DELIVER]. I can work effectively with many styles, but that is the one that brings out my best.",
    followUps: [
      "How do you manage yourself when your manager does not have that quality?",
      "What do you do to make your manager's job easier?"
    ],
    whyTheyAsk: "Interviewers use this to assess manager-candidate fit. If you value autonomy and the hiring manager is a micromanager, both parties benefit from knowing that upfront. It also reveals self-awareness: do you know what kind of management brings out your best work? The comparison between a good and less good manager experience shows depth of reflection.",
    coachingTip: "Pick one quality and go deep rather than listing many. Use the comparison structure: describe a manager who had this quality and the impact on your performance, then contrast with one who lacked it. This makes your preference vivid and evidence-based rather than theoretical. Signal flexibility at the end so you do not seem rigid or high-maintenance.",
    recommendedStructure: "comparison"
  },

  // =====================================================================
  // GROUP 10: STRUCTURED RESPONSE DRILLS (8 questions)
  // =====================================================================

  {
    id: 'dr_01',
    question: "Your interviewer just said: 'We are restructuring the team next quarter.' Respond using What-So What-Now What.",
    category: "Drill",
    group: "drills",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "restructuring",
      "team changes",
      "organizational change",
      "what so what now what",
      "respond to new information"
    ],
    bullets: [
      "WHAT: Acknowledge what you heard and show you processed it",
      "SO WHAT: Explain why it matters or what it means from your perspective",
      "NOW WHAT: Propose a forward-looking response or question",
      "Practice processing new information with structure instead of freezing"
    ],
    narrative: "What I hear is that the team is going through a significant transition. So what that tells me is that whoever joins now will have an opportunity to shape the new structure rather than just inherit an established one. Now what I would want to understand is what the vision behind the restructuring is and how I could contribute to making the transition smooth for the team.",
    followUps: [
      "Now try the same structure with: 'We lost our biggest client last month.'",
      "How would your response change if you were already on the team?"
    ],
    whyTheyAsk: "This drill trains you to process unexpected information with structure rather than freezing or rambling. Stanford professor Matt Abrahams identifies What-So What-Now What as one of the most versatile spontaneous speaking frameworks because it works for any new information: good news, bad news, surprises, or curveballs.",
    coachingTip: "This structure works for any unexpected information in an interview. What: restate what you heard to show you processed it. So What: interpret its meaning or significance. Now What: propose a forward-looking action or ask a thoughtful question. Practice until it becomes automatic; the structure itself prevents you from freezing when caught off guard.",
    recommendedStructure: "what-so-now"
  },

  {
    id: 'dr_02',
    question: "Pitch a process improvement you made at a past job using Problem-Solution-Benefit format.",
    category: "Drill",
    group: "drills",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "process improvement",
      "problem solution benefit",
      "pitch an improvement",
      "efficiency gain",
      "made things better"
    ],
    bullets: [
      "PROBLEM: Name the specific inefficiency or pain point clearly",
      "SOLUTION: Describe exactly what you implemented and how",
      "BENEFIT: Quantify the outcome with numbers if possible",
      "Practice turning achievements into concise, persuasive stories"
    ],
    narrative: "The problem was that [SPECIFIC INEFFICIENCY] was costing the team [TIME OR MONEY OR FRUSTRATION] every [FREQUENCY]. My solution was to [WHAT YOU BUILT OR CHANGED], which I implemented by [HOW]. The benefit was [QUANTIFIED RESULT: saved X hours per week, reduced errors by Y percent, improved customer satisfaction by Z]. It showed me that small process fixes can have outsized impact.",
    followUps: [
      "What resistance did you face implementing that change?",
      "Now pitch it in 30 seconds instead of 60."
    ],
    whyTheyAsk: "Problem-Solution-Benefit is one of Matt Abrahams' core communication structures. It keeps people engaged because humans are naturally wired to solve problems. This drill trains you to present achievements as solutions to problems rather than isolated accomplishments, which makes them more memorable and persuasive to interviewers.",
    coachingTip: "Lead with the problem to create engagement before presenting your solution. Quantify both the problem (how much time or money it cost) and the benefit (what improved and by how much). The PSB structure makes achievements feel like stories rather than resume bullet points. Practice compressing this to 30 seconds for when you need a quick example.",
    recommendedStructure: "psb"
  },

  {
    id: 'dr_03',
    question: "The interviewer asks: 'Why should we hire you over other candidates?' Answer using PREP: Point-Reason-Example-Point.",
    category: "Drill",
    group: "drills",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "why should we hire you",
      "over other candidates",
      "what makes you different",
      "why you",
      "PREP format"
    ],
    bullets: [
      "POINT: Lead with your one strongest differentiator in a single sentence",
      "REASON: Explain why that quality matters specifically for this role",
      "EXAMPLE: Give one concrete proof point from your experience",
      "POINT: Restate the differentiator to anchor it in the interviewer's memory"
    ],
    narrative: "My point is that I bring [UNIQUE DIFFERENTIATOR]. The reason that matters here is [CONNECTION TO THE ROLE'S BIGGEST NEED]. For example, at [COMPANY] I [SPECIFIC ACHIEVEMENT THAT PROVES IT]. That is why I believe [RESTATED DIFFERENTIATOR] is what would make me an impactful hire for this team.",
    followUps: [
      "Now give me a different differentiator using the same structure.",
      "What if the interviewer pushes back: 'Everyone says that'?"
    ],
    whyTheyAsk: "PREP (Point-Reason-Example-Point) is a structure used in impromptu speaking training that ensures your answer has a clear thesis, supporting logic, concrete evidence, and a memorable conclusion. Repeating the point at the end anchors your differentiator in the interviewer's memory, making it more likely to be recalled during the hiring decision.",
    coachingTip: "The power of PREP is in the repetition: stating your point at the beginning and end creates a bookend effect that makes your differentiator stick. Choose one specific quality rather than listing many. Make sure the example is concrete and relevant to this particular role. If your differentiator is generic (hard work, attention to detail), dig deeper for something that is genuinely unique to your background.",
    recommendedStructure: "prep"
  },

  {
    id: 'dr_04',
    question: "The interviewer asks a follow-up you did not expect: 'How do you handle situations where you have zero context?' Use ADD: Answer-Detail-Describe relevance.",
    category: "Drill",
    group: "drills",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "unexpected follow-up",
      "zero context",
      "answer detail describe",
      "ADD format",
      "handle with no context"
    ],
    bullets: [
      "ANSWER: Give a direct, concise answer to the question in one sentence",
      "DETAIL: Provide a specific example or story that supports your answer",
      "DESCRIBE RELEVANCE: Connect it back to why this matters for the role you want",
      "Practice handling surprise questions with structure instead of rambling"
    ],
    narrative: "My answer is that I focus on asking the right questions and building context rapidly rather than waiting for it to come to me. In detail, at [COMPANY] I was dropped into [SITUATION WITH NO CONTEXT] and my approach was to [SPECIFIC ACTIONS]. The relevance to this role is that [CONNECTION: you will likely face situations where speed of learning matters more than depth of existing knowledge].",
    followUps: [
      "Now try ADD with: 'How do you know when you are wrong?'",
      "What happens when asking questions is not an option?"
    ],
    whyTheyAsk: "ADD (Answer-Detail-Describe) is a framework Matt Abrahams recommends for handling unexpected questions. It prevents the most common failure mode in interviews: rambling without a clear point. By giving a direct answer first, then supporting it with detail, and connecting it to the role, you demonstrate both composure and relevance under pressure.",
    coachingTip: "The Answer step is the most important: lead with a one-sentence direct answer before providing any context. This prevents the common mistake of building to your point through a long story. The Detail step is where your example goes. The Describe step is what makes it relevant to the interviewer. Practice using ADD on random questions to build the reflex.",
    recommendedStructure: "add"
  },

  {
    id: 'dr_05',
    question: "You just blanked on a question. Practice the pause-breathe-structure recovery technique.",
    category: "Drill",
    group: "drills",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "blanked on a question",
      "forgot what to say",
      "went blank",
      "mind went blank",
      "recover from blanking",
      "anxiety in interview"
    ],
    bullets: [
      "PAUSE: Take a full two-second pause. Silence is better than filler words.",
      "BREATHE: One slow exhale to activate your calm-down response",
      "STRUCTURE: Pick any framework (STAR, What-So What-Now What, Problem-Solution-Benefit) as a scaffold",
      "Practice: This drill trains composure under pressure, not content recall"
    ],
    narrative: "That is a great question. Let me think about that for a moment. [PAUSE]. The way I would approach this is through [CHOSEN STRUCTURE]. Starting with [FIRST ELEMENT], I would say [BEGINNING OF YOUR ANSWER]. The key is that a composed pause followed by a structured response always lands better than a rushed, scattered one.",
    followUps: [
      "Now do it again with a two-second pause before you start speaking.",
      "What phrases help you buy time naturally without sounding unprepared?"
    ],
    whyTheyAsk: "This is not a question interviewers ask but a scenario every candidate faces. Matt Abrahams' research on anxiety management shows that a structured pause activates the parasympathetic nervous system, reducing the fight-or-flight response that causes blanking. Having a practiced recovery technique turns a potentially disqualifying moment into evidence of composure under pressure.",
    coachingTip: "Practice the pause until it feels comfortable. Two seconds of silence feels eternal to you but barely registers with the interviewer. Use a bridge phrase like 'Let me think about that for a moment' or 'That is a great question; let me organize my thoughts.' Then pick any framework (STAR, PSB, What-So What-Now What) as scaffolding. Having a structure to grab prevents the spiral of blanking harder.",
    recommendedStructure: null
  },

  {
    id: 'dr_06',
    question: "Tell a complete STAR story about teamwork in under 60 seconds. Focus on pacing and conciseness.",
    category: "Drill",
    group: "drills",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "60 second story",
      "STAR in one minute",
      "concise story",
      "timed response",
      "pacing drill",
      "tell me quickly"
    ],
    bullets: [
      "SITUATION: Set the scene in two sentences maximum",
      "TASK: Your role in one sentence",
      "ACTION: What you specifically did in two to three sentences",
      "RESULT: Outcome with a number if possible, in one sentence",
      "Total target: under 60 seconds spoken aloud"
    ],
    narrative: "At [COMPANY], our team was tasked with [GOAL] on a tight timeline. I was responsible for [YOUR PIECE]. I coordinated with [TEAM] by [ACTION 1] and personally handled [ACTION 2]. We delivered [RESULT WITH METRIC] ahead of schedule. The key was [ONE LESSON].",
    followUps: [
      "That was over 60 seconds. Trim 15 seconds. What can you cut?",
      "Now tell the same story but emphasize your individual contribution more."
    ],
    whyTheyAsk: "Amazon's behavioral interview guidance recommends keeping STAR stories to two to three minutes. This drill trains the opposite extreme: extreme conciseness. The ability to tell a complete, compelling story in 60 seconds is a superpower in interviews, because interviewers often run over time and appreciate candidates who can make their point efficiently.",
    coachingTip: "Time yourself out loud. Most candidates think their answer is 60 seconds when it is actually closer to three minutes. The Situation should be two sentences maximum; one is better. The Task is one sentence. The Action gets the most space: two to three sentences. The Result is one sentence with a metric. If you cannot hit 60 seconds, cut context from the Situation first since interviewers need less background than you think.",
    recommendedStructure: "star"
  },

  {
    id: 'dr_07',
    question: "The interviewer asks about a skill you do not have. Practice acknowledging the gap and bridging to a related strength.",
    category: "Drill",
    group: "drills",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "skill you don't have",
      "skill gap",
      "missing experience",
      "do not have that skill",
      "bridge to a strength",
      "redirect"
    ],
    bullets: [
      "ACKNOWLEDGE: Be honest about the gap without apologizing or minimizing",
      "BRIDGE: Connect to a related skill or experience you do have",
      "EVIDENCE: Provide a specific example of transferable competence",
      "FORWARD: Express how you would close the gap and your track record of doing so"
    ],
    narrative: "I do not have direct experience with [SPECIFIC SKILL], and I want to be upfront about that. What I do bring is strong experience in [RELATED SKILL], which I demonstrated when [SPECIFIC EXAMPLE]. I also have a track record of ramping up quickly on new skills; for instance, I learned [SOMETHING SIMILAR] in [TIMEFRAME]. I am confident I could close this gap effectively.",
    followUps: [
      "What if they press: 'But this is a core requirement'?",
      "How do you balance honesty about gaps with confidence in your ability to learn?"
    ],
    whyTheyAsk: "Skill gap questions test honesty and learning agility simultaneously. Interviewers report that candidates who admit gaps honestly and bridge to transferable skills score higher than those who claim to know everything. The bridge to a related strength is critical because it shows you understand the underlying competency even if you lack the specific tool or experience.",
    coachingTip: "Never fake expertise you do not have; interviewers will probe and you will lose credibility. Instead, use the acknowledge-bridge-evidence-forward structure. Acknowledge the gap in one sentence. Bridge to a related strength with a specific example. Then show evidence of your ability to learn new skills quickly with a track record example. Forward-looking confidence is the strongest close: 'Based on my track record, I am confident I could close this gap in X timeframe.'",
    recommendedStructure: "add"
  },

  {
    id: 'dr_08',
    question: "Listen to the interviewer describe their team's biggest challenge, then paraphrase it back and connect your experience.",
    category: "Drill",
    group: "drills",
    priority: "Medium",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "active listening drill",
      "paraphrase",
      "connect your experience",
      "listen and respond",
      "team challenge"
    ],
    bullets: [
      "LISTEN: Let the interviewer finish completely before responding",
      "PARAPHRASE: Restate what you heard in your own words to confirm understanding",
      "CONNECT: Link their challenge to a relevant experience or strength you have",
      "ASK: Follow up with a thoughtful question that shows you were truly listening"
    ],
    narrative: "So if I am hearing you correctly, the team's biggest challenge right now is [PARAPHRASE OF THEIR DESCRIPTION]. That resonates with me because at [COMPANY] I faced something similar when [BRIEF PARALLEL]. The approach that worked there was [WHAT YOU DID]. I am curious: [THOUGHTFUL FOLLOW-UP QUESTION ABOUT THEIR SITUATION].",
    followUps: [
      "What if you misunderstood what they said?",
      "How do you avoid making the conversation about yourself when connecting your experience?"
    ],
    whyTheyAsk: "This drill trains the most underrated interview skill: making the conversation about the interviewer's needs, not your resume. Paraphrasing demonstrates active listening, which builds rapport and trust. Connecting your experience to their challenge shows relevance. The follow-up question shows curiosity and engagement. Together, these create the impression that you are already thinking like a teammate.",
    coachingTip: "The paraphrase is the most important step because it builds trust and ensures you understood correctly. Use phrases like 'So if I am hearing you correctly' or 'It sounds like the core challenge is.' Keep the connection to your experience brief; this is about their challenge, not your resume. The follow-up question should demonstrate genuine curiosity about their situation, not just showcase more of your experience.",
    recommendedStructure: "what-so-now"
  },

  // =====================================================================
  // GROUP 14: CLOSING, SALARY, AND NEGOTIATION (7 questions)
  // =====================================================================

  {
    id: 'cl_01',
    question: "What are your salary expectations?",
    category: "Compensation",
    group: "closing",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "salary expectations",
      "what are you looking for salary",
      "compensation expectations",
      "salary range",
      "how much are you looking for",
      "salary requirements"
    ],
    bullets: [
      "Anchor with research: mention that you have studied market rates for this role",
      "Give a range: your target range should be based on data, not emotion",
      "Express flexibility: signal willingness to discuss the full compensation package",
      "Redirect to fit: emphasize that the right opportunity matters more than maximizing salary"
    ],
    narrative: "Based on my research of similar roles in [LOCATION AND INDUSTRY] with my level of experience, I am targeting a range of [LOWER BOUND] to [UPPER BOUND]. That said, I am very open to discussing the full compensation package including [BENEFITS, EQUITY, BONUS, FLEXIBILITY]. The most important thing to me is finding the right fit where I can make a real impact, and I am confident we can find a number that works for both of us.",
    followUps: [
      "What is the budget for this role?",
      "Are you flexible on that range?",
      "What does the full compensation package look like?"
    ],
    whyTheyAsk: "Hiring managers assess three things: whether your expectations align with their budget, whether you understand your market value, and how you handle a potentially uncomfortable negotiation. Research from Salary.com shows that 84% of employers expect candidates to negotiate, so confidently stating a researched range actually signals professionalism rather than arrogance.",
    coachingTip: "Always ground your range in market research rather than personal need. Saying 'based on my research of comparable roles' is more persuasive than 'I need X to cover my expenses.' Set your range so the bottom of your range is your actual target. Express flexibility about the full compensation package (benefits, equity, flexibility, growth opportunities) to show you are evaluating the whole offer, not just the number.",
    recommendedStructure: "prep"
  },

  {
    id: 'cl_02',
    question: "Do you have any other offers you are considering?",
    category: "Closing",
    group: "closing",
    priority: "Medium",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "other offers",
      "other companies",
      "interviewing elsewhere",
      "other opportunities",
      "competitive offers"
    ],
    bullets: [
      "Be honest without revealing too much detail",
      "If yes: mention it factually and express genuine preference for this role",
      "If no: reframe around your selective process rather than lack of options",
      "Always bring it back to why this opportunity is your top choice"
    ],
    narrative: "I am [IN CONVERSATIONS WITH / EXPLORING OPPORTUNITIES AT] a few other companies, which tells me the market values my experience. However, this role is [MY TOP CHOICE / PARTICULARLY COMPELLING] because [SPECIFIC REASON TIED TO THIS COMPANY]. I am being selective in my search because I want to find the right long-term fit, not just the first offer.",
    followUps: [
      "What timeline are you working with?",
      "What would make you choose us over the other options?"
    ],
    whyTheyAsk: "This question serves two purposes: creating urgency (if you have other offers, they may need to move faster) and gauging your genuine interest (are you actively choosing them or settling for whoever offers first?). Interviewers also evaluate your honesty and negotiation sophistication. Fabricating offers you do not have is risky because interviewers may ask for specifics.",
    coachingTip: "If you have other offers, mention them honestly but without ultimatums. Frame it as validation of your value, then redirect to why this role is your top choice. If you do not have other offers, never lie. Instead, emphasize your selective approach: 'I am being deliberate about my search because I want the right long-term fit.' Always end by explaining specifically why this role is compelling to you.",
    recommendedStructure: null
  },

  {
    id: 'cl_03',
    question: "Why should we hire you?",
    category: "Closing",
    group: "closing",
    priority: "High",
    difficulty: "intermediate",
    isDefault: true,
    keywords: [
      "why should we hire you",
      "what makes you the right person",
      "why you over others",
      "what do you bring",
      "convince me to hire you"
    ],
    bullets: [
      "Match your top strength to their top need",
      "Provide one specific proof point from your experience",
      "Mention what you bring that is hard to find in other candidates",
      "End with genuine enthusiasm for the specific role, not just any job"
    ],
    narrative: "You should hire me because your biggest need right now is [THEIR PRIORITY], and that is exactly where I have the deepest experience. At [COMPANY], I [SPECIFIC ACHIEVEMENT THAT MAPS TO THEIR NEED]. Beyond that, I bring [UNIQUE QUALITY: a perspective, a combination of skills, a way of working] that would be hard to replicate. And honestly, I am genuinely excited about [SPECIFIC ASPECT OF THIS ROLE], which means you would get someone who brings energy and ownership from day one.",
    followUps: [
      "What do you think you would struggle with most in this role?",
      "Where would you add the most value in the first six months?"
    ],
    whyTheyAsk: "This is your closing argument. Interviewers use it to see whether you can synthesize everything discussed in the interview into a compelling case for yourself. They evaluate whether you listened well enough during the conversation to match your strengths to their actual needs, not just deliver a generic pitch. The best answers reference something specific learned during the interview itself.",
    coachingTip: "Use what you learned during the interview to customize your answer. If the interviewer mentioned a specific team challenge, connect your top strength directly to it. Use the PREP structure: Point (your differentiator), Reason (why it matters to them), Example (proof from your experience), Point (restate). End with genuine enthusiasm about a specific aspect of this role, not generic excitement about the company.",
    recommendedStructure: "prep"
  },

  {
    id: 'cl_04',
    question: "Do you have any questions for us?",
    category: "Closing",
    group: "closing",
    priority: "High",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "questions for me",
      "questions for us",
      "any questions",
      "what questions do you have",
      "anything you want to ask",
      "do you have questions"
    ],
    bullets: [
      "About the role: what does success look like in the first 90 days?",
      "About the team: what is the team's biggest challenge right now?",
      "About growth: what does professional development look like here?",
      "About them personally: what do you enjoy most about working here?",
      "Never say 'No, I think you covered everything.' Always ask at least two questions."
    ],
    narrative: "Yes, I have a few questions. First, what does success look like for this role in the first 90 days? Second, what is the biggest challenge the team is facing right now? And third, I would love to hear what you personally enjoy most about working here. I find that the way people talk about their own experience says a lot about the culture.",
    followUps: [],
    whyTheyAsk: "Research from Harvard Business Review confirms that the questions you ask reveal more about your judgment, curiosity, and strategic thinking than your answers do. Saying 'No questions' is one of the most common interview disqualifiers because it signals either lack of preparation or lack of genuine interest. Thoughtful questions also demonstrate that you are evaluating the company, not just seeking any offer.",
    coachingTip: "Prepare five questions and plan to ask two or three, since some may be answered during the conversation. Include one about success metrics (shows you are results-oriented), one about team challenges (shows you are thinking like a problem-solver), and one personal question for the interviewer (builds rapport). Avoid questions about benefits, vacation, or perks in the first interview; those signal that you are focused on what you get rather than what you contribute.",
    recommendedStructure: null
  },

  {
    id: 'cl_05',
    question: "What would make you turn down this offer?",
    category: "Closing",
    group: "closing",
    priority: "Medium",
    difficulty: "advanced",
    isDefault: true,
    keywords: [
      "turn down this offer",
      "deal breaker",
      "what would make you say no",
      "walk away from this offer",
      "red flags"
    ],
    bullets: [
      "Be honest about your non-negotiables without sounding rigid",
      "Frame your deal-breakers as values, not demands",
      "Show that you are evaluating fit, not just accepting any offer",
      "Turn it into a positive: explain that knowing your non-negotiables means you commit fully to the right fit"
    ],
    narrative: "I would turn down an offer if I felt the role did not genuinely allow me to [CORE NEED: grow, make impact, work autonomously, be part of a collaborative team]. From everything I have seen so far, this role aligns well with what I am looking for. The fact that I am clear about my non-negotiables means that when I commit, I commit fully and stay engaged for the long term.",
    followUps: [
      "What is your most important non-negotiable?",
      "Is there anything about this role that concerns you?"
    ],
    whyTheyAsk: "This is a candor test and a retention predictor. Interviewers want to know your deal-breakers before extending an offer so they can address concerns proactively. They also assess whether you are the kind of person who will commit fully when you do accept. Candidates who cannot name any deal-breakers seem desperate; those with thoughtful non-negotiables seem self-aware and likely to stay.",
    coachingTip: "Frame your deal-breakers as values rather than demands. Instead of 'I would turn down the offer if the salary was too low,' say 'I would turn down the offer if I felt the role did not genuinely allow me to grow and make impact.' Then pivot to expressing alignment with what you have learned about this role. End by connecting your clarity about non-negotiables to commitment: 'When I say yes, it means something because I have thought carefully about it.'",
    recommendedStructure: "prep"
  },

  {
    id: 'cl_06',
    question: "When can you start?",
    category: "Closing",
    group: "closing",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "when can you start",
      "start date",
      "how soon can you begin",
      "notice period",
      "availability"
    ],
    bullets: [
      "Be realistic: state your actual notice period or availability",
      "Show professionalism: express commitment to finishing responsibilities at your current role",
      "Show eagerness: communicate genuine excitement to get started",
      "Be flexible if possible: offer willingness to accelerate within reason"
    ],
    narrative: "I want to make sure I leave my current role responsibly, so I would need to give [NOTICE PERIOD]. That puts my earliest start date at [DATE]. I am excited to get started and happy to begin any onboarding materials or reading before my official first day if that would be helpful. If there is flexibility needed on the timeline, I am open to discussing it.",
    followUps: [
      "Would you be able to start sooner if needed?",
      "Is there anything you need to wrap up at your current role?"
    ],
    whyTheyAsk: "This question is often a buying signal indicating genuine interest in hiring you. Interviewers evaluate professionalism (honoring your notice period), enthusiasm (genuine excitement to start), and flexibility (willingness to accommodate their timeline). Candidates who can start immediately but show no concern about leaving their current employer responsibly may raise loyalty concerns.",
    coachingTip: "State your realistic notice period first to show professionalism, then express genuine excitement. Offering to begin onboarding before your start date signals initiative without compromising your current employer. If you are available immediately, briefly explain why (contract ended, company downsized) so it does not seem like you quit without notice.",
    recommendedStructure: null
  },

  {
    id: 'cl_07',
    question: "Is there anything else you would like us to know?",
    category: "Closing",
    group: "closing",
    priority: "Medium",
    difficulty: "foundation",
    isDefault: true,
    keywords: [
      "anything else",
      "anything to add",
      "anything we should know",
      "final thoughts",
      "anything else you want to share"
    ],
    bullets: [
      "Use this as a closing statement: reinforce your strongest selling point",
      "Address anything that came up during the interview that you want to clarify",
      "Express genuine enthusiasm for the role with specificity",
      "Keep it to 30 seconds: end strong, not with a ramble"
    ],
    narrative: "I just want to reiterate how excited I am about this opportunity. The combination of [SPECIFIC ASPECT OF ROLE] and [SOMETHING ABOUT THE TEAM OR COMPANY] is exactly what I have been looking for. I am confident that my experience in [YOUR STRENGTH] would translate directly into impact here. Thank you for your time today. I really enjoyed our conversation.",
    followUps: [],
    whyTheyAsk: "This is your closing statement and many candidates waste it by saying 'No, I think we covered everything.' Interviewers use this as a final impression test. The last thing you say is disproportionately memorable (recency bias), so using this moment to reinforce your strongest selling point and express specific enthusiasm creates a lasting positive impression.",
    coachingTip: "Never say 'No, I think we covered everything.' Always use this as your closing argument. Reinforce one key point (your strongest differentiator), express specific enthusiasm (not 'I am excited about the role' but 'The opportunity to lead the data migration project is exactly the challenge I have been looking for'), and thank them genuinely. Keep it to 30 seconds. End on energy, not on a fade-out.",
    recommendedStructure: null
  },

];

// Legacy group mapping for backwards compatibility with old group IDs
const LEGACY_GROUP_MAP = {
  'your-story': 'first-impressions',
  'motivation': 'first-impressions',
  'teamwork': 'behavioral',
};

/**
 * Maps a legacy group ID to the new group ID.
 * Returns the input unchanged if it is already a new group ID.
 */
export const mapLegacyGroup = (groupId) => LEGACY_GROUP_MAP[groupId] || groupId;

export function getDefaultActiveGroups() {
  return new Set(QUESTION_GROUPS.filter(g => g.defaultOn !== false).map(g => g.id));
}

export function filterQuestionsByGroups(questions, activeGroups) {
  if (!activeGroups || activeGroups.size === 0) return questions;
  return questions.filter(q => activeGroups.has(q.question_group || q.group));
}

export function getQuestionCountsByGroup(questions) {
  const counts = {};
  (questions || []).forEach(q => {
    const groupKey = q.question_group || q.group;
    if (groupKey) counts[groupKey] = (counts[groupKey] || 0) + 1;
  });
  return counts;
}
