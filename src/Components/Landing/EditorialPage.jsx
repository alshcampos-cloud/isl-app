// EditorialPage.jsx — /about/editorial
// Author byline anchor + editorial standards page.
// Linked from every published article's byline: "InterviewAnswers Editorial Team"
// Phase 0.5 of the Content Engine v2 build.
// Pattern: modeled after EthicsPage.jsx for layout + nav.
// D.R.A.F.T. Protocol: NEW file. No existing production component modified.

import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, BookOpen, CheckCircle, Mail, FileText } from 'lucide-react';
import useDocumentHead from '../../hooks/useDocumentHead';

const EDITORIAL_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'InterviewAnswers Editorial Team',
  url: 'https://www.interviewanswers.ai/about/editorial',
  parentOrganization: {
    '@type': 'Organization',
    name: 'InterviewAnswers.ai',
    url: 'https://www.interviewanswers.ai',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'editorial',
    email: 'editorial@interviewanswers.ai',
  },
};

export default function EditorialPage() {
  useDocumentHead({
    title: 'Editorial Standards | InterviewAnswers.ai',
    description:
      'How InterviewAnswers.ai produces blog content — citation standards, editorial review, and the people behind every article.',
    canonical: 'https://www.interviewanswers.ai/about/editorial',
    robots: 'index, follow',
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EDITORIAL_LD) }}
      />

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
            <BookOpen className="w-4 h-4 text-teal-300" />
            <span className="text-sm text-slate-300 font-medium">Editorial</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
            How we write.{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
              What we publish.
            </span>
          </h1>
          <p className="mt-8 text-xl sm:text-2xl text-slate-300 max-w-2xl leading-relaxed">
            Every article on InterviewAnswers.ai goes through citation review, human editorial pass, and brand-standards check before it reaches you.
          </p>
        </div>
      </section>

      {/* Editorial Team */}
      <section id="editorial-team" className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">
            Who writes here
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            InterviewAnswers Editorial Team
          </h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>
              InterviewAnswers Editorial Team articles are produced by our content pipeline — drafted, reviewed against our citation library and brand standards, edited for accuracy and voice, then published. Our editorial standards are anchored in cognitive psychology research on practice, retrieval, and skill acquisition.
            </p>
            <p>
              Editorial review by <strong>Jacob Bernal</strong>, our technical operations contractor.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Standards */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">
            How we work
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">
            Editorial Standards
          </h2>
          <ul className="space-y-6">
            {[
              {
                headline: 'Verified citations only.',
                body: 'One primary citation per article, drawn from a curated library of peer-reviewed research and credible sources. No fabricated or hallucinated references.',
              },
              {
                headline: 'Human review before publication.',
                body: 'Every article is read by a human editor before it goes live. The pipeline drafts; a person approves.',
              },
              {
                headline: 'Citation rotation enforced.',
                body: 'No single source is over-cited. We rotate across the library so the corpus stays grounded in the breadth of the science, not one convenient study.',
              },
              {
                headline: 'No unverified product or employer claims.',
                body: 'We do not make claims about specific companies, detection systems, or hiring outcomes without verifiable sourcing. When we characterize competitors or industry behavior, we attribute to specific, named sources.',
              },
              {
                headline: 'Corrections welcome.',
                body: (
                  <>
                    If you find a factual error or want to raise a sourcing concern, email{' '}
                    <a
                      href="mailto:editorial@interviewanswers.ai"
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      editorial@interviewanswers.ai
                    </a>
                    . We will review and correct promptly.
                  </>
                ),
              },
            ].map(({ headline, body }) => (
              <li key={headline} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-teal-500 shrink-0 mt-0.5" />
                <div className="text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">{headline}</span>{' '}
                  {body}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Editorial contact</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Questions about sources, corrections, or our editorial process:{' '}
              <a
                href="mailto:editorial@interviewanswers.ai"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                editorial@interviewanswers.ai
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Founder anchor — dormant, not rendered. Infrastructure for future activation. */}
      <span id="founder" aria-hidden="true" />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-gray-300 font-medium">InterviewAnswers.ai</span>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-gray-200 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-gray-200 transition-colors">Terms</a>
            <a href="/ethics" className="hover:text-gray-200 transition-colors">Ethics</a>
            <a href="mailto:editorial@interviewanswers.ai" className="hover:text-gray-200 transition-colors">Editorial</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
