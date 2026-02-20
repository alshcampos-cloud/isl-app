// SEO Content Page: STAR Method Interview Guide
// Target keywords: "STAR method", "STAR method examples", "behavioral interview answers",
//   "how to use STAR method", "STAR interview technique", "situation task action result"
// This page exists to capture long-tail search traffic and funnel visitors into the app.

import { Link } from 'react-router-dom';
import { Brain, ArrowRight, CheckCircle, Target, Sparkles, BookOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import useDocumentHead from '../../hooks/useDocumentHead';

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

export default function STARMethodGuidePage() {
  useDocumentHead({
    title: 'The Complete STAR Method Guide (2026) — How to Answer Behavioral Interview Questions | InterviewAnswers.ai',
    description: 'Learn the STAR method for behavioral interviews. Step-by-step guide with real examples for Situation, Task, Action, Result answers. Practice with AI coaching. Free.',
    keywords: 'STAR method, STAR method examples, behavioral interview questions, how to answer behavioral questions, STAR interview technique, situation task action result, interview preparation, STAR method practice, behavioral interview tips, job interview STAR method',
    canonical: 'https://www.interviewanswers.ai/star-method-guide',
    og: {
      title: 'The Complete STAR Method Guide (2026) — Ace Behavioral Interviews',
      description: 'Step-by-step STAR method guide with real examples. Learn to answer any behavioral interview question with confidence.',
      url: 'https://www.interviewanswers.ai/star-method-guide',
      type: 'article',
    },
    twitter: {
      title: 'The Complete STAR Method Guide — Ace Behavioral Interviews',
      description: 'Step-by-step STAR method guide with examples. Answer any behavioral question with confidence.',
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
          <span className="text-gray-900">STAR Method Guide</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">INTERVIEW GUIDE</span>
          <span className="text-sm text-gray-500">Updated February 2026</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          The Complete STAR Method Guide:<br className="hidden sm:block" />
          <span className="text-teal-600">How to Answer Any Behavioral Interview Question</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          Behavioral interviews are the most common interview format in 2026. The STAR method is the proven framework
          that top candidates use to give structured, compelling answers. This guide teaches you exactly how to use it.
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
            <li><a href="#what-is-star" className="hover:text-teal-600 transition-colors">→ What is the STAR Method?</a></li>
            <li><a href="#four-components" className="hover:text-teal-600 transition-colors">→ The Four Components Explained</a></li>
            <li><a href="#example" className="hover:text-teal-600 transition-colors">→ Full STAR Answer Example</a></li>
            <li><a href="#common-mistakes" className="hover:text-teal-600 transition-colors">→ 5 Common Mistakes to Avoid</a></li>
            <li><a href="#types" className="hover:text-teal-600 transition-colors">→ Types of Behavioral Questions</a></li>
            <li><a href="#practice" className="hover:text-teal-600 transition-colors">→ How to Practice Effectively</a></li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        {/* Section: What is STAR */}
        <section id="what-is-star" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Is the STAR Method?</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            The STAR method is a structured approach to answering behavioral interview questions — the kind that start with
            "Tell me about a time when..." or "Give me an example of..." Instead of rambling or giving vague responses,
            STAR gives you a framework to tell a clear, compelling story from your real experience.
          </p>
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8 mb-6">
            <p className="text-gray-700 text-lg font-medium mb-2">STAR stands for:</p>
            <div className="grid sm:grid-cols-4 gap-4 mt-4">
              {[
                { letter: 'S', word: 'Situation', desc: 'Set the scene. Where were you? What was happening?' },
                { letter: 'T', word: 'Task', desc: 'What was your specific responsibility or challenge?' },
                { letter: 'A', word: 'Action', desc: 'What did YOU do? Be specific about your steps.' },
                { letter: 'R', word: 'Result', desc: 'What happened? Quantify the outcome if possible.' },
              ].map((item) => (
                <div key={item.letter} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-extrabold text-teal-600 mb-1">{item.letter}</div>
                  <div className="font-bold text-gray-900 mb-1">{item.word}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">
            Hiring managers use behavioral questions because they predict future performance. The principle is simple:
            how you handled challenges before is the best indicator of how you'll handle them again. STAR ensures your answer
            demonstrates <strong>real experience</strong>, not hypotheticals.
          </p>
        </section>

        {/* Section: Four Components */}
        <section id="four-components" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Four Components — Deep Dive</h2>

          <div className="space-y-4">
            <AccordionItem title="S — Situation: Set the Context" defaultOpen={true}>
              <p className="text-gray-600 mb-3">
                Start by painting a quick picture. The interviewer needs just enough context to understand the scenario — not your full
                career history. Keep it to 2-3 sentences.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-sm font-medium text-gray-500 mb-1">Good example:</p>
                <p className="text-gray-800 italic">"In my previous role at a SaaS company, our customer churn rate had spiked to 12% after a major product change. As the customer success lead for enterprise accounts, I was responsible for our top 50 clients."</p>
              </div>
              <p className="text-sm text-gray-500">
                <strong>Tip:</strong> Include the company context (without naming it if you prefer), your role, and the timeframe. Avoid backstory that doesn't serve the answer.
              </p>
            </AccordionItem>

            <AccordionItem title="T — Task: Define Your Responsibility">
              <p className="text-gray-600 mb-3">
                Clarify what was specifically expected of YOU. This separates your contribution from the team's work. What was on your plate?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-sm font-medium text-gray-500 mb-1">Good example:</p>
                <p className="text-gray-800 italic">"My task was to reduce churn to under 5% within the quarter, specifically by identifying at-risk enterprise clients and implementing a proactive retention strategy before the next billing cycle."</p>
              </div>
              <p className="text-sm text-gray-500">
                <strong>Tip:</strong> Be specific about measurable goals. "Improve things" is weak. "Reduce churn from 12% to under 5% in 90 days" is strong.
              </p>
            </AccordionItem>

            <AccordionItem title="A — Action: Show What You Did">
              <p className="text-gray-600 mb-3">
                This is the most important section — usually 60% of your answer. Describe the specific steps YOU took. Use "I" not "we."
                Walk through your decision-making process.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-sm font-medium text-gray-500 mb-1">Good example:</p>
                <p className="text-gray-800 italic">"First, I analyzed usage data to segment clients by risk level — I identified 18 accounts showing warning signs. Then I created a personalized outreach plan for each, scheduling calls to understand their frustrations with the product change. I collaborated with the product team to fast-track three specific feature requests that were blocking our biggest accounts. I also built a weekly check-in cadence and an executive business review template."</p>
              </div>
              <p className="text-sm text-gray-500">
                <strong>Tip:</strong> Use action verbs: analyzed, created, led, implemented, negotiated. Avoid "helped with" or "was involved in."
              </p>
            </AccordionItem>

            <AccordionItem title="R — Result: Prove the Impact">
              <p className="text-gray-600 mb-3">
                End with the measurable outcome. Numbers are powerful — percentages, dollar amounts, time saved, ratings improved.
                If you can't quantify, describe the qualitative impact.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-sm font-medium text-gray-500 mb-1">Good example:</p>
                <p className="text-gray-800 italic">"Within 90 days, we reduced enterprise churn from 12% to 3.8%. The proactive approach saved an estimated $420K in annual recurring revenue. Two of the at-risk accounts actually expanded their contracts. My retention framework was adopted as the standard process across the entire customer success team."</p>
              </div>
              <p className="text-sm text-gray-500">
                <strong>Tip:</strong> Always include what you learned or how the approach was recognized/adopted. This shows self-awareness and impact beyond the immediate task.
              </p>
            </AccordionItem>
          </div>
        </section>

        {/* Section: Full Example */}
        <section id="example" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Full STAR Answer — Put It All Together</h2>
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
            <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">Question: "Tell me about a time you had to meet a tight deadline."</p>

            <div className="space-y-4">
              {[
                { label: 'Situation', color: 'teal', text: '"Last year, our team received a client request to deliver a custom analytics dashboard two weeks before the original timeline. The client was presenting to their board and needed the data."' },
                { label: 'Task', color: 'blue', text: '"As the lead developer, I needed to scope what was achievable in the compressed timeline and coordinate between our design, backend, and QA teams to deliver a usable product."' },
                { label: 'Action', color: 'indigo', text: '"I immediately mapped the critical features versus nice-to-haves with the client, reducing scope by 40% to the must-haves. I restructured our sprint, assigned parallel workstreams, and set up daily 15-minute standups. I personally took on the most complex data pipeline work and stayed late two nights to unblock the frontend team."' },
                { label: 'Result', color: 'emerald', text: '"We delivered the dashboard one day early. The client\'s board presentation went smoothly, and they signed a $150K expansion contract the following month, citing our responsiveness. I documented the rapid delivery process, and our PM team now uses it as the template for expedited requests."' },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className={`bg-${item.color}-100 text-${item.color}-700 font-bold text-xs px-3 py-1 rounded-full h-fit mt-1 shrink-0`}>
                    {item.label}
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Common Mistakes */}
        <section id="common-mistakes" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">5 Common STAR Method Mistakes (And How to Fix Them)</h2>
          <div className="space-y-6">
            {[
              { mistake: 'Being too vague', fix: 'Use specific numbers, timelines, and outcomes. "I improved sales" → "I increased Q3 sales by 23% through a new outreach cadence."' },
              { mistake: 'Saying "we" instead of "I"', fix: 'Credit your team, but make your individual contribution crystal clear. Interviewers are hiring YOU.' },
              { mistake: 'Spending too long on Situation/Task', fix: 'Keep context to 20% of your answer. The Action section should be 60%. Practice timing yourself.' },
              { mistake: 'Skipping the Result', fix: 'Always land the plane. Even if the outcome wasn\'t perfect, share what happened and what you learned from it.' },
              { mistake: 'Making up stories', fix: 'Interviewers can tell. Use real experiences, even modest ones. A genuine story about a small win beats a fabricated story about saving the company.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.mistake}</h3>
                  <p className="text-gray-600">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Types of Behavioral Questions */}
        <section id="types" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Behavioral Interview Question Categories</h2>
          <p className="text-lg text-gray-600 mb-6">
            Most behavioral questions fall into a few core categories. Prepare 2-3 STAR stories for each, and you'll be ready for almost anything.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { cat: 'Leadership & Influence', examples: '"Tell me about a time you led a team through a challenge"' },
              { cat: 'Problem Solving', examples: '"Describe a complex problem you solved with limited information"' },
              { cat: 'Conflict Resolution', examples: '"Tell me about a disagreement with a coworker and how you resolved it"' },
              { cat: 'Adaptability', examples: '"Give an example of when you had to quickly adapt to a major change"' },
              { cat: 'Failure & Learning', examples: '"Tell me about a time you failed and what you learned from it"' },
              { cat: 'Teamwork & Collaboration', examples: '"Describe a project where you worked across teams to deliver results"' },
              { cat: 'Time Management', examples: '"How did you handle competing priorities with tight deadlines?"' },
              { cat: 'Initiative', examples: '"Tell me about a time you went above and beyond your job description"' },
            ].map((item) => (
              <div key={item.cat} className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-1">{item.cat}</h3>
                <p className="text-sm text-gray-500 italic">{item.examples}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: How to Practice */}
        <section id="practice" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Practice the STAR Method Effectively</h2>
          <p className="text-lg text-gray-600 mb-6">
            Reading about STAR is step one. Actually practicing out loud is what separates candidates who stumble through interviews
            from those who nail them. Here's a proven practice routine:
          </p>
          <div className="space-y-4 mb-8">
            {[
              { step: '1', title: 'Build Your Story Bank', desc: 'Write down 8-10 stories from your career that cover different situations. Each story can often be adapted for multiple question types.' },
              { step: '2', title: 'Structure Each Story', desc: 'For each story, write out the S-T-A-R components. Keep Situation/Task to 2-3 sentences. Expand Action to 3-5 specific steps.' },
              { step: '3', title: 'Practice Out Loud', desc: 'Reading and speaking are different skills. Say your answers out loud until they flow naturally — not memorized, but comfortable.' },
              { step: '4', title: 'Time Yourself', desc: 'Aim for 90 seconds to 2 minutes per answer. Under 60 seconds feels thin. Over 3 minutes loses the interviewer.' },
              { step: '5', title: 'Get Feedback', desc: 'Practice with a friend, mentor, or AI interviewer that gives structured feedback on your STAR structure and delivery.' },
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

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Practice STAR Method Answers with AI</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            InterviewAnswers.ai conducts realistic mock interviews, scores your STAR structure in real-time,
            and coaches you to tell stronger stories from your real experience. Free to start.
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
              <Link to="/nurse" className="hover:text-white transition-colors">Nursing Interviews</Link>
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
