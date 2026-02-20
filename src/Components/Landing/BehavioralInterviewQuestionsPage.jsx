// SEO Content Page: Behavioral Interview Questions
// Target keywords: "behavioral interview questions", "behavioral interview questions and answers",
//   "common behavioral interview questions", "tell me about a time", "interview questions 2026"
// High-volume search term page designed to capture organic traffic.

import { Link } from 'react-router-dom';
import { Brain, ArrowRight, Target, Sparkles, ChevronDown, BookOpen, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import useDocumentHead from '../../hooks/useDocumentHead';

const questionCategories = [
  {
    category: 'Leadership & Influence',
    icon: '👔',
    questions: [
      'Tell me about a time you led a team through a difficult project.',
      'Describe a situation where you had to influence someone without formal authority.',
      'Give me an example of when you had to make an unpopular decision.',
      'Tell me about a time you mentored or developed a team member.',
      'Describe a situation where you had to rally a team during a setback.',
    ],
  },
  {
    category: 'Problem Solving & Critical Thinking',
    icon: '🧩',
    questions: [
      'Describe a complex problem you solved with limited information.',
      'Tell me about a time you identified a problem before it became critical.',
      'Give me an example of a creative solution you developed for a tough challenge.',
      'Describe a situation where you had to make a decision with incomplete data.',
      'Tell me about a time you simplified a complicated process.',
    ],
  },
  {
    category: 'Teamwork & Collaboration',
    icon: '🤝',
    questions: [
      'Tell me about a successful project you worked on with a cross-functional team.',
      'Describe a time when you disagreed with a teammate. How did you handle it?',
      'Give me an example of when you had to collaborate with someone whose work style was very different from yours.',
      'Tell me about a time you helped a struggling team member.',
      'Describe a situation where you had to build consensus among a group.',
    ],
  },
  {
    category: 'Adaptability & Resilience',
    icon: '🔄',
    questions: [
      'Tell me about a time you had to quickly adapt to a major change at work.',
      'Describe a situation where you faced an unexpected challenge.',
      'Give me an example of when priorities shifted and you had to adjust.',
      'Tell me about a time you worked outside your comfort zone.',
      'Describe a situation where you had to learn a new skill under pressure.',
    ],
  },
  {
    category: 'Conflict Resolution',
    icon: '⚖️',
    questions: [
      'Tell me about a conflict you had with a coworker and how you resolved it.',
      'Describe a time you had to deliver difficult feedback to someone.',
      'Give me an example of when you mediated a disagreement between others.',
      'Tell me about a situation where you had to manage a difficult stakeholder.',
      'Describe a time when you turned a negative work relationship into a productive one.',
    ],
  },
  {
    category: 'Failure & Growth',
    icon: '📈',
    questions: [
      'Tell me about a time you failed. What did you learn?',
      'Describe a situation where things didn\'t go as planned despite your best efforts.',
      'Give me an example of when you received critical feedback and how you responded.',
      'Tell me about a mistake you made and how you handled it.',
      'Describe a time when you had to admit you were wrong.',
    ],
  },
  {
    category: 'Time Management & Prioritization',
    icon: '⏰',
    questions: [
      'Tell me about a time you had to manage multiple competing deadlines.',
      'Describe a situation where you had to prioritize between urgent tasks.',
      'Give me an example of when you delivered a project under a tight deadline.',
      'Tell me about a time you had to say no to a request in order to focus on priorities.',
      'Describe a situation where you improved efficiency in a process.',
    ],
  },
  {
    category: 'Communication',
    icon: '💬',
    questions: [
      'Tell me about a time you had to explain something complex to a non-technical audience.',
      'Describe a situation where clear communication prevented a problem.',
      'Give me an example of a presentation or pitch that went well.',
      'Tell me about a time you had to communicate bad news to a client or stakeholder.',
      'Describe a situation where miscommunication led to an issue and how you fixed it.',
    ],
  },
];

function CategoryCard({ category, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <span className="text-lg font-semibold text-gray-900">{category.category}</span>
            <span className="text-sm text-gray-500 ml-2">({category.questions.length} questions)</span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 bg-white">
          <ol className="space-y-3">
            {category.questions.map((q, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="bg-teal-100 text-teal-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700">{q}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              to="/onboarding"
              className="text-teal-600 hover:text-teal-700 font-medium text-sm inline-flex items-center gap-1"
            >
              Practice these with AI mock interviews <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BehavioralInterviewQuestionsPage() {
  const [openCategories, setOpenCategories] = useState(new Set([0]));

  const toggleCategory = (index) => {
    const next = new Set(openCategories);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setOpenCategories(next);
  };

  const totalQuestions = questionCategories.reduce((sum, c) => sum + c.questions.length, 0);

  useDocumentHead({
    title: `${totalQuestions} Behavioral Interview Questions by Category (2026) | InterviewAnswers.ai`,
    description: `${totalQuestions} behavioral interview questions organized by category: leadership, problem solving, teamwork, conflict, and more. Practice with AI mock interviews. Free question bank.`,
    keywords: 'behavioral interview questions, behavioral interview questions and answers, common behavioral interview questions, tell me about a time, interview questions 2026, STAR method questions, leadership interview questions, teamwork interview questions, problem solving interview questions',
    canonical: 'https://www.interviewanswers.ai/behavioral-interview-questions',
    og: {
      title: `${totalQuestions} Behavioral Interview Questions by Category (2026)`,
      description: 'Complete list of behavioral interview questions organized by category. Practice with AI mock interviews.',
      url: 'https://www.interviewanswers.ai/behavioral-interview-questions',
      type: 'article',
    },
    twitter: {
      title: `${totalQuestions} Behavioral Interview Questions (2026)`,
      description: 'Complete list of behavioral interview questions by category. Practice with AI mock interviews.',
    },
  });

  return (
    <div className="min-h-screen bg-white">
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
          <span className="text-gray-900">Behavioral Interview Questions</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">QUESTION BANK</span>
          <span className="text-sm text-gray-500">Updated February 2026</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {totalQuestions} Behavioral Interview Questions<br className="hidden sm:block" />
          <span className="text-indigo-600">Organized by Category</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          The most common behavioral interview questions, organized into 8 categories. Each question
          can be answered using the <Link to="/star-method-guide" className="text-teal-600 hover:text-teal-700 font-medium underline">STAR method</Link>.
          Use this list to prepare stories from your real experience — then practice them out loud.
        </p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 mt-8">
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm">
            <span className="font-bold text-gray-900">{totalQuestions}</span> <span className="text-gray-500">questions</span>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm">
            <span className="font-bold text-gray-900">{questionCategories.length}</span> <span className="text-gray-500">categories</span>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm">
            <span className="font-bold text-gray-900">Free</span> <span className="text-gray-500">AI practice included</span>
          </div>
        </div>
      </header>

      {/* How to Use This Page */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            How to Use This Question Bank
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Pick 2-3 per category</p>
                <p className="text-sm text-gray-600">Don't try to memorize all {totalQuestions}. Choose the ones most relevant to your target role.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Draft STAR answers</p>
                <p className="text-sm text-gray-600">Write out your Situation, Task, Action, and Result for each. Use real stories.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Practice out loud</p>
                <p className="text-sm text-gray-600">Use our AI mock interviewer to practice answering with real-time feedback.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions by Category */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Questions by Category</h2>
        <div className="space-y-4">
          {questionCategories.map((cat, i) => (
            <CategoryCard
              key={cat.category}
              category={cat}
              isOpen={openCategories.has(i)}
              onToggle={() => toggleCategory(i)}
            />
          ))}
        </div>

        {/* Pro Tips Section */}
        <section className="mt-16 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips for Answering Behavioral Questions</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: 'Use the STAR Method', desc: 'Structure every answer with Situation, Task, Action, Result. This keeps you focused and gives the interviewer a clear narrative.', link: '/star-method-guide', linkText: 'Read our STAR Method Guide' },
              { title: 'Prepare 8-10 Core Stories', desc: 'Most behavioral questions overlap. A story about conflict resolution can also demonstrate communication and leadership.' },
              { title: 'Quantify Your Results', desc: 'Numbers are memorable. "Improved efficiency" is forgettable. "Reduced processing time by 40%, saving 15 hours per week" sticks.' },
              { title: 'Be Honest About Failures', desc: 'When asked about mistakes or failures, own them. Show what you learned and how you applied that lesson. Authenticity wins.' },
            ].map((tip, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{tip.desc}</p>
                {tip.link && (
                  <Link to={tip.link} className="text-teal-600 hover:text-teal-700 text-sm font-medium inline-flex items-center gap-1">
                    {tip.linkText} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Practice These Questions?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            InterviewAnswers.ai asks you these exact questions in realistic mock interviews,
            scores your STAR structure, and coaches you to give stronger answers. Free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg inline-flex items-center justify-center gap-2"
            >
              Start AI Mock Interview <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-indigo-200 text-sm mt-4">No credit card required. Free tier includes 3 AI mock interview sessions/month.</p>
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
              <Link to="/star-method-guide" className="hover:text-white transition-colors">STAR Method Guide</Link>
              <Link to="/nurse" className="hover:text-white transition-colors">Nursing Interviews</Link>
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
