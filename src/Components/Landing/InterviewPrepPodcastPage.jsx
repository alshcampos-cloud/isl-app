// SEO Content Page: Interview Prep Podcast (Prep Radio)
// Target keywords: "interview prep podcast" (~6K/mo), "interview preparation audio" (~3K/mo),
//   "interview coaching podcast", "personalized interview prep", "AI interview podcast"
// This page showcases Prep Radio to capture podcast/audio search traffic.

import { Link } from 'react-router-dom';
import { Brain, ArrowRight, CheckCircle, Headphones, Radio, ChevronDown, Mic, Target, RefreshCw, Zap } from 'lucide-react';
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
    q: 'How is this different from a regular interview prep podcast?',
    a: 'Traditional podcasts give the same generic advice to everyone. Prep Radio generates episodes personalized to YOUR situation: your target role, your interview date, your weakest question categories, and your actual practice history. Every session is different because your progress changes.',
  },
  {
    q: 'What does a Prep Radio episode sound like?',
    a: 'Each episode is AI-narrated audio that feels like a personal coaching session. A typical daily briefing includes a countdown to your interview date, analysis of your practice stats, coaching on your weakest areas, a tip of the day, and a motivational closer. Question walkthroughs break down specific questions with what the interviewer is really testing, how to structure your answer, and common mistakes to avoid.',
  },
  {
    q: 'Can I listen offline or during my commute?',
    a: 'Yes. Prep Radio is designed for hands-free listening. Press play and listen while commuting, walking, exercising, or doing chores. No screen interaction needed once the episode starts.',
  },
  {
    q: 'How often should I listen?',
    a: 'Daily listening is ideal in the weeks before an interview. The daily briefing adapts to your countdown and recent practice. Even 5-10 minutes per day keeps interview concepts fresh through spaced repetition.',
  },
  {
    q: 'Is Prep Radio free?',
    a: 'The daily briefing and question walkthroughs are available on the free tier. Some advanced episode types like answer review and recall coaching are available with a Pro subscription.',
  },
];

const EPISODE_TYPES = [
  {
    icon: <Radio className="w-6 h-6 text-teal-600" />,
    title: 'Daily Briefing',
    desc: 'Your personalized morning report: interview countdown, practice stats, weak area coaching, and a rotating tip of the day.',
    duration: '5-8 min',
  },
  {
    icon: <Target className="w-6 h-6 text-teal-600" />,
    title: 'Question Walkthrough',
    desc: 'Deep dive into a specific interview question. What the interviewer is really testing, how to structure your answer, and common mistakes to avoid.',
    duration: '6-10 min',
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-teal-600" />,
    title: 'Story Review',
    desc: 'Replays your STAR stories with visualization cues and recall techniques. Strengthens the neural pathways so stories flow naturally under pressure.',
    duration: '5-8 min',
  },
  {
    icon: <Mic className="w-6 h-6 text-teal-600" />,
    title: 'Mock Interview (Mental Rehearsal)',
    desc: 'Audio-guided mental rehearsal. Hear a question, think through your STAR answer, then get coaching on what a strong response hits.',
    duration: '10-15 min',
  },
  {
    icon: <Zap className="w-6 h-6 text-teal-600" />,
    title: 'Answer Review',
    desc: 'Analyzes your actual practice answers. Walks through your highest and lowest scoring responses with specific coaching on improvement.',
    duration: '8-12 min',
  },
  {
    icon: <Headphones className="w-6 h-6 text-teal-600" />,
    title: 'Recall Coach',
    desc: 'Teaches five memory techniques for interviews: keyword anchoring, story mapping, opening sentences, spaced repetition, and body anchoring.',
    duration: '10-12 min',
  },
];

export default function InterviewPrepPodcastPage() {
  useDocumentHead({
    title: 'AI Interview Prep Podcast: Personalized Daily Coaching | InterviewAnswers.ai',
    description: 'Prep Radio: an AI-powered interview coaching podcast personalized to your target role, interview date, and practice history. Daily briefings, question walkthroughs, and mental rehearsal. Free.',
    keywords: 'interview prep podcast, interview preparation audio, interview coaching podcast, AI interview podcast, personalized interview prep, interview audio course, daily interview coaching, interview mental rehearsal, spaced repetition interview prep',
    canonical: 'https://www.interviewanswers.ai/interview-prep-podcast',
    og: {
      title: 'AI Interview Prep Podcast: Personalized Daily Coaching | InterviewAnswers.ai',
      description: 'A podcast that knows your interview date, your target role, and your weakest spots — and coaches you through them.',
      url: 'https://www.interviewanswers.ai/interview-prep-podcast',
      type: 'article',
    },
    twitter: {
      title: 'AI Interview Prep Podcast: Personalized Daily Coaching',
      description: 'A podcast that knows your interview date, target role, and weakest spots — and coaches you through them.',
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
            Try Free
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Interview Prep Podcast</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">PREP RADIO</span>
          <span className="text-sm text-gray-500">AI-Powered Audio Coaching</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Your Personal<br className="hidden sm:block" />
          <span className="text-teal-600">Interview Prep Podcast</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
          A podcast that knows your interview date, your target role, and your weakest spots — and coaches
          you through them. Personalized daily briefings that adapt as you practice.
        </p>
      </header>

      {/* How Prep Radio is different — visual comparison */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Regular Podcasts vs. Prep Radio</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Regular Podcast</p>
              <ul className="space-y-2 text-gray-500">
                <li className="flex items-start gap-2"><span className="text-gray-300 mt-0.5">--</span> Same episode for everyone</li>
                <li className="flex items-start gap-2"><span className="text-gray-300 mt-0.5">--</span> Generic tips and advice</li>
                <li className="flex items-start gap-2"><span className="text-gray-300 mt-0.5">--</span> No progress awareness</li>
                <li className="flex items-start gap-2"><span className="text-gray-300 mt-0.5">--</span> Weekly release schedule</li>
                <li className="flex items-start gap-2"><span className="text-gray-300 mt-0.5">--</span> Passive listening</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-teal-600 uppercase tracking-wide mb-3">Prep Radio</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" /> Personalized to your role and company</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" /> Coaches your specific weak areas</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" /> Adapts to your practice history</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" /> Fresh episode every day</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" /> Active recall and mental rehearsal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">

        {/* What Prep Radio does */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Prep Radio Does</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Prep Radio generates personalized audio coaching episodes based on your interview context. Set
            your target role, company, and interview date, and Prep Radio builds episodes that count down
            with you — coaching your weakest areas, reviewing your actual practice answers, and keeping
            concepts fresh through spaced repetition.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            It is not pre-recorded content. Every episode is generated fresh based on your current data,
            which means the coaching evolves as you improve. A session two weeks before your interview
            sounds completely different from one the day before.
          </p>
        </section>

        {/* Episode types */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">6 Episode Types</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {EPISODE_TYPES.map((ep, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5 hover:border-teal-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  {ep.icon}
                  <div>
                    <h3 className="font-bold text-gray-900">{ep.title}</h3>
                    <span className="text-xs text-gray-400">{ep.duration}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{ep.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What a typical session sounds like */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What a Daily Briefing Sounds Like</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Here is the structure of a typical daily briefing episode. The content is personalized, but
            the format gives you a consistent coaching rhythm.
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
            <div className="space-y-4">
              {[
                { time: '0:00', section: 'Greeting and Context', detail: 'Good morning. 6 days until your Product Manager interview at Stripe. Let\'s get you ready.' },
                { time: '0:30', section: 'Practice Stats', detail: 'Reviews your session count, consistency streak, and positions your progress relative to average candidates.' },
                { time: '1:30', section: 'Weak Area Coaching', detail: 'Identifies your lowest-scoring question category and explains WHY it matters and HOW to improve it.' },
                { time: '3:00', section: 'Tip of the Day', detail: 'Rotating coaching insight: the power of silence, show-don\'t-tell, the STAR result section, connecting past to future.' },
                { time: '5:00', section: 'Motivational Closer', detail: 'Ends with perspective and confidence. Reminds you that preparation compounds.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-teal-100 text-teal-700 font-mono text-xs font-bold px-3 py-1 rounded-full h-fit mt-1 shrink-0">
                    {item.time}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{item.section}</h3>
                    <p className="text-sm text-gray-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best for */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Best For</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { who: 'Commuters', why: 'Turn 20-30 minutes of dead commute time into focused interview prep. No screen needed.' },
              { who: 'Gym-Goers and Runners', why: 'Listen during workouts. The coaching format works perfectly at walking or running pace.' },
              { who: 'Audio Learners', why: 'If you retain information better by hearing it than reading it, Prep Radio is built for you.' },
              { who: 'People Who Hate Cramming', why: 'Short daily episodes use spaced repetition. 5-10 minutes per day beats 3 hours the night before.' },
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">More Interview Preparation Resources</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/interview-coaching-lessons" className="block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Interview Academy: 25 Audio Lessons</h3>
              <p className="text-sm text-gray-500 mt-1">Structured curriculum with quizzes covering fundamentals through advanced techniques.</p>
            </Link>
            <Link to="/star-method-guide" className="block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">The Complete STAR Method Guide</h3>
              <p className="text-sm text-gray-500 mt-1">Deep dive into Situation, Task, Action, Result with examples.</p>
            </Link>
            <Link to="/mock-interview-practice" className="block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">AI Mock Interview Practice</h3>
              <p className="text-sm text-gray-500 mt-1">Practice with an AI interviewer that adapts and gives instant feedback.</p>
            </Link>
            <Link to="/interview-questions-and-answers" className="block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Top 50 Interview Questions and Answers</h3>
              <p className="text-sm text-gray-500 mt-1">Common questions across all categories with answer strategies.</p>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Interview Prep Podcast: Frequently Asked Questions</h2>
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
          <h2 className="text-3xl font-bold mb-4">Get Your First Personalized Episode Free</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            Set your target role, company, and interview date. Prep Radio builds your first
            personalized coaching episode in seconds. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors text-lg inline-flex items-center justify-center gap-2"
            >
              Start Listening Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-teal-200 text-sm mt-4">Daily briefings available on the free tier. No credit card required.</p>
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
              <Link to="/interview-coaching-lessons" className="hover:text-white transition-colors">Interview Academy</Link>
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
