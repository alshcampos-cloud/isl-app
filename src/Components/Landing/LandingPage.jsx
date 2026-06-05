import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useDocumentHead from '../../hooks/useDocumentHead';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import TrustBar from './TrustBar';
import SocialProofBar from './SocialProofBar';
import CogPsychTrustStrip from './CogPsychTrustStrip';
import InlineDemoSection from './InlineDemoSection';
import ProblemSection from './ProblemSection';
import FeatureCarousel from './FeatureCarousel';
import FeatureToolbox from './FeatureToolbox';
import HowItWorksSection from './HowItWorksSection';
import WhyISLSection from './WhyISLSection';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // SEO: Dynamic meta tags for the general landing page
  // (Above-the-fold / shared social preview copy is pure pro-Y; anti-X framing
  //  lives only in mid-page differentiators + Ethics page + ads.)
  useDocumentHead({
    title: 'InterviewAnswers.ai - Rehearsal-First AI Interview Practice',
    description: 'Rehearse your interview answers out loud, with AI practice feedback grounded in cognitive-psychology research. Free to start, no credit card required.',
    keywords: 'interview preparation, AI interview practice, mock interview, STAR method, behavioral interview questions, job interview tips, interview coaching, AI interview coach, rehearsal interview practice, cognitive psychology interview practice',
    canonical: 'https://www.interviewanswers.ai/',
    og: {
      title: 'InterviewAnswers.ai - Rehearsal-First AI Interview Practice',
      description: 'Rehearse the interview before it happens. AI practice, grounded in cognitive-psychology research. Free to start.',
      url: 'https://www.interviewanswers.ai/',
      type: 'website',
    },
    twitter: {
      title: 'InterviewAnswers.ai - Rehearsal-First AI Interview Practice',
      description: 'Rehearse the interview before it happens. AI practice grounded in cognitive-psychology research. Free to start.',
    },
  });

  useEffect(() => {
    // 2026-06-04: catch the Supabase email-confirmation redirect.
    //
    // The signup flow tells Supabase to use the bare Site URL as
    // emailRedirectTo (the /auth/confirm path isn't in the dashboard's
    // Redirect URLs allowlist and gets rejected — see Auth.jsx note).
    // So after the user clicks the confirmation email, Supabase verifies
    // the email server-side AND drops the user back here at "/" with
    // either:
    //   - PKCE flow:    `?code=<auth_code>&type=signup` in the query
    //   - Implicit:     `#access_token=...&type=signup` in the hash
    // Either signal means "this is an authenticated email-confirm landing
    // — we need to finish establishing the session". Hand the URL to
    // /auth/confirm, which has the full Strategy 0-5 session-exchange
    // logic. Preserve any ?from=nursing too.
    const search = window.location.search;
    const hash = window.location.hash;
    const isPkceConfirm = search.includes('code=') &&
      (search.includes('type=signup') || hash.includes('type=signup'));
    const isHashConfirm = hash.includes('access_token') ||
      hash.includes('type=signup') || hash.includes('type=recovery');

    if (isPkceConfirm || isHashConfirm) {
      console.log('🔑 Email-confirm landing detected, routing to /auth/confirm');
      // Preserve nursing context if it's in the search params
      const fromNursing = new URLSearchParams(search).get('from') === 'nursing';
      const params = fromNursing && !search.includes('from=')
        ? `${search}${search ? '&' : '?'}from=nursing`
        : search;
      const target = `/auth/confirm${params}${hash}`;
      navigate(target, { replace: true });
      return;
    }

    // Fallback timeout — if getSession() hangs or fails silently, show landing page anyway
    const fallbackTimer = setTimeout(() => {
      console.warn('⚠️ LandingPage: getSession() timed out after 3s, showing landing page');
      setLoading(false);
    }, 3000);

    // If already authenticated, redirect to app or nursing based on user metadata.
    // BUT: anonymous users (from onboarding/demo) should see the landing page.
    //
    // IMPORTANT: Use getUser() not getSession(). getSession() returns expired
    // sessions from localStorage; getUser() validates server-side. Otherwise
    // stale sessions would bounce users through /app → /login.
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      clearTimeout(fallbackTimer);
      if (!error && user && !user.is_anonymous) {
        const field = user.user_metadata?.onboarding_field;
        navigate(field === 'nursing' ? '/nursing' : '/app', { replace: true });
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      clearTimeout(fallbackTimer);
      console.error('LandingPage: getUser() failed:', error);
      setLoading(false); // Show landing page even if auth check fails
    });

    return () => clearTimeout(fallbackTimer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 text-lg">Loading InterviewAnswers.ai...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <TrustBar />
      <SocialProofBar />
      <CogPsychTrustStrip />
      <InlineDemoSection />
      <ProblemSection />
      <FeatureCarousel />
      <FeatureToolbox />
      <HowItWorksSection />
      <WhyISLSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 p-3 z-40">
        <a
          href="/onboarding"
          className="block w-full text-center bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg"
        >
          Start Practicing Free
        </a>
      </div>
    </div>
  );
}
