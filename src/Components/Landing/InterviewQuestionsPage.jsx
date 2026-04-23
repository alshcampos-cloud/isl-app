// SEO Content Page: 50 Interview Questions & Answers
// Target keywords: "interview questions and answers", "common interview questions",
//   "job interview questions", "top interview questions", "interview questions 2026"
// This is the SEO anchor page that ties all content pages together via internal links.

import { Link } from 'react-router-dom';
import { Brain, ArrowRight, ChevronDown, BookOpen, Sparkles } from 'lucide-react';
import { useState } from 'react';
import useDocumentHead from '../../hooks/useDocumentHead';
import { showNursingFeatures } from '../../utils/appTarget';

const QUESTIONS = [
  {
    category: 'Behavioral',
    id: 'behavioral',
    questions: [
      { q: 'Tell me about a time you had to meet a tight deadline.', tip: 'Use the STAR method. Emphasize what YOU did, not the team. Quantify the outcome.' },
      { q: 'Describe a situation where you had to work with a difficult coworker.', tip: 'Focus on how you handled it professionally, not on blaming the other person. Show resolution.' },
      { q: 'Give an example of when you showed leadership without a formal title.', tip: 'Describe the initiative you took and the impact it had. Leadership is about influence, not position.' },
      { q: 'Tell me about a time you failed and what you learned from it.', tip: 'Pick a real failure, own it, and focus 70% of your answer on what you learned and changed afterward.' },
      { q: 'Describe a time you had to make a decision with incomplete information.', tip: 'Walk through your reasoning process. Show how you gathered what you could and made a judgment call.' },
      { q: 'Tell me about a project that required you to learn something new quickly.', tip: 'Highlight your learning process and resourcefulness, not just the end result.' },
      { q: 'Give an example of when you went above and beyond your job description.', tip: 'Show initiative and impact. Explain why you did it, not just what you did.' },
      { q: 'Describe a time you received constructive criticism and how you responded.', tip: 'Demonstrate self-awareness and growth. Show you acted on the feedback, not just accepted it.' },
    ],
  },
  {
    category: 'Situational',
    id: 'situational',
    questions: [
      { q: 'How would you handle a project that is falling behind schedule?', tip: 'Show a structured approach: assess the root cause, communicate with stakeholders, re-prioritize, and propose a path forward.' },
      { q: 'What would you do if you disagreed with your manager on an important decision?', tip: 'Demonstrate respect and professionalism. Share your perspective with data, but show you can commit even if overruled.' },
      { q: 'How would you handle multiple urgent tasks with competing deadlines?', tip: 'Describe your prioritization framework. Mention communication with stakeholders about tradeoffs.' },
      { q: 'What would you do if a team member was not pulling their weight?', tip: 'Show empathy first (maybe they are struggling), then a direct conversation, then escalation if needed.' },
      { q: 'How would you approach a task you have never done before?', tip: 'Show resourcefulness: research, ask questions, find examples, and start with a small experiment.' },
      { q: 'What would you do if you realized you made a significant mistake on a deliverable?', tip: 'Honesty and speed matter. Describe owning it, notifying the right people, and fixing it.' },
      { q: 'How would you onboard yourself in the first 90 days?', tip: 'Show a plan: learn the product, meet stakeholders, identify quick wins, and understand priorities.' },
      { q: 'What would you do if a client or customer was upset about a mistake your team made?', tip: 'Listen first, acknowledge the issue, take ownership, and describe the resolution process.' },
    ],
  },
  {
    category: '"Tell Me About..." Questions',
    id: 'tell-me',
    questions: [
      { q: 'Tell me about yourself.', tip: 'Use the Present-Past-Future framework. 60-90 seconds. Focus on what is relevant to THIS role.' },
      { q: 'Tell me about your greatest professional achievement.', tip: 'Pick one story with measurable impact. Use STAR. Make the result specific and quantified.' },
      { q: 'Tell me about a time you had to persuade someone.', tip: 'Focus on your approach: what data, logic, or empathy did you use? Show the outcome of the persuasion.' },
      { q: 'Tell me about your experience with [specific skill from the job description].', tip: 'Give a concrete example, not a generic claim. Show how you applied the skill and what resulted.' },
      { q: 'Tell me about a time you had to adapt to a major change at work.', tip: 'Demonstrate flexibility and a positive attitude. Show how you helped others adapt too.' },
      { q: 'Tell me about your management style.', tip: 'Give a concise philosophy, then back it up with a specific example of it in action.' },
      { q: 'Tell me about a time you had to resolve a conflict.', tip: 'Focus on the process: how you listened, found common ground, and reached resolution.' },
      { q: 'Tell me about your biggest professional weakness.', tip: 'Name a real weakness, then immediately describe what you are doing to improve it. Show self-awareness.' },
    ],
  },
  {
    category: 'Strengths & Weaknesses',
    id: 'strengths-weaknesses',
    questions: [
      { q: 'What is your greatest strength?', tip: 'Pick one strength directly relevant to the role. Back it up with a brief example showing it in action.' },
      { q: 'What is your greatest weakness?', tip: 'Choose something genuine but not disqualifying. Describe the specific steps you take to manage it.' },
      { q: 'What makes you unique compared to other candidates?', tip: 'Identify the intersection of skills or experiences that is rare. Connect it to value for this specific role.' },
      { q: 'What skill are you currently working on improving?', tip: 'Show growth mindset. Name the skill, what you are doing about it (course, practice, mentorship), and progress made.' },
      { q: 'How do you handle stress and pressure?', tip: 'Give a concrete strategy (prioritization, exercise, breaking problems down) and a brief example of it working.' },
      { q: 'What would your previous manager say is your best quality?', tip: 'Use a real quote or paraphrased feedback if possible. Specificity beats generic praise.' },
      { q: 'What is the hardest part of your current (or last) job?', tip: 'Be honest but strategic. Frame the challenge positively and describe how you handle it.' },
      { q: 'How do you stay motivated during repetitive or routine tasks?', tip: 'Show self-awareness. Mention systems, goals, or mindset shifts you use to stay engaged.' },
    ],
  },
  {
    category: 'Career Goals',
    id: 'career-goals',
    questions: [
      { q: 'Where do you see yourself in five years?', tip: 'Show ambition that aligns with the company. Focus on skills you want to develop and impact you want to make.' },
      { q: 'Why are you leaving your current job?', tip: 'Stay positive. Frame it as moving toward an opportunity, not away from a problem.' },
      { q: 'Why do you want this specific role?', tip: 'Connect your skills and interests to the specific responsibilities listed in the job description.' },
      { q: 'What are you looking for in your next role?', tip: 'Describe growth, challenge, and impact — then show how this role delivers on all three.' },
      { q: 'What would make you stay at a company for 10+ years?', tip: 'Talk about growth opportunities, meaningful work, and team culture — not salary or perks.' },
      { q: 'How does this role fit into your long-term career plan?', tip: 'Show thoughtfulness. Connect the role to skills you want to build and the direction you are heading.' },
      { q: 'What would you do if you did not get this job?', tip: 'Show resilience. You would reflect on the experience, keep developing your skills, and keep looking for the right fit.' },
      { q: 'What motivates you professionally?', tip: 'Be specific. "Making an impact" is vague. "Seeing a feature I built change how users work" is concrete.' },
    ],
  },
  {
    category: 'Company Fit',
    id: 'company-fit',
    questions: [
      { q: 'Why do you want to work at this company?', tip: 'Reference specific things about the company (product, mission, team, recent news). Generic answers signal low effort.' },
      { q: 'What do you know about our company?', tip: 'Do your homework. Mention the product, recent milestones, competitive position, or company values.' },
      { q: 'How would you describe your ideal work environment?', tip: 'Describe something that matches what you know about this company. Be honest but strategic.' },
      { q: 'What type of manager do you work best with?', tip: 'Describe a management style that suggests you are adaptable but thrive with the type of leadership this company offers.' },
      { q: 'How do you handle working in a fast-paced environment?', tip: 'Give a specific example of when you thrived under pace. Show you have systems, not just willpower.' },
      { q: 'What questions do you have for us?', tip: 'Always have 2-3 thoughtful questions ready. Ask about team dynamics, success metrics, or challenges the team is facing.' },
      { q: 'How would your coworkers describe you?', tip: 'Use real feedback you have received. Pick 2-3 qualities and briefly illustrate one with an example.' },
      { q: 'What is your salary expectation?', tip: 'Research the market range first. Give a range based on your research and state that you are flexible based on total compensation.' },
    ],
  },
];

function CategorySection({ category, id, questions }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="space-y-3">
          {questions.map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-teal-300 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-sm text-gray-600">{item.tip}</p>
                </div>
                <Link
                  to="/onboarding"
                  className="text-teal-600 hover:text-teal-700 text-sm font-semibold whitespace-nowrap shrink-0 mt-0.5"
                >
                  Practice this &#8594;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function InterviewQuestionsPage() {
  useDocumentHead({
    title: 'Top 50 Interview Questions & Answers (2026) | Practice Free',
    description: '50 common interview questions organized by category with answer tips for each. Behavioral, situational, strengths, career goals, and company fit. Practice each question free with AI.',
    keywords: 'interview questions and answers, common interview questions, job interview questions, top interview questions, interview questions 2026, behavioral interview questions, situational interview questions, how to answer interview questions',
    canonical: 'https://www.interviewanswers.ai/interview-questions-and-answers',
    og: {
      title: '50 Interview Questions & Answers (2026) — Practice Each One Free',
      description: '50 common interview questions by category with answer tips. Practice each one with AI feedback.',
      url: 'https://www.interviewanswers.ai/interview-questions-and-answers',
      type: 'article',
    },
    twitter: {
      title: '50 Interview Questions & Answers (2026)',
      description: 'The most common interview questions by category, with answer tips and free AI practice.',
    },
  });

  const totalQuestions = QUESTIONS.reduce((sum, cat) => sum + cat.questions.length, 0);

  // JSON-LD structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the most common interview questions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The most common interview questions fall into 6 categories: behavioral (Tell me about a time...), situational (How would you handle...), self-introduction (Tell me about yourself), strengths and weaknesses, career goals, and company fit. This page covers 50 questions across all 6 categories with answer tips for each.',
        },
      },
      {
        '@type': 'Question',
        name: 'How should I prepare for interview questions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The most effective preparation is practicing answers out loud, not just reading tips. Build a bank of 8-10 stories from your experience, structure them using the STAR method, and practice delivering them until they flow naturally. AI mock interviews provide structured feedback on every answer.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many interview questions should I prepare for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Prepare 8-10 strong STAR stories that can be adapted to different questions. Most behavioral questions map to a few core themes (leadership, conflict, problem-solving, teamwork). If you have a versatile story bank, you can handle most questions with minor adjustments.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">InterviewAnswers.ai</span>
          </Link>
          <Link
            to="/onboarding"
            className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all"
          >
            Practice Free
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Interview Questions & Answers</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">QUESTION BANK</span>
          <span className="text-sm text-gray-500">Updated April 2026</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {totalQuestions} Interview Questions & Answers<br className="hidden sm:block" />
          <span className="text-teal-600">Practice Each One Free</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          The most common job interview questions, organized by category. Each question includes a concise
          answer tip and a link to practice it out loud with AI feedback. Bookmark this page and come back
          before every interview.
        </p>
      </header>

      {/* Category Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Jump to Category
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {QUESTIONS.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-3 hover:bg-teal-50 transition-colors"
              >
                <span className="text-gray-900 font-medium">{cat.category}</span>
                <span className="text-sm text-gray-500">{cat.questions.length} Qs</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Internal Links Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-wrap gap-3">
          <Link to="/star-method-guide" className="text-sm bg-teal-50 text-teal-700 font-medium px-4 py-2 rounded-full hover:bg-teal-100 transition-colors">
            STAR Method Guide &#8594;
          </Link>
          <Link to="/behavioral-interview-questions" className="text-sm bg-teal-50 text-teal-700 font-medium px-4 py-2 rounded-full hover:bg-teal-100 transition-colors">
            40 Behavioral Questions &#8594;
          </Link>
          <Link to="/tell-me-about-yourself" className="text-sm bg-teal-50 text-teal-700 font-medium px-4 py-2 rounded-full hover:bg-teal-100 transition-colors">
            "Tell Me About Yourself" Guide &#8594;
          </Link>
          <Link to="/mock-interview-practice" className="text-sm bg-teal-50 text-teal-700 font-medium px-4 py-2 rounded-full hover:bg-teal-100 transition-colors">
            AI Mock Interview Practice &#8594;
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">

        {/* How to Use This Page */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              How to Use This Page
            </h2>
            <ol className="space-y-2 text-gray-700">
              <li className="flex gap-2"><span className="font-bold text-teal-600">1.</span> Browse questions by category to find what you are most likely to face.</li>
              <li className="flex gap-2"><span className="font-bold text-teal-600">2.</span> Read the answer tip for each question to understand what the interviewer is looking for.</li>
              <li className="flex gap-2"><span className="font-bold text-teal-600">3.</span> Click "Practice this" to answer the question out loud with AI feedback.</li>
              <li className="flex gap-2"><span className="font-bold text-teal-600">4.</span> Use the <Link to="/star-method-guide" className="text-teal-600 hover:underline">STAR method</Link> to structure your behavioral and situational answers.</li>
            </ol>
          </div>
        </section>

        {/* Question Categories */}
        {QUESTIONS.map((cat) => (
          <CategorySection key={cat.id} {...cat} />
        ))}

        {/* Preparation Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Interview Preparation Tips</h2>
          <div className="space-y-4">
            {[
              { title: 'Build a story bank', desc: 'Write down 8-10 stories from your career covering leadership, conflict, failure, teamwork, and initiative. One story can answer multiple questions.' },
              { title: 'Practice out loud', desc: 'Thinking an answer and saying it are completely different. Practice speaking your answers until they flow naturally without sounding memorized.' },
              { title: 'Use the STAR method', desc: 'Structure every behavioral answer with Situation, Task, Action, Result. Spend 60% of your time on the Action section.' },
              { title: 'Time yourself', desc: 'Most answers should be 60-90 seconds. Under a minute feels thin. Over 2 minutes loses the interviewer.' },
              { title: 'Research the company', desc: 'Tailor your "Why this company?" and "Where do you see yourself?" answers to the specific role and organization.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start p-5 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Practice Every Question with AI</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            Reading answer tips is step one. Practicing out loud with structured feedback is what actually
            changes your performance. InterviewAnswers.ai scores your STAR structure, specificity, and delivery
            on every answer. Free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors text-lg inline-flex items-center justify-center gap-2"
            >
              Start Practicing Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-teal-200 text-sm mt-4">No credit card required. Free tier includes 3 AI mock interview sessions/month.</p>
        </section>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">InterviewAnswers.ai</span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {showNursingFeatures() && <Link to="/nurse" className="hover:text-white transition-colors">Nursing Interviews</Link>}
              <Link to="/star-method-guide" className="hover:text-white transition-colors">STAR Method</Link>
              <Link to="/mock-interview-practice" className="hover:text-white transition-colors">Mock Interviews</Link>
              <Link to="/tell-me-about-yourself" className="hover:text-white transition-colors">Tell Me About Yourself</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} InterviewAnswers.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
