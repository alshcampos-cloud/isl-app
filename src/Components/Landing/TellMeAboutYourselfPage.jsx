// SEO Content Page: Tell Me About Yourself
// Target keywords: "tell me about yourself interview", "how to answer tell me about yourself",
//   "tell me about yourself example", "introduce yourself in interview", "self introduction interview"
// This page exists to capture long-tail search traffic and funnel visitors into the app.

import { Link } from 'react-router-dom';
import { Brain, ArrowRight, CheckCircle, AlertTriangle, ChevronDown, Sparkles, BookOpen } from 'lucide-react';
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

export default function TellMeAboutYourselfPage() {
  useDocumentHead({
    title: 'Tell Me About Yourself: How to Answer + Practice with AI (2026)',
    description: 'Learn how to answer "Tell me about yourself" with the Present-Past-Future framework. 3 example answers for different career stages. Practice with AI feedback.',
    keywords: 'tell me about yourself interview, how to answer tell me about yourself, tell me about yourself example, introduce yourself in interview, self introduction interview, tell me about yourself answer, interview opening question',
    canonical: 'https://www.interviewanswers.ai/tell-me-about-yourself',
    og: {
      title: 'How to Answer "Tell Me About Yourself" (2026)',
      description: 'The Present-Past-Future framework with 3 example answers. Practice with AI feedback.',
      url: 'https://www.interviewanswers.ai/tell-me-about-yourself',
      type: 'article',
    },
    twitter: {
      title: 'How to Answer "Tell Me About Yourself" in an Interview',
      description: 'The proven framework with example answers for every career stage.',
    },
  });

  // JSON-LD structured data for FAQ
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long should my "Tell me about yourself" answer be?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Aim for 60 to 90 seconds. Under 30 seconds feels unprepared. Over 2 minutes loses the interviewer\'s attention. Practice timing yourself — most people underestimate how long they speak.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I talk about my personal life?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Keep it professional. Briefly mentioning a relevant hobby or passion is fine if it connects to the role, but the focus should be on your professional experience, skills, and what you bring to this specific position.',
        },
      },
      {
        '@type': 'Question',
        name: 'What if I am a new graduate with no work experience?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Focus on your education, relevant coursework, internships, volunteer work, or class projects. The Present-Past-Future framework works even without traditional work experience — lead with what you are studying and why, then describe relevant projects, and finish with your career goals.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I memorize my answer word for word?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Memorize the structure (Present-Past-Future), not the exact words. A memorized script sounds robotic. Instead, practice the key points until you can deliver them naturally in slightly different words each time.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I tailor this answer for different jobs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Adjust the "Present" and "Future" sections for each role. Emphasize the skills and experiences most relevant to the specific job description. Your "Past" section stays mostly the same, but the framing should connect to what this employer values.',
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
          <Link to="/interview-questions-and-answers" className="hover:text-teal-600 transition-colors">Interview Questions</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Tell Me About Yourself</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">INTERVIEW GUIDE</span>
          <span className="text-sm text-gray-500">Updated April 2026</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          How to Answer<br className="hidden sm:block" />
          <span className="text-teal-600">"Tell Me About Yourself"</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          It is the most common opening question in job interviews — and most people answer it poorly.
          This guide gives you a simple 3-part framework, example answers for different career stages,
          and a way to practice with AI feedback until your delivery is natural.
        </p>
      </header>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            In This Guide
          </h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-gray-700">
            <li><a href="#why-it-matters" className="hover:text-teal-600 transition-colors">&#8594; Why This Question Matters</a></li>
            <li><a href="#framework" className="hover:text-teal-600 transition-colors">&#8594; The Present-Past-Future Framework</a></li>
            <li><a href="#examples" className="hover:text-teal-600 transition-colors">&#8594; 3 Example Answers</a></li>
            <li><a href="#mistakes" className="hover:text-teal-600 transition-colors">&#8594; Common Mistakes to Avoid</a></li>
            <li><a href="#practice-with-ai" className="hover:text-teal-600 transition-colors">&#8594; How to Practice with AI</a></li>
            <li><a href="#faq" className="hover:text-teal-600 transition-colors">&#8594; FAQ</a></li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">

        {/* Why It Matters */}
        <section id="why-it-matters" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why This Question Matters More Than You Think</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            "Tell me about yourself" is not small talk. It is the interviewer giving you the microphone and
            saying: convince me to keep listening. Your answer sets the tone for the entire interview. A strong
            opening builds momentum and confidence. A weak one puts you on the back foot for the next 45 minutes.
          </p>
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8">
            <h3 className="font-bold text-gray-900 mb-3">What the interviewer is actually evaluating:</h3>
            <ul className="space-y-2">
              {[
                'Can you communicate clearly and concisely?',
                'Do you understand what is relevant for this role?',
                'Are you self-aware about your strengths and career direction?',
                'Do you sound confident and prepared?',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The Framework */}
        <section id="framework" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Present &#8594; Past &#8594; Future Framework</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            The best answers follow a simple structure that keeps you focused and the interviewer engaged.
            Start with now, give context from your past, then connect it to your future at this company.
          </p>
          <div className="space-y-4">
            {[
              {
                label: 'Present',
                color: 'teal',
                title: 'Where you are now',
                desc: 'Start with your current role, what you do, and one key accomplishment or strength. This is your headline — make it count.',
                example: '"I am currently a product manager at a mid-size SaaS company, where I lead a team of 8 and recently shipped a feature that increased user retention by 18%."',
                time: '~20 seconds',
              },
              {
                label: 'Past',
                color: 'blue',
                title: 'How you got here',
                desc: 'Briefly connect the dots. What experience or decisions led to your current expertise? Pick 1-2 relevant highlights, not your entire resume.',
                example: '"Before that, I spent three years in customer success, which gave me deep empathy for the user. I transitioned to product because I wanted to solve the problems I was seeing firsthand."',
                time: '~20 seconds',
              },
              {
                label: 'Future',
                color: 'emerald',
                title: 'Why you are here (at this interview)',
                desc: 'Connect your trajectory to this specific role. Why does this opportunity excite you? What do you want to do next?',
                example: '"I am excited about this role because your company is tackling enterprise onboarding, which is exactly where my product and customer success experience intersect. I want to build onboarding flows that make complex software feel simple."',
                time: '~20 seconds',
              },
            ].map((item) => (
              <div key={item.label} className={`bg-${item.color}-50 rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`bg-${item.color}-200 text-${item.color}-800 font-bold text-xs px-3 py-1 rounded-full`}>
                    {item.label.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <span className="text-sm text-gray-500 ml-auto">{item.time}</span>
                </div>
                <p className="text-gray-600 mb-3">{item.desc}</p>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-700 italic">{item.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Example Answers */}
        <section id="examples" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">3 Example Answers by Career Stage</h2>

          {/* New Grad */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">NEW GRADUATE</span>
            </h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 italic leading-relaxed">
                "I just graduated from the University of Texas with a degree in Marketing, where I focused on digital
                analytics and consumer behavior. During my senior year, I led a team project that created a social media
                campaign for a local nonprofit — we grew their following by 340% in three months and it ended up becoming
                a case study for the program. That experience confirmed that I want to build my career in digital marketing,
                and I am drawn to your agency because you work with brands that are scaling fast, which is the environment
                where I do my best work."
              </p>
            </div>
          </div>

          {/* Mid-Career */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">MID-CAREER</span>
            </h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 italic leading-relaxed">
                "I am a senior software engineer with six years of experience building backend systems, currently at a
                fintech company where I lead the payments team. Last quarter, I redesigned our transaction processing
                pipeline, which cut latency by 40% and saved us $200K annually in infrastructure costs. I started my
                career in consulting, which taught me how to communicate technical tradeoffs to non-technical stakeholders.
                I am looking at this role because you are building distributed systems at a scale that genuinely excites
                me, and I want to be part of the team solving those hard problems."
              </p>
            </div>
          </div>

          {/* Career Changer */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">CAREER CHANGER</span>
            </h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 italic leading-relaxed">
                "For the past eight years, I have been a high school science teacher, and I recently completed a UX
                design certificate because I discovered a passion for designing learning experiences digitally.
                In the classroom, I redesigned our lab curriculum around student feedback, which improved engagement
                scores by 25%. That process — researching user needs, prototyping solutions, and iterating based on
                data — is exactly what drew me to UX design. I am excited about this junior UX role because you are
                building educational products, and I bring firsthand understanding of how learners actually think."
              </p>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section id="mistakes" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Mistakes to Avoid</h2>
          <div className="space-y-4">
            {[
              {
                mistake: 'Starting with your life story',
                fix: 'Nobody needs to hear where you were born. Start with your current professional reality and work backward only as far as relevant.',
              },
              {
                mistake: 'Rambling past 2 minutes',
                fix: 'The ideal answer is 60-90 seconds. If you are going longer, you are including too much. Cut anything that does not directly serve the role you are interviewing for.',
              },
              {
                mistake: 'Being too vague',
                fix: '"I have experience in marketing" says nothing. "I led a 3-person team that grew organic traffic by 150% in 6 months" says everything.',
              },
              {
                mistake: 'Reciting your resume line by line',
                fix: 'The interviewer has your resume. They want the narrative — the thread that connects your experiences and leads to this role.',
              },
              {
                mistake: 'Forgetting the "Future" part',
                fix: 'Many candidates describe their background but never say why they are sitting in THIS interview. The "Future" section shows intent and research.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.mistake}</h3>
                  <p className="text-gray-600">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Practice with AI */}
        <section id="practice-with-ai" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Practice This Question with AI</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Reading tips is helpful. Practicing out loud is what actually changes your delivery.
            InterviewAnswers.ai lets you practice answering "Tell me about yourself" with an AI interviewer
            that evaluates your answer and gives structured feedback.
          </p>
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8">
            <h3 className="font-bold text-gray-900 mb-4">What the AI evaluates:</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Structure', desc: 'Did you use the Present-Past-Future flow?' },
                { label: 'Specificity', desc: 'Did you include concrete details and numbers?' },
                { label: 'Relevance', desc: 'Did you connect your story to the role?' },
                { label: 'Timing', desc: 'Was your answer in the 60-90 second sweet spot?' },
                { label: 'Confidence', desc: 'Did you sound clear and self-assured?' },
                { label: 'Filler words', desc: 'Did you avoid um, uh, like, you know?' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-gray-900">{item.label}:</span>{' '}
                    <span className="text-gray-600 text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <FAQItem
              question='How long should my "Tell me about yourself" answer be?'
              answer='Aim for 60 to 90 seconds. Under 30 seconds feels unprepared. Over 2 minutes loses the interviewer&apos;s attention. Practice timing yourself — most people underestimate how long they speak.'
              defaultOpen={true}
            />
            <FAQItem
              question="Should I talk about my personal life?"
              answer="Keep it professional. Briefly mentioning a relevant hobby or passion is fine if it connects to the role, but the focus should be on your professional experience, skills, and what you bring to this specific position."
            />
            <FAQItem
              question="What if I am a new graduate with no work experience?"
              answer="Focus on your education, relevant coursework, internships, volunteer work, or class projects. The Present-Past-Future framework works even without traditional work experience — lead with what you are studying and why, then describe relevant projects, and finish with your career goals."
            />
            <FAQItem
              question="Should I memorize my answer word for word?"
              answer="No. Memorize the structure (Present-Past-Future), not the exact words. A memorized script sounds robotic. Instead, practice the key points until you can deliver them naturally in slightly different words each time."
            />
            <FAQItem
              question="How do I tailor this answer for different jobs?"
              answer='Adjust the "Present" and "Future" sections for each role. Emphasize the skills and experiences most relevant to the specific job description. Your "Past" section stays mostly the same, but the framing should connect to what this employer values.'
            />
          </div>
        </section>

        {/* Internal Links */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Interview Resources</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/star-method-guide" className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-1">STAR Method Guide</h3>
              <p className="text-sm text-gray-600">The framework for answering behavioral questions with structured stories.</p>
            </Link>
            <Link to="/mock-interview-practice" className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-1">AI Mock Interview Practice</h3>
              <p className="text-sm text-gray-600">Full mock interviews with instant AI feedback on every answer.</p>
            </Link>
            <Link to="/behavioral-interview-questions" className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-1">40 Behavioral Interview Questions</h3>
              <p className="text-sm text-gray-600">Browse and practice the most common behavioral questions by category.</p>
            </Link>
            <Link to="/interview-questions-and-answers" className="block bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-1">50 Interview Questions & Answers</h3>
              <p className="text-sm text-gray-600">The most common questions across every category, with answer tips.</p>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Practice "Tell Me About Yourself" with AI</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            Craft and rehearse your answer with an AI interviewer that scores your structure, delivery, and
            specificity. Get it right before the real interview. Free to start.
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
