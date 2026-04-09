/**
 * curatedInterviews.js — Named, structured mock interview playlists
 *
 * These are "Spotify playlists" for interviews. Unlike interviewFormats.js, which
 * randomly picks questions from the user's bank to fill format slots, each curated
 * interview here has a CURATED opening question and a CURATED rhythm — modeled after
 * real interview experiences documented on Blind, Glassdoor, Leetcode, Exponent,
 * IGotAnOffer, and interviewing.io.
 *
 * Each entry belongs to one of the 4 existing formats (behavioral, phoneScreen,
 * panel, finalRound) and exposes ordered question shapes. The player uses these
 * to pick matching questions from the user's bank OR uses the suggestedText
 * verbatim when the bank is thin.
 *
 * Slot types map to the 11 question_groups:
 *   first-impressions, behavioral, situational, self-awareness, communication,
 *   leadership, adaptability, curveball, values, drills, closing
 */

export const CURATED_INTERVIEWS = [
  // ======================================================================
  // PHONE SCREEN (4 playlists)
  // ======================================================================
  {
    id: 'faang-phone-screen',
    title: 'The FAANG Phone Screen',
    format: 'phoneScreen',
    summary: 'The 20-minute recruiter screen used at Google, Meta, Amazon, Apple, and Netflix. Fast-paced, focused on basic fit, motivation, and red-flag detection.',
    whoItsFor: 'Anyone in an early-stage FAANG or top-tier tech pipeline',
    duration: '15-20 min',
    difficulty: 'medium',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Tell me about yourself',
        suggestedText: 'Thanks for taking the time today. To kick us off — walk me through your background and what brought you to apply for this role.',
      },
      {
        slotType: 'values',
        topic: 'Why this company',
        suggestedText: 'Why are you interested in working here specifically? What is it about us versus other companies you are looking at?',
      },
      {
        slotType: 'behavioral',
        topic: 'Recent project ownership',
        suggestedText: 'Tell me about a project you worked on recently that you are proud of. What was your specific contribution?',
      },
      {
        slotType: 'closing',
        topic: 'Compensation and logistics',
        suggestedText: 'Before we wrap up — what are your compensation expectations, and is there anything about timing or location I should know?',
      },
    ],
    insiderTip: 'Recruiters are screening for red flags, not depth. Keep answers under 90 seconds, stay upbeat, and always have a salary range ready.',
    realWorldContext: 'Synthesized from hundreds of FAANG phone screen reports on Blind, Glassdoor, and IGotAnOffer.',
  },
  {
    id: 'recruiter-first-pass',
    title: 'The Recruiter First-Pass Screen',
    format: 'phoneScreen',
    summary: 'The 10-minute gatekeeper call every major employer runs before handing you to the hiring manager. Mostly logistics and fit — but easy to fail.',
    whoItsFor: 'Anyone in a competitive pipeline who needs to survive the gatekeeper',
    duration: '10-15 min',
    difficulty: 'easy',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Quick introduction',
        suggestedText: 'Give me a two-minute version of your background and what you are looking for next.',
      },
      {
        slotType: 'values',
        topic: 'Why leaving current role',
        suggestedText: 'What is driving your decision to make a move right now?',
      },
      {
        slotType: 'closing',
        topic: 'Salary and availability',
        suggestedText: 'What are you targeting for compensation, and how soon could you start if things moved forward?',
      },
    ],
    insiderTip: 'Recruiters type notes in real time. Speak in clean bullet points — they are literally transcribing you into an ATS.',
    realWorldContext: 'Based on standard in-house and agency recruiter workflows described across LinkedIn Talent and SHRM guides.',
  },
  {
    id: 'sdr-phone-screen',
    title: 'The SaaS SDR Phone Screen',
    format: 'phoneScreen',
    summary: 'Fast, high-energy tech sales screen used at companies like Salesforce, Gong, Outreach, and Ramp. Tests whether you can think on your feet and handle objections.',
    whoItsFor: 'Entry to mid-level sales candidates (SDR, BDR, AE)',
    duration: '20 min',
    difficulty: 'medium',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Sell me on you',
        suggestedText: 'You have 60 seconds — sell me on why you would be a great SDR here.',
      },
      {
        slotType: 'values',
        topic: 'Why sales and why us',
        suggestedText: 'Why sales, and what specifically drew you to this company and product?',
      },
      {
        slotType: 'curveball',
        topic: 'Handling rejection',
        suggestedText: 'Pretend I just told you we are not interested and hung up. What do you do next?',
      },
      {
        slotType: 'closing',
        topic: 'Quota and logistics',
        suggestedText: 'What kind of quota attainment are you used to, and what comp structure are you looking for?',
      },
    ],
    insiderTip: 'Energy is the #1 signal. Sales leaders decide in the first 30 seconds whether they want to take your call to the next round.',
    realWorldContext: 'Drawn from Aspireship, Orum, and Springboard SDR interview guides plus Glassdoor reports.',
  },
  {
    id: 'early-career-screen',
    title: 'First-Time Job Screen',
    format: 'phoneScreen',
    summary: 'A gentle, welcoming phone screen for students, new grads, and anyone interviewing for their very first professional role.',
    whoItsFor: 'Students, recent grads, interns, first-time job seekers',
    duration: '15 min',
    difficulty: 'easy',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Tell me about yourself',
        suggestedText: 'Take me through your background — school, any experience, and what brings you here today.',
      },
      {
        slotType: 'values',
        topic: 'Why this role',
        suggestedText: 'What drew you to this role, and what are you hoping to learn in your first year?',
      },
      {
        slotType: 'behavioral',
        topic: 'Teamwork example',
        suggestedText: 'Tell me about a time you worked on a team — could be school, a club, or a part-time job — and what role you played.',
      },
      {
        slotType: 'closing',
        topic: 'Questions for the interviewer',
        suggestedText: 'We are almost out of time — what questions do you have for me about the team or the role?',
      },
    ],
    insiderTip: 'You are not expected to have a resume full of experience. Show curiosity, coachability, and clear reasons you want THIS job.',
    realWorldContext: 'Modeled after university career center phone screen templates and Handshake employer workflows.',
  },

  // ======================================================================
  // BEHAVIORAL (4 playlists)
  // ======================================================================
  {
    id: 'amazon-lp-deep-dive',
    title: 'Amazon Leadership Principles Deep Dive',
    format: 'behavioral',
    summary: 'The real Amazon bar raiser experience. Six STAR-based questions mapped to specific Leadership Principles. Expect to be cut off and asked "What did YOU do?"',
    whoItsFor: 'Anyone in an Amazon, AWS, or ex-Amazon-led interview loop',
    duration: '30-40 min',
    difficulty: 'hard',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Career walkthrough',
        suggestedText: 'Walk me through your resume, focusing on the moments where you had the biggest impact.',
      },
      {
        slotType: 'behavioral',
        topic: 'Customer Obsession',
        suggestedText: 'Tell me about a time you went above and beyond for a customer. What did you learn from them that others missed?',
      },
      {
        slotType: 'behavioral',
        topic: 'Ownership',
        suggestedText: 'Give me an example of when you took on something significant outside your area of responsibility. Why did you do it and what was the result?',
      },
      {
        slotType: 'behavioral',
        topic: 'Bias for Action',
        suggestedText: 'Tell me about a time you had to make a decision with incomplete information and had to move fast. What was the tradeoff?',
      },
      {
        slotType: 'leadership',
        topic: 'Disagree and Commit',
        suggestedText: 'Describe a situation where you strongly disagreed with a decision from your manager or team. How did you handle it?',
      },
      {
        slotType: 'closing',
        topic: 'Your questions for Amazon',
        suggestedText: 'We have a few minutes left. What questions do you have for me about working at Amazon?',
      },
    ],
    insiderTip: 'Amazon interviewers are trained to ask "What did YOU do?" three times in a row. Never say "we" — always answer in first person.',
    realWorldContext: 'Based on Amazon\'s published Leadership Principles and thousands of documented interview loops on interviewing.io and Blind.',
  },
  {
    id: 'google-behavioral',
    title: 'Google Behavioral Interview (Googleyness & Leadership)',
    format: 'behavioral',
    summary: 'Google\'s "Googleyness and Leadership" round. Tests collaboration, ambiguity handling, and the ability to make others better. Less aggressive than Amazon, more reflective.',
    whoItsFor: 'Candidates in a Google, YouTube, or DeepMind loop (SWE, PM, UXR, etc.)',
    duration: '30 min',
    difficulty: 'medium',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Why Google',
        suggestedText: 'Walk me through your background and what specifically drew you to Google.',
      },
      {
        slotType: 'behavioral',
        topic: 'Cross-functional collaboration',
        suggestedText: 'Tell me about a time you worked on a cross-functional project with conflicting priorities. How did you align everyone?',
      },
      {
        slotType: 'adaptability',
        topic: 'Ambiguous problem',
        suggestedText: 'Describe a situation where you had to make progress on a problem without clear direction. How did you figure out what to do?',
      },
      {
        slotType: 'self-awareness',
        topic: 'Mistake and learning',
        suggestedText: 'Tell me about a significant mistake you made at work. What did you learn, and how has it changed the way you work?',
      },
      {
        slotType: 'closing',
        topic: 'Questions about Google',
        suggestedText: 'What questions do you have for me about Google or the team?',
      },
    ],
    insiderTip: 'Google evaluates "Googleyness" — comfort with ambiguity, intellectual humility, and making teammates better. Show vulnerability on the mistake question.',
    realWorldContext: 'Based on Google\'s published hiring rubric and reports from IGotAnOffer and Exponent.',
  },
  {
    id: 'career-changer-story',
    title: 'The Career Changer Story Interview',
    format: 'behavioral',
    summary: 'Designed for people pivoting industries or functions. Every question gives you a chance to connect your old experience to the new role and defend the transition.',
    whoItsFor: 'Career changers, returners, bootcamp grads, military-to-civilian, parent returners',
    duration: '25-30 min',
    difficulty: 'medium',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Tell me your story',
        suggestedText: 'I see an interesting path in your resume. Walk me through your story and what led you to apply for this role.',
      },
      {
        slotType: 'values',
        topic: 'Why the pivot',
        suggestedText: 'What made you decide to make this career change now, and why this field specifically?',
      },
      {
        slotType: 'behavioral',
        topic: 'Transferable skills in action',
        suggestedText: 'Tell me about a time from your previous career where you used skills that would directly translate to this role.',
      },
      {
        slotType: 'self-awareness',
        topic: 'Addressing the gap',
        suggestedText: 'What do you see as the biggest gap between where you are today and where this role needs you to be, and how are you closing it?',
      },
      {
        slotType: 'closing',
        topic: 'What success looks like',
        suggestedText: 'If we hired you, what would a successful first 90 days look like from your side?',
      },
    ],
    insiderTip: 'Never frame your pivot as running AWAY from something. Frame it as running TOWARD the new role with a story that makes your past feel inevitable.',
    realWorldContext: 'Synthesized from Muse, Biginterview, and Career Contessa career-change interview guides.',
  },
  {
    id: 'nursing-new-grad',
    title: 'The New Grad Nurse Interview',
    format: 'behavioral',
    summary: 'Modeled after real hospital nurse residency interviews. Starts with your story, moves into clinical scenarios, and ends with cultural fit. Uses SBAR framing where appropriate.',
    whoItsFor: 'New grad RNs, nursing students, nurses applying to their first hospital role',
    duration: '25-30 min',
    difficulty: 'medium',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Why nursing',
        suggestedText: 'Tell me about yourself and why you chose nursing as your career.',
      },
      {
        slotType: 'values',
        topic: 'Why this unit',
        suggestedText: 'Why are you interested in this specific unit and this hospital?',
      },
      {
        slotType: 'situational',
        topic: 'Difficult patient or family',
        suggestedText: 'Tell me about a time during clinicals when you had to handle a difficult patient or family member. What did you do?',
      },
      {
        slotType: 'behavioral',
        topic: 'Teamwork under pressure',
        suggestedText: 'Describe a time you worked with a team during a stressful clinical situation. What was your role?',
      },
      {
        slotType: 'self-awareness',
        topic: 'Strength and growth area',
        suggestedText: 'As a new grad, what do you see as your biggest clinical strength and the biggest area you want to grow?',
      },
      {
        slotType: 'closing',
        topic: 'Questions about the unit',
        suggestedText: 'What questions do you have about our unit, orientation program, or preceptorship?',
      },
    ],
    insiderTip: 'Hiring managers know you are new. They are evaluating your learning mindset and your ability to stay calm under pressure, not your clinical depth.',
    realWorldContext: 'Based on Nursegrid, Incredible Health, and ANA new grad interview guides, reviewed against real RN residency hiring rubrics.',
  },

  // ======================================================================
  // PANEL (4 playlists)
  // ======================================================================
  {
    id: 'faang-onsite-panel',
    title: 'The FAANG Onsite Panel',
    format: 'panel',
    summary: 'The full onsite loop simulation. Four rotating interviewers — HR, hiring manager, engineering peer, cross-functional partner — each with their own focus area.',
    whoItsFor: 'Candidates in a full onsite or virtual onsite loop at a big tech company',
    duration: '45-60 min',
    difficulty: 'hard',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'HR opening',
        suggestedText: 'From HR: Let us start with a quick overview — walk me through your background.',
      },
      {
        slotType: 'behavioral',
        topic: 'Conflict with a peer',
        suggestedText: 'From the hiring manager: Tell me about a time you had a significant disagreement with a peer. How did you resolve it?',
      },
      {
        slotType: 'communication',
        topic: 'Explaining complex ideas',
        suggestedText: 'From the engineering peer: Tell me about a time you had to explain a complex technical concept to a non-technical audience.',
      },
      {
        slotType: 'situational',
        topic: 'Scope tradeoff',
        suggestedText: 'From the hiring manager: Imagine you are three weeks from launch and discover the feature won\'t hit the original scope. What do you do?',
      },
      {
        slotType: 'leadership',
        topic: 'Influence without authority',
        suggestedText: 'From the cross-functional partner: Tell me about a time you had to influence a team or decision without having formal authority.',
      },
      {
        slotType: 'curveball',
        topic: 'Peer curveball',
        suggestedText: 'From the engineering peer: What is the most controversial technical or product opinion you hold, and why?',
      },
      {
        slotType: 'behavioral',
        topic: 'Failure and recovery',
        suggestedText: 'From the hiring manager: Tell me about a project that failed. What did you do after, and what changed because of it?',
      },
      {
        slotType: 'closing',
        topic: 'Panel wrap-up',
        suggestedText: 'From HR: We are out of time. What are your top questions for each of us?',
      },
    ],
    insiderTip: 'Panelists calibrate with each other after the loop. Repeat stories are death — have 5-6 distinct STAR stories prepped and assign them by principle, not by question.',
    realWorldContext: 'Based on documented FAANG onsite loops from interviewing.io, Exponent, and Blind including Meta, Google, Amazon, and Apple.',
  },
  {
    id: 'mbb-consulting-fit',
    title: 'MBB Consulting Fit Panel',
    format: 'panel',
    summary: 'The Personal Experience Interview (PEI) used at McKinsey, BCG, and Bain. Three deep STAR stories probed aggressively — entrepreneurial drive, personal impact, leadership.',
    whoItsFor: 'Consulting candidates preparing for MBB final rounds',
    duration: '30-45 min',
    difficulty: 'hard',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Why consulting, why us',
        suggestedText: 'Start by telling me why consulting, why our firm specifically, and what you want to get out of the first two years here.',
      },
      {
        slotType: 'leadership',
        topic: 'Personal impact',
        suggestedText: 'Tell me about a time you had significant personal impact on a group — a team, a project, or an organization. Walk me through what you did, step by step.',
      },
      {
        slotType: 'situational',
        topic: 'Entrepreneurial drive',
        suggestedText: 'Describe a time you took initiative to build or change something that nobody asked you to. Why did you do it, and what happened?',
      },
      {
        slotType: 'behavioral',
        topic: 'Leadership under difficulty',
        suggestedText: 'Tell me about a time you led a team through a difficult situation. What was the resistance and how did you handle it?',
      },
      {
        slotType: 'communication',
        topic: 'Persuading a skeptic',
        suggestedText: 'Give me an example of when you had to convince someone senior to change their mind on something important.',
      },
      {
        slotType: 'closing',
        topic: 'Your questions',
        suggestedText: 'We have a few minutes left. What do you want to know about life at the firm from our perspective?',
      },
    ],
    insiderTip: 'MBB interviewers will ask "and then what?" up to 8 times on a single story. Prepare each story deep enough that you could narrate 20 minutes of detail.',
    realWorldContext: 'Based on MConsultingPrep PEI guides and published McKinsey, BCG, and Bain fit interview frameworks.',
  },
  {
    id: 'product-manager-panel',
    title: 'The Product Manager Leadership Panel',
    format: 'panel',
    summary: 'Modeled after Meta\'s Leadership & Drive and Google\'s cross-functional rounds. Focused on execution, prioritization, and managing ambiguity.',
    whoItsFor: 'PM candidates at tech companies (APM, PM, Senior PM)',
    duration: '45 min',
    difficulty: 'hard',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'PM journey',
        suggestedText: 'Walk me through your PM journey — what products you have shipped and what you learned along the way.',
      },
      {
        slotType: 'behavioral',
        topic: 'Prioritization with competing stakeholders',
        suggestedText: 'Tell me about a time you had to prioritize between competing priorities from engineering, design, and the business. How did you decide?',
      },
      {
        slotType: 'communication',
        topic: 'Influencing without authority',
        suggestedText: 'How did you get a team or leader to commit to a priority they initially resisted?',
      },
      {
        slotType: 'adaptability',
        topic: 'Changing course mid-project',
        suggestedText: 'Tell me about a time new data or a new constraint forced you to change the direction of a product you were shipping.',
      },
      {
        slotType: 'situational',
        topic: 'Launch gone wrong',
        suggestedText: 'Imagine your biggest launch of the year goes badly in the first 48 hours. Walk me through what you do.',
      },
      {
        slotType: 'leadership',
        topic: 'Making someone else better',
        suggestedText: 'Tell me about a time you made someone else on your team meaningfully better at their job.',
      },
      {
        slotType: 'closing',
        topic: 'Your questions about the product org',
        suggestedText: 'What do you want to know about how product works here?',
      },
    ],
    insiderTip: 'Meta and Google PMs are evaluated on "drive" — the ability to push through ambiguity. Every story should end with a measurable outcome and what you would do differently.',
    realWorldContext: 'Based on Meta\'s Leadership & Drive rubric, Google\'s published PM interview guide, Exponent, and Product Alliance.',
  },
  {
    id: 'engineering-cultural-fit',
    title: 'The Engineering Cultural Fit Panel',
    format: 'panel',
    summary: 'The non-coding half of the engineering loop. Tests how you collaborate, handle technical disagreements, and mentor others. Common at Stripe, Airbnb, Shopify, and Netflix.',
    whoItsFor: 'Software engineers (mid to senior) at culture-heavy tech companies',
    duration: '45 min',
    difficulty: 'medium',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Engineering journey',
        suggestedText: 'Tell me about your engineering journey and the kind of engineer you are becoming.',
      },
      {
        slotType: 'behavioral',
        topic: 'Technical disagreement',
        suggestedText: 'Describe a time you disagreed with a technical decision made by your team or tech lead. What did you do?',
      },
      {
        slotType: 'communication',
        topic: 'Code review done well',
        suggestedText: 'Walk me through a code review you did that you are particularly proud of — either as the reviewer or the author.',
      },
      {
        slotType: 'leadership',
        topic: 'Mentoring someone',
        suggestedText: 'Tell me about a time you helped another engineer grow. What did you actually do day to day?',
      },
      {
        slotType: 'self-awareness',
        topic: 'Worst bug you shipped',
        suggestedText: 'Tell me about the worst bug you ever shipped to production. What happened, and what did you change after?',
      },
      {
        slotType: 'closing',
        topic: 'Questions about the engineering culture',
        suggestedText: 'What questions do you have about how we engineer here — code review, on-call, planning, any of it?',
      },
    ],
    insiderTip: 'Companies like Stripe and Airbnb weight this round as heavily as coding. A great engineer who is hard to work with gets rejected here.',
    realWorldContext: 'Based on publicly described cultural interview loops at Stripe, Airbnb, Shopify, Netflix, and GitLab.',
  },

  // ======================================================================
  // FINAL ROUND (4 playlists)
  // ======================================================================
  {
    id: 'executive-final-round',
    title: 'The Executive Final Round',
    format: 'finalRound',
    summary: 'The chemistry check with the CEO, the board, or the hiring executive. Strategy, judgment, and long-range thinking. One question can become a 30-minute conversation.',
    whoItsFor: 'VP, Director, and C-suite candidates',
    duration: '35-45 min',
    difficulty: 'hard',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Career arc and vision',
        suggestedText: 'Take me through your career arc and tell me what you think you were uniquely built to do.',
      },
      {
        slotType: 'leadership',
        topic: 'Leadership philosophy',
        suggestedText: 'What is your leadership philosophy, and where did it come from? Give me a specific moment that shaped it.',
      },
      {
        slotType: 'situational',
        topic: 'Strategic judgment call',
        suggestedText: 'Walk me through the hardest strategic decision you have made in the last three years. How did you frame the call?',
      },
      {
        slotType: 'values',
        topic: 'Culture you build',
        suggestedText: 'Describe the culture you build on your teams. How would a skip-level describe what it is like working under you?',
      },
      {
        slotType: 'closing',
        topic: 'What you need to succeed',
        suggestedText: 'If we made you an offer and you accepted, what would you need from me in the first 90 days for you to be successful?',
      },
    ],
    insiderTip: 'By this stage the company already believes you can do the job. They are deciding if they want to be in a foxhole with you for the next five years. Chemistry wins.',
    realWorldContext: 'Based on InveniasPartners, JM Search, and Ivy Exec executive search interview guides.',
  },
  {
    id: 'startup-founder-final',
    title: 'Startup Founder Final Round',
    format: 'finalRound',
    summary: 'The final call with the founder of a Series A-C startup. Tests conviction, scrappiness, and whether you can thrive in chaos. Fast, informal, intense.',
    whoItsFor: 'Candidates joining venture-backed startups at early-to-mid stage',
    duration: '30 min',
    difficulty: 'hard',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Why this startup',
        suggestedText: 'Of all the companies you could join, why this one, and why now?',
      },
      {
        slotType: 'values',
        topic: 'Risk tolerance',
        suggestedText: 'Startups are risky. Tell me about your risk tolerance and a time it was tested.',
      },
      {
        slotType: 'adaptability',
        topic: 'Wearing many hats',
        suggestedText: 'Give me an example of a time you did something completely outside your job description because the company needed it.',
      },
      {
        slotType: 'situational',
        topic: 'First 30 days plan',
        suggestedText: 'If you start in two weeks, what are the first three things you do, and what outcome do you expect by day 30?',
      },
      {
        slotType: 'closing',
        topic: 'Due diligence questions',
        suggestedText: 'What are the questions you need me to answer honestly before you would accept an offer here?',
      },
    ],
    insiderTip: 'Founders hire for conviction and speed. If you hedge, you lose. Answer with "I would" and "I will," not "I might."',
    realWorldContext: 'Based on founder-led interview patterns described across First Round Review, YC library, and Lenny\'s Newsletter.',
  },
  {
    id: 'hostile-stress-interview',
    title: 'The Hostile Stress Interview',
    format: 'finalRound',
    summary: 'A deliberately uncomfortable final round designed to test composure. Used by some investment banks, law firms, and PE shops. Not mean — just relentless.',
    whoItsFor: 'Finance, law, PE, and high-pressure client-facing roles',
    duration: '20-30 min',
    difficulty: 'hard',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Defend your resume',
        suggestedText: 'I am going to be direct — looking at your resume, I do not see why we should hire you. Convince me.',
      },
      {
        slotType: 'curveball',
        topic: 'Stress under pressure',
        suggestedText: 'Walk me through the single worst professional day of your life and what you did about it.',
      },
      {
        slotType: 'self-awareness',
        topic: 'Harshest feedback',
        suggestedText: 'What is the harshest piece of feedback you have ever received, and was it fair?',
      },
      {
        slotType: 'behavioral',
        topic: 'Time you were wrong',
        suggestedText: 'Tell me about a time you were completely wrong about something important. How did you realize it?',
      },
      {
        slotType: 'closing',
        topic: 'One reason not to hire you',
        suggestedText: 'Give me one reason we should NOT hire you. Be honest — I will know if you are not.',
      },
    ],
    insiderTip: 'The content of your answer matters less than whether you stay calm, hold eye contact, and refuse to get flustered. Breathe. Pause. Then answer.',
    realWorldContext: 'Based on documented stress interview techniques from investment banking, BigLaw, and private equity recruiting.',
  },
  {
    id: 'nursing-manager-final',
    title: 'The Nurse Manager Final Round',
    format: 'finalRound',
    summary: 'The last conversation with a nurse manager before an offer. Mixes values, judgment, and specific questions about the unit\'s culture and your fit within it.',
    whoItsFor: 'RNs in final-round hospital interviews (new grad or experienced)',
    duration: '25-30 min',
    difficulty: 'medium',
    questions: [
      {
        slotType: 'first-impressions',
        topic: 'Where you see yourself',
        suggestedText: 'Where do you see your nursing career going in the next three to five years, and how does this unit fit into that?',
      },
      {
        slotType: 'values',
        topic: 'Patient safety culture',
        suggestedText: 'Describe the kind of patient safety culture you want to work in, and tell me about a time you spoke up about a safety issue.',
      },
      {
        slotType: 'leadership',
        topic: 'Supporting a struggling teammate',
        suggestedText: 'Tell me about a time you supported a nursing teammate who was struggling. What did you do?',
      },
      {
        slotType: 'situational',
        topic: 'Disagreement with a provider',
        suggestedText: 'Imagine you disagree with a physician about a plan of care. Walk me through how you would handle the conversation.',
      },
      {
        slotType: 'closing',
        topic: 'Questions about the team',
        suggestedText: 'Last question time — what do you need to know about our team, schedule, or culture to feel confident accepting an offer?',
      },
    ],
    insiderTip: 'Nurse managers hire for longevity. They are screening for burnout risk. Show that you have a sustainable reason to be in nursing and in this specialty.',
    realWorldContext: 'Based on Incredible Health, Nurse.org, and ANA nurse manager interview guides plus real hospital hiring rubrics.',
  },
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Get all curated interviews for a given format.
 * @param {string} formatId - One of 'behavioral', 'phoneScreen', 'panel', 'finalRound'
 * @returns {Array}
 */
export function getCuratedInterviewsByFormat(formatId) {
  return CURATED_INTERVIEWS.filter(ci => ci.format === formatId);
}

/**
 * Get a single curated interview by its ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getCuratedInterviewById(id) {
  return CURATED_INTERVIEWS.find(ci => ci.id === id) || null;
}
