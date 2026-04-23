// EthicsPage.jsx — "Practice, not cheat" manifesto page
// Route: /ethics
// The ethical-stance page that anchors the rebrand. Links from HeroSection,
// FAQSection, TermsPage, footer, and pricing callouts.
//
// Pattern: modeled after PrivacyPage.jsx for layout + nav.
// D.R.A.F.T. Protocol: NEW file. No existing production component modified.

import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, CheckCircle, Shield, BookOpen, Heart } from 'lucide-react';
import useDocumentHead from '../../hooks/useDocumentHead';

export default function EthicsPage() {
  useDocumentHead({
    title: 'Our Ethics — Practice, Not Cheat | InterviewAnswers.ai',
    description:
      'Why we removed live-interview AI and built a practice-first interview coach instead. The interview AI that doesn\u2019t go in the interview.',
    canonical: 'https://www.interviewanswers.ai/ethics',
    robots: 'index, follow',
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">InterviewAnswers.ai</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-teal-300" />
            <span className="text-sm text-slate-300 font-medium">Our Ethics</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Practice,{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
              not cheat.
            </span>
          </h1>
          <p className="mt-8 text-xl sm:text-2xl text-slate-300 max-w-2xl leading-relaxed">
            The interview AI that doesn&rsquo;t go in the interview.
          </p>
          <p className="mt-6 text-base text-slate-400 max-w-2xl leading-relaxed">
            We&rsquo;re building the opposite of a live interview copilot. No real-time
            answers in your ear. No &ldquo;undetectable&rdquo; modes. Just deep, private
            practice that makes you better when it&rsquo;s your turn to speak.
          </p>
        </div>
      </section>

      {/* Section 1 — We built it, then we removed it */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">
            The story
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            We built a live interview prompter. Then we removed it.
          </h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>
              Our first version of InterviewAnswers.ai included a live prompter &mdash;
              a tool that listened to interview questions in real time and surfaced
              bullet points from your prepared answers while you were actually on the
              call. Users asked for it. We shipped it.
            </p>
            <p>
              Then we watched the category. A wave of &ldquo;interview copilot&rdquo;
              products emerged, some marketed explicitly as &ldquo;undetectable&rdquo;
              AI to use live, during real interviews. News outlets including
              CBS News began reporting on AI-assisted interview fraud &mdash; by one
              report, 50% of businesses had encountered it in 2026. Hiring managers
              started asking candidates directly whether they had used AI help. Some
              candidates lost offers.
            </p>
            <p>
              We realized the market we were drifting toward was &ldquo;invisible
              cheating tools.&rdquo; That&rsquo;s not why we built this.
            </p>
            <p className="font-semibold text-gray-900">
              So we took the live mode out. We renamed it &ldquo;Practice
              Prompter.&rdquo; It&rsquo;s for rehearsal &mdash; the kind you do alone,
              out loud, before the interview.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Why this matters */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">
            Why this matters
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            The best products are defined by what they refuse to do.
          </h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>
              DuckDuckGo refused to track you. They put it on a billboard on Highway
              101 in 2011 while Google was minting billions from ad targeting. A
              decade later, the Snowden leaks hit &mdash; and DDG was the only
              prepared beneficiary. 100M+ daily searches today.
            </p>
            <p>
              Signal refused to monetize through ads, data, or targeting. They
              structured it as a non-profit foundation so they literally
              <em> couldn&rsquo;t</em> be acquired and flipped. When WhatsApp changed
              its privacy policy in January 2021, Signal added 40 million users in
              one week. The stance held for a decade, then compounded violently when
              the cultural moment arrived.
            </p>
            <p>
              Basecamp refused to chase growth. They refused &ldquo;integrations&rdquo;
              with other tools. They refused open opens in HEY email. Every refusal
              was a blog post, a public commitment, a product constraint.
            </p>
            <p>
              We&rsquo;re making the same kind of refusal, in our corner of the market.
              Live AI in interviews is becoming a category that hurts the people
              using it. We&rsquo;re not going to build for that category &mdash; no
              matter how much demand there is.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2.5 — The Science (Cognitive Psychology) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">
            The science
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Practice beats real-time help. Cognitive psychology is clear on this.
          </h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>
              There&rsquo;s a reason athletes rehearse before the game, surgeons train
              on simulators, and pilots log hours in flight sims &mdash; and it&rsquo;s
              not just discipline. It&rsquo;s how human memory actually works.
            </p>
            <p>
              <strong className="text-gray-900">The testing effect.</strong>{' '}
              Roediger &amp; Karpicke (2006) found that actively recalling information
              &mdash; testing yourself on it &mdash; improved retention roughly 50%
              more than re-reading the same material. Reading your answers in your head
              is not practice. Speaking them out loud, with feedback, is.
            </p>
            <p>
              <strong className="text-gray-900">Transfer-appropriate processing.</strong>{' '}
              Morris, Bransford &amp; Franks (1977) showed that memory performs best
              when the conditions at practice match the conditions at retrieval. If
              your real interview requires speaking out loud under pressure, you
              should practice speaking out loud under pressure. Not typing answers
              into a chatbot.
            </p>
            <p>
              <strong className="text-gray-900">Context-dependent memory.</strong>{' '}
              Godden &amp; Baddeley (1975) demonstrated that memories are easier to
              retrieve in the context they were formed. We build practice environments
              that replicate the real interview as closely as possible &mdash; timed
              questions, voice input, the exact same cognitive load you&rsquo;ll face
              on the day.
            </p>
            <p>
              <strong className="text-gray-900">Deliberate practice.</strong>{' '}
              Anders Ericsson&rsquo;s research on expert performance found that skill
              comes from focused, goal-oriented practice with immediate feedback &mdash;
              not from more exposure, and definitely not from shortcuts during the
              actual event.
            </p>
            <p className="font-semibold text-gray-900">
              An AI whispering in your ear during the interview doesn&rsquo;t build
              skill. It borrows someone else&rsquo;s voice and hopes the interviewer
              doesn&rsquo;t notice. We built the opposite: a system that makes{' '}
              <em>you</em> better, so you don&rsquo;t need anything in the room with
              you except what you already know.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Our commitment (3 pillars) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3 text-center">
            Our commitment
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
            Three principles. Enforced in the product, not just the marketing.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Practice-first',
                body:
                  'Every feature is designed for the hours before the interview, not the minutes during it. Mock interviews. Answer building. Flashcards. Spaced repetition. Things you do in private so you don\u2019t need us in public.',
              },
              {
                icon: Shield,
                title: 'Ethical by design',
                body:
                  'The live-interview use case is forbidden in our Terms of Service. It\u2019s in our product roadmap as a non-goal. It\u2019s in our pricing page. It\u2019s here. If a hiring manager asks whether you used us, the honest answer is: \u201cI used it to prepare \u2014 and that\u2019s it.\u201d',
              },
              {
                icon: Heart,
                title: 'Built for preparation',
                body:
                  'We believe the single best predictor of how you\u2019ll do in an interview is how many times you\u2019ve answered the question out loud before. That\u2019s not glamorous. It\u2019s not magic. It\u2019s what actually works.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — FAQ */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">
            Frequently asked
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">
            About the decision.
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Why remove it if users were asking for it?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Because the users asking for live-interview AI were, in most cases,
                scared. Scared of freezing. Scared of forgetting a story. Scared of
                being outclassed by someone else who was using an AI copilot. The
                feature didn&rsquo;t fix the fear; it just hid it for 30 minutes. The
                fear comes back at the next interview. Practice is the only thing
                that actually makes the fear go away.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                What if I genuinely need help during an interview?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Bring your own notes &mdash; on paper, in a second monitor, whatever
                your interview platform allows. Use a glass of water as a pause. Ask
                the interviewer to repeat the question. Those are real tools that
                don&rsquo;t cross a line. An AI listening to your interview and
                whispering answers into your ear does cross a line &mdash; and
                hiring managers are increasingly able to detect it.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Is this enforced, or is it just marketing?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                It&rsquo;s enforced. Our Terms of Service explicitly prohibit using
                InterviewAnswers.ai during live interviews, recorded interviews, or
                any evaluative hiring process where AI assistance hasn&rsquo;t been
                approved by the employer. Our product doesn&rsquo;t include a live
                in-interview mode, on purpose. And we document this stance publicly,
                where a hiring manager or reporter can verify it. That&rsquo;s the
                whole point: the stance has to be structural, not a tagline.{' '}
                <Link to="/terms" className="text-teal-600 hover:text-teal-700 underline">
                  Read the Terms.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-teal-600 to-emerald-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Practice until you don&rsquo;t need us on interview day.
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
            Free to start. No credit card required. The only interview AI built
            for the hours <em>before</em> the interview.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-0.5"
          >
            Start practicing free
            <CheckCircle className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-white/70">
            Built for practice. Never for cheating.
          </p>
        </div>
      </section>
    </div>
  );
}
