import { useState } from 'react';
import { BookOpen, Plus, ChevronRight, CheckCircle, X, Lightbulb, Sparkles } from 'lucide-react';

// Complete Universal Interview Templates - 6 templates with 44 questions
// Each question includes keywords for Live Prompter matching
const TEMPLATES = [
  {
    id: 'core-interview-fundamentals',
    name: 'Core Interview Fundamentals',
    description: 'Essential questions asked in nearly every interview. Master these first!',
    category: 'General',
    is_free: true,
    questions: [
      {
        id: 'core-1',
        question_text: 'Tell me about yourself',
        keywords: ['tell me about yourself', 'walk me through your background', 'introduce yourself', 'describe yourself', 'who are you', 'your background', 'about you', 'walk me through your resume'],
        category: 'Core Narrative',
        priority: 'Must-Know',
        structure_prompts: [
          'What experiences shaped your career path? (Be specific, not generic)',
          'What are you doing now and what have you learned?',
          'Why does THIS role excite you? (Connect your past to their future)',
          'Keep it to 90-120 seconds: Past (30s) → Present (30s) → Future (30s)'
        ]
      },
      {
        id: 'core-2',
        question_text: 'Why are you interested in this role?',
        keywords: ['why this role', 'why interested', 'what attracts you', 'why do you want', 'why apply', 'interest in position', 'why this job', 'why this position', 'what draws you'],
        category: 'Core Narrative',
        priority: 'Must-Know',
        structure_prompts: [
          'What SPECIFIC aspects of the role excite you? (Not just "great company")',
          'How does this fit YOUR career goals?',
          'What will YOU specifically bring that others won\'t?',
          'Mention something specific you researched about them'
        ]
      },
      {
        id: 'core-3',
        question_text: 'What are your greatest strengths?',
        keywords: ['greatest strengths', 'your strengths', 'what are you good at', 'strong suits', 'best qualities', 'top strengths', 'strengths'],
        category: 'Core Narrative',
        priority: 'Must-Know',
        structure_prompts: [
          'Pick 2-3 strengths relevant to THIS role',
          'Give a specific example for each (mini-STAR)',
          'Connect directly to job requirements',
          'Don\'t list 5+ strengths - you\'ll sound unfocused'
        ]
      },
      {
        id: 'core-4',
        question_text: 'What is your greatest weakness?',
        keywords: ['greatest weakness', 'your weakness', 'weaknesses', 'areas for improvement', 'what are you bad at', 'shortcomings', 'weakness'],
        category: 'Core Narrative',
        priority: 'Must-Know',
        structure_prompts: [
          'Choose a REAL weakness (not "I work too hard")',
          'What specific steps are you taking to improve?',
          'How do you manage around it currently?',
          'Show self-awareness and growth mindset'
        ]
      },
      {
        id: 'core-5',
        question_text: 'Where do you see yourself in 5 years?',
        keywords: ['five years', '5 years', 'where do you see yourself', 'future goals', 'career goals', 'long term', 'future plans'],
        category: 'Core Narrative',
        priority: 'Must-Know',
        structure_prompts: [
          'What skills do you want to develop?',
          'What type of impact do you want to have?',
          'How does THIS role fit that path?',
          'Show ambition but also commitment to THIS role'
        ]
      },
      {
        id: 'core-6',
        question_text: 'Why are you leaving your current role?',
        keywords: ['why leaving', 'why left', 'leave your job', 'leaving current', 'why change', 'reason for leaving', 'why are you looking'],
        category: 'Core Narrative',
        priority: 'Must-Know',
        structure_prompts: [
          'What are you looking for that you can\'t get there?',
          'Frame it positively (growth, not escape)',
          'Connect to why THIS role excites you',
          'NEVER badmouth current/former employer'
        ]
      },
      {
        id: 'core-7',
        question_text: 'What do you know about our company?',
        keywords: ['know about us', 'about our company', 'what do you know', 'research', 'why our company', 'about the company', 'know about our organization'],
        category: 'Core Narrative',
        priority: 'Must-Know',
        structure_prompts: [
          'Mention their mission, recent news, or specific projects',
          'Connect their work to YOUR values or experience',
          'Show you\'ve done real research, not just read the homepage',
          'Ask a follow-up question based on what you learned'
        ]
      },
      {
        id: 'core-8',
        question_text: 'Do you have any questions for us?',
        keywords: ['questions for us', 'any questions', 'what questions', 'ask us', 'want to know', 'questions for me'],
        category: 'Core Narrative',
        priority: 'Must-Know',
        structure_prompts: [
          'Ask about team dynamics, challenges, or success metrics',
          'Ask about growth opportunities or what excellence looks like',
          'Show you\'ve researched them - reference something specific',
          'Prepare 5-7 questions, ask 2-3 per interview round'
        ]
      }
    ]
  },
  {
    id: 'behavioral-star',
    name: 'Behavioral / STAR Questions',
    description: '"Tell me about a time..." questions. Use the STAR method: Situation, Task, Action, Result.',
    category: 'Behavioral',
    is_free: true,
    questions: [
      {
        id: 'behavioral-1',
        question_text: 'Tell me about a time you faced a significant challenge at work',
        keywords: ['challenge', 'difficult situation', 'obstacle', 'problem you faced', 'tough situation', 'adversity', 'challenging situation', 'overcame'],
        category: 'Behavioral',
        priority: 'Must-Know',
        structure_prompts: [
          'SITUATION: Set the scene - what was the challenge and stakes?',
          'TASK: What was YOUR specific responsibility?',
          'ACTION: What steps did YOU take? (Be specific)',
          'RESULT: What was the outcome? Quantify if possible'
        ]
      },
      {
        id: 'behavioral-2',
        question_text: 'Describe a situation where you had to meet a tight deadline',
        keywords: ['tight deadline', 'deadline', 'time pressure', 'crunch time', 'under pressure', 'time constraint', 'short timeline', 'rushed'],
        category: 'Behavioral',
        priority: 'Must-Know',
        structure_prompts: [
          'SITUATION: What was the deadline and why was it tight?',
          'TASK: What needed to be delivered?',
          'ACTION: How did you prioritize and execute?',
          'RESULT: Did you meet it? What did you learn?'
        ]
      },
      {
        id: 'behavioral-3',
        question_text: 'Give an example of when you showed leadership',
        keywords: ['showed leadership', 'leadership example', 'led a team', 'took charge', 'leadership skills', 'led', 'leadership'],
        category: 'Behavioral',
        priority: 'Must-Know',
        structure_prompts: [
          'SITUATION: What was the context requiring leadership?',
          'TASK: What did the team need to accomplish?',
          'ACTION: How did you lead? (motivate, delegate, decide)',
          'RESULT: What was the team outcome?'
        ]
      },
      {
        id: 'behavioral-4',
        question_text: 'Tell me about a time you failed and what you learned',
        keywords: ['time you failed', 'failure', 'mistake', 'setback', 'didn\'t work out', 'learned from failure', 'failed', 'unsuccessful'],
        category: 'Behavioral',
        priority: 'Must-Know',
        structure_prompts: [
          'SITUATION: What were you trying to accomplish?',
          'TASK: What was your role?',
          'ACTION: What went wrong and why?',
          'RESULT: What did you learn? How did you apply it later?'
        ]
      },
      {
        id: 'behavioral-5',
        question_text: 'Describe a time you had to learn something quickly',
        keywords: ['learn quickly', 'quick learner', 'new skill', 'had to learn', 'learning curve', 'picked up fast', 'ramp up', 'new technology'],
        category: 'Behavioral',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What did you need to learn and why the urgency?',
          'TASK: What level of competence was required?',
          'ACTION: What was your learning strategy?',
          'RESULT: How quickly did you get proficient? What was the impact?'
        ]
      },
      {
        id: 'behavioral-6',
        question_text: 'Tell me about a time you went above and beyond',
        keywords: ['above and beyond', 'extra mile', 'exceeded expectations', 'went beyond', 'more than expected', 'extra effort'],
        category: 'Behavioral',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What was the baseline expectation?',
          'TASK: What was your official responsibility?',
          'ACTION: What extra did you do and why?',
          'RESULT: What impact did going above and beyond have?'
        ]
      },
      {
        id: 'behavioral-7',
        question_text: 'Give an example of when you had to adapt to change',
        keywords: ['adapt to change', 'change', 'pivot', 'flexibility', 'adjusted', 'adaptability', 'things changed', 'unexpected change'],
        category: 'Behavioral',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What change occurred?',
          'TASK: What did you need to adapt to?',
          'ACTION: How did you adjust your approach?',
          'RESULT: What was the outcome of your adaptability?'
        ]
      },
      {
        id: 'behavioral-8',
        question_text: 'Describe a time you received difficult feedback',
        keywords: ['difficult feedback', 'criticism', 'negative feedback', 'constructive criticism', 'tough feedback', 'critical feedback'],
        category: 'Behavioral',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What was the feedback about?',
          'TASK: What did you need to improve?',
          'ACTION: How did you respond and what changes did you make?',
          'RESULT: What improved as a result?'
        ]
      },
      {
        id: 'behavioral-9',
        question_text: 'Tell me about your proudest professional accomplishment',
        keywords: ['proudest accomplishment', 'biggest achievement', 'most proud of', 'greatest accomplishment', 'proud moment', 'achievement', 'accomplished'],
        category: 'Behavioral',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What was the context?',
          'TASK: What were you trying to achieve?',
          'ACTION: What did YOU specifically do?',
          'RESULT: Why are you proud? Quantify the impact'
        ]
      },
      {
        id: 'behavioral-10',
        question_text: 'Give an example of when you had to prioritize competing demands',
        keywords: ['prioritize', 'competing priorities', 'multiple tasks', 'prioritization', 'manage priorities', 'juggle', 'competing demands', 'too many things'],
        category: 'Behavioral',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What were the competing demands?',
          'TASK: What needed to get done?',
          'ACTION: How did you decide what to prioritize? What framework?',
          'RESULT: Did you meet all deadlines? What was the outcome?'
        ]
      }
    ]
  },
  {
    id: 'leadership-management',
    name: 'Leadership & Team Management',
    description: 'Questions about how you lead, manage, and develop others.',
    category: 'Leadership',
    is_free: true,
    questions: [
      {
        id: 'leadership-1',
        question_text: 'How do you motivate team members?',
        keywords: ['motivate team', 'motivation', 'inspire team', 'keep team motivated', 'motivating others', 'motivate employees'],
        category: 'Leadership',
        priority: 'Must-Know',
        structure_prompts: [
          'What\'s your philosophy on motivation?',
          'Give a specific example of motivating someone',
          'How do you tailor motivation to different people?',
          'What results has your approach produced?'
        ]
      },
      {
        id: 'leadership-2',
        question_text: 'Describe your leadership style',
        keywords: ['leadership style', 'how do you lead', 'management style', 'your style', 'type of leader', 'describe your style'],
        category: 'Leadership',
        priority: 'Must-Know',
        structure_prompts: [
          'Name your style (servant leader, collaborative, etc.)',
          'Give an example of this style in action',
          'How do you adapt your style to different situations?',
          'What feedback have you received about your leadership?'
        ]
      },
      {
        id: 'leadership-3',
        question_text: 'Tell me about a time you had to delegate effectively',
        keywords: ['delegate', 'delegation', 'assigned tasks', 'distributed work', 'delegating', 'delegated'],
        category: 'Leadership',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What needed to be delegated and why?',
          'TASK: How did you decide what to delegate and to whom?',
          'ACTION: How did you set expectations and provide support?',
          'RESULT: What was the outcome? Did it develop the person?'
        ]
      },
      {
        id: 'leadership-4',
        question_text: 'How do you handle underperforming team members?',
        keywords: ['underperforming', 'poor performance', 'struggling employee', 'not meeting expectations', 'underperformer', 'performance issues'],
        category: 'Leadership',
        priority: 'Must-Know',
        structure_prompts: [
          'What\'s your process for identifying performance issues?',
          'How do you have the difficult conversation?',
          'What support do you provide for improvement?',
          'Give an example - what was the outcome?'
        ]
      },
      {
        id: 'leadership-5',
        question_text: 'Describe a time you built or improved a team',
        keywords: ['built a team', 'improved team', 'team building', 'developed team', 'grew the team', 'build a team'],
        category: 'Leadership',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What was the team\'s starting state?',
          'TASK: What improvements were needed?',
          'ACTION: What specific steps did you take to build/improve?',
          'RESULT: How did the team transform? Metrics?'
        ]
      },
      {
        id: 'leadership-6',
        question_text: 'How do you make difficult decisions?',
        keywords: ['difficult decisions', 'tough decisions', 'hard choices', 'decision making', 'make decisions', 'tough call'],
        category: 'Leadership',
        priority: 'Important',
        structure_prompts: [
          'What\'s your framework for making hard decisions?',
          'How do you gather input while maintaining ownership?',
          'Give an example of a difficult decision you made',
          'How did you communicate and implement the decision?'
        ]
      },
      {
        id: 'leadership-7',
        question_text: 'Tell me about a time you led through change',
        keywords: ['leading through change', 'change management', 'led change', 'organizational change', 'transition', 'lead through change', 'managed change'],
        category: 'Leadership',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What change was happening?',
          'TASK: What was your role in leading it?',
          'ACTION: How did you communicate, support, and drive adoption?',
          'RESULT: What was the outcome? How did people respond?'
        ]
      },
      {
        id: 'leadership-8',
        question_text: 'How do you develop talent on your team?',
        keywords: ['develop talent', 'mentoring', 'coaching', 'developing others', 'grow talent', 'training team', 'develop employees'],
        category: 'Leadership',
        priority: 'Important',
        structure_prompts: [
          'What\'s your philosophy on talent development?',
          'How do you identify potential and growth areas?',
          'Give an example of someone you developed',
          'What methods do you use? (coaching, stretch assignments, etc.)'
        ]
      }
    ]
  },
  {
    id: 'technical-problem-solving',
    name: 'Technical Problem-Solving',
    description: 'Questions about how you analyze problems, use data, and improve processes.',
    category: 'Technical',
    is_free: true,
    questions: [
      {
        id: 'technical-1',
        question_text: 'Walk me through how you approach complex problems',
        keywords: ['approach problems', 'problem solving', 'complex problems', 'how do you solve', 'methodology', 'tackle problems', 'solve problems'],
        category: 'Technical',
        priority: 'Must-Know',
        structure_prompts: [
          'What\'s your framework for breaking down complex problems?',
          'How do you gather information and identify root causes?',
          'Give a specific example of solving a complex problem',
          'How do you know when you\'ve found the right solution?'
        ]
      },
      {
        id: 'technical-2',
        question_text: 'Describe a time you analyzed data to make a decision',
        keywords: ['analyzed data', 'data driven', 'data analysis', 'used data', 'metrics', 'analytics', 'data-driven decision'],
        category: 'Technical',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What decision needed to be made?',
          'TASK: What data did you need to gather?',
          'ACTION: How did you analyze it and what did you find?',
          'RESULT: What decision did you make and what was the outcome?'
        ]
      },
      {
        id: 'technical-3',
        question_text: 'Tell me about a process you improved',
        keywords: ['process improvement', 'improved process', 'efficiency', 'streamlined', 'optimization', 'made more efficient', 'improved efficiency'],
        category: 'Technical',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What process was broken or inefficient?',
          'TASK: What improvement was needed?',
          'ACTION: What changes did you implement?',
          'RESULT: What was the measurable impact? (time saved, errors reduced, etc.)'
        ]
      },
      {
        id: 'technical-4',
        question_text: 'How do you stay current in your field?',
        keywords: ['stay current', 'professional development', 'keep up to date', 'continuous learning', 'stay updated', 'keep learning'],
        category: 'Technical',
        priority: 'Good-to-Know',
        structure_prompts: [
          'What resources do you use? (publications, courses, conferences)',
          'How do you apply new learnings to your work?',
          'Give an example of something you learned recently and applied',
          'How do you balance learning with day-to-day responsibilities?'
        ]
      },
      {
        id: 'technical-5',
        question_text: 'Describe a time you troubleshot a difficult issue',
        keywords: ['troubleshoot', 'debugging', 'root cause', 'diagnosed', 'figured out', 'solved issue', 'troubleshooting', 'diagnose'],
        category: 'Technical',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What was the issue and its impact?',
          'TASK: What did you need to figure out?',
          'ACTION: What was your troubleshooting process?',
          'RESULT: What was the root cause and fix?'
        ]
      },
      {
        id: 'technical-6',
        question_text: 'Tell me about a project you managed from start to finish',
        keywords: ['project management', 'managed project', 'start to finish', 'end to end', 'project you led', 'ran a project', 'project from beginning'],
        category: 'Technical',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What was the project scope and goals?',
          'TASK: What was your role and responsibilities?',
          'ACTION: How did you plan, execute, and handle obstacles?',
          'RESULT: What was delivered? On time/budget?'
        ]
      }
    ]
  },
  {
    id: 'career-transition-goals',
    name: 'Career Transition & Goals',
    description: 'Questions about career changes, motivations, and future aspirations.',
    category: 'Career',
    is_free: true,
    questions: [
      {
        id: 'career-1',
        question_text: 'Why are you interested in this career change?',
        keywords: ['career change', 'switching careers', 'transition', 'new field', 'changing industries', 'career transition', 'change careers'],
        category: 'Career',
        priority: 'Must-Know',
        structure_prompts: [
          'What sparked your interest in this new direction?',
          'How does your previous experience translate?',
          'What have you done to prepare for this change?',
          'Why is this the right time?'
        ]
      },
      {
        id: 'career-2',
        question_text: 'How does your background prepare you for this role?',
        keywords: ['background prepare', 'transferable skills', 'experience relevant', 'qualifications', 'prepared you', 'background qualify'],
        category: 'Career',
        priority: 'Must-Know',
        structure_prompts: [
          'What specific skills transfer directly?',
          'What unique perspective does your background bring?',
          'Give examples of relevant accomplishments',
          'What have you done to fill any gaps?'
        ]
      },
      {
        id: 'career-3',
        question_text: 'What attracts you to our industry?',
        keywords: ['attracts you', 'why this industry', 'interest in industry', 'drawn to', 'appeal of', 'why this field'],
        category: 'Career',
        priority: 'Important',
        structure_prompts: [
          'What specifically interests you about this industry?',
          'How have you explored or prepared for it?',
          'What impact do you want to make?',
          'What trends or challenges excite you?'
        ]
      },
      {
        id: 'career-4',
        question_text: 'Where do you see your career heading?',
        keywords: ['career heading', 'career trajectory', 'career path', 'future career', 'career direction', 'career going'],
        category: 'Career',
        priority: 'Important',
        structure_prompts: [
          'What\'s your long-term career vision?',
          'How does this role fit into that path?',
          'What skills do you want to develop?',
          'How do you balance ambition with commitment to this role?'
        ]
      },
      {
        id: 'career-5',
        question_text: 'What skills are you looking to develop?',
        keywords: ['skills develop', 'want to learn', 'growth areas', 'skills to build', 'develop skills', 'looking to grow'],
        category: 'Career',
        priority: 'Good-to-Know',
        structure_prompts: [
          'What specific skills do you want to strengthen?',
          'Why are these skills important to you?',
          'How will this role help you develop them?',
          'What are you already doing to learn?'
        ]
      },
      {
        id: 'career-6',
        question_text: 'Why now? What prompted this move?',
        keywords: ['why now', 'prompted', 'timing', 'this moment', 'right time', 'what changed', 'why this time'],
        category: 'Career',
        priority: 'Important',
        structure_prompts: [
          'What factors aligned to make this the right time?',
          'What changed in your situation or thinking?',
          'How did you decide you were ready?',
          'What would happen if you didn\'t make this move?'
        ]
      }
    ]
  },
  {
    id: 'conflict-difficult-situations',
    name: 'Conflict & Difficult Situations',
    description: 'Questions about handling disagreements, difficult people, and high-pressure scenarios.',
    category: 'Conflict',
    is_free: true,
    questions: [
      {
        id: 'conflict-1',
        question_text: 'Tell me about a time you disagreed with your manager',
        keywords: ['disagreed with manager', 'conflict with boss', 'pushed back', 'different opinion', 'disagreement', 'disagreed with supervisor'],
        category: 'Conflict',
        priority: 'Must-Know',
        structure_prompts: [
          'SITUATION: What was the disagreement about?',
          'TASK: What was at stake?',
          'ACTION: How did you handle it professionally?',
          'RESULT: What was the outcome? What did you learn?'
        ]
      },
      {
        id: 'conflict-2',
        question_text: 'Describe a conflict with a coworker and how you resolved it',
        keywords: ['conflict coworker', 'disagreement colleague', 'coworker conflict', 'interpersonal conflict', 'conflict with colleague', 'coworker disagreement'],
        category: 'Conflict',
        priority: 'Must-Know',
        structure_prompts: [
          'SITUATION: What caused the conflict?',
          'TASK: What needed to be resolved?',
          'ACTION: What steps did you take to address it?',
          'RESULT: How was it resolved? How\'s the relationship now?'
        ]
      },
      {
        id: 'conflict-3',
        question_text: 'How do you handle working with difficult personalities?',
        keywords: ['difficult personalities', 'difficult people', 'challenging people', 'hard to work with', 'difficult coworker', 'challenging personality'],
        category: 'Conflict',
        priority: 'Important',
        structure_prompts: [
          'What\'s your general approach to difficult people?',
          'Give a specific example',
          'How do you stay professional and productive?',
          'What have you learned about working with different styles?'
        ]
      },
      {
        id: 'conflict-4',
        question_text: 'Tell me about a time you had to deliver bad news',
        keywords: ['delivering bad news', 'bad news', 'difficult conversation', 'hard message', 'tough news', 'deliver bad news'],
        category: 'Conflict',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What was the bad news?',
          'TASK: Why did you need to deliver it?',
          'ACTION: How did you prepare and deliver the message?',
          'RESULT: How did they react? What was the outcome?'
        ]
      },
      {
        id: 'conflict-5',
        question_text: 'Describe a situation where you had to stand firm on a decision',
        keywords: ['stand firm', 'stood your ground', 'defended decision', 'pushed back', 'held firm', 'stood firm', 'didn\'t back down'],
        category: 'Conflict',
        priority: 'Important',
        structure_prompts: [
          'SITUATION: What decision were you defending?',
          'TASK: Why was it important to stand firm?',
          'ACTION: How did you handle the pushback?',
          'RESULT: What was the outcome? Were you right?'
        ]
      },
      {
        id: 'conflict-6',
        question_text: 'How do you handle pressure and stressful situations?',
        keywords: ['handle pressure', 'stress', 'stressful situations', 'under pressure', 'high pressure', 'pressure situations', 'stressful'],
        category: 'Conflict',
        priority: 'Must-Know',
        structure_prompts: [
          'What\'s your approach to managing stress?',
          'Give a specific example of a high-pressure situation',
          'What techniques do you use to stay calm and focused?',
          'How do you perform under pressure vs. normal conditions?'
        ]
      }
    ]
  }
];

function TemplateLibrary({ onImport, onClose, onOpenAICoach, checkUsageLimit }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleImport = async () => {
    if (!selectedTemplate) return;

    setImporting(true);
    try {
      // Convert template questions to user's question format
      const questionsToImport = selectedTemplate.questions.map(tq => ({
        question: tq.question_text,
        category: tq.category,
        priority: tq.priority,
        bullets: tq.structure_prompts || [],
        narrative: '',
        keywords: [],
        followups: [],
        authenticityTips: tq.authenticity_tips || [],
        timingGuidance: tq.timing_guidance || ''
      }));

      // Pass to parent component to add to user's questions
      if (onImport) {
        onImport(questionsToImport);
      }

      alert(`✅ Successfully imported ${questionsToImport.length} questions from ${selectedTemplate.name}!`);
      if (onClose) onClose();
    } catch (err) {
      console.error('Error importing:', err);
      alert('Failed to import questions. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportSingle = async (templateQuestion) => {
    try {
      const questionToImport = {
        question: templateQuestion.question_text,
        category: templateQuestion.category,
        priority: templateQuestion.priority,
        bullets: templateQuestion.structure_prompts || [],
        narrative: '',
        keywords: [],
        followups: [],
        authenticityTips: templateQuestion.authenticity_tips || [],
        timingGuidance: templateQuestion.timing_guidance || ''
      };

      if (onImport) {
        onImport([questionToImport]);
      }

      alert(`✅ Added "${templateQuestion.question_text}" to your Question Bank!`);
    } catch (err) {
      console.error('Error importing single question:', err);
      alert('Failed to import question. Please try again.');
    }
  };

  const handleAICoach = async (templateQuestion) => {
    // Check usage limit first
    if (checkUsageLimit) {
      const canUse = await checkUsageLimit();
      if (!canUse) return; // Limit reached, modal shown by parent
    }

    // Create question object for AI Coach
    const questionForCoach = {
      question: templateQuestion.question_text,
      category: templateQuestion.category,
      priority: templateQuestion.priority,
      bullets: templateQuestion.structure_prompts || [],
      narrative: '',
      keywords: [],
      followups: [],
      id: `template-${templateQuestion.id}` // Temporary ID
    };

    if (onOpenAICoach) {
      onOpenAICoach(questionForCoach);
    }
  };

  const templateQuestions = selectedTemplate?.questions || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold">Question Templates</h2>
              <p className="text-gray-600 text-sm">Start with pre-built questions, customize with YOUR stories</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Template List */}
          <div className="md:w-1/3 border-b md:border-b-0 md:border-r overflow-y-auto p-4 md:p-6 max-h-[30vh] md:max-h-none">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Available Templates</h3>
            <div className="space-y-3">
              {TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedTemplate?.id === template.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{template.industry}</span>
                        {template.is_free && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Free</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Preview */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!selectedTemplate ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p className="text-sm md:text-base">Select a template to preview questions</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
                  {selectedTemplate.name} ({templateQuestions.length} questions)
                </h3>
                <div className="space-y-4">
                  {templateQuestions.map((q, idx) => (
                    <div key={q.id} className="border-2 border-gray-200 rounded-xl p-3 md:p-4 hover:border-indigo-300 transition">
                      <div className="flex items-start gap-2 md:gap-3 mb-3">
                        <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm md:text-base leading-tight">{q.question_text}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">{q.category}</span>
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{q.priority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Structure Prompts */}
                      {q.structure_prompts && q.structure_prompts.length > 0 && (
                        <div className="mb-3 bg-gray-50 rounded-lg p-2 md:p-3">
                          <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">📝 Structure Your Answer:</p>
                          <ul className="space-y-1">
                            {q.structure_prompts.map((prompt, i) => (
                              <li key={i} className="text-xs md:text-sm text-gray-600 flex gap-2">
                                <span className="text-indigo-600">•</span>
                                <span>{prompt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Timing Guidance */}
                      {q.timing_guidance && (
                        <div className="mb-3 p-2 md:p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs md:text-sm text-blue-900">
                            <span className="font-semibold">⏱️ Timing:</span> {q.timing_guidance}
                          </p>
                        </div>
                      )}

                      {/* Authenticity Tips */}
                      {q.authenticity_tips && q.authenticity_tips.length > 0 && (
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm font-semibold text-amber-900 mb-2">💡 Be Authentic:</p>
                          <ul className="space-y-1">
                            {q.authenticity_tips.map((tip, i) => (
                              <li key={i} className="text-sm text-amber-800 flex gap-2">
                                <span>•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
                        {onOpenAICoach && (
                          <button
                            onClick={() => handleAICoach(q)}
                            className="flex-1 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                          >
                            <Lightbulb className="w-4 h-4" />
                            <span className="hidden sm:inline">Can't Think of Answer?</span>
                            <span>AI Coach</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleImportSingle(q)}
                          className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Bank</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className="p-4 md:p-6 border-t bg-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p className="text-xs md:text-sm text-gray-600">
              These questions will be added to your question bank. You can customize them with YOUR details.
            </p>
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 md:px-6 py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
            >
              {importing ? (
                'Importing...'
              ) : (
                <>
                  <Sparkles className="w-4 md:w-5 h-4 md:h-5" />
                  Import All {templateQuestions.length} Questions
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateLibrary;
