// SEO Content Page: Interview Coaching Lessons (Interview Academy)
// Target keywords: "interview coaching" (~18K/mo), "interview preparation course" (~8K/mo),
//   "interview coaching lessons", "free interview course", "interview skills training"
// This page showcases the 25-lesson Interview Academy to capture search traffic.

import { Link } from 'react-router-dom';
import { Brain, ArrowRight, CheckCircle, Headphones, BookOpen, ChevronDown, Play, Award, Clock, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import useDocumentHead from '../../hooks/useDocumentHead';
import { showNursingFeatures } from '../../utils/appTarget';

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 bg-white">{children}</div>}
    </div>
  );
}

const FAQ_DATA = [
  {
    q: 'Are the interview coaching lessons really free?',
    a: 'Yes. All 25 audio lessons and quizzes are available on the free tier. You can complete the entire Interview Academy curriculum without paying anything.',
  },
  {
    q: 'How long does it take to complete the full course?',
    a: 'Each lesson is 5-10 minutes of audio plus a short quiz. At one lesson per day, you can finish in about 5 weeks. Many users complete 2-3 lessons per sitting and finish in under two weeks.',
  },
  {
    q: 'How is this different from watching interview tips on YouTube?',
    a: 'Three key differences: (1) structured curriculum that builds on itself instead of random tips, (2) active recall quizzes after every lesson that force you to retain what you learned, and (3) audio format so you can learn during commutes, workouts, or chores.',
  },
  {
    q: 'Do I need interview experience to start?',
    a: 'No. Module 1 starts with the fundamentals of how behavioral interviews work and builds from there. Whether you are a new graduate or a senior professional changing careers, the curriculum meets you where you are.',
  },
  {
    q: 'Can I combine the lessons with mock interview practice?',
    a: 'Absolutely, and that is the recommended approach. Learn a concept in the Academy, then immediately practice it in a mock interview with AI feedback. The app tracks your progress across both.',
  },
];

export default function InterviewCoachingLessonsPage() {
  useDocumentHead({
    title: 'Free Interview Coaching Lessons: 25 Audio Lessons + Quiz | InterviewAnswers.ai',
    description: 'Learn interview skills with 25 structured audio lessons across 5 modules. Active recall quizzes, STAR method deep dives, and advanced techniques. Free interview preparation course.',
    keywords: 'interview coaching, interview preparation course, interview coaching lessons, free interview course, interview skills training, behavioral interview course, STAR method course, interview preparation, job interview tips, interview training online',
    canonical: 'https://www.interviewanswers.ai/interview-coaching-lessons',
    og: {
      title: 'Free Interview Coaching: 25 Audio Lessons + Quiz | InterviewAnswers.ai',
      description: '25 structured audio lessons with active recall quizzes. Learn interview skills like a course, not a Google search.',
      url: 'https://www.interviewanswers.ai/interview-coaching-lessons',
      type: 'article',
    },
    twitter: {
      title: 'Free Interview Coaching: 25 Audio Lessons + Quiz',
      description: '25 structured audio lessons with quizzes. Learn interview skills like a course, not a Google search.',
    },
  });

  const modules = [
    {
      num: 1,
      title: 'Interview Fundamentals',
      desc: 'How behavioral interviews work and what makes answers great',
      lessons: [
        'How Behavioral Interviews Work',
        'The Anatomy of a Great STAR Answer',
        'Stories, Not Reports',
        'What Interviewers Actually Score',
        'Building Your Story Bank',
      ],
    },
    {
      num: 2,
      title: 'STAR Deep Dive',
      desc: 'Master each component of the STAR framework',
      lessons: [
        'Situation: Setting the Scene',
        'Task: Showing Ownership',
        'Action: The Hero Section',
        'Result: Proving Impact',
        'Putting STAR Together + The 3-Minute Rule',
      ],
    },
    {
      num: 3,
      title: 'Question Type Mastery',
      desc: 'Specific strategies for every question category',
      lessons: [
        '"Tell Me About Yourself"',
        'Behavioral Questions',
        'Danger Zone Questions',
        'Situational Questions',
        '"Why This Role / Why This Company?"',
      ],
    },
    {
      num: 4,
      title: 'Advanced Techniques',
      desc: 'Tactics that separate good candidates from exceptional ones',
      lessons: [
        'Bridge Answers',
        'Handling Curveball Questions',
        'Panel and Virtual Interview Tactics',
        'Questions to Ask Them',
        'Company Research and the Briefcase Technique',
      ],
    },
    {
      num: 5,
      title: 'Beyond the Interview',
      desc: 'Presence, negotiation, follow-up, and multi-round strategy',
      lessons: [
        'Confidence and Presence',
        'Body Language and Nonverbal Communication',
        'Salary Negotiation',
        'Follow-Up and Thank You Notes',
        'Multi-Round Interview Strategy',
      ],
    },
  ];

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
            Start Free
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Interview Coaching Lessons</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">INTERVIEW ACADEMY</span>
          <span className="text-sm text-gray-500">25 Lessons | 5 Modules</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Interview Coaching:<br className="hidden sm:block" />
          <span className="text-teal-600">25 Free Audio Lessons</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Learn interview skills like a course, not a Google search. 25 expert audio lessons with active recall
          quizzes that build on each other — from fundamentals through advanced negotiation tactics.
        </p>
      </header>

      {/* Quick stats bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: <Headphones className="w-5 h-5 text-teal-600" />, stat: '25', label: 'Audio Lessons' },
            { icon: <BookOpen className="w-5 h-5 text-teal-600" />, stat: '5', label: 'Modules' },
            { icon: <Clock className="w-5 h-5 text-teal-600" />, stat: '5-10 min', label: 'Per Lesson' },
            { icon: <Award className="w-5 h-5 text-teal-600" />, stat: '75', label: 'Quiz Questions' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-2">{item.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{item.stat}</div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">

        {/* Why audio lessons work */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Audio Lessons Work for Interview Prep</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Most interview advice lives in blog posts and YouTube videos — content you can only consume when sitting
            at a screen. Audio lessons change that. You can sharpen your interview skills during your commute, at
            the gym, or while making dinner.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Learn Anywhere', desc: 'Commute, gym, walks — your idle time becomes prep time. No screen required.' },
              { title: 'Active Recall Quizzes', desc: 'Every lesson ends with a quiz that forces retrieval, the proven method for long-term retention.' },
              { title: 'Structured Curriculum', desc: 'Lessons build on each other. No jumping between random tips — a real progression from basics to advanced.' },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The 5 Modules */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Full Curriculum: 5 Modules, 25 Lessons</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Each module contains five lessons that progress from foundational concepts to advanced application.
            Complete them in order for the best results, or jump to the module that matches your biggest gap.
          </p>

          <div className="space-y-4">
            {modules.map((mod) => (
              <AccordionItem
                key={mod.num}
                title={`Module ${mod.num}: ${mod.title}`}
                defaultOpen={mod.num === 1}
              >
                <p className="text-gray-600 mb-4">{mod.desc}</p>
                <div className="space-y-2">
                  {mod.lessons.map((lesson, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-7 h-7 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {mod.num}.{i + 1}
                      </div>
                      <Play className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-800 font-medium">{lesson}</span>
                      <span className="text-xs text-gray-400 ml-auto">5-10 min</span>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How the Interview Academy Works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Pick a Module', desc: 'Start with Module 1 for the fundamentals, or jump to the topic you need most. Each module stands on its own.' },
              { step: '2', title: 'Listen to the Lesson', desc: 'Press play and listen. Each lesson is 5-10 minutes of focused coaching — designed for commutes, walks, or any downtime.' },
              { step: '3', title: 'Take the Quiz', desc: 'After each lesson, answer 3 active recall questions. These are not trick questions — they reinforce the key concepts you just heard.' },
              { step: '4', title: 'Track Your Progress', desc: 'The app tracks which lessons and quizzes you have completed. Come back anytime to review or continue where you left off.' },
              { step: '5', title: 'Practice What You Learned', desc: 'Apply concepts immediately in AI mock interviews. The best learning loop: listen to a lesson, then practice it live.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What makes this different */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Interview Academy vs. YouTube and Blog Posts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 pr-4 text-sm font-bold text-gray-500 uppercase tracking-wide"></th>
                  <th className="py-3 px-4 text-sm font-bold text-teal-600 uppercase tracking-wide">Interview Academy</th>
                  <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-wide">YouTube / Blogs</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {[
                  ['Format', 'Audio lessons (hands-free)', 'Video / text (screen required)'],
                  ['Structure', '25 lessons in logical order', 'Random tips, no progression'],
                  ['Retention', 'Quiz after every lesson', 'No built-in recall testing'],
                  ['Progress tracking', 'Dashboard shows completion', 'No tracking'],
                  ['Practice integration', 'Immediate AI mock interview', 'Practice on your own'],
                  ['Time per session', '5-10 focused minutes', '10-30 min (often padded)'],
                ].map(([feature, academy, other], i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-900">{feature}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                        {academy}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Who it's for */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Who the Interview Academy Is For</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { who: 'Job Seekers with Upcoming Interviews', why: 'Structured preparation that covers every question type and interview format in a few weeks.' },
              { who: 'Career Changers', why: 'Learn how to frame experience from one industry as relevant to another using the STAR method and bridge answers.' },
              { who: 'New Graduates', why: 'Module 1 covers the fundamentals. Even with limited work experience, you can learn to tell compelling stories from internships, projects, and coursework.' },
              { who: 'Busy Professionals', why: 'Audio format means you can prepare during commutes or workouts. No need to carve out screen time.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2">{item.who}</h3>
                <p className="text-sm text-gray-600">{item.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Continue Your Preparation</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/star-method-guide" className="block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">The Complete STAR Method Guide</h3>
              <p className="text-sm text-gray-500 mt-1">Deep dive into Situation, Task, Action, Result with examples.</p>
            </Link>
            <Link to="/behavioral-interview-questions" className="block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">40 Behavioral Interview Questions</h3>
              <p className="text-sm text-gray-500 mt-1">Practice the most common behavioral questions by category.</p>
            </Link>
            <Link to="/mock-interview-practice" className="block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">AI Mock Interview Practice</h3>
              <p className="text-sm text-gray-500 mt-1">Practice with an AI interviewer that adapts and gives real-time feedback.</p>
            </Link>
            <Link to="/interview-questions-and-answers" className="block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Top 50 Interview Questions and Answers</h3>
              <p className="text-sm text-gray-500 mt-1">Common questions across all categories with answer strategies.</p>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Interview Coaching Lessons: Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <AccordionItem key={i} title={faq.q} defaultOpen={i === 0}>
                <p className="text-gray-600">{faq.a}</p>
              </AccordionItem>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start the Interview Academy Free</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            25 audio lessons. Active recall quizzes. Structured curriculum that builds real interview skills.
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors text-lg inline-flex items-center justify-center gap-2"
            >
              Start Learning Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-teal-200 text-sm mt-4">All 25 lessons available on the free tier. No credit card required.</p>
        </section>
      </article>

      {/* JSON-LD FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_DATA.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          }),
        }}
      />

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
              <Link to="/star-method-guide" className="hover:text-white transition-colors">STAR Method Guide</Link>
              <Link to="/behavioral-interview-questions" className="hover:text-white transition-colors">Behavioral Questions</Link>
              <Link to="/interview-prep-podcast" className="hover:text-white transition-colors">Prep Radio</Link>
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
