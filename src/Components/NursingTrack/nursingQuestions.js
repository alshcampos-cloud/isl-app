// NursingTrack — Curated Clinical Interview Questions
// ============================================================
// CONTENT SOURCING: Questions sourced from publicly available nursing
// interview concepts, NCSBN competency domains, and common clinical
// interview topics. Interview question concepts are not copyrightable.
//
// WHAT IS OUR IP: The evaluation rubrics (bullets), coaching prompts,
// and the C.O.A.C.H. conversation architecture. That's what we built.
//
// CLINICAL FRAMEWORKS: All frameworks referenced are publicly published
// knowledge (SBAR, Nursing Process, NCSBN CJM, Maslow's, ABC).
//
// WHAT WE DON'T DO: We never reproduce copyrighted textbook content
// (Lippincott, Elsevier, UWorld, Kaplan, Hurst).
//
// CLINICAL REVIEW: All questions reviewed and approved by Erin
// (Infection Prevention, Stanford Health Care) on 2026-02-12.
// 64 approved, 3 rewritten per her notes, 0 rejected.
// ============================================================

/**
 * NURSING QUESTION DATA STRUCTURE
 * Extends the existing ISL question format with clinical metadata
 *
 * Base ISL fields: id, question, category, priority, keywords[], bullets[], narrative, followUps[]
 * Added nursing fields: specialty, clinicalFramework, responseFramework, difficulty, metadata{}
 *
 * responseFramework: 'sbar' | 'star'
 *   - 'sbar' → Clinical Judgment, Communication, Technical questions (clinical scenarios)
 *   - 'star' → Behavioral, Motivation questions (general behavioral)
 *
 * metadata.triggerCondition: optional string describing when AI should prioritize this question
 *   e.g., 'new_grad_only', 'sbar_coaching' — used by the coaching engine to adapt flow
 */

// ============================================================
// SPECIALTY DEFINITIONS
// ============================================================
export const NURSING_SPECIALTIES = [
  {
    id: 'ed',
    name: 'Emergency Department',
    shortName: 'ED',
    icon: '🚨',
    color: 'from-red-500 to-orange-500',
    description: 'Fast-paced triage, trauma, and acute care',
    questionCount: 26,  // 8 ED-specific + 18 general
  },
  {
    id: 'icu',
    name: 'Intensive Care Unit',
    shortName: 'ICU',
    icon: '🫀',
    color: 'from-blue-600 to-cyan-500',
    description: 'Critical care, ventilator management, hemodynamic monitoring',
    questionCount: 26,  // 8 ICU-specific + 18 general
  },
  {
    id: 'or',
    name: 'Operating Room',
    shortName: 'OR',
    icon: '🔬',
    color: 'from-green-600 to-emerald-500',
    description: 'Perioperative care, surgical procedures, sterile technique',
    questionCount: 24,  // 6 OR-specific + 18 general
  },
  {
    id: 'ld',
    name: 'Labor & Delivery',
    shortName: 'L&D',
    icon: '👶',
    color: 'from-pink-500 to-rose-400',
    description: 'Obstetric care, fetal monitoring, postpartum support',
    questionCount: 24,  // 6 L&D-specific + 18 general
  },
  {
    id: 'peds',
    name: 'Pediatrics',
    shortName: 'Peds',
    icon: '🧸',
    color: 'from-yellow-500 to-amber-400',
    description: 'Child-specific assessment, family-centered care, developmental milestones',
    questionCount: 24,  // 6 Peds-specific + 18 general
  },
  {
    id: 'psych',
    name: 'Psych / Behavioral Health',
    shortName: 'Psych',
    icon: '🧠',
    color: 'from-purple-600 to-violet-500',
    description: 'Therapeutic communication, crisis intervention, de-escalation',
    questionCount: 24,  // 6 Psych-specific + 18 general
  },
  {
    id: 'medsurg',
    name: 'Med-Surg',
    shortName: 'Med-Surg',
    icon: '🏥',
    color: 'from-sky-600 to-blue-500',
    description: 'General medical-surgical nursing, high patient ratios, diverse conditions',
    questionCount: 24,  // 6 Med-Surg-specific + 18 general
  },
  {
    id: 'travel',
    name: 'Travel Nursing',
    shortName: 'Travel',
    icon: '✈️',
    color: 'from-teal-500 to-cyan-400',
    description: 'Adaptability, quick onboarding, multi-facility experience',
    questionCount: 24,  // 6 Travel-specific + 18 general
  },
];

// ============================================================
// CLINICAL FRAMEWORKS REFERENCE
// All publicly published — free to reference by name and cite.
// ============================================================
export const CLINICAL_FRAMEWORKS = {
  NCSBN_CJM: {
    name: 'NCSBN Clinical Judgment Model',
    description: 'Recognize cues → Analyze cues → Prioritize hypotheses → Generate solutions → Take action → Evaluate outcomes',
    source: 'National Council of State Boards of Nursing',
    url: 'https://www.ncsbn.org/public-files/CJMM_Overview.pdf',
  },
  SBAR: {
    name: 'SBAR Communication',
    description: 'Situation → Background → Assessment → Recommendation',
    source: 'Institute for Healthcare Improvement',
    url: 'https://www.ihi.org/resources/Pages/Tools/SBARToolkit.aspx',
  },
  NURSING_PROCESS: {
    name: 'Nursing Process (ADPIE)',
    description: 'Assessment → Diagnosis → Planning → Implementation → Evaluation',
    source: 'American Nurses Association',
    url: 'https://www.nursingworld.org/',
  },
  MASLOWS: {
    name: "Maslow's Hierarchy of Needs",
    description: 'Physiological → Safety → Love/Belonging → Esteem → Self-Actualization',
    source: "Public domain — applied to patient prioritization in nursing",
  },
  ABC: {
    name: 'ABC Prioritization',
    description: 'Airway → Breathing → Circulation',
    source: 'American Heart Association / Emergency Nurses Association',
    url: 'https://www.heart.org/',
  },
};

// ============================================================
// CURATED NURSING INTERVIEW QUESTIONS
// ============================================================
// All questions reviewed by Erin (2026-02-12).
// Sources: Publicly available nursing interview concepts, NCSBN
// competency domains, common clinical interview topics.
// Evaluation rubrics (bullets) are original — that's our IP.
// ============================================================
export const NURSING_QUESTIONS = [

  // ============================================================
  // GENERAL — All Specialties (Q1-Q18)
  // ============================================================

  // Q1
  {
    id: 'ng_1',
    question: 'Tell me about yourself and why you chose nursing.',
    category: 'Motivation',
    specialty: 'general',
    priority: 'High',
    difficulty: 'beginner',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['tell me about yourself', 'why nursing', 'introduce yourself', 'background', 'your story'],
    bullets: [
      'Open with your current role and setting (brief — 1 sentence)',
      'Share what drew you to nursing specifically (personal, not generic)',
      'Highlight 1-2 clinical experiences that shaped your career path',
      'Connect to why you want THIS role — make it specific to the position',
    ],
    narrative: '',
    followUps: [
      'What moment confirmed nursing was the right career for you?',
      'How has your nursing philosophy evolved since you started?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: null,
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q2
  {
    id: 'ng_2',
    question: 'Tell me about a time you had to advocate for a patient.',
    category: 'Behavioral',
    specialty: 'general',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['advocate for a patient', 'patient advocacy', 'spoke up for a patient', 'went to bat for a patient'],
    bullets: [
      'SITUATION: Set the scene — what was happening with the patient that required advocacy?',
      'TASK: What specifically needed to change, and why were you the one to act?',
      'ACTION: Who did you communicate with? How did you frame the concern? What communication strategies did you use?',
      'RESULT: What changed for the patient? What did you learn about advocating within the healthcare team?',
    ],
    narrative: '',
    followUps: [
      'How did you handle any pushback from other members of the care team?',
      'What would you do differently in that situation now?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANA Code of Ethics for Nurses, Provision 3: Advocacy',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q3
  {
    id: 'ng_3',
    question: 'Describe a time you made an error or near-miss. How did you handle it?',
    category: 'Behavioral',
    specialty: 'general',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['made an error', 'near miss', 'medication error', 'mistake', 'tell me about a mistake'],
    bullets: [
      'SITUATION: What happened — be honest and specific (no patient identifiers)',
      'TASK: What was at stake, and what was your immediate responsibility?',
      'ACTION: How did you report it? What steps did you take to mitigate harm? Did you use your chain of command?',
      'RESULT: Patient outcome, what changed in your practice, any system improvements that resulted',
    ],
    narrative: '',
    followUps: [
      'How has this experience changed your practice day-to-day?',
      'What systems or double-checks do you now rely on to prevent errors?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'Just Culture principles; IOM To Err is Human',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q4
  {
    id: 'ng_4',
    question: 'How do you prioritize when you have multiple patients with competing needs?',
    category: 'Clinical Judgment',
    specialty: 'general',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'star',
    keywords: ['prioritize patients', 'competing needs', 'multiple patients', 'triage', 'how do you prioritize'],
    bullets: [
      'SITUATION: Describe the scenario — how many patients, what were the competing needs?',
      "TASK: What framework guided your prioritization? (ABC, Maslow's, acuity-based)",
      'ACTION: Walk through your clinical reasoning step by step — what did you assess first and why?',
      'RESULT: How did it turn out? What did you learn about prioritization under pressure?',
    ],
    narrative: '',
    followUps: [
      'What prioritization framework do you rely on most and why?',
      'Tell me about a time your priorities shifted unexpectedly mid-shift.',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'NCSBN Clinical Judgment Measurement Model (CJMM)',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q5 — Erin note: Trigger this if user is not consistently formatting with SBAR
  {
    id: 'ng_5',
    question: 'Describe a situation where you used SBAR to communicate critical information.',
    category: 'Communication',
    specialty: 'general',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'SBAR',
    responseFramework: 'sbar',
    keywords: ['SBAR', 'communicate with a doctor', 'called a physician', 'critical information', 'handoff', 'bedside report'],
    bullets: [
      'SITUATION: What was happening with the patient that required urgent communication?',
      'BACKGROUND: What relevant history and context did you include?',
      'ASSESSMENT: What was your clinical assessment of what was happening?',
      'RECOMMENDATION: What did you recommend and what was the response?',
    ],
    narrative: '',
    followUps: [
      "How do you handle it when your recommendation isn't followed?",
      'How do you adapt SBAR for different audiences — physician vs. charge nurse vs. family?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'IHI SBAR Communication Framework',
      reviewDate: '2026-02-12',
      status: 'approved',
      triggerCondition: 'sbar_coaching',  // Erin: trigger if user not consistently formatting with SBAR
    },
  },

  // Q6
  {
    id: 'ng_6',
    question: 'Tell me about a time you had a conflict with a colleague or provider. How did you resolve it?',
    category: 'Behavioral',
    specialty: 'general',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['conflict with a colleague', 'disagreement with coworker', 'difficult coworker', 'conflict resolution', 'interprofessional conflict'],
    bullets: [
      'SITUATION: What was the conflict, and who was involved? (Keep it professional, no names)',
      'TASK: Why was it important to resolve — especially regarding patient care?',
      'ACTION: How did you approach the conversation? What communication strategies did you use (active listening, I-statements)?',
      'RESULT: How was it resolved? What did the working relationship look like afterward?',
    ],
    narrative: '',
    followUps: [
      "How do you handle it when the conflict can't be fully resolved?",
      'What did you learn about yourself from that experience?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: null,
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q7
  {
    id: 'ng_7',
    question: 'Why are you interested in this specialty and this unit specifically?',
    category: 'Motivation',
    specialty: 'general',
    priority: 'High',
    difficulty: 'beginner',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['why this specialty', 'why this unit', 'why do you want to work here', 'what drew you', 'interested in this area'],
    bullets: [
      'Personal connection: What experience sparked your interest in this specialty?',
      'Clinical alignment: How does your training and clinical experience prepare you?',
      'Growth: What do you specifically hope to learn or develop here?',
      'Contribution: What unique perspective or skill do you bring to this team?',
    ],
    narrative: '',
    followUps: [
      'Where do you see yourself in this specialty in 3-5 years?',
      'What specific aspect of this unit excites you most?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: null,
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q8
  {
    id: 'ng_8',
    question: 'How do you handle end-of-life care and supporting grieving families?',
    category: 'Communication',
    specialty: 'general',
    priority: 'Medium',
    difficulty: 'advanced',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['end of life', 'death', 'dying patient', 'grieving family', 'palliative', 'comfort care', 'hospice'],
    bullets: [
      'SITUATION: Describe a specific end-of-life situation you navigated',
      'TASK: What did the patient and family need from you — clinically and emotionally?',
      'ACTION: How did you provide comfort, communicate prognosis, and support autonomy? How did you take care of yourself afterward?',
      'RESULT: How did the family respond? What did you learn about presence in those moments?',
    ],
    narrative: '',
    followUps: [
      'How do you take care of your own emotional well-being after losing a patient?',
      'How do you approach conversations about code status or goals of care?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANA Position Statement on End-of-Life Care',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q9 — Erin note: Trigger this for new grads, not experienced nurses
  {
    id: 'ng_9',
    question: 'Describe your experience with electronic health records and clinical documentation.',
    category: 'Technical',
    specialty: 'general',
    priority: 'Medium',
    difficulty: 'beginner',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['EHR', 'electronic health record', 'charting', 'documentation', 'Epic', 'Cerner', 'Meditech'],
    bullets: [
      'Name the specific EHR systems you have experience with (Epic, Cerner, Meditech, etc.)',
      'Describe your documentation philosophy — how do you ensure accuracy and timeliness?',
      'Share how you handle documentation during high-acuity situations',
      'Mention any specific modules or workflows you are proficient with',
    ],
    narrative: '',
    followUps: [
      'How do you handle charting when things get extremely busy?',
      'How do you ensure your documentation would hold up legally?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: null,
      reviewDate: '2026-02-12',
      status: 'approved',
      triggerCondition: 'new_grad_only',  // Erin: trigger for new grads, not experienced nurses
    },
  },

  // Q10 — REWRITTEN per Erin: added "And how did you respond?" to question text
  {
    id: 'ng_10',
    question: 'Tell me about a time you received critical feedback from a supervisor or peer. How did you respond?',
    category: 'Behavioral',
    specialty: 'general',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['critical feedback', 'constructive criticism', 'negative feedback', 'preceptor feedback', 'performance review'],
    bullets: [
      'SITUATION: What was the feedback, and who gave it? (Be specific but professional)',
      'TASK: Why was it hard to hear? What was your initial reaction?',
      'ACTION: How did you process it? What specific changes did you make?',
      'RESULT: How did your practice improve? Did you follow up with the person who gave feedback?',
    ],
    narrative: '',
    followUps: [
      'How do you distinguish between feedback you should act on vs. feedback you should consider but may not agree with?',
      'How do you seek out feedback proactively?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: null,
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Rewritten per Erin — added "And how did you respond?" to question text',
    },
  },

  // Q11
  {
    id: 'ng_11',
    question: 'How do you communicate with families when a patient has a poor prognosis?',
    category: 'Communication',
    specialty: 'general',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['family communication', 'poor prognosis', 'bad news', 'family meeting', 'goals of care', 'withdrawal of care'],
    bullets: [
      'SITUATION: Describe the context — what was happening with the patient?',
      'TASK: What did the family need from you? How did you balance honesty with compassion?',
      'ACTION: How did you communicate? What language did you use? How did you create space for questions and emotions?',
      'RESULT: How did the family respond? What feedback did you receive? How did you manage your own emotions?',
    ],
    narrative: '',
    followUps: [
      'How do you handle family members who are in denial about a prognosis?',
      'How do you coordinate communication between the interdisciplinary team and family?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANA Standard: Communication; AACN Synergy Model: Caring Practices',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q12
  {
    id: 'ng_12',
    question: 'How do you manage a patient refusing care or threatening to leave against medical advice (AMA)?',
    category: 'Communication',
    specialty: 'general',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['AMA', 'against medical advice', 'refusing care', 'patient refusal', 'right to refuse', 'patient autonomy', 'patient rights'],
    bullets: [
      'SITUATION: Describe the context — what was the patient refusing, and why?',
      'TASK: What were the competing priorities — patient autonomy vs. safety? What was at stake clinically?',
      'ACTION: How did you communicate the risks? How did you balance advocacy with respecting their right to refuse? Who else did you involve (charge nurse, provider, social work)?',
      'RESULT: What happened? If they left AMA, how did you ensure proper documentation and discharge education? If they stayed, what changed their mind?',
    ],
    narrative: '',
    followUps: [
      'How do you handle the emotional frustration when a patient makes a decision you believe is harmful to themselves?',
      'What documentation is critical when a patient leaves AMA?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANA Code of Ethics — Provision 1 (Respect for Autonomy); Joint Commission Patient Rights Standards',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q13
  {
    id: 'ng_13',
    question: 'How do you decide what tasks to delegate, and ensure they\'re completed safely?',
    category: 'Clinical Judgment',
    specialty: 'general',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['delegation', 'delegate tasks', 'CNA', 'LPN', 'tech', 'supervise', 'five rights of delegation'],
    bullets: [
      'Understands scope of practice for CNAs, LPNs, techs',
      'Uses the 5 Rights of Delegation (right task, right circumstance, right person, right direction, right supervision)',
      'Follows up and verifies completion',
      'Takes responsibility for delegated tasks',
    ],
    narrative: '',
    followUps: [
      'What do you do when a CNA pushes back on a task you\'ve delegated?',
      'Describe a time delegation didn\'t go as planned. What did you learn?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANA Standard: Resource Stewardship; NCSBN: Five Rights of Delegation',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q14
  {
    id: 'ng_14',
    question: 'Tell me about a time you dealt with a threatening or unsafe situation involving a patient or visitor.',
    category: 'Behavioral',
    specialty: 'general',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['workplace violence', 'threatening patient', 'unsafe situation', 'security', 'aggressive visitor', 'safety'],
    bullets: [
      'Describes de-escalation techniques used',
      'Shows awareness of personal safety and team safety',
      'Mentions institutional resources (security, behavioral response teams)',
      'Demonstrates appropriate documentation and reporting',
    ],
    narrative: '',
    followUps: [
      'What de-escalation techniques do you use?',
      'How do you support yourself or colleagues after a violent incident?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ENA Position Statement: Workplace Violence; Joint Commission: Workplace Violence Prevention',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q15 — REWRITTEN per Erin: clarified objective — asking about quality improvement projects on the unit
  {
    id: 'ng_15',
    question: 'Tell me about a time you used evidence-based practice to improve care delivery on your unit.',
    category: 'Behavioral',
    specialty: 'general',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['evidence-based practice', 'EBP', 'quality improvement', 'research', 'best practice', 'practice change', 'QI project'],
    bullets: [
      'SITUATION: Identify the clinical question, practice gap, or quality issue you observed on your unit',
      'TASK: Describe how you searched for or applied research evidence to address it',
      'ACTION: Walk through how you implemented the practice change — who was involved, what was the process?',
      'RESULT: What was the measurable outcome? How did it affect patient care on the unit?',
    ],
    narrative: '',
    followUps: [
      'How do you stay current with nursing research in your specialty?',
      'What resources do you use for evidence-based practice?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANA Standard: Evidence-Based Practice; AACN: Clinical Inquiry',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Rewritten per Erin — clarified to focus on QI projects on the unit, not bedside practice changes',
    },
  },

  // Q16 — REWRITTEN per Erin: broadened to "variety of patient populations" instead of "differed from your own"
  {
    id: 'ng_16',
    question: 'Describe caring for a variety of patient populations with different cultural backgrounds, languages, or beliefs.',
    category: 'Communication',
    specialty: 'general',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['cultural competence', 'interpreter', 'language barrier', 'cultural sensitivity', 'diverse patients', 'health equity'],
    bullets: [
      'Shows respect for cultural practices and preferences',
      'Uses interpreter services when needed (not family members for medical interpretation)',
      'Adapts care plan to accommodate cultural/spiritual needs',
      'Demonstrates humility and willingness to learn',
    ],
    narrative: '',
    followUps: [
      'How do you handle a situation where a cultural practice conflicts with the medical plan?',
      'What do you do when an interpreter isn\'t immediately available?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANA Standard: Culturally Congruent Practice; NCSBN: Environmental Factors',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Rewritten per Erin — broadened to "variety of patient populations" instead of comparing to nurse\'s own background',
    },
  },

  // Q17 — Cross-listed from ICU per Erin: ethical dilemmas happen everywhere, not just ICU
  {
    id: 'ng_17',
    question: 'Tell me about a time you faced an ethical dilemma. How did you navigate it?',
    category: 'Behavioral',
    specialty: 'general',
    priority: 'Medium',
    difficulty: 'advanced',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['ethical dilemma', 'ethics', 'moral distress', 'right thing to do', 'ethics committee'],
    bullets: [
      'Describes the specific ethical tension',
      'Shows use of institutional resources (ethics committee, chaplain, social work)',
      'Demonstrates patient advocacy',
      'Reflects on what was learned',
    ],
    narrative: '',
    followUps: [
      'Have you ever disagreed with a provider\'s plan of care? How did you handle it?',
      'How do you balance following orders with your own clinical judgment?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AACN Synergy Model: Advocacy and Moral Agency; ANA Code of Ethics',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Cross-listed from ICU to General per Erin — ethical dilemmas are not unique to the ICU',
    },
  },

  // Q18 — Cross-listed from ICU per Erin: hemodynamic interpretation is relevant across specialties
  {
    id: 'ng_18',
    question: 'Describe interpreting hemodynamic data and using it to advocate for a change in the plan of care.',
    category: 'Technical',
    specialty: 'general',
    priority: 'Medium',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['hemodynamic', 'MAP', 'CVP', 'blood pressure', 'trending vitals', 'advocate for change'],
    bullets: [
      'Demonstrates familiarity with hemodynamic parameters (MAP, CVP, SVR, CO/CI)',
      'Shows ability to interpret trends, not just numbers',
      'Describes how findings were communicated to the team',
      'Links data to clinical decision-making',
    ],
    narrative: '',
    followUps: [
      'How do you communicate hemodynamic concerns to a provider who seems unconcerned?',
      'Describe a time hemodynamic data changed the plan of care.',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CCRN Domain: Cardiovascular; AACN: Clinical Judgment + Advocacy',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Cross-listed from ICU to General per Erin — good question across ED, Med-Surg, and ICU',
    },
  },

  // ============================================================
  // ED — Emergency Department (Q17-Q24 in Erin's numbering)
  // ============================================================

  // Q17/ED-1
  {
    id: 'ned_1',
    question: 'The ED sees everything — trauma, psychiatric crises, labor, pediatrics. How do you adapt your care approach with very different populations back-to-back?',
    category: 'Clinical Judgment',
    specialty: 'ed',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'ABC',
    responseFramework: 'star',
    keywords: ['diverse populations', 'ED variety', 'adapt care', 'versatility', 'back-to-back', 'different patients'],
    bullets: [
      'Shows awareness of the breadth of ED patient populations',
      'Demonstrates ability to shift assessment approach by population',
      'Mentions prioritization and resource allocation',
      'Shows comfort with clinical versatility',
    ],
    narrative: '',
    followUps: [
      'How do you adjust your assessment when a pediatric patient arrives vs. a geriatric patient?',
      'What\'s the most challenging population shift you\'ve had to make in a single shift?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'BCEN CEN Domains 1-10; ENA Core Curriculum',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q18/ED-2
  {
    id: 'ned_2',
    question: 'Walk me through how you manage a trauma patient from arrival to stabilization.',
    category: 'Clinical Judgment',
    specialty: 'ed',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'ABC',
    responseFramework: 'sbar',
    keywords: ['trauma', 'trauma patient', 'stabilization', 'ABCDE', 'primary survey', 'trauma team'],
    bullets: [
      'Describes primary survey (ABCDE) approach',
      'Mentions team roles and communication',
      'Addresses rapid assessment and intervention',
      'Shows awareness of documentation during a trauma',
    ],
    narrative: '',
    followUps: [
      'How do you communicate findings to the trauma team using SBAR?',
      'Describe a trauma where the initial presentation was misleading.',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ENA TNCC; BCEN CEN Domain: Cardiovascular/Respiratory/Neurological',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q19/ED-3
  {
    id: 'ned_3',
    question: 'How do you care for patients who present to the ED for issues that could be managed in primary care?',
    category: 'Communication',
    specialty: 'ed',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['primary care', 'non-emergent', 'low acuity', 'ED utilization', 'patient education'],
    bullets: [
      'Shows empathy — understands why patients come (access barriers, uninsured, fear)',
      'Treats every patient with respect regardless of acuity',
      'Provides appropriate education about community resources',
      'Avoids being judgmental about ED utilization',
    ],
    narrative: '',
    followUps: [
      'How do you balance compassion with efficient resource use?',
      'What resources do you connect these patients to at discharge?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'BCEN CEN Domain 10: Patient Safety/Satisfaction; ENA Core Curriculum',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q20/ED-4 — REWRITTEN per Erin: changed to "informing the infection control team and implementing isolation"
  {
    id: 'ned_4',
    question: 'Describe managing patients with suspected infectious diseases in the ED, including informing the infection control team and implementing isolation.',
    category: 'Clinical Judgment',
    specialty: 'ed',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'SBAR',
    responseFramework: 'sbar',
    keywords: ['infectious disease', 'isolation', 'PPE', 'infection control', 'communicable disease', 'infection prevention'],
    bullets: [
      'Describes rapid isolation and PPE protocols',
      'Mentions communication with infection prevention team',
      'Shows awareness of protecting other patients and staff',
      'Addresses documentation and reporting requirements',
    ],
    narrative: '',
    followUps: [
      'How do you handle a situation where isolation rooms are full but you suspect an infectious patient?',
      'What has changed about your infection prevention practice since COVID?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'BCEN CEN Domain 9: Environment/Toxicology/Communicable Diseases; CDC Guidelines',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Rewritten per Erin — changed "isolation and team safety" to "informing the infection control team and implementing isolation"',
    },
  },

  // Q21/ED-5
  {
    id: 'ned_5',
    question: 'Tell me about caring for a patient experiencing a psychiatric or mental health crisis in the ED.',
    category: 'Communication',
    specialty: 'ed',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['psychiatric crisis', 'mental health', 'ED psych', 'behavioral emergency', 'psych hold'],
    bullets: [
      'Demonstrates therapeutic communication',
      'Describes de-escalation techniques',
      'Shows awareness of safety (patient and staff)',
      'Mentions collaboration with psychiatric services/social work',
      'Addresses patient dignity in a busy ED environment',
    ],
    narrative: '',
    followUps: [
      'How do you maintain safety while being therapeutic?',
      'What do you do when psychiatric resources aren\'t immediately available?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'BCEN CEN Domain 5: Mental Health Emergencies; ENA Position Statement: Workplace Violence',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q22/ED-6
  {
    id: 'ned_6',
    question: 'Describe how you identify and respond to a patient showing signs of sepsis in the ED.',
    category: 'Clinical Judgment',
    specialty: 'ed',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['sepsis', 'sepsis screening', 'sepsis bundle', 'lactate', 'blood cultures', 'early recognition'],
    bullets: [
      'Recognizes early sepsis indicators (fever, tachycardia, hypotension, altered mental status)',
      'Describes initiating the sepsis bundle (blood cultures, lactate, antibiotics, fluid resuscitation)',
      'Shows urgency and time-sensitivity awareness',
      'Communicates findings clearly to the team',
    ],
    narrative: '',
    followUps: [
      'What do you do when a patient\'s sepsis screening is positive but the provider hasn\'t responded yet?',
      'How do you differentiate sepsis from other causes of similar symptoms?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'BCEN CEN Domain 6: Medical Emergencies; CMS SEP-1 Bundle',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q23/ED-7
  {
    id: 'ned_7',
    question: 'How do you assess and manage a patient with a suspected fracture or orthopedic injury?',
    category: 'Clinical Judgment',
    specialty: 'ed',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['fracture', 'orthopedic', 'musculoskeletal', 'splint', 'compartment syndrome', 'neurovascular'],
    bullets: [
      'Describes neurovascular assessment (5 P\'s: pain, pallor, pulselessness, paresthesia, paralysis)',
      'Mentions pain management approach',
      'Shows awareness of compartment syndrome risk',
      'Addresses splinting/immobilization and patient education',
    ],
    narrative: '',
    followUps: [
      'What are the signs that concern you for compartment syndrome?',
      'How do you manage pain in a patient who is drug-seeking vs. one who is in genuine distress?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'BCEN CEN Domain 7: Musculoskeletal and Wound Emergencies',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q24/ED-8
  {
    id: 'ned_8',
    question: 'Tell me about your experience managing a pregnant patient presenting to the ED.',
    category: 'Clinical Judgment',
    specialty: 'ed',
    priority: 'Medium',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['pregnant patient', 'OB emergency', 'ectopic', 'pre-eclampsia', 'emergency delivery', 'pregnant in ED'],
    bullets: [
      'Shows awareness that pregnancy changes normal assessment parameters',
      'Describes approach to common OB emergencies (ectopic, pre-eclampsia, emergency delivery)',
      'Mentions coordination with L&D and OB team',
      'Demonstrates understanding of two-patient care (mother and fetus)',
    ],
    narrative: '',
    followUps: [
      'What do you do if a patient arrives in active labor and cannot be transferred to L&D?',
      'How do you handle a pregnant patient who presents with vaginal bleeding?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'BCEN CEN Domain 4: GYN/OB Emergencies; ENA Core Curriculum',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // ============================================================
  // ICU — Intensive Care Unit (Q25-Q32)
  // ============================================================

  // Q25/ICU-1
  {
    id: 'nicu_1',
    question: 'Describe a time you noticed a subtle change in a critically ill patient that others missed.',
    category: 'Clinical Judgment',
    specialty: 'icu',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['subtle change', 'noticed something', 'clinical intuition', 'caught a change', 'deteriorating patient'],
    bullets: [
      'SITUATION: What was the patient baseline, and what subtle change did you notice?',
      'TASK: Why was this finding significant? What could it have indicated?',
      'ACTION: What did you do with this information? Who did you notify and how (SBAR)?',
      'RESULT: What was the outcome? How did your early recognition impact the patient?',
    ],
    narrative: '',
    followUps: [
      'How do you stay vigilant during a 12-hour shift with multiple critically ill patients?',
      'What assessment techniques do you use to catch early deterioration?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AACN Synergy Model: Clinical Judgment; NCSBN: Recognize Cues + Analyze Cues',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q26/ICU-2 — Also cross-listed to General (ng_18) per Erin
  {
    id: 'nicu_2',
    question: 'Describe interpreting hemodynamic data and using it to advocate for a change in the plan of care.',
    category: 'Technical',
    specialty: 'icu',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['hemodynamic', 'MAP', 'CVP', 'SVR', 'cardiac output', 'hemodynamic monitoring'],
    bullets: [
      'Demonstrates familiarity with hemodynamic parameters (MAP, CVP, SVR, CO/CI)',
      'Shows ability to interpret trends, not just numbers',
      'Describes how findings were communicated to the team',
      'Links data to clinical decision-making',
    ],
    narrative: '',
    followUps: [
      'How do you communicate hemodynamic concerns to a provider who seems unconcerned?',
      'Describe a time hemodynamic data changed the plan of care.',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CCRN Domain: Cardiovascular (17%); AACN: Clinical Judgment + Advocacy',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Also cross-listed to General and applicable to ED/Med-Surg per Erin',
    },
  },

  // Q27/ICU-3
  {
    id: 'nicu_3',
    question: 'Tell me about managing ventilated patients, including assessing readiness for weaning.',
    category: 'Technical',
    specialty: 'icu',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['ventilator', 'weaning', 'extubation', 'FiO2', 'PEEP', 'ABG', 'spontaneous breathing trial'],
    bullets: [
      'Describes ventilator settings awareness (modes, FiO2, PEEP)',
      'Shows understanding of weaning protocols and readiness criteria',
      'Mentions ABG interpretation',
      'Addresses patient comfort and sedation management',
    ],
    narrative: '',
    followUps: [
      'What do you do when a patient fails a spontaneous breathing trial?',
      'How do you manage a patient who is anxious about extubation?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CCRN Domain: Respiratory/Pulmonary (15%); AACN Standards',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q28/ICU-4
  {
    id: 'nicu_4',
    question: 'Tell me about managing multiple vasoactive drips and devices simultaneously.',
    category: 'Technical',
    specialty: 'icu',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['drips', 'infusions', 'vasoactive', 'titration', 'multiple devices', 'pump programming'],
    bullets: [
      'Shows knowledge of titration protocols',
      'Demonstrates prioritization when multiple parameters are changing',
      'Describes monitoring approach and frequency',
      'Addresses safety (double-check, pump programming, line management)',
    ],
    narrative: '',
    followUps: [
      'How do you prioritize when two patients need simultaneous drip adjustments?',
      'Describe a time a medication error was narrowly avoided. What happened?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CCRN Domain: Cardiovascular + Multisystem; AACN: Systems Thinking',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q29/ICU-5
  {
    id: 'nicu_5',
    question: 'Describe managing a patient progressing from sepsis to multiorgan dysfunction.',
    category: 'Clinical Judgment',
    specialty: 'icu',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['sepsis', 'multiorgan dysfunction', 'MODS', 'organ failure', 'CRRT', 'deteriorating'],
    bullets: [
      'Recognizes progressive organ failure indicators',
      'Describes escalation of care (pressors, CRRT, ventilator support)',
      'Shows team communication during deterioration',
      'Addresses family communication during critical changes',
    ],
    narrative: '',
    followUps: [
      'How do you communicate the severity of the situation to a family member?',
      'When do you advocate for a goals-of-care conversation?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CCRN Domain: Multisystem (14%); NCSBN: All 6 cognitive steps',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q30/ICU-6
  {
    id: 'nicu_6',
    question: 'Describe transitioning a patient from aggressive treatment to comfort care.',
    category: 'Communication',
    specialty: 'icu',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['comfort care', 'withdrawal of care', 'palliative', 'goals of care', 'end of life ICU'],
    bullets: [
      'Describes supporting the family through the decision',
      'Shows collaboration with palliative care team',
      'Addresses symptom management during comfort care',
      'Demonstrates emotional intelligence and presence',
    ],
    narrative: '',
    followUps: [
      'How do you handle your own emotions after a patient death?',
      'What do you do when the family and the medical team disagree about goals of care?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CCRN Professional Practice (20%): End-of-Life/Palliative; AACN: Caring Practices + Advocacy',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q31/ICU-7 — Also cross-listed to General (ng_17) per Erin
  {
    id: 'nicu_7',
    question: 'Tell me about an ethical dilemma in the ICU. How did you navigate it?',
    category: 'Behavioral',
    specialty: 'icu',
    priority: 'Medium',
    difficulty: 'advanced',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['ethical dilemma', 'ICU ethics', 'moral distress', 'ethics committee', 'futile care'],
    bullets: [
      'Describes the specific ethical tension',
      'Shows use of institutional resources (ethics committee, chaplain, social work)',
      'Demonstrates patient advocacy',
      'Reflects on what was learned',
    ],
    narrative: '',
    followUps: [
      'Have you ever disagreed with a provider\'s plan of care? How did you handle it?',
      'How do you balance following orders with your own clinical judgment?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AACN Synergy Model: Advocacy and Moral Agency; CCRN: Ethical Practice',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Also cross-listed to General per Erin — ethical dilemmas are not unique to the ICU',
    },
  },

  // Q32/ICU-8
  {
    id: 'nicu_8',
    question: 'How do you assess for and manage delirium in your ICU patients?',
    category: 'Clinical Judgment',
    specialty: 'icu',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'star',
    keywords: ['delirium', 'CAM-ICU', 'RASS', 'sedation', 'ICU delirium', 'confusion'],
    bullets: [
      'Uses validated assessment tools (CAM-ICU, RASS)',
      'Describes non-pharmacological interventions first (reorientation, mobility, sleep hygiene)',
      'Addresses sedation protocols and daily sedation vacations',
      'Communicates delirium findings to the team',
    ],
    narrative: '',
    followUps: [
      'How do you differentiate delirium from dementia in an ICU patient?',
      'What role does the nurse play in preventing ICU delirium?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CCRN Domain: Neurological/Psychosocial (14%); AACN Standards',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // ============================================================
  // OR — Operating Room (Q33-Q38)
  // ============================================================

  // Q33/OR-1
  {
    id: 'nor_1',
    question: 'Walk me through surgical counts and what you do when a count is off.',
    category: 'Technical',
    specialty: 'or',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['surgical count', 'time-out', 'wrong site surgery', 'patient safety', 'surgical checklist', 'universal protocol'],
    bullets: [
      'Describes standardized counting procedure (initial, during handoffs, final before closure)',
      'Explains actions when count is discrepant (stop, re-count, notify surgeon, imaging if needed)',
      'Shows understanding of risk factors (emergent cases, long procedures, blood loss)',
      'Demonstrates patient advocacy under pressure',
    ],
    narrative: '',
    followUps: [
      'Have you ever had a count discrepancy? What happened?',
      'What do you do if the surgeon wants to close and you haven\'t reconciled the count?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CNOR SA3: Intraoperative Management; AORN RSI Prevention Guideline',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q34/OR-2 — Erin note: added "and how you would respond"
  {
    id: 'nor_2',
    question: 'Tell me about identifying a break in sterile technique during a procedure and how you responded.',
    category: 'Clinical Judgment',
    specialty: 'or',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'sbar',
    keywords: ['sterile technique', 'break in sterility', 'contamination', 'aseptic technique', 'scrub nurse'],
    bullets: [
      'SITUATION: Describe a time you identified a break in sterile technique',
      'TASK: What was at stake — what could have happened if it went unnoticed?',
      'ACTION: How did you address it? How did you communicate with the surgical team?',
      'RESULT: What happened next? How did the team respond?',
    ],
    narrative: '',
    followUps: [
      'What do you do when a surgeon dismisses your concern about sterility?',
      'How do you maintain sterile field awareness during a 6-hour case?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CNOR SA5: Infection Prevention (16%); AORN Sterile Technique Guideline',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Erin note: added "and how you responded" to question text',
    },
  },

  // Q35/OR-3
  {
    id: 'nor_3',
    question: 'Describe responding to an intraoperative emergency — malignant hyperthermia, hemorrhage, or cardiac arrest.',
    category: 'Clinical Judgment',
    specialty: 'or',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['intraoperative emergency', 'malignant hyperthermia', 'OR hemorrhage', 'cardiac arrest OR', 'MH crisis'],
    bullets: [
      'Describes a specific emergency situation',
      'Shows clear role identification and team coordination',
      'Demonstrates knowledge of emergency protocols',
      'Addresses post-event debriefing and documentation',
    ],
    narrative: '',
    followUps: [
      'What is your role as the circulating nurse during an MH crisis?',
      'How does your team prepare for emergencies that rarely happen?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CNOR SA6: Emergency Situations (10%); AORN Guidelines',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q36/OR-4
  {
    id: 'nor_4',
    question: 'The patient can\'t speak under anesthesia. How do you advocate for your patient in the OR?',
    category: 'Behavioral',
    specialty: 'or',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['patient advocacy', 'anesthesia', 'patient voice', 'OR advocacy', 'circulating nurse'],
    bullets: [
      'Describes specific advocacy actions (positioning safety, temperature regulation, dignity)',
      'Shows awareness that the circulating nurse IS the patient\'s voice',
      'Mentions communication with the team about patient needs',
      'Addresses informed consent verification and patient preferences',
    ],
    narrative: '',
    followUps: [
      'Have you ever stopped a procedure because of a safety concern?',
      'How do you ensure a patient\'s wishes from the pre-op conversation are honored?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CNOR SA3: Patient Dignity/Privacy; AORN Standard: Advocacy',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q37/OR-5
  {
    id: 'nor_5',
    question: 'How do you communicate effectively with the surgical team, especially raising a concern during a critical moment?',
    category: 'Communication',
    specialty: 'or',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['OR communication', 'speaking up', 'surgical team', 'CUS framework', 'hierarchy', 'assertive communication'],
    bullets: [
      'Uses structured communication (CUS framework: Concerned, Uncomfortable, Safety issue)',
      'Describes assertive but respectful communication',
      'Shows awareness of hierarchy in the OR and how to navigate it',
      'Mentions time-out and surgical pause practices',
    ],
    narrative: '',
    followUps: [
      'What do you do when a surgeon is dismissive of your concern?',
      'How do you handle conflict between the surgeon and anesthesia team?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CNOR SA4: Communication (11%); AORN Standard: Communication; AHRQ TeamSTEPPS',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q38/OR-6
  {
    id: 'nor_6',
    question: 'Describe your experience with complex surgical equipment — robotics, laparoscopic, or specialized devices.',
    category: 'Technical',
    specialty: 'or',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['surgical equipment', 'robotics', 'laparoscopic', 'da Vinci', 'equipment troubleshooting'],
    bullets: [
      'Shows familiarity with equipment setup and troubleshooting',
      'Describes how you learn new technology/equipment',
      'Addresses equipment failure and backup plans',
      'Mentions manufacturer specifications and safety protocols',
    ],
    narrative: '',
    followUps: [
      'How do you prepare when your facility introduces new surgical technology?',
      'Describe a time equipment malfunctioned during a case. What did you do?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CNOR SA3: Equipment Operation; AORN Guidelines',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // ============================================================
  // L&D — Labor & Delivery (Q39-Q44)
  // ============================================================

  // Q39/LD-1
  {
    id: 'nld_1',
    question: 'How do you handle unexpected changes to a birth plan — like when a vaginal delivery requires an emergency cesarean?',
    category: 'Communication',
    specialty: 'ld',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['birth plan changed', 'unexpected c-section', 'labor complication', 'supporting the patient', 'birth plan'],
    bullets: [
      'Shows empathy for the patient\'s emotional response',
      'Describes clear communication about why the change is necessary',
      'Maintains patient involvement in decision-making',
      'Supports the patient and partner through the transition',
    ],
    narrative: '',
    followUps: [
      'How do you balance urgency with keeping the patient informed?',
      'Describe a time a patient was resistant to a plan change. How did you handle it?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'NCC RNC-OB Domain 3: Labor and Birth (36%); AWHONN: Continuous Labor Support',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q40/LD-2
  {
    id: 'nld_2',
    question: 'Describe identifying a concerning fetal heart rate pattern and how you escalated it.',
    category: 'Clinical Judgment',
    specialty: 'ld',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['fetal monitoring', 'fetal heart rate', 'decelerations', 'non-reassuring', 'escalation', 'stat c-section'],
    bullets: [
      'Uses NICHD terminology (Category I, II, III)',
      'Describes specific interventions attempted (position change, oxygen, fluid bolus, stopping Pitocin)',
      'Shows clear SBAR communication to the provider',
      'Documents findings and interventions',
    ],
    narrative: '',
    followUps: [
      'How do you communicate your concern when a Category II tracing isn\'t resolving?',
      'What do you do when you and the provider disagree on the interpretation?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AWHONN FHM Standards; NCC RNC-OB Domain 2: Fetal Assessment (17%); NICHD 3-Tier System',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q41/LD-3
  {
    id: 'nld_3',
    question: 'Walk me through your response to a postpartum hemorrhage.',
    category: 'Clinical Judgment',
    specialty: 'ld',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['postpartum hemorrhage', 'PPH', 'blood loss', 'uterotonic', 'massive transfusion'],
    bullets: [
      'Describes quantified blood loss (QBL) measurement',
      'Shows knowledge of uterotonic cascade',
      'Demonstrates team communication and role identification',
      'Addresses massive transfusion protocol awareness',
    ],
    narrative: '',
    followUps: [
      'How do you recognize early signs of PPH before it becomes critical?',
      'What is your role in a hemorrhage vs. the provider\'s role?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'NCC RNC-OB Domain 4: Recovery/Postpartum (16%); AWHONN: QBL Measurement',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q42/LD-4 — Erin note: use "Pitocin" (pharmaceutical analog) instead of generic "oxytocin"
  {
    id: 'nld_4',
    question: 'Describe managing Pitocin administration during labor, including monitoring for complications.',
    category: 'Technical',
    specialty: 'ld',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['Pitocin', 'oxytocin', 'labor induction', 'augmentation', 'tachysystole', 'contraction monitoring'],
    bullets: [
      'Understands titration protocols and facility policy',
      'Describes continuous monitoring requirements',
      'Shows awareness of tachysystole/hyperstimulation and response',
      'Addresses patient communication about the process',
    ],
    narrative: '',
    followUps: [
      'What do you do when you observe tachysystole during Pitocin infusion?',
      'How do you balance the provider\'s order with your assessment findings?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AWHONN: 1:1 Staffing for Oxytocin; NCC RNC-OB Domain 3: Induction/Augmentation',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Erin note: use "Pitocin" (pharmaceutical analog) instead of generic "oxytocin" in question text',
    },
  },

  // Q43/LD-5
  {
    id: 'nld_5',
    question: 'How do you support a family experiencing a fetal loss or stillbirth?',
    category: 'Communication',
    specialty: 'ld',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['fetal loss', 'stillbirth', 'perinatal loss', 'bereavement', 'grieving family'],
    bullets: [
      'Shows compassion and presence',
      'Describes creating a supportive environment (memory-making, keepsakes)',
      'Mentions involvement of chaplain, social work, bereavement support',
      'Addresses cultural and individual preferences for grieving',
    ],
    narrative: '',
    followUps: [
      'How do you take care of yourself after supporting a family through loss?',
      'How do you support other patients on the unit while caring for a grieving family?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AWHONN Standards; NCC Professional Practice; ANA: Caring Practices',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q44/LD-6
  {
    id: 'nld_6',
    question: 'Describe managing a high-risk antepartum patient — pre-eclampsia, preterm labor, or gestational diabetes.',
    category: 'Clinical Judgment',
    specialty: 'ld',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['high-risk pregnancy', 'pre-eclampsia', 'preterm labor', 'gestational diabetes', 'magnesium sulfate', 'antepartum'],
    bullets: [
      'Shows knowledge of monitoring protocols for the specific condition',
      'Describes escalation when parameters change',
      'Addresses patient education and anxiety management',
      'Demonstrates interdisciplinary communication',
    ],
    narrative: '',
    followUps: [
      'How do you manage a patient on magnesium sulfate — what are you watching for?',
      'How do you educate a patient about bed rest or activity restrictions without being condescending?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'NCC RNC-OB Domain 1: Complications of Pregnancy (28%); AWHONN Standards',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // ============================================================
  // PEDS — Pediatrics (Q45-Q50)
  // ============================================================

  // Q45/PEDS-1
  {
    id: 'npeds_1',
    question: 'How do assessment and communication differ with pediatric patients compared to adults?',
    category: 'Clinical Judgment',
    specialty: 'peds',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['pediatric assessment', 'child patient', 'age-appropriate', 'family-centered care', 'developmental stage'],
    bullets: [
      'Adjusts communication by developmental stage (infant, toddler, school-age, adolescent)',
      'Uses age-appropriate assessment techniques',
      'Involves parents/caregivers appropriately',
      'Recognizes different vital sign norms by age',
    ],
    narrative: '',
    followUps: [
      'How do you approach a terrified 4-year-old who needs an IV?',
      'What changes about your assessment when the patient is nonverbal?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'PNCB CPN Domain 2: Assessment (35%); SPN: Developmentally Appropriate Care',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q46/PEDS-2
  {
    id: 'npeds_2',
    question: 'What are the key differences in clinical care for pediatric vs. adult patients, and how do they affect your practice?',
    category: 'Clinical Judgment',
    specialty: 'peds',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'star',
    keywords: ['pediatric dosing', 'weight-based', 'medication differences', 'pediatric protocols', 'clinical care differences', 'peds vs adult'],
    bullets: [
      'Weight-based medication dosing (not age-based)',
      'Different pharmacokinetics and physiologic responses',
      'Higher risk for medication errors — smaller margins',
      'Vital sign norms differ by age group',
    ],
    narrative: '',
    followUps: [
      'Describe your process for double-checking a pediatric medication dose.',
      'What\'s the most common medication safety concern in pediatrics?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'PNCB CPN Domain 3: Planning and Management (33%); SPN PNE Model',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q47/PEDS-3
  {
    id: 'npeds_3',
    question: 'How do you implement family-centered care when a parent\'s wishes conflict with the care team\'s recommendations?',
    category: 'Communication',
    specialty: 'peds',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['family-centered care', 'parent conflict', 'pediatric family', 'parent disagreement', 'care team conflict'],
    bullets: [
      'Parents as full partners in care planning',
      'Navigating disagreements with empathy and education',
      'Cultural sensitivity in family dynamics',
      'Including parents in procedures when appropriate',
    ],
    narrative: '',
    followUps: [
      'How do you handle a parent who refuses a recommended treatment for their child?',
      'Describe a time you had to set boundaries with an anxious parent.',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'SPN Core Competency: Child and Family-Centered Care; PNCB CPN Domain 3',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q48/PEDS-4
  {
    id: 'npeds_4',
    question: 'How do you assess and manage pain in a child who can\'t clearly verbalize what they\'re feeling?',
    category: 'Clinical Judgment',
    specialty: 'peds',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'star',
    keywords: ['pediatric pain', 'FLACC', 'FACES', 'pain assessment', 'child pain', 'nonverbal pain'],
    bullets: [
      'Uses age-appropriate pain scales (FLACC for preverbal, Wong-Baker FACES, numeric for older)',
      'Includes behavioral and physiological cues',
      'Describes both pharmacological and non-pharmacological approaches',
      'Involves caregivers in pain assessment',
    ],
    narrative: '',
    followUps: [
      'How do you manage pain differently in a 6-month-old vs. a 12-year-old?',
      'What do you do when a parent says their child isn\'t in pain but your assessment says otherwise?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'PNCB CPN Domain 2: Assessment; SPN Standards',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q49/PEDS-5
  {
    id: 'npeds_5',
    question: 'Tell me about mandatory reporting. Have you ever suspected abuse or neglect?',
    category: 'Behavioral',
    specialty: 'peds',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['mandatory reporting', 'child abuse', 'neglect', 'CPS', 'suspected abuse', 'patterned injuries'],
    bullets: [
      'Understands mandatory reporting obligations',
      'Describes assessment for abuse indicators (inconsistent history, patterned injuries, developmental red flags)',
      'Shows appropriate documentation practices',
      'Addresses emotional difficulty of reporting',
    ],
    narrative: '',
    followUps: [
      'How do you maintain a therapeutic relationship with a family while a report is being investigated?',
      'What do you do when your gut says something is wrong but the evidence is unclear?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'PNCB CPN Domain 4: Professional Responsibilities; SPN: Advocacy',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q50/PEDS-6
  {
    id: 'npeds_6',
    question: 'How do you navigate adolescent care around confidentiality, consent/assent, and sensitive topics?',
    category: 'Communication',
    specialty: 'peds',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['adolescent care', 'confidentiality', 'consent', 'assent', 'teen patient', 'sensitive topics'],
    bullets: [
      'Understands legal framework for minor consent and assent',
      'Creates space for private conversations with the adolescent',
      'Handles sensitive topics (substance use, sexual health, mental health)',
      'Balances parental involvement with adolescent autonomy',
    ],
    narrative: '',
    followUps: [
      'How do you handle an adolescent who tells you something in confidence that affects their safety?',
      'Describe how you build trust with a resistant teenage patient.',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'PNCB CPN Domain 3; SPN: Advocacy; AAP Guidelines',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // ============================================================
  // PSYCH — Behavioral Health (Q51-Q56)
  // ============================================================

  // Q51/PSYCH-1
  {
    id: 'npsych_1',
    question: 'Describe using therapeutic communication to de-escalate a patient in crisis.',
    category: 'Communication',
    specialty: 'psych',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['de-escalation', 'crisis intervention', 'therapeutic communication', 'agitated patient', 'psych emergency'],
    bullets: [
      'Names specific techniques (active listening, validation, setting limits, offering choices)',
      'Describes body language and environmental awareness',
      'Shows progression from verbal to other interventions',
      'Addresses team safety and patient dignity',
    ],
    narrative: '',
    followUps: [
      'What do you do when verbal de-escalation isn\'t working?',
      'How do you maintain a therapeutic relationship after a crisis event?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'APNA Standard: Therapeutic Relationship and Counseling; ANCC PMH-BC Domain III (46%)',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q52/PSYCH-2
  {
    id: 'npsych_2',
    question: 'Describe your approach to assessing suicide risk and developing a safety plan.',
    category: 'Clinical Judgment',
    specialty: 'psych',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'star',
    keywords: ['suicide risk', 'safety plan', 'suicidal ideation', 'risk assessment', 'SI'],
    bullets: [
      'Uses validated risk assessment tools',
      'Asks directly about suicidal ideation (shows comfort with the conversation)',
      'Describes collaborative safety planning',
      'Addresses environmental safety and documentation',
    ],
    narrative: '',
    followUps: [
      'How do you reassess suicide risk throughout a patient\'s stay?',
      'What do you do when a patient denies suicidal ideation but you still have concerns?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'APNA Suicide Prevention Competencies; ANCC PMH-BC Domain I (22%); Joint Commission NPSG',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q53/PSYCH-3
  {
    id: 'npsych_3',
    question: 'Tell me about managing a patient who became physically aggressive. Walk me through it.',
    category: 'Behavioral',
    specialty: 'psych',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['physically aggressive', 'restraints', 'seclusion', 'physical intervention', 'violent patient'],
    bullets: [
      'Describes least restrictive interventions first',
      'Shows de-escalation attempted before physical intervention',
      'Addresses team coordination and safety',
      'Mentions seclusion/restraint as last resort with appropriate documentation',
    ],
    narrative: '',
    followUps: [
      'How do you debrief with your team after a physical intervention?',
      'What does "least restrictive intervention" look like in practice?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'APNA Seclusion & Restraint Standards; ANCC PMH-BC Domain III: Crisis Management',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q54/PSYCH-4
  {
    id: 'npsych_4',
    question: 'How do you care for a patient with both a psychiatric disorder and substance use disorder?',
    category: 'Clinical Judgment',
    specialty: 'psych',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'star',
    keywords: ['dual diagnosis', 'substance use', 'co-occurring', 'addiction', 'withdrawal'],
    bullets: [
      'Demonstrates non-judgmental approach',
      'Shows understanding that both conditions need treatment simultaneously',
      'Describes withdrawal assessment and monitoring',
      'Addresses motivational interviewing techniques',
    ],
    narrative: '',
    followUps: [
      'How do you handle a patient who is using substances while admitted to your unit?',
      'What is your approach when a patient is resistant to treatment?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANCC PMH-BC Domain III; APNA Standards; NCSBN: Psychosocial Integrity',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q55/PSYCH-5
  {
    id: 'npsych_5',
    question: 'How do you contribute to maintaining a therapeutic milieu on a psychiatric unit?',
    category: 'Behavioral',
    specialty: 'psych',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['therapeutic milieu', 'milieu therapy', 'unit environment', 'group dynamics', 'psych unit culture'],
    bullets: [
      'Describes creating a safe, structured environment',
      'Shows understanding of group dynamics and patient interactions',
      'Addresses limit-setting while maintaining therapeutic relationships',
      'Mentions environmental safety (ligature risk, contraband)',
    ],
    narrative: '',
    followUps: [
      'How do you handle it when one patient\'s behavior is affecting the therapeutic environment for others?',
      'What does a healthy vs. unhealthy milieu look like?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'APNA Standard: Milieu Therapy; ANCC PMH-BC Domain III',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q56/PSYCH-6
  {
    id: 'npsych_6',
    question: 'Describe a situation involving involuntary commitment, patient rights, or confidentiality. How did you navigate it?',
    category: 'Behavioral',
    specialty: 'psych',
    priority: 'Medium',
    difficulty: 'advanced',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['involuntary commitment', 'patient rights', 'psych hold', 'duty to warn', 'confidentiality'],
    bullets: [
      'Shows knowledge of involuntary hold criteria',
      'Demonstrates respect for patient rights even during commitment',
      'Addresses confidentiality boundaries (duty to warn)',
      'Shows emotional complexity and ethical reasoning',
    ],
    narrative: '',
    followUps: [
      'How do you explain involuntary commitment to a patient who is angry about it?',
      'When does duty to warn override patient confidentiality?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANCC PMH-BC Domain III; APNA Standards; NCSBN: Ethics',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // ============================================================
  // MED-SURG (Q57-Q62)
  // ============================================================

  // Q57/MS-1
  {
    id: 'nms_1',
    question: 'How do you manage a full patient assignment and make sure nothing falls through the cracks?',
    category: 'Clinical Judgment',
    specialty: 'medsurg',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['time management', 'full assignment', 'organization', 'busy shift', 'patient load', 'med-surg nurse'],
    bullets: [
      'Describes organizational system (brain sheets, time management, rounding)',
      'Shows prioritization approach',
      'Addresses delegation to CNAs/techs',
      'Demonstrates how they catch things early before they become emergencies',
    ],
    narrative: '',
    followUps: [
      'How do you reprioritize when an admission or emergency disrupts your plan?',
      'What\'s your approach to the first 30 minutes of a shift?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AMSN Domain 1: Patient/Care Management; CMSRN: Diagnostic & Patient Monitoring',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q58/MS-2 — Erin note: added "and how did you respond"
  {
    id: 'nms_2',
    question: 'Tell me about recognizing a patient was deteriorating before it became obvious. What clues did you notice, and how did you respond?',
    category: 'Clinical Judgment',
    specialty: 'medsurg',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'sbar',
    keywords: ['deteriorating patient', 'rapid response', 'early warning', 'subtle changes', 'clinical intuition'],
    bullets: [
      'Describes subtle clinical changes noticed (altered mental status, trending vitals, urine output changes)',
      'Shows assessment-driven response, not just protocol-following',
      'Communicates using SBAR to the rapid response team or provider',
      'Links to outcome',
    ],
    narrative: '',
    followUps: [
      'How do you communicate concern to a provider when the vital signs are still "technically normal"?',
      'Have you ever activated a rapid response? Walk me through it.',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'CMSRN: Managing Rapidly Changing Situations; NCSBN: Recognize Cues + Analyze Cues',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Erin note: added "and how did you respond" to question text',
    },
  },

  // Q59/MS-3 — Erin note: added "and what care objectives/goals did you prioritize"
  {
    id: 'nms_3',
    question: 'Describe managing a post-operative patient — what you\'re assessing for in the first 24 hours and what care objectives you prioritized.',
    category: 'Technical',
    specialty: 'medsurg',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['post-operative', 'post-op care', 'surgical patient', 'first 24 hours', 'post-op complications'],
    bullets: [
      'Systematic assessment approach (airway, pain, surgical site, drains, activity, diet advancement)',
      'Watches for complications (bleeding, infection, DVT, ileus, atelectasis)',
      'Describes pain management approach',
      'Addresses patient education on recovery expectations',
    ],
    narrative: '',
    followUps: [
      'How do you differentiate expected post-op discomfort from a complication?',
      'Describe a post-op complication you caught early.',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AMSN Domain 1: Surgical/Procedural Management; CMSRN Field 2',
      reviewDate: '2026-02-12',
      status: 'approved',
      erinNote: 'Erin note: added "and what care objectives/goals did you prioritize" to question text',
    },
  },

  // Q60/MS-4
  {
    id: 'nms_4',
    question: 'How do you ensure medication safety, especially with high-alert medications?',
    category: 'Technical',
    specialty: 'medsurg',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['medication safety', 'high-alert medications', 'five rights', 'med reconciliation', 'smart pump'],
    bullets: [
      'Uses the 5 Rights consistently',
      'Describes additional safeguards for high-alert meds (independent double checks, smart pump limits)',
      'Addresses medication reconciliation',
      'Shows what they do when something doesn\'t feel right',
    ],
    narrative: '',
    followUps: [
      'Tell me about a time you caught a medication error before it reached the patient.',
      'How do you handle polypharmacy in an elderly patient?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AMSN Domain 1: Medication Management; CMSRN Field 2: Therapeutic Interventions',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q61/MS-5
  {
    id: 'nms_5',
    question: 'How do you assess and manage pain in patients with chronic pain or substance use history?',
    category: 'Clinical Judgment',
    specialty: 'medsurg',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: 'NCSBN_CJM',
    responseFramework: 'star',
    keywords: ['pain management', 'chronic pain', 'substance use', 'multimodal', 'opioid', 'non-pharmacological'],
    bullets: [
      'Uses multimodal approach (pharmacological + non-pharmacological)',
      'Believes and respects the patient\'s reported pain level',
      'Addresses bias and judgment in pain management',
      'Describes advocacy when pain isn\'t adequately managed',
    ],
    narrative: '',
    followUps: [
      'How do you approach a patient whose pain management needs conflict with the provider\'s comfort level?',
      'What non-pharmacological interventions have you found effective?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AMSN Domain 1: Pain Management; CMSRN Field 2: Helping Role',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q62/MS-6
  {
    id: 'nms_6',
    question: 'How do you prepare a patient for discharge — especially with complex needs or low health literacy?',
    category: 'Communication',
    specialty: 'medsurg',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['discharge planning', 'patient education', 'health literacy', 'teach-back', 'complex discharge'],
    bullets: [
      'Assesses learning readiness and health literacy',
      'Uses teach-back method to verify understanding',
      'Addresses medication education, activity restrictions, follow-up appointments',
      'Involves family/caregivers in education',
    ],
    narrative: '',
    followUps: [
      'How do you handle a patient who says they understand but you\'re not confident they do?',
      'What do you do when a patient is being discharged and you don\'t think they\'re ready?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'AMSN Domain 2: Education of Patients/Families; CMSRN Field 2: Teaching/Coaching',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // ============================================================
  // TRAVEL NURSING (Q63-Q68)
  // ============================================================

  // Q63/TRAVEL-1
  {
    id: 'ntravel_1',
    question: 'Walk me through your first 48 hours at a new facility. How do you get up to speed quickly?',
    category: 'Behavioral',
    specialty: 'travel',
    priority: 'High',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['new facility', 'first 48 hours', 'onboarding', 'travel nurse', 'orientation', 'adapt quickly'],
    bullets: [
      'Has a systematic approach to orientation (crash cart, code process, EMR, key contacts)',
      'Identifies unit resources and "go-to" people',
      'Asks questions proactively',
      'Doesn\'t assume policies are the same as last assignment',
    ],
    narrative: '',
    followUps: [
      'What\'s the first thing you look for on a new unit?',
      'How do you handle it when your orientation feels inadequate?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'Joint Commission NPG 12: Unit-Specific Orientation; NATHO Standards',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q64/TRAVEL-2
  {
    id: 'ntravel_2',
    question: 'Describe identifying a safety concern at a new facility. What did you do?',
    category: 'Clinical Judgment',
    specialty: 'travel',
    priority: 'High',
    difficulty: 'advanced',
    clinicalFramework: 'NURSING_PROCESS',
    responseFramework: 'star',
    keywords: ['safety concern', 'new facility', 'spoke up', 'patient safety', 'different protocols'],
    bullets: [
      'Describes the specific concern identified',
      'Shows appropriate escalation (charge nurse, manager, safety reporting system)',
      'Navigates being the "outsider" raising a concern',
      'Demonstrates that patient safety trumps being liked',
    ],
    narrative: '',
    followUps: [
      'How do you raise a concern without alienating the permanent staff?',
      'What do you do if your concern is dismissed?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'Joint Commission NPG 12; ANA Standard: Advocacy',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q65/TRAVEL-3
  {
    id: 'ntravel_3',
    question: 'Epic at one facility, Cerner at the next, Meditech at another. How do you adapt to different EMR systems?',
    category: 'Technical',
    specialty: 'travel',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['EMR', 'Epic', 'Cerner', 'Meditech', 'different systems', 'documentation', 'adapt EMR'],
    bullets: [
      'Lists systems they\'ve worked in',
      'Describes adaptation strategies (super-user identification, quick-reference guides)',
      'Addresses documentation accuracy as a priority',
      'Shows humility about asking for help',
    ],
    narrative: '',
    followUps: [
      'What do you do when you can\'t figure out how to document something in an unfamiliar system?',
      'How do you ensure nothing falls through the cracks during the learning curve?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'Facility Skills Assessments; Joint Commission: Documentation Standards',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q66/TRAVEL-4
  {
    id: 'ntravel_4',
    question: 'How do you handle being floated to a unit outside your primary specialty?',
    category: 'Clinical Judgment',
    specialty: 'travel',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['floated', 'float pool', 'unfamiliar unit', 'outside specialty', 'scope of practice'],
    bullets: [
      'Describes self-assessment of competency vs. the unit\'s needs',
      'Shows willingness to communicate limitations honestly',
      'Identifies unit resources and support',
      'Maintains patient safety as the priority',
    ],
    narrative: '',
    followUps: [
      'What do you do when you\'re floated to a unit where you don\'t feel competent to manage the patient population?',
      'How do you advocate for yourself and your patients when you feel out of your depth?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'NCSBN: Scope of Practice; Float Pool Research',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q67/TRAVEL-5
  {
    id: 'ntravel_5',
    question: 'How do you build trust with a new team when you\'re only there for 13 weeks?',
    category: 'Communication',
    specialty: 'travel',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['build trust', 'new team', '13 weeks', 'rapport', 'outsider', 'travel relationships'],
    bullets: [
      'Shows initiative (introduces self, offers help, asks about workflows)',
      'Demonstrates respect for the existing culture',
      'Addresses the "outsider" dynamic',
      'Builds credibility through competence, not just personality',
    ],
    narrative: '',
    followUps: [
      'How do you handle tension between travelers and permanent staff?',
      'What do you do when the team\'s workflow is different from what you\'re used to?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'ANA Standard: Collaboration; NATHO Ethics',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },

  // Q68/TRAVEL-6
  {
    id: 'ntravel_6',
    question: 'How do you stay aware of scope-of-practice differences when working in different states?',
    category: 'Behavioral',
    specialty: 'travel',
    priority: 'Medium',
    difficulty: 'intermediate',
    clinicalFramework: null,
    responseFramework: 'star',
    keywords: ['scope of practice', 'nurse licensure compact', 'NLC', 'state differences', 'multi-state'],
    bullets: [
      'Understands that practice is governed by the state where the patient is located',
      'Describes how they research state-specific scope before assignments',
      'Shows awareness of compact vs. non-compact licensure',
      'Addresses how they handle situations where scope differs from what they\'re used to',
    ],
    narrative: '',
    followUps: [
      'What do you do if a facility asks you to do something outside your scope in that state?',
      'How do you manage licensure across multiple states?',
    ],
    metadata: {
      author: 'InterviewAnswers.AI Content Team',
      reviewer: 'Erin',
      clinicalFrameworkSource: 'NCSBN: Nurse Practice Act; NLC/eNLC Requirements',
      reviewDate: '2026-02-12',
      status: 'approved',
    },
  },
];

// Backward compatibility alias
export const SAMPLE_NURSING_QUESTIONS = NURSING_QUESTIONS;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get questions filtered by specialty
 * Returns general questions PLUS specialty-specific questions
 */
export function getQuestionsForSpecialty(specialty) {
  if (!specialty || specialty === 'all') {
    return NURSING_QUESTIONS;
  }
  return NURSING_QUESTIONS.filter(
    q => q.specialty === 'general' || q.specialty === specialty
  );
}

/**
 * Get questions filtered by difficulty
 */
export function getQuestionsByDifficulty(questions, difficulty) {
  return questions.filter(q => q.difficulty === difficulty);
}

/**
 * Get questions filtered by clinical framework
 */
export function getQuestionsByFramework(questions, framework) {
  return questions.filter(q => q.clinicalFramework === framework);
}

/**
 * Get questions filtered by category
 */
export function getQuestionsByCategory(questions, category) {
  return questions.filter(q => q.category === category);
}

/**
 * Check if a question has been fully reviewed
 */
export function isQuestionApproved(question) {
  return question.metadata?.status === 'approved';
}

/**
 * Get unique categories from a set of questions
 */
export function getCategories(questions) {
  return [...new Set(questions.map(q => q.category))];
}

/**
 * Get framework details for a question's clinicalFramework key
 */
export function getFrameworkDetails(frameworkKey) {
  return frameworkKey ? CLINICAL_FRAMEWORKS[frameworkKey] || null : null;
}

/**
 * Get questions with a specific trigger condition
 * Used by the AI coaching engine to adapt question selection
 */
export function getQuestionsByTrigger(questions, triggerCondition) {
  return questions.filter(q => q.metadata?.triggerCondition === triggerCondition);
}
