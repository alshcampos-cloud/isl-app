-- ============================================================
-- NURSING TRACK — Seed Data: 68 Curated Questions (All Erin-Approved)
-- InterviewAnswers.AI — NurseInterviewPro Track
-- ============================================================
-- Updated: 2026-02-13  |  Branch: feature/nursing-track
--
-- SOURCE: nursingQuestions.js NURSING_QUESTIONS array (70 entries = 68 unique + 2 cross-listed)
-- CLINICAL REVIEW: All questions reviewed and approved by Erin (2026-02-12)
-- 64 approved as-is, 3 rewritten per Erin's notes, 0 rejected
--
-- RUN AFTER: 20260210000001_nursing_track_tables.sql
-- IDEMPOTENT: Uses ON CONFLICT (question_code) DO UPDATE to sync changes
-- ============================================================


-- ============================
-- GENERAL — All Specialties (18 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('ng_1',
 'Tell me about yourself and why you chose nursing.',
 'Motivation', 'High', 'general', 'beginner', 'star', NULL,
 ARRAY['tell me about yourself', 'why nursing', 'introduce yourself', 'background', 'your story'],
 ARRAY['Open with your current role and setting (brief — 1 sentence)', 'Share what drew you to nursing specifically (personal, not generic)', 'Highlight 1-2 clinical experiences that shaped your career path', 'Connect to why you want THIS role — make it specific to the position'],
 ARRAY['What moment confirmed nursing was the right career for you?', 'How has your nursing philosophy evolved since you started?'],
 'InterviewAnswers.AI Content Team', 'Erin', NULL, '2026-02-12'::timestamptz, 'approved'),

('ng_2',
 'Tell me about a time you had to advocate for a patient.',
 'Behavioral', 'High', 'general', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['advocate for a patient', 'patient advocacy', 'spoke up for a patient', 'went to bat for a patient'],
 ARRAY['SITUATION: Set the scene — what was happening with the patient that required advocacy?', 'TASK: What specifically needed to change, and why were you the one to act?', 'ACTION: Who did you communicate with? How did you frame the concern? What communication strategies did you use?', 'RESULT: What changed for the patient? What did you learn about advocating within the healthcare team?'],
 ARRAY['How did you handle any pushback from other members of the care team?', 'What would you do differently in that situation now?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANA Code of Ethics for Nurses, Provision 3: Advocacy', '2026-02-12'::timestamptz, 'approved'),

('ng_3',
 'Describe a time you made an error or near-miss. How did you handle it?',
 'Behavioral', 'High', 'general', 'advanced', 'star', 'NURSING_PROCESS',
 ARRAY['made an error', 'near miss', 'medication error', 'mistake', 'tell me about a mistake'],
 ARRAY['SITUATION: What happened — be honest and specific (no patient identifiers)', 'TASK: What was at stake, and what was your immediate responsibility?', 'ACTION: How did you report it? What steps did you take to mitigate harm? Did you use your chain of command?', 'RESULT: Patient outcome, what changed in your practice, any system improvements that resulted'],
 ARRAY['How has this experience changed your practice day-to-day?', 'What systems or double-checks do you now rely on to prevent errors?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'Just Culture principles; IOM To Err is Human', '2026-02-12'::timestamptz, 'approved'),

('ng_4',
 'How do you prioritize when you have multiple patients with competing needs?',
 'Clinical Judgment', 'High', 'general', 'intermediate', 'star', 'NCSBN_CJM',
 ARRAY['prioritize patients', 'competing needs', 'multiple patients', 'triage', 'how do you prioritize'],
 ARRAY['SITUATION: Describe the scenario — how many patients, what were the competing needs?', 'TASK: What framework guided your prioritization? (ABC, Maslow''s, acuity-based)', 'ACTION: Walk through your clinical reasoning step by step — what did you assess first and why?', 'RESULT: How did it turn out? What did you learn about prioritization under pressure?'],
 ARRAY['What prioritization framework do you rely on most and why?', 'Tell me about a time your priorities shifted unexpectedly mid-shift.'],
 'InterviewAnswers.AI Content Team', 'Erin', 'NCSBN Clinical Judgment Measurement Model (CJMM)', '2026-02-12'::timestamptz, 'approved'),

('ng_5',
 'Describe a situation where you used SBAR to communicate critical information.',
 'Communication', 'High', 'general', 'intermediate', 'sbar', 'SBAR',
 ARRAY['SBAR', 'communicate with a doctor', 'called a physician', 'critical information', 'handoff', 'bedside report'],
 ARRAY['SITUATION: What was happening with the patient that required urgent communication?', 'BACKGROUND: What relevant history and context did you include?', 'ASSESSMENT: What was your clinical assessment of what was happening?', 'RECOMMENDATION: What did you recommend and what was the response?'],
 ARRAY['How do you handle it when your recommendation isn''t followed?', 'How do you adapt SBAR for different audiences — physician vs. charge nurse vs. family?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'IHI SBAR Communication Framework', '2026-02-12'::timestamptz, 'approved'),

('ng_6',
 'Tell me about a time you had a conflict with a colleague or provider. How did you resolve it?',
 'Behavioral', 'High', 'general', 'intermediate', 'star', NULL,
 ARRAY['conflict with a colleague', 'disagreement with coworker', 'difficult coworker', 'conflict resolution', 'interprofessional conflict'],
 ARRAY['SITUATION: What was the conflict, and who was involved? (Keep it professional, no names)', 'TASK: Why was it important to resolve — especially regarding patient care?', 'ACTION: How did you approach the conversation? What communication strategies did you use (active listening, I-statements)?', 'RESULT: How was it resolved? What did the working relationship look like afterward?'],
 ARRAY['How do you handle it when the conflict can''t be fully resolved?', 'What did you learn about yourself from that experience?'],
 'InterviewAnswers.AI Content Team', 'Erin', NULL, '2026-02-12'::timestamptz, 'approved'),

('ng_7',
 'Why are you interested in this specialty and this unit specifically?',
 'Motivation', 'High', 'general', 'beginner', 'star', NULL,
 ARRAY['why this specialty', 'why this unit', 'why do you want to work here', 'what drew you', 'interested in this area'],
 ARRAY['Personal connection: What experience sparked your interest in this specialty?', 'Clinical alignment: How does your training and clinical experience prepare you?', 'Growth: What do you specifically hope to learn or develop here?', 'Contribution: What unique perspective or skill do you bring to this team?'],
 ARRAY['Where do you see yourself in this specialty in 3-5 years?', 'What specific aspect of this unit excites you most?'],
 'InterviewAnswers.AI Content Team', 'Erin', NULL, '2026-02-12'::timestamptz, 'approved'),

('ng_8',
 'How do you handle end-of-life care and supporting grieving families?',
 'Communication', 'Medium', 'general', 'advanced', 'star', 'NURSING_PROCESS',
 ARRAY['end of life', 'death', 'dying patient', 'grieving family', 'palliative', 'comfort care', 'hospice'],
 ARRAY['SITUATION: Describe a specific end-of-life situation you navigated', 'TASK: What did the patient and family need from you — clinically and emotionally?', 'ACTION: How did you provide comfort, communicate prognosis, and support autonomy? How did you take care of yourself afterward?', 'RESULT: How did the family respond? What did you learn about presence in those moments?'],
 ARRAY['How do you take care of your own emotional well-being after losing a patient?', 'How do you approach conversations about code status or goals of care?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANA Position Statement on End-of-Life Care', '2026-02-12'::timestamptz, 'approved'),

('ng_9',
 'Describe your experience with electronic health records and clinical documentation.',
 'Technical', 'Medium', 'general', 'beginner', 'star', NULL,
 ARRAY['EHR', 'electronic health record', 'charting', 'documentation', 'Epic', 'Cerner', 'Meditech'],
 ARRAY['Name the specific EHR systems you have experience with (Epic, Cerner, Meditech, etc.)', 'Describe your documentation philosophy — how do you ensure accuracy and timeliness?', 'Share how you handle documentation during high-acuity situations', 'Mention any specific modules or workflows you are proficient with'],
 ARRAY['How do you handle charting when things get extremely busy?', 'How do you ensure your documentation would hold up legally?'],
 'InterviewAnswers.AI Content Team', 'Erin', NULL, '2026-02-12'::timestamptz, 'approved'),

('ng_10',
 'Tell me about a time you received critical feedback from a supervisor or peer. How did you respond?',
 'Behavioral', 'Medium', 'general', 'intermediate', 'star', NULL,
 ARRAY['critical feedback', 'constructive criticism', 'negative feedback', 'preceptor feedback', 'performance review'],
 ARRAY['SITUATION: What was the feedback, and who gave it? (Be specific but professional)', 'TASK: Why was it hard to hear? What was your initial reaction?', 'ACTION: How did you process it? What specific changes did you make?', 'RESULT: How did your practice improve? Did you follow up with the person who gave feedback?'],
 ARRAY['How do you distinguish between feedback you should act on vs. feedback you should consider but may not agree with?', 'How do you seek out feedback proactively?'],
 'InterviewAnswers.AI Content Team', 'Erin', NULL, '2026-02-12'::timestamptz, 'approved'),

('ng_11',
 'How do you communicate with families when a patient has a poor prognosis?',
 'Communication', 'High', 'general', 'advanced', 'star', 'NURSING_PROCESS',
 ARRAY['family communication', 'poor prognosis', 'bad news', 'family meeting', 'goals of care', 'withdrawal of care'],
 ARRAY['SITUATION: Describe the context — what was happening with the patient?', 'TASK: What did the family need from you? How did you balance honesty with compassion?', 'ACTION: How did you communicate? What language did you use? How did you create space for questions and emotions?', 'RESULT: How did the family respond? What feedback did you receive? How did you manage your own emotions?'],
 ARRAY['How do you handle family members who are in denial about a prognosis?', 'How do you coordinate communication between the interdisciplinary team and family?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANA Standard: Communication; AACN Synergy Model: Caring Practices', '2026-02-12'::timestamptz, 'approved'),

('ng_12',
 'How do you manage a patient refusing care or threatening to leave against medical advice (AMA)?',
 'Communication', 'High', 'general', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['AMA', 'against medical advice', 'refusing care', 'patient refusal', 'right to refuse', 'patient autonomy', 'patient rights'],
 ARRAY['SITUATION: Describe the context — what was the patient refusing, and why?', 'TASK: What were the competing priorities — patient autonomy vs. safety? What was at stake clinically?', 'ACTION: How did you communicate the risks? How did you balance advocacy with respecting their right to refuse? Who else did you involve (charge nurse, provider, social work)?', 'RESULT: What happened? If they left AMA, how did you ensure proper documentation and discharge education? If they stayed, what changed their mind?'],
 ARRAY['How do you handle the emotional frustration when a patient makes a decision you believe is harmful to themselves?', 'What documentation is critical when a patient leaves AMA?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANA Code of Ethics — Provision 1 (Respect for Autonomy); Joint Commission Patient Rights Standards', '2026-02-12'::timestamptz, 'approved'),

('ng_13',
 'How do you decide what tasks to delegate, and ensure they''re completed safely?',
 'Clinical Judgment', 'High', 'general', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['delegation', 'delegate tasks', 'CNA', 'LPN', 'tech', 'supervise', 'five rights of delegation'],
 ARRAY['Understands scope of practice for CNAs, LPNs, techs', 'Uses the 5 Rights of Delegation (right task, right circumstance, right person, right direction, right supervision)', 'Follows up and verifies completion', 'Takes responsibility for delegated tasks'],
 ARRAY['What do you do when a CNA pushes back on a task you''ve delegated?', 'Describe a time delegation didn''t go as planned. What did you learn?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANA Standard: Resource Stewardship; NCSBN: Five Rights of Delegation', '2026-02-12'::timestamptz, 'approved'),

('ng_14',
 'Tell me about a time you dealt with a threatening or unsafe situation involving a patient or visitor.',
 'Behavioral', 'High', 'general', 'intermediate', 'star', NULL,
 ARRAY['workplace violence', 'threatening patient', 'unsafe situation', 'security', 'aggressive visitor', 'safety'],
 ARRAY['Describes de-escalation techniques used', 'Shows awareness of personal safety and team safety', 'Mentions institutional resources (security, behavioral response teams)', 'Demonstrates appropriate documentation and reporting'],
 ARRAY['What de-escalation techniques do you use?', 'How do you support yourself or colleagues after a violent incident?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ENA Position Statement: Workplace Violence; Joint Commission: Workplace Violence Prevention', '2026-02-12'::timestamptz, 'approved'),

('ng_15',
 'Tell me about a time you used evidence-based practice to improve care delivery on your unit.',
 'Behavioral', 'Medium', 'general', 'intermediate', 'star', NULL,
 ARRAY['evidence-based practice', 'EBP', 'quality improvement', 'research', 'best practice', 'practice change', 'QI project'],
 ARRAY['SITUATION: Identify the clinical question, practice gap, or quality issue you observed on your unit', 'TASK: Describe how you searched for or applied research evidence to address it', 'ACTION: Walk through how you implemented the practice change — who was involved, what was the process?', 'RESULT: What was the measurable outcome? How did it affect patient care on the unit?'],
 ARRAY['How do you stay current with nursing research in your specialty?', 'What resources do you use for evidence-based practice?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANA Standard: Evidence-Based Practice; AACN: Clinical Inquiry', '2026-02-12'::timestamptz, 'approved'),

('ng_16',
 'Describe caring for a variety of patient populations with different cultural backgrounds, languages, or beliefs.',
 'Communication', 'Medium', 'general', 'intermediate', 'star', NULL,
 ARRAY['cultural competence', 'interpreter', 'language barrier', 'cultural sensitivity', 'diverse patients', 'health equity'],
 ARRAY['Shows respect for cultural practices and preferences', 'Uses interpreter services when needed (not family members for medical interpretation)', 'Adapts care plan to accommodate cultural/spiritual needs', 'Demonstrates humility and willingness to learn'],
 ARRAY['How do you handle a situation where a cultural practice conflicts with the medical plan?', 'What do you do when an interpreter isn''t immediately available?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANA Standard: Culturally Congruent Practice; NCSBN: Environmental Factors', '2026-02-12'::timestamptz, 'approved'),

('ng_17',
 'Tell me about a time you faced an ethical dilemma. How did you navigate it?',
 'Behavioral', 'Medium', 'general', 'advanced', 'star', NULL,
 ARRAY['ethical dilemma', 'ethics', 'moral distress', 'right thing to do', 'ethics committee'],
 ARRAY['Describes the specific ethical tension', 'Shows use of institutional resources (ethics committee, chaplain, social work)', 'Demonstrates patient advocacy', 'Reflects on what was learned'],
 ARRAY['Have you ever disagreed with a provider''s plan of care? How did you handle it?', 'How do you balance following orders with your own clinical judgment?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AACN Synergy Model: Advocacy and Moral Agency; ANA Code of Ethics', '2026-02-12'::timestamptz, 'approved'),

('ng_18',
 'Describe interpreting hemodynamic data and using it to advocate for a change in the plan of care.',
 'Technical', 'Medium', 'general', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['hemodynamic', 'MAP', 'CVP', 'blood pressure', 'trending vitals', 'advocate for change'],
 ARRAY['Demonstrates familiarity with hemodynamic parameters (MAP, CVP, SVR, CO/CI)', 'Shows ability to interpret trends, not just numbers', 'Describes how findings were communicated to the team', 'Links data to clinical decision-making'],
 ARRAY['How do you communicate hemodynamic concerns to a provider who seems unconcerned?', 'Describe a time hemodynamic data changed the plan of care.'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CCRN Domain: Cardiovascular; AACN: Clinical Judgment + Advocacy', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================
-- ED — Emergency Department (8 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('ned_1',
 'The ED sees everything — trauma, psychiatric crises, labor, pediatrics. How do you adapt your care approach with very different populations back-to-back?',
 'Clinical Judgment', 'High', 'ed', 'intermediate', 'star', 'ABC',
 ARRAY['diverse populations', 'ED variety', 'adapt care', 'versatility', 'back-to-back', 'different patients'],
 ARRAY['Shows awareness of the breadth of ED patient populations', 'Demonstrates ability to shift assessment approach by population', 'Mentions prioritization and resource allocation', 'Shows comfort with clinical versatility'],
 ARRAY['How do you adjust your assessment when a pediatric patient arrives vs. a geriatric patient?', 'What''s the most challenging population shift you''ve had to make in a single shift?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'BCEN CEN Domains 1-10; ENA Core Curriculum', '2026-02-12'::timestamptz, 'approved'),

('ned_2',
 'Walk me through how you manage a trauma patient from arrival to stabilization.',
 'Clinical Judgment', 'High', 'ed', 'advanced', 'sbar', 'ABC',
 ARRAY['trauma', 'trauma patient', 'stabilization', 'ABCDE', 'primary survey', 'trauma team'],
 ARRAY['Describes primary survey (ABCDE) approach', 'Mentions team roles and communication', 'Addresses rapid assessment and intervention', 'Shows awareness of documentation during a trauma'],
 ARRAY['How do you communicate findings to the trauma team using SBAR?', 'Describe a trauma where the initial presentation was misleading.'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ENA TNCC; BCEN CEN Domain: Cardiovascular/Respiratory/Neurological', '2026-02-12'::timestamptz, 'approved'),

('ned_3',
 'How do you care for patients who present to the ED for issues that could be managed in primary care?',
 'Communication', 'Medium', 'ed', 'intermediate', 'star', NULL,
 ARRAY['primary care', 'non-emergent', 'low acuity', 'ED utilization', 'patient education'],
 ARRAY['Shows empathy — understands why patients come (access barriers, uninsured, fear)', 'Treats every patient with respect regardless of acuity', 'Provides appropriate education about community resources', 'Avoids being judgmental about ED utilization'],
 ARRAY['How do you balance compassion with efficient resource use?', 'What resources do you connect these patients to at discharge?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'BCEN CEN Domain 10: Patient Safety/Satisfaction; ENA Core Curriculum', '2026-02-12'::timestamptz, 'approved'),

('ned_4',
 'Describe managing patients with suspected infectious diseases in the ED, including informing the infection control team and implementing isolation.',
 'Clinical Judgment', 'High', 'ed', 'intermediate', 'sbar', 'SBAR',
 ARRAY['infectious disease', 'isolation', 'PPE', 'infection control', 'communicable disease', 'infection prevention'],
 ARRAY['Describes rapid isolation and PPE protocols', 'Mentions communication with infection prevention team', 'Shows awareness of protecting other patients and staff', 'Addresses documentation and reporting requirements'],
 ARRAY['How do you handle a situation where isolation rooms are full but you suspect an infectious patient?', 'What has changed about your infection prevention practice since COVID?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'BCEN CEN Domain 9: Environment/Toxicology/Communicable Diseases; CDC Guidelines', '2026-02-12'::timestamptz, 'approved'),

('ned_5',
 'Tell me about caring for a patient experiencing a psychiatric or mental health crisis in the ED.',
 'Communication', 'High', 'ed', 'intermediate', 'star', NULL,
 ARRAY['psychiatric crisis', 'mental health', 'ED psych', 'behavioral emergency', 'psych hold'],
 ARRAY['Demonstrates therapeutic communication', 'Describes de-escalation techniques', 'Shows awareness of safety (patient and staff)', 'Mentions collaboration with psychiatric services/social work', 'Addresses patient dignity in a busy ED environment'],
 ARRAY['How do you maintain safety while being therapeutic?', 'What do you do when psychiatric resources aren''t immediately available?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'BCEN CEN Domain 5: Mental Health Emergencies; ENA Position Statement: Workplace Violence', '2026-02-12'::timestamptz, 'approved'),

('ned_6',
 'Describe how you identify and respond to a patient showing signs of sepsis in the ED.',
 'Clinical Judgment', 'High', 'ed', 'intermediate', 'sbar', 'NCSBN_CJM',
 ARRAY['sepsis', 'sepsis screening', 'sepsis bundle', 'lactate', 'blood cultures', 'early recognition'],
 ARRAY['Recognizes early sepsis indicators (fever, tachycardia, hypotension, altered mental status)', 'Describes initiating the sepsis bundle (blood cultures, lactate, antibiotics, fluid resuscitation)', 'Shows urgency and time-sensitivity awareness', 'Communicates findings clearly to the team'],
 ARRAY['What do you do when a patient''s sepsis screening is positive but the provider hasn''t responded yet?', 'How do you differentiate sepsis from other causes of similar symptoms?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'BCEN CEN Domain 6: Medical Emergencies; CMS SEP-1 Bundle', '2026-02-12'::timestamptz, 'approved'),

('ned_7',
 'How do you assess and manage a patient with a suspected fracture or orthopedic injury?',
 'Clinical Judgment', 'Medium', 'ed', 'intermediate', 'star', NULL,
 ARRAY['fracture', 'orthopedic', 'musculoskeletal', 'splint', 'compartment syndrome', 'neurovascular'],
 ARRAY['Describes neurovascular assessment (5 P''s: pain, pallor, pulselessness, paresthesia, paralysis)', 'Mentions pain management approach', 'Shows awareness of compartment syndrome risk', 'Addresses splinting/immobilization and patient education'],
 ARRAY['What are the signs that concern you for compartment syndrome?', 'How do you manage pain in a patient who is drug-seeking vs. one who is in genuine distress?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'BCEN CEN Domain 7: Musculoskeletal and Wound Emergencies', '2026-02-12'::timestamptz, 'approved'),

('ned_8',
 'Tell me about your experience managing a pregnant patient presenting to the ED.',
 'Clinical Judgment', 'Medium', 'ed', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['pregnant patient', 'OB emergency', 'ectopic', 'pre-eclampsia', 'emergency delivery', 'pregnant in ED'],
 ARRAY['Shows awareness that pregnancy changes normal assessment parameters', 'Describes approach to common OB emergencies (ectopic, pre-eclampsia, emergency delivery)', 'Mentions coordination with L&D and OB team', 'Demonstrates understanding of two-patient care (mother and fetus)'],
 ARRAY['What do you do if a patient arrives in active labor and cannot be transferred to L&D?', 'How do you handle a pregnant patient who presents with vaginal bleeding?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'BCEN CEN Domain 4: GYN/OB Emergencies; ENA Core Curriculum', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================
-- ICU — Intensive Care Unit (8 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('nicu_1',
 'Describe a time you noticed a subtle change in a critically ill patient that others missed.',
 'Clinical Judgment', 'High', 'icu', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['subtle change', 'noticed something', 'clinical intuition', 'caught a change', 'deteriorating patient'],
 ARRAY['SITUATION: What was the patient baseline, and what subtle change did you notice?', 'TASK: Why was this finding significant? What could it have indicated?', 'ACTION: What did you do with this information? Who did you notify and how (SBAR)?', 'RESULT: What was the outcome? How did your early recognition impact the patient?'],
 ARRAY['How do you stay vigilant during a 12-hour shift with multiple critically ill patients?', 'What assessment techniques do you use to catch early deterioration?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AACN Synergy Model: Clinical Judgment; NCSBN: Recognize Cues + Analyze Cues', '2026-02-12'::timestamptz, 'approved'),

('nicu_2',
 'Describe interpreting hemodynamic data and using it to advocate for a change in the plan of care.',
 'Technical', 'High', 'icu', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['hemodynamic', 'MAP', 'CVP', 'SVR', 'cardiac output', 'hemodynamic monitoring'],
 ARRAY['Demonstrates familiarity with hemodynamic parameters (MAP, CVP, SVR, CO/CI)', 'Shows ability to interpret trends, not just numbers', 'Describes how findings were communicated to the team', 'Links data to clinical decision-making'],
 ARRAY['How do you communicate hemodynamic concerns to a provider who seems unconcerned?', 'Describe a time hemodynamic data changed the plan of care.'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CCRN Domain: Cardiovascular (17%); AACN: Clinical Judgment + Advocacy', '2026-02-12'::timestamptz, 'approved'),

('nicu_3',
 'Tell me about managing ventilated patients, including assessing readiness for weaning.',
 'Technical', 'High', 'icu', 'intermediate', 'star', NULL,
 ARRAY['ventilator', 'weaning', 'extubation', 'FiO2', 'PEEP', 'ABG', 'spontaneous breathing trial'],
 ARRAY['Describes ventilator settings awareness (modes, FiO2, PEEP)', 'Shows understanding of weaning protocols and readiness criteria', 'Mentions ABG interpretation', 'Addresses patient comfort and sedation management'],
 ARRAY['What do you do when a patient fails a spontaneous breathing trial?', 'How do you manage a patient who is anxious about extubation?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CCRN Domain: Respiratory/Pulmonary (15%); AACN Standards', '2026-02-12'::timestamptz, 'approved'),

('nicu_4',
 'Tell me about managing multiple vasoactive drips and devices simultaneously.',
 'Technical', 'High', 'icu', 'intermediate', 'star', NULL,
 ARRAY['drips', 'infusions', 'vasoactive', 'titration', 'multiple devices', 'pump programming'],
 ARRAY['Shows knowledge of titration protocols', 'Demonstrates prioritization when multiple parameters are changing', 'Describes monitoring approach and frequency', 'Addresses safety (double-check, pump programming, line management)'],
 ARRAY['How do you prioritize when two patients need simultaneous drip adjustments?', 'Describe a time a medication error was narrowly avoided. What happened?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CCRN Domain: Cardiovascular + Multisystem; AACN: Systems Thinking', '2026-02-12'::timestamptz, 'approved'),

('nicu_5',
 'Describe managing a patient progressing from sepsis to multiorgan dysfunction.',
 'Clinical Judgment', 'High', 'icu', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['sepsis', 'multiorgan dysfunction', 'MODS', 'organ failure', 'CRRT', 'deteriorating'],
 ARRAY['Recognizes progressive organ failure indicators', 'Describes escalation of care (pressors, CRRT, ventilator support)', 'Shows team communication during deterioration', 'Addresses family communication during critical changes'],
 ARRAY['How do you communicate the severity of the situation to a family member?', 'When do you advocate for a goals-of-care conversation?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CCRN Domain: Multisystem (14%); NCSBN: All 6 cognitive steps', '2026-02-12'::timestamptz, 'approved'),

('nicu_6',
 'Describe transitioning a patient from aggressive treatment to comfort care.',
 'Communication', 'High', 'icu', 'advanced', 'star', 'NURSING_PROCESS',
 ARRAY['comfort care', 'withdrawal of care', 'palliative', 'goals of care', 'end of life ICU'],
 ARRAY['Describes supporting the family through the decision', 'Shows collaboration with palliative care team', 'Addresses symptom management during comfort care', 'Demonstrates emotional intelligence and presence'],
 ARRAY['How do you handle your own emotions after a patient death?', 'What do you do when the family and the medical team disagree about goals of care?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CCRN Professional Practice (20%): End-of-Life/Palliative; AACN: Caring Practices + Advocacy', '2026-02-12'::timestamptz, 'approved'),

('nicu_7',
 'Tell me about an ethical dilemma in the ICU. How did you navigate it?',
 'Behavioral', 'Medium', 'icu', 'advanced', 'star', NULL,
 ARRAY['ethical dilemma', 'ICU ethics', 'moral distress', 'ethics committee', 'futile care'],
 ARRAY['Describes the specific ethical tension', 'Shows use of institutional resources (ethics committee, chaplain, social work)', 'Demonstrates patient advocacy', 'Reflects on what was learned'],
 ARRAY['Have you ever disagreed with a provider''s plan of care? How did you handle it?', 'How do you balance following orders with your own clinical judgment?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AACN Synergy Model: Advocacy and Moral Agency; CCRN: Ethical Practice', '2026-02-12'::timestamptz, 'approved'),

('nicu_8',
 'How do you assess for and manage delirium in your ICU patients?',
 'Clinical Judgment', 'Medium', 'icu', 'intermediate', 'star', 'NCSBN_CJM',
 ARRAY['delirium', 'CAM-ICU', 'RASS', 'sedation', 'ICU delirium', 'confusion'],
 ARRAY['Uses validated assessment tools (CAM-ICU, RASS)', 'Describes non-pharmacological interventions first (reorientation, mobility, sleep hygiene)', 'Addresses sedation protocols and daily sedation vacations', 'Communicates delirium findings to the team'],
 ARRAY['How do you differentiate delirium from dementia in an ICU patient?', 'What role does the nurse play in preventing ICU delirium?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CCRN Domain: Neurological/Psychosocial (14%); AACN Standards', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================
-- OR — Operating Room (6 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('nor_1',
 'Walk me through surgical counts and what you do when a count is off.',
 'Technical', 'High', 'or', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['surgical count', 'time-out', 'wrong site surgery', 'patient safety', 'surgical checklist', 'universal protocol'],
 ARRAY['Describes standardized counting procedure (initial, during handoffs, final before closure)', 'Explains actions when count is discrepant (stop, re-count, notify surgeon, imaging if needed)', 'Shows understanding of risk factors (emergent cases, long procedures, blood loss)', 'Demonstrates patient advocacy under pressure'],
 ARRAY['Have you ever had a count discrepancy? What happened?', 'What do you do if the surgeon wants to close and you haven''t reconciled the count?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CNOR SA3: Intraoperative Management; AORN RSI Prevention Guideline', '2026-02-12'::timestamptz, 'approved'),

('nor_2',
 'Tell me about identifying a break in sterile technique during a procedure and how you responded.',
 'Clinical Judgment', 'High', 'or', 'intermediate', 'sbar', NULL,
 ARRAY['sterile technique', 'break in sterility', 'contamination', 'aseptic technique', 'scrub nurse'],
 ARRAY['SITUATION: Describe a time you identified a break in sterile technique', 'TASK: What was at stake — what could have happened if it went unnoticed?', 'ACTION: How did you address it? How did you communicate with the surgical team?', 'RESULT: What happened next? How did the team respond?'],
 ARRAY['What do you do when a surgeon dismisses your concern about sterility?', 'How do you maintain sterile field awareness during a 6-hour case?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CNOR SA5: Infection Prevention (16%); AORN Sterile Technique Guideline', '2026-02-12'::timestamptz, 'approved'),

('nor_3',
 'Describe responding to an intraoperative emergency — malignant hyperthermia, hemorrhage, or cardiac arrest.',
 'Clinical Judgment', 'High', 'or', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['intraoperative emergency', 'malignant hyperthermia', 'OR hemorrhage', 'cardiac arrest OR', 'MH crisis'],
 ARRAY['Describes a specific emergency situation', 'Shows clear role identification and team coordination', 'Demonstrates knowledge of emergency protocols', 'Addresses post-event debriefing and documentation'],
 ARRAY['What is your role as the circulating nurse during an MH crisis?', 'How does your team prepare for emergencies that rarely happen?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CNOR SA6: Emergency Situations (10%); AORN Guidelines', '2026-02-12'::timestamptz, 'approved'),

('nor_4',
 'The patient can''t speak under anesthesia. How do you advocate for your patient in the OR?',
 'Behavioral', 'High', 'or', 'intermediate', 'star', NULL,
 ARRAY['patient advocacy', 'anesthesia', 'patient voice', 'OR advocacy', 'circulating nurse'],
 ARRAY['Describes specific advocacy actions (positioning safety, temperature regulation, dignity)', 'Shows awareness that the circulating nurse IS the patient''s voice', 'Mentions communication with the team about patient needs', 'Addresses informed consent verification and patient preferences'],
 ARRAY['Have you ever stopped a procedure because of a safety concern?', 'How do you ensure a patient''s wishes from the pre-op conversation are honored?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CNOR SA3: Patient Dignity/Privacy; AORN Standard: Advocacy', '2026-02-12'::timestamptz, 'approved'),

('nor_5',
 'How do you communicate effectively with the surgical team, especially raising a concern during a critical moment?',
 'Communication', 'High', 'or', 'intermediate', 'star', NULL,
 ARRAY['OR communication', 'speaking up', 'surgical team', 'CUS framework', 'hierarchy', 'assertive communication'],
 ARRAY['Uses structured communication (CUS framework: Concerned, Uncomfortable, Safety issue)', 'Describes assertive but respectful communication', 'Shows awareness of hierarchy in the OR and how to navigate it', 'Mentions time-out and surgical pause practices'],
 ARRAY['What do you do when a surgeon is dismissive of your concern?', 'How do you handle conflict between the surgeon and anesthesia team?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CNOR SA4: Communication (11%); AORN Standard: Communication; AHRQ TeamSTEPPS', '2026-02-12'::timestamptz, 'approved'),

('nor_6',
 'Describe your experience with complex surgical equipment — robotics, laparoscopic, or specialized devices.',
 'Technical', 'Medium', 'or', 'intermediate', 'star', NULL,
 ARRAY['surgical equipment', 'robotics', 'laparoscopic', 'da Vinci', 'equipment troubleshooting'],
 ARRAY['Shows familiarity with equipment setup and troubleshooting', 'Describes how you learn new technology/equipment', 'Addresses equipment failure and backup plans', 'Mentions manufacturer specifications and safety protocols'],
 ARRAY['How do you prepare when your facility introduces new surgical technology?', 'Describe a time equipment malfunctioned during a case. What did you do?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CNOR SA3: Equipment Operation; AORN Guidelines', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================
-- L&D — Labor & Delivery (6 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('nld_1',
 'How do you handle unexpected changes to a birth plan — like when a vaginal delivery requires an emergency cesarean?',
 'Communication', 'High', 'ld', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['birth plan changed', 'unexpected c-section', 'labor complication', 'supporting the patient', 'birth plan'],
 ARRAY['Shows empathy for the patient''s emotional response', 'Describes clear communication about why the change is necessary', 'Maintains patient involvement in decision-making', 'Supports the patient and partner through the transition'],
 ARRAY['How do you balance urgency with keeping the patient informed?', 'Describe a time a patient was resistant to a plan change. How did you handle it?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'NCC RNC-OB Domain 3: Labor and Birth (36%); AWHONN: Continuous Labor Support', '2026-02-12'::timestamptz, 'approved'),

('nld_2',
 'Describe identifying a concerning fetal heart rate pattern and how you escalated it.',
 'Clinical Judgment', 'High', 'ld', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['fetal monitoring', 'fetal heart rate', 'decelerations', 'non-reassuring', 'escalation', 'stat c-section'],
 ARRAY['Uses NICHD terminology (Category I, II, III)', 'Describes specific interventions attempted (position change, oxygen, fluid bolus, stopping Pitocin)', 'Shows clear SBAR communication to the provider', 'Documents findings and interventions'],
 ARRAY['How do you communicate your concern when a Category II tracing isn''t resolving?', 'What do you do when you and the provider disagree on the interpretation?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AWHONN FHM Standards; NCC RNC-OB Domain 2: Fetal Assessment (17%); NICHD 3-Tier System', '2026-02-12'::timestamptz, 'approved'),

('nld_3',
 'Walk me through your response to a postpartum hemorrhage.',
 'Clinical Judgment', 'High', 'ld', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['postpartum hemorrhage', 'PPH', 'blood loss', 'uterotonic', 'massive transfusion'],
 ARRAY['Describes quantified blood loss (QBL) measurement', 'Shows knowledge of uterotonic cascade', 'Demonstrates team communication and role identification', 'Addresses massive transfusion protocol awareness'],
 ARRAY['How do you recognize early signs of PPH before it becomes critical?', 'What is your role in a hemorrhage vs. the provider''s role?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'NCC RNC-OB Domain 4: Recovery/Postpartum (16%); AWHONN: QBL Measurement', '2026-02-12'::timestamptz, 'approved'),

('nld_4',
 'Describe managing Pitocin administration during labor, including monitoring for complications.',
 'Technical', 'High', 'ld', 'intermediate', 'star', NULL,
 ARRAY['Pitocin', 'oxytocin', 'labor induction', 'augmentation', 'tachysystole', 'contraction monitoring'],
 ARRAY['Understands titration protocols and facility policy', 'Describes continuous monitoring requirements', 'Shows awareness of tachysystole/hyperstimulation and response', 'Addresses patient communication about the process'],
 ARRAY['What do you do when you observe tachysystole during Pitocin infusion?', 'How do you balance the provider''s order with your assessment findings?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AWHONN: 1:1 Staffing for Oxytocin; NCC RNC-OB Domain 3: Induction/Augmentation', '2026-02-12'::timestamptz, 'approved'),

('nld_5',
 'How do you support a family experiencing a fetal loss or stillbirth?',
 'Communication', 'High', 'ld', 'advanced', 'star', 'NURSING_PROCESS',
 ARRAY['fetal loss', 'stillbirth', 'perinatal loss', 'bereavement', 'grieving family'],
 ARRAY['Shows compassion and presence', 'Describes creating a supportive environment (memory-making, keepsakes)', 'Mentions involvement of chaplain, social work, bereavement support', 'Addresses cultural and individual preferences for grieving'],
 ARRAY['How do you take care of yourself after supporting a family through loss?', 'How do you support other patients on the unit while caring for a grieving family?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AWHONN Standards; NCC Professional Practice; ANA: Caring Practices', '2026-02-12'::timestamptz, 'approved'),

('nld_6',
 'Describe managing a high-risk antepartum patient — pre-eclampsia, preterm labor, or gestational diabetes.',
 'Clinical Judgment', 'High', 'ld', 'advanced', 'sbar', 'NCSBN_CJM',
 ARRAY['high-risk pregnancy', 'pre-eclampsia', 'preterm labor', 'gestational diabetes', 'magnesium sulfate', 'antepartum'],
 ARRAY['Shows knowledge of monitoring protocols for the specific condition', 'Describes escalation when parameters change', 'Addresses patient education and anxiety management', 'Demonstrates interdisciplinary communication'],
 ARRAY['How do you manage a patient on magnesium sulfate — what are you watching for?', 'How do you educate a patient about bed rest or activity restrictions without being condescending?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'NCC RNC-OB Domain 1: Complications of Pregnancy (28%); AWHONN Standards', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================
-- PEDS — Pediatrics (6 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('npeds_1',
 'How do assessment and communication differ with pediatric patients compared to adults?',
 'Clinical Judgment', 'High', 'peds', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['pediatric assessment', 'child patient', 'age-appropriate', 'family-centered care', 'developmental stage'],
 ARRAY['Adjusts communication by developmental stage (infant, toddler, school-age, adolescent)', 'Uses age-appropriate assessment techniques', 'Involves parents/caregivers appropriately', 'Recognizes different vital sign norms by age'],
 ARRAY['How do you approach a terrified 4-year-old who needs an IV?', 'What changes about your assessment when the patient is nonverbal?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'PNCB CPN Domain 2: Assessment (35%); SPN: Developmentally Appropriate Care', '2026-02-12'::timestamptz, 'approved'),

('npeds_2',
 'What are the key differences in clinical care for pediatric vs. adult patients, and how do they affect your practice?',
 'Clinical Judgment', 'High', 'peds', 'intermediate', 'star', 'NCSBN_CJM',
 ARRAY['pediatric dosing', 'weight-based', 'medication differences', 'pediatric protocols', 'clinical care differences', 'peds vs adult'],
 ARRAY['Weight-based medication dosing (not age-based)', 'Different pharmacokinetics and physiologic responses', 'Higher risk for medication errors — smaller margins', 'Vital sign norms differ by age group'],
 ARRAY['Describe your process for double-checking a pediatric medication dose.', 'What''s the most common medication safety concern in pediatrics?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'PNCB CPN Domain 3: Planning and Management (33%); SPN PNE Model', '2026-02-12'::timestamptz, 'approved'),

('npeds_3',
 'How do you implement family-centered care when a parent''s wishes conflict with the care team''s recommendations?',
 'Communication', 'High', 'peds', 'intermediate', 'star', NULL,
 ARRAY['family-centered care', 'parent conflict', 'pediatric family', 'parent disagreement', 'care team conflict'],
 ARRAY['Parents as full partners in care planning', 'Navigating disagreements with empathy and education', 'Cultural sensitivity in family dynamics', 'Including parents in procedures when appropriate'],
 ARRAY['How do you handle a parent who refuses a recommended treatment for their child?', 'Describe a time you had to set boundaries with an anxious parent.'],
 'InterviewAnswers.AI Content Team', 'Erin', 'SPN Core Competency: Child and Family-Centered Care; PNCB CPN Domain 3', '2026-02-12'::timestamptz, 'approved'),

('npeds_4',
 'How do you assess and manage pain in a child who can''t clearly verbalize what they''re feeling?',
 'Clinical Judgment', 'High', 'peds', 'intermediate', 'star', 'NCSBN_CJM',
 ARRAY['pediatric pain', 'FLACC', 'FACES', 'pain assessment', 'child pain', 'nonverbal pain'],
 ARRAY['Uses age-appropriate pain scales (FLACC for preverbal, Wong-Baker FACES, numeric for older)', 'Includes behavioral and physiological cues', 'Describes both pharmacological and non-pharmacological approaches', 'Involves caregivers in pain assessment'],
 ARRAY['How do you manage pain differently in a 6-month-old vs. a 12-year-old?', 'What do you do when a parent says their child isn''t in pain but your assessment says otherwise?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'PNCB CPN Domain 2: Assessment; SPN Standards', '2026-02-12'::timestamptz, 'approved'),

('npeds_5',
 'Tell me about mandatory reporting. Have you ever suspected abuse or neglect?',
 'Behavioral', 'High', 'peds', 'advanced', 'star', NULL,
 ARRAY['mandatory reporting', 'child abuse', 'neglect', 'CPS', 'suspected abuse', 'patterned injuries'],
 ARRAY['Understands mandatory reporting obligations', 'Describes assessment for abuse indicators (inconsistent history, patterned injuries, developmental red flags)', 'Shows appropriate documentation practices', 'Addresses emotional difficulty of reporting'],
 ARRAY['How do you maintain a therapeutic relationship with a family while a report is being investigated?', 'What do you do when your gut says something is wrong but the evidence is unclear?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'PNCB CPN Domain 4: Professional Responsibilities; SPN: Advocacy', '2026-02-12'::timestamptz, 'approved'),

('npeds_6',
 'How do you navigate adolescent care around confidentiality, consent/assent, and sensitive topics?',
 'Communication', 'Medium', 'peds', 'intermediate', 'star', NULL,
 ARRAY['adolescent care', 'confidentiality', 'consent', 'assent', 'teen patient', 'sensitive topics'],
 ARRAY['Understands legal framework for minor consent and assent', 'Creates space for private conversations with the adolescent', 'Handles sensitive topics (substance use, sexual health, mental health)', 'Balances parental involvement with adolescent autonomy'],
 ARRAY['How do you handle an adolescent who tells you something in confidence that affects their safety?', 'Describe how you build trust with a resistant teenage patient.'],
 'InterviewAnswers.AI Content Team', 'Erin', 'PNCB CPN Domain 3; SPN: Advocacy; AAP Guidelines', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================
-- PSYCH — Behavioral Health (6 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('npsych_1',
 'Describe using therapeutic communication to de-escalate a patient in crisis.',
 'Communication', 'High', 'psych', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['de-escalation', 'crisis intervention', 'therapeutic communication', 'agitated patient', 'psych emergency'],
 ARRAY['Names specific techniques (active listening, validation, setting limits, offering choices)', 'Describes body language and environmental awareness', 'Shows progression from verbal to other interventions', 'Addresses team safety and patient dignity'],
 ARRAY['What do you do when verbal de-escalation isn''t working?', 'How do you maintain a therapeutic relationship after a crisis event?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'APNA Standard: Therapeutic Relationship and Counseling; ANCC PMH-BC Domain III (46%)', '2026-02-12'::timestamptz, 'approved'),

('npsych_2',
 'Describe your approach to assessing suicide risk and developing a safety plan.',
 'Clinical Judgment', 'High', 'psych', 'advanced', 'star', 'NCSBN_CJM',
 ARRAY['suicide risk', 'safety plan', 'suicidal ideation', 'risk assessment', 'SI'],
 ARRAY['Uses validated risk assessment tools', 'Asks directly about suicidal ideation (shows comfort with the conversation)', 'Describes collaborative safety planning', 'Addresses environmental safety and documentation'],
 ARRAY['How do you reassess suicide risk throughout a patient''s stay?', 'What do you do when a patient denies suicidal ideation but you still have concerns?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'APNA Suicide Prevention Competencies; ANCC PMH-BC Domain I (22%); Joint Commission NPSG', '2026-02-12'::timestamptz, 'approved'),

('npsych_3',
 'Tell me about managing a patient who became physically aggressive. Walk me through it.',
 'Behavioral', 'High', 'psych', 'intermediate', 'star', NULL,
 ARRAY['physically aggressive', 'restraints', 'seclusion', 'physical intervention', 'violent patient'],
 ARRAY['Describes least restrictive interventions first', 'Shows de-escalation attempted before physical intervention', 'Addresses team coordination and safety', 'Mentions seclusion/restraint as last resort with appropriate documentation'],
 ARRAY['How do you debrief with your team after a physical intervention?', 'What does "least restrictive intervention" look like in practice?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'APNA Seclusion & Restraint Standards; ANCC PMH-BC Domain III: Crisis Management', '2026-02-12'::timestamptz, 'approved'),

('npsych_4',
 'How do you care for a patient with both a psychiatric disorder and substance use disorder?',
 'Clinical Judgment', 'High', 'psych', 'intermediate', 'star', 'NCSBN_CJM',
 ARRAY['dual diagnosis', 'substance use', 'co-occurring', 'addiction', 'withdrawal'],
 ARRAY['Demonstrates non-judgmental approach', 'Shows understanding that both conditions need treatment simultaneously', 'Describes withdrawal assessment and monitoring', 'Addresses motivational interviewing techniques'],
 ARRAY['How do you handle a patient who is using substances while admitted to your unit?', 'What is your approach when a patient is resistant to treatment?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANCC PMH-BC Domain III; APNA Standards; NCSBN: Psychosocial Integrity', '2026-02-12'::timestamptz, 'approved'),

('npsych_5',
 'How do you contribute to maintaining a therapeutic milieu on a psychiatric unit?',
 'Behavioral', 'Medium', 'psych', 'intermediate', 'star', NULL,
 ARRAY['therapeutic milieu', 'milieu therapy', 'unit environment', 'group dynamics', 'psych unit culture'],
 ARRAY['Describes creating a safe, structured environment', 'Shows understanding of group dynamics and patient interactions', 'Addresses limit-setting while maintaining therapeutic relationships', 'Mentions environmental safety (ligature risk, contraband)'],
 ARRAY['How do you handle it when one patient''s behavior is affecting the therapeutic environment for others?', 'What does a healthy vs. unhealthy milieu look like?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'APNA Standard: Milieu Therapy; ANCC PMH-BC Domain III', '2026-02-12'::timestamptz, 'approved'),

('npsych_6',
 'Describe a situation involving involuntary commitment, patient rights, or confidentiality. How did you navigate it?',
 'Behavioral', 'Medium', 'psych', 'advanced', 'star', NULL,
 ARRAY['involuntary commitment', 'patient rights', 'psych hold', 'duty to warn', 'confidentiality'],
 ARRAY['Shows knowledge of involuntary hold criteria', 'Demonstrates respect for patient rights even during commitment', 'Addresses confidentiality boundaries (duty to warn)', 'Shows emotional complexity and ethical reasoning'],
 ARRAY['How do you explain involuntary commitment to a patient who is angry about it?', 'When does duty to warn override patient confidentiality?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANCC PMH-BC Domain III; APNA Standards; NCSBN: Ethics', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================
-- MED-SURG — Medical-Surgical (6 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('nms_1',
 'How do you manage a full patient assignment and make sure nothing falls through the cracks?',
 'Clinical Judgment', 'High', 'medsurg', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['time management', 'full assignment', 'organization', 'busy shift', 'patient load', 'med-surg nurse'],
 ARRAY['Describes organizational system (brain sheets, time management, rounding)', 'Shows prioritization approach', 'Addresses delegation to CNAs/techs', 'Demonstrates how they catch things early before they become emergencies'],
 ARRAY['How do you reprioritize when an admission or emergency disrupts your plan?', 'What''s your approach to the first 30 minutes of a shift?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AMSN Domain 1: Patient/Care Management; CMSRN: Diagnostic & Patient Monitoring', '2026-02-12'::timestamptz, 'approved'),

('nms_2',
 'Tell me about recognizing a patient was deteriorating before it became obvious. What clues did you notice, and how did you respond?',
 'Clinical Judgment', 'High', 'medsurg', 'intermediate', 'sbar', 'NCSBN_CJM',
 ARRAY['deteriorating patient', 'rapid response', 'early warning', 'subtle changes', 'clinical intuition'],
 ARRAY['Describes subtle clinical changes noticed (altered mental status, trending vitals, urine output changes)', 'Shows assessment-driven response, not just protocol-following', 'Communicates using SBAR to the rapid response team or provider', 'Links to outcome'],
 ARRAY['How do you communicate concern to a provider when the vital signs are still "technically normal"?', 'Have you ever activated a rapid response? Walk me through it.'],
 'InterviewAnswers.AI Content Team', 'Erin', 'CMSRN: Managing Rapidly Changing Situations; NCSBN: Recognize Cues + Analyze Cues', '2026-02-12'::timestamptz, 'approved'),

('nms_3',
 'Describe managing a post-operative patient — what you''re assessing for in the first 24 hours and what care objectives you prioritized.',
 'Technical', 'High', 'medsurg', 'intermediate', 'star', 'NURSING_PROCESS',
 ARRAY['post-operative', 'post-op care', 'surgical patient', 'first 24 hours', 'post-op complications'],
 ARRAY['Systematic assessment approach (airway, pain, surgical site, drains, activity, diet advancement)', 'Watches for complications (bleeding, infection, DVT, ileus, atelectasis)', 'Describes pain management approach', 'Addresses patient education on recovery expectations'],
 ARRAY['How do you differentiate expected post-op discomfort from a complication?', 'Describe a post-op complication you caught early.'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AMSN Domain 1: Surgical/Procedural Management; CMSRN Field 2', '2026-02-12'::timestamptz, 'approved'),

('nms_4',
 'How do you ensure medication safety, especially with high-alert medications?',
 'Technical', 'High', 'medsurg', 'intermediate', 'star', NULL,
 ARRAY['medication safety', 'high-alert medications', 'five rights', 'med reconciliation', 'smart pump'],
 ARRAY['Uses the 5 Rights consistently', 'Describes additional safeguards for high-alert meds (independent double checks, smart pump limits)', 'Addresses medication reconciliation', 'Shows what they do when something doesn''t feel right'],
 ARRAY['Tell me about a time you caught a medication error before it reached the patient.', 'How do you handle polypharmacy in an elderly patient?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AMSN Domain 1: Medication Management; CMSRN Field 2: Therapeutic Interventions', '2026-02-12'::timestamptz, 'approved'),

('nms_5',
 'How do you assess and manage pain in patients with chronic pain or substance use history?',
 'Clinical Judgment', 'Medium', 'medsurg', 'intermediate', 'star', 'NCSBN_CJM',
 ARRAY['pain management', 'chronic pain', 'substance use', 'multimodal', 'opioid', 'non-pharmacological'],
 ARRAY['Uses multimodal approach (pharmacological + non-pharmacological)', 'Believes and respects the patient''s reported pain level', 'Addresses bias and judgment in pain management', 'Describes advocacy when pain isn''t adequately managed'],
 ARRAY['How do you approach a patient whose pain management needs conflict with the provider''s comfort level?', 'What non-pharmacological interventions have you found effective?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AMSN Domain 1: Pain Management; CMSRN Field 2: Helping Role', '2026-02-12'::timestamptz, 'approved'),

('nms_6',
 'How do you prepare a patient for discharge — especially with complex needs or low health literacy?',
 'Communication', 'Medium', 'medsurg', 'intermediate', 'star', NULL,
 ARRAY['discharge planning', 'patient education', 'health literacy', 'teach-back', 'complex discharge'],
 ARRAY['Assesses learning readiness and health literacy', 'Uses teach-back method to verify understanding', 'Addresses medication education, activity restrictions, follow-up appointments', 'Involves family/caregivers in education'],
 ARRAY['How do you handle a patient who says they understand but you''re not confident they do?', 'What do you do when a patient is being discharged and you don''t think they''re ready?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'AMSN Domain 2: Education of Patients/Families; CMSRN Field 2: Teaching/Coaching', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================
-- TRAVEL — Travel Nursing (6 questions)
-- ============================

INSERT INTO nursing_questions (question_code, question_text, category, priority, specialty_id, difficulty, response_framework, clinical_framework_id, keywords, bullets, follow_ups, author, reviewer, clinical_framework_source, review_date, content_status) VALUES

('ntravel_1',
 'Walk me through your first 48 hours at a new facility. How do you get up to speed quickly?',
 'Behavioral', 'High', 'travel', 'intermediate', 'star', NULL,
 ARRAY['new facility', 'first 48 hours', 'onboarding', 'travel nurse', 'orientation', 'adapt quickly'],
 ARRAY['Has a systematic approach to orientation (crash cart, code process, EMR, key contacts)', 'Identifies unit resources and "go-to" people', 'Asks questions proactively', 'Doesn''t assume policies are the same as last assignment'],
 ARRAY['What''s the first thing you look for on a new unit?', 'How do you handle it when your orientation feels inadequate?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'Joint Commission NPG 12: Unit-Specific Orientation; NATHO Standards', '2026-02-12'::timestamptz, 'approved'),

('ntravel_2',
 'Describe identifying a safety concern at a new facility. What did you do?',
 'Clinical Judgment', 'High', 'travel', 'advanced', 'star', 'NURSING_PROCESS',
 ARRAY['safety concern', 'new facility', 'spoke up', 'patient safety', 'different protocols'],
 ARRAY['Describes the specific concern identified', 'Shows appropriate escalation (charge nurse, manager, safety reporting system)', 'Navigates being the "outsider" raising a concern', 'Demonstrates that patient safety trumps being liked'],
 ARRAY['How do you raise a concern without alienating the permanent staff?', 'What do you do if your concern is dismissed?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'Joint Commission NPG 12; ANA Standard: Advocacy', '2026-02-12'::timestamptz, 'approved'),

('ntravel_3',
 'Epic at one facility, Cerner at the next, Meditech at another. How do you adapt to different EMR systems?',
 'Technical', 'Medium', 'travel', 'intermediate', 'star', NULL,
 ARRAY['EMR', 'Epic', 'Cerner', 'Meditech', 'different systems', 'documentation', 'adapt EMR'],
 ARRAY['Lists systems they''ve worked in', 'Describes adaptation strategies (super-user identification, quick-reference guides)', 'Addresses documentation accuracy as a priority', 'Shows humility about asking for help'],
 ARRAY['What do you do when you can''t figure out how to document something in an unfamiliar system?', 'How do you ensure nothing falls through the cracks during the learning curve?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'Facility Skills Assessments; Joint Commission: Documentation Standards', '2026-02-12'::timestamptz, 'approved'),

('ntravel_4',
 'How do you handle being floated to a unit outside your primary specialty?',
 'Clinical Judgment', 'Medium', 'travel', 'intermediate', 'star', NULL,
 ARRAY['floated', 'float pool', 'unfamiliar unit', 'outside specialty', 'scope of practice'],
 ARRAY['Describes self-assessment of competency vs. the unit''s needs', 'Shows willingness to communicate limitations honestly', 'Identifies unit resources and support', 'Maintains patient safety as the priority'],
 ARRAY['What do you do when you''re floated to a unit where you don''t feel competent to manage the patient population?', 'How do you advocate for yourself and your patients when you feel out of your depth?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'NCSBN: Scope of Practice; Float Pool Research', '2026-02-12'::timestamptz, 'approved'),

('ntravel_5',
 'How do you build trust with a new team when you''re only there for 13 weeks?',
 'Communication', 'Medium', 'travel', 'intermediate', 'star', NULL,
 ARRAY['build trust', 'new team', '13 weeks', 'rapport', 'outsider', 'travel relationships'],
 ARRAY['Shows initiative (introduces self, offers help, asks about workflows)', 'Demonstrates respect for the existing culture', 'Addresses the "outsider" dynamic', 'Builds credibility through competence, not just personality'],
 ARRAY['How do you handle tension between travelers and permanent staff?', 'What do you do when the team''s workflow is different from what you''re used to?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'ANA Standard: Collaboration; NATHO Ethics', '2026-02-12'::timestamptz, 'approved'),

('ntravel_6',
 'How do you stay aware of scope-of-practice differences when working in different states?',
 'Behavioral', 'Medium', 'travel', 'intermediate', 'star', NULL,
 ARRAY['scope of practice', 'nurse licensure compact', 'NLC', 'state differences', 'multi-state'],
 ARRAY['Understands that practice is governed by the state where the patient is located', 'Describes how they research state-specific scope before assignments', 'Shows awareness of compact vs. non-compact licensure', 'Addresses how they handle situations where scope differs from what they''re used to'],
 ARRAY['What do you do if a facility asks you to do something outside your scope in that state?', 'How do you manage licensure across multiple states?'],
 'InterviewAnswers.AI Content Team', 'Erin', 'NCSBN: Nurse Practice Act; NLC/eNLC Requirements', '2026-02-12'::timestamptz, 'approved')

ON CONFLICT (question_code) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  response_framework = EXCLUDED.response_framework,
  clinical_framework_id = EXCLUDED.clinical_framework_id,
  keywords = EXCLUDED.keywords,
  bullets = EXCLUDED.bullets,
  follow_ups = EXCLUDED.follow_ups,
  reviewer = EXCLUDED.reviewer,
  clinical_framework_source = EXCLUDED.clinical_framework_source,
  review_date = EXCLUDED.review_date,
  content_status = EXCLUDED.content_status,
  updated_at = now();


-- ============================================================
-- Verify: should show 70 rows (68 unique questions + 2 cross-listed)
-- ============================================================
-- SELECT count(*) FROM nursing_questions;
-- SELECT question_code, category, specialty_id, response_framework, content_status, reviewer FROM nursing_questions ORDER BY question_code;
