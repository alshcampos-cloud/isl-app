// SEO Content Page: Mock Interview Practice
// Target keywords: "mock interview practice", "AI mock interview", "online mock interview",
//   "practice interview online", "free mock interview", "interview simulator"
// This page exists to capture long-tail search traffic and funnel visitors into the app.

import { Link } from 'react-router-dom';
import { Brain, ArrowRight, CheckCircle, Mic, MessageSquare, BarChart3, Users, Phone, ChevronDown, Sparkles, Clock, Target } from 'lucide-react';
import { useState } from 'react';
import useDocumentHead from '../../hooks/useDocumentHead';
import { showNursingFeatures } from '../../utils/appTarget';

function FAQItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-semibold text-gray-900">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 bg-white text-gray-600 leading-relaxed">{answer}</div>}
    </div>
  );
}

export default function MockInterviewPracticePage() {
  useDocumentHead({
    title: 'Free AI Mock Interview Practice Online | InterviewAnswers.ai',
    description: 'Practice mock interviews with an AI interviewer that adapts to your answers. Get instant feedback on STAR structure, delivery, and confidence. Free — no credit card required.',
    keywords: 'mock interview practice, AI mock interview, online mock interview, practice interview online, free mock interview, interview simulator, interview practice tool, mock interview questions',
    canonical: 'https://www.interviewanswers.ai/mock-interview-practice',
    og: {
      title: 'Free AI Mock Interview Practice Online',
      description: 'Practice mock interviews with an AI interviewer. Get instant feedback on your answers. Free to start.',
      url: 'https://www.interviewanswers.ai/mock-interview-practice',
      type: 'article',
    },
    twitter: {
      title: 'Free AI Mock Interview Practice Online',
      description: 'Practice mock interviews with an AI interviewer. Get instant feedback on your answers.',
    },
  });

  // JSON-LD structured data for FAQ
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is AI mock interview practice effective?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Research shows that practicing answers out loud produces better interview performance than mental rehearsal alone. AI mock interviews let you practice as many times as you want with instant, structured feedback on your STAR structure, specificity, and delivery.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does an AI mock interview work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You choose an interview format (behavioral, phone screen, panel, or final round), and the AI asks you real interview questions one at a time. You answer out loud or by typing. After each answer, the AI scores your response on structure, specificity, and confidence, then moves to the next question.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The free tier includes 3 full AI mock interview sessions per month. No credit card is required to sign up. Upgrade to a 30-Day Pass for $39 — no subscription, no auto-renew. Or get the Annual Pass for $129/year.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I practice specific types of interview questions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can choose from behavioral questions, phone screen questions, panel interview scenarios, and final round questions. The AI draws from a curated bank of real interview questions across multiple categories.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is this different from practicing with a friend?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI mock interviews are available 24/7, never judge you, and provide structured scoring on every answer. A friend may be encouraging but vague. The AI evaluates whether you used the STAR method, included specific details, quantified results, and communicated confidently.',
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
          <span className="text-gray-900">Mock Interview Practice</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">AI INTERVIEW PRACTICE</span>
          <span className="text-sm text-gray-500">Updated April 2026</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Free AI Mock Interview Practice
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Stop rehearsing answers in your head. Practice with an AI interviewer that asks real questions,
          listens to your responses, and gives you structured feedback on every answer. Available 24/7, totally free to start.
        </p>
        <div className="mt-8">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all text-lg"
          >
            Start Practicing Free — No Credit Card <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">

        {/* What is AI Mock Interview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Is an AI Mock Interview?</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            An AI mock interview simulates a real job interview using artificial intelligence. Instead of
            reading questions off a list, the AI interviewer asks you questions one at a time, waits for your
            spoken or typed response, evaluates your answer using the STAR method framework, and gives you
            actionable feedback before moving to the next question.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            The result is realistic, low-pressure interview practice you can do from your couch at midnight
            or during a lunch break — as many times as you need until your answers feel natural and confident.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works — 3 Simple Steps</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                icon: <Target className="w-6 h-6 text-teal-600" />,
                title: 'Choose Your Interview Format',
                desc: 'Select behavioral, phone screen, panel, or final round. The AI tailors its questions and evaluation criteria to match the format you are preparing for.',
              },
              {
                step: '2',
                icon: <Mic className="w-6 h-6 text-teal-600" />,
                title: 'Practice Out Loud',
                desc: 'Answer each question by speaking naturally or typing. The AI listens to your full response before evaluating — just like a real interviewer would.',
              },
              {
                step: '3',
                icon: <BarChart3 className="w-6 h-6 text-teal-600" />,
                title: 'Get Structured Feedback',
                desc: 'After each answer, see scores for STAR structure, specificity, confidence, and delivery. The AI highlights what worked and what to improve.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 p-6 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-700 text-xl shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {item.icon}
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why AI Practice is Better */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why AI Practice Beats Practicing Alone</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Available 24/7', desc: 'Practice at 6 AM or midnight. No scheduling, no waiting for a friend to be free.', icon: <Clock className="w-5 h-5 text-teal-600" /> },
              { title: 'No judgment', desc: 'Stumble over your words? Start over. The AI never judges — it just helps you improve.', icon: <CheckCircle className="w-5 h-5 text-teal-600" /> },
              { title: 'Structured scoring', desc: 'Every answer gets scored on STAR structure, specificity, and confidence — not vague "that was good."', icon: <BarChart3 className="w-5 h-5 text-teal-600" /> },
              { title: 'Unlimited repetition', desc: 'Practice the same question 10 times until your answer flows naturally. No one gets tired of asking.', icon: <Sparkles className="w-5 h-5 text-teal-600" /> },
              { title: 'Real interview questions', desc: 'Questions drawn from a curated bank of what hiring managers actually ask across industries.', icon: <MessageSquare className="w-5 h-5 text-teal-600" /> },
              { title: 'Speak out loud', desc: 'Thinking an answer and saying it are different skills. Practice saying it until it is second nature.', icon: <Mic className="w-5 h-5 text-teal-600" /> },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  {item.icon}
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4 Interview Formats */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">4 Interview Formats You Can Practice</h2>
          <p className="text-lg text-gray-600 mb-6">
            Different interview rounds test different things. Choose the format that matches your upcoming interview.
          </p>
          <div className="space-y-4">
            {[
              {
                icon: <MessageSquare className="w-6 h-6 text-teal-600" />,
                title: 'Behavioral Interview',
                desc: 'The most common format. Questions start with "Tell me about a time..." and test how you handled real situations. Uses STAR method evaluation.',
                example: '"Tell me about a time you had to meet a tight deadline."',
              },
              {
                icon: <Phone className="w-6 h-6 text-blue-600" />,
                title: 'Phone Screen',
                desc: 'The first hurdle. Quick, focused questions testing fit and communication. Usually 20-30 minutes with a recruiter.',
                example: '"Walk me through your resume and why you are interested in this role."',
              },
              {
                icon: <Users className="w-6 h-6 text-indigo-600" />,
                title: 'Panel Interview',
                desc: 'Multiple interviewers, multiple perspectives. Tests your ability to engage a group and give answers that satisfy different priorities.',
                example: '"How would you handle a project that is behind schedule with competing stakeholder demands?"',
              },
              {
                icon: <Target className="w-6 h-6 text-emerald-600" />,
                title: 'Final Round',
                desc: 'The deep dive. Longer, more probing questions about leadership, strategy, and cultural fit. This is where offers are won or lost.',
                example: '"Where do you see yourself contributing most in the first 90 days?"',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  {item.icon}
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-600 mb-2">{item.desc}</p>
                <p className="text-sm text-gray-500 italic">Example: {item.example}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <FAQItem
              question="Is AI mock interview practice effective?"
              answer="Yes. Research shows that practicing answers out loud produces better interview performance than mental rehearsal alone. AI mock interviews let you practice as many times as you want with instant, structured feedback on your STAR structure, specificity, and delivery."
              defaultOpen={true}
            />
            <FAQItem
              question="How does an AI mock interview work?"
              answer="You choose an interview format (behavioral, phone screen, panel, or final round), and the AI asks you real interview questions one at a time. You answer out loud or by typing. After each answer, the AI scores your response on structure, specificity, and confidence, then moves to the next question."
            />
            <FAQItem
              question="Is it really free?"
              answer="Yes. The free tier includes 3 full AI mock interview sessions per month. No credit card is required to sign up. Upgrade to a 30-Day Pass for $39 — no subscription, no auto-renew. Or get the Annual Pass for $129/year."
            />
            <FAQItem
              question="Can I practice specific types of interview questions?"
              answer="Yes. You can choose from behavioral questions, phone screen questions, panel interview scenarios, and final round questions. The AI draws from a curated bank of real interview questions across multiple categories."
            />
            <FAQItem
              question="How is this different from practicing with a friend?"
              answer="AI mock interviews are available 24/7, never judge you, and provide structured scoring on every answer. A friend may be encouraging but vague. The AI evaluates whether you used the STAR method, included specific details, quantified results, and communicated confidently."
            />
          </div>
        </section>

        {/* Internal Links */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Interview Resources</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/star-method-guide" className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-1">STAR Method Guide</h3>
              <p className="text-sm text-gray-600">Learn the framework top candidates use for behavioral interviews.</p>
            </Link>
            <Link to="/behavioral-interview-questions" className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-1">40 Behavioral Interview Questions</h3>
              <p className="text-sm text-gray-600">Browse questions by category and practice each one.</p>
            </Link>
            <Link to="/tell-me-about-yourself" className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-1">How to Answer "Tell Me About Yourself"</h3>
              <p className="text-sm text-gray-600">The framework and examples for the most common opening question.</p>
            </Link>
            <Link to="/interview-questions-and-answers" className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-1">50 Interview Questions & Answers</h3>
              <p className="text-sm text-gray-600">The most common questions across every category, with answer tips.</p>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            InterviewAnswers.ai conducts realistic AI mock interviews, scores every answer instantly,
            and coaches you to give stronger, more specific responses. Free to start — no credit card required.
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
              <Link to="/behavioral-interview-questions" className="hover:text-white transition-colors">Behavioral Questions</Link>
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
